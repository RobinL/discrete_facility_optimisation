// TODO:
// Have a second, optional line of controls for changing the size of supply units
// Have a control that removes supply constraints.


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
		VMT.controller.change_supplier()
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
		VMT.controller.change_supplier(this)
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