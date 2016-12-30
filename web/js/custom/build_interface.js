// TODO:
// Initial setup has unlimited supply with large number of supply and demand
// Hide supply options when 'unlimited supply mode' is selected


function Interface() {

	var me = this;
	this.controls = {}

	this.controls["unlimited_supply_mode_checkbox"] = d3.select("#unlimited_supply_mode_checkbox")
	this.controls["decrease_supply_10_pc_button"] = d3.select("#decrease_supply_10_pc_button")
	this.controls["supply_capacity_input"] = d3.select("#supply_capacity_input")
	this.controls["increase_supply_10_pc_button"] = d3.select("#increase_supply_10_pc_button")
	this.controls["supply_to_change_select"] = d3.select("#supply_to_change_select")


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
		VMT.controller.rerun()
	})

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




}