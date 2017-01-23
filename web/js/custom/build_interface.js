function Interface() {

	var me = this;
	this.controls = {}

	this.controls["unlimited_supply_mode_checkbox"] = d3.select("#unlimited_supply_mode_checkbox")
	this.controls["decrease_supply_10_pc_button"] = d3.select("#decrease_supply_10_pc_button")
	this.controls["supply_capacity_input"] = d3.select("#supply_capacity_input")
	this.controls["increase_supply_10_pc_button"] = d3.select("#increase_supply_10_pc_button")
	this.controls["supply_to_change_select"] = d3.select("#supply_to_change_select")
	this.controls["scenario_select"] = d3.select("#scenario_select")


	function build_data_selector() {
		VMT.utils.draw_options("#data_csv_select", VMT.settings.csv_files)
		me.controls["data_csv_select"] = d3.select("#data_csv_select")
	}
	build_data_selector()


	function build_intensity_selector() {
		var options = _.map(VMTs.search_intensity_lookup, function(d) {return d})
		VMT.utils.draw_options("#optimisation_intensity_select",options)
		me.controls["optimisation_intensity_select"] = d3.select("#optimisation_intensity_select")
		me.search_intensity = "medium"
	}
	build_intensity_selector()


	function build_optimisation_target_selector() {
		var options = [{"value": "duration_min", "text" : "Drive time (min)"},
						{"value": "distance_crowflies_km", "text" : "Distance as crow flies (km)"},
						{"value": "distance_route_km", "text" : "Drive distance (km)"}]
		VMT.utils.draw_options("#optimisation_target_select",options)

		me.controls["optimisation_target_select"] = d3.select("#optimisation_target_select")
		me.optimisation_target = "duration_min"
	}
	build_optimisation_target_selector()


	this.build_supply_to_change_selector = function() {
		var suppliers = VMT.model.supply_collection.suppliers
		suppliers = _.filter(suppliers, function(d) { return d.is_active})
		suppliers = _.map(suppliers, function(d) {return {text: d.supply_name, value: d.supply_id}})
		VMT.utils.draw_options("#supply_to_change_select", suppliers)

		// Trigger supply on change
		VMT.controller.change_supplier(suppliers[0]["value"])
	}

	function process_scenario_data(csv_data) {
		var scenario_data = {}
		_.each(csv_data, function(row) {
			if (VMT.utils.key_not_in_dict(row["scenario_name"],scenario_data)) {
				scenario_data[row["scenario_name"]] = []
			} 

				scenario_data[row["scenario_name"]].push(row)
		})
		me.scenario_data = scenario_data

	}

	function scenario_data_to_select_box() {
		var options = [{value: "built_in_original", text: "Original"}]
		_.each(me.scenario_data,function(value, key) {
			options.push({value:key, text:key})
		})
		VMT.utils.draw_options("#scenario_select", options)	
	}

	function apply_scenario() {
		var scenario_name = me.scenario_name;

		// Turn off all suppliers and reset 
		reset_all_suppliers(active=false)
		// Iterate through the scenario applying its features 
		var scenario_data = me.scenario_data[scenario_name]
		_.each(scenario_data, function(data){ 
			var this_supplier = VMT.model.supply_collection.suppliers[data["supply_id"]]
			if (data["active"] == "1") {
				this_supplier.is_active = true
			} else {
				this_supplier.is_active = false
			}

			this_supplier.supply = parseFloat(data["supply"])
		})
	}


	this.build_scenario_selector = function() {
		// Attempt to load data.  If exists, populate, otherwise hide scenario selector
		var data_file = me.csv_path
		data_file = data_file.replace("datasets/", "scenarios/")
		d3.csv(data_file, function(error, data) {
			if (error)  {
				// Hide the 'scenario selection' select box
				me.scenario_data = {}
				scenario_data_to_select_box()
				d3.select(".scenario_select_container").classed("hidden", true)

			} else {
				// Populate and show the 'scenario selection' box
				process_scenario_data(data)
				scenario_data_to_select_box()

				d3.select(".scenario_select_container").classed("hidden", false)
			}

		})
		// 

	}

	this.update_supply_to_change_selector_mouseover = function(supply_id) {
		me.supply_id = supply_id
		VMT.controller.change_supplier(supply_id)

	}

	this.update_show_hide_infopanel = function() {

		_.each(VMT.settings.show_hide_infopanel, function(hidden_true_false, key) {
			var this_elem = d3.select("#" + key + "_show_hide")
			if (hidden_true_false) { 
				this_elem.classed("info_panel_hidden", false); 
			} else {
				this_elem.classed("info_panel_hidden", true); 	
			}

			var this_elem = d3.select("#show_button_"+ key)
			if (hidden_true_false) { 
				this_elem.classed("info_panel_hidden", true); 
			} else {
				this_elem.classed("info_panel_hidden", false); 	
			}
		})

		d3.selectAll(".show_buttons").on("click", function(d) {
			var id = this.value
			VMT.settings.show_hide_infopanel[id] = !VMT.settings.show_hide_infopanel[id]
			me.update_show_hide_infopanel()
		})

		d3.selectAll(".hide_button").on("click", function(d) {
			var id = this.value
			VMT.settings.show_hide_infopanel[id] = !VMT.settings.show_hide_infopanel[id]
			me.update_show_hide_infopanel()
		})

	}
	

	d3.select("#data_csv_select").on("change", function(d) {
		VMT.controller.initialise()
	})

	d3.selectAll("#optimisation_intensity_select").on("change", function(d){
		VMT.controller.rerun()
	})

	d3.selectAll("#optimisation_target_select").on("change", function(d){
		VMT.model.demand_collection.order_suppliers_by_closest()
		VMT.controller.rerun()
	})

	d3.selectAll(".change_supply_button").on("click", function(d) {
		VMT.controller.supply_button_click(this)
	})

	d3.select("#supply_to_change_select").on("change", function(d) {
		var supply_id = me.supply_id
		VMT.controller.change_supplier(supply_id)
	})

	d3.select("#supply_capacity_input").on("change", function(d) {
		VMT.controller.supply_capacity_change(this)
	})

	d3.select("#unlimited_supply_mode_checkbox").on("change", function(d) {
		if (me.unlimited_supply_mode) {
			d3.selectAll(".unlimited_supply_hide").classed("hidden", true)
		} else {
			d3.selectAll(".unlimited_supply_hide").classed("hidden", false)
		}

		VMT.controller.rerun()
	})

    d3.select("#fileupload_data").on("change", function(d) {
        //parse data 
        var data = null;
        var file = this.files[0];
        var reader = new FileReader();

        reader.readAsText(file);
        
        reader.onload = function(event) {
            var csvData = event.target.result;
            csvData = d3.csvParse(csvData);
            VMT.controller.upload_data_csv(csvData)
   
        }

    })


	function reset_all_suppliers(active=true) {
		_.each(VMT.model.supply_collection.suppliers, function(supplier, supply_id) {
					supplier.is_active = active
					supplier.supply = supplier.original_supply
				})
	}
	d3.select("#scenario_select").on("change", function(d) {
			if (me.scenario_name == "built_in_original") {
				// Select all and reset supply volumes
				reset_all_suppliers()
			} else {
				// Appply scenario
				apply_scenario()
			}
			// Re run
			VMT.controller.rerun()

	})

	this.show_spinner = function() {
		d3.select(".spinner2").attr("class", "spinner")
		d3.select(".opacity_overlay2").attr("class", "opacity_overlay")		

	}

	this.hide_spinner = function() {
		d3.select(".spinner").attr("class", "spinner2")
				
		d3.select(".opacity_overlay").attr("class", "opacity_overlay2")

	}

}

Interface.prototype = {
	get csv_path() {
		return this.controls["data_csv_select"].node().value
	},

	set csv_path(set_value) {
		this.controls["data_csv_select"].node().value = set_value
	},

	get search_intensity() {
		return this.controls["optimisation_intensity_select"].node().value
	},

	set search_intensity(set_value) {
		this.controls["optimisation_intensity_select"].node().value = set_value
	},

	get optimisation_target() {
		return this.controls["optimisation_target_select"].node().value
	},

	set optimisation_target(set_value) {
		this.controls["optimisation_target_select"].node().value = set_value
	},

	get unlimited_supply_mode() {
		return this.controls["unlimited_supply_mode_checkbox"].property('checked');
	},

	set unlimited_supply_mode(set_value) {
		this.controls["unlimited_supply_mode_checkbox"].property('checked', set_value);
	},

	get supply_id() {
		return this.controls["supply_to_change_select"].node().value
	},

	set supply_id(set_value) {
		this.controls["supply_to_change_select"].node().value = set_value
	},

	get supply_capacity() {
		return this.controls["supply_capacity_input"].node().value
	},

	set supply_capacity(set_value) {
		this.controls["supply_capacity_input"].node().value = set_value
	},

	get scenario_name() {
		return this.controls["scenario_select"].node().value 
	}

}
