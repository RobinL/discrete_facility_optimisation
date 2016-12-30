// The controller intermediates between the interface, the model, and the visualisation

function Controller() {

	// We need to maintain a list of supply units which are active
	var me = this;


	// This function is needed when the model needs to be restarted with completely new data
	this.initialise = function() {
		var csv_path = VMT.interface.csv_path
		d3.csv(csv_path, function(csv_data) {
			VMT.csv_processed = new CsvProcessor(csv_data, VMT.settings.column_descriptions_overrides)
			VMT.model = new SupplyAndDemandModel(VMT.csv_processed)
		    VMT.supply_points_layer = new SupplyPointsLayer();
		    VMT.demand_allocation_layer = new DemandAllocationLayer()
			VMT.mapholder.reset_all_layers()
	    	VMT.mapholder.initiate_bounds()
	    	VMT.supply_points_layer.draw_from_scratch()
	    	VMT.demand_allocation_layer.draw_from_scratch()

	    	VMT.interface.build_supply_to_change_selector()
	    	VMT.interface.build_scenario_selector()



		})
	}

	// this function is used when a different set of suppliers is selected.
	this.rerun = function() {
		
		VMT.model.filter_suppliers()
		VMT.model.run_model()

		VMT.mapholder.reset_all_layers()
    	VMT.mapholder.initiate_bounds()
    	VMT.supply_points_layer.draw_from_scratch()
    	VMT.demand_allocation_layer.draw_from_scratch()

	}

	this.toggle_supplier = function(supplier_id) {
		VMT.model.supply_collection.suppliers[supplier_id].is_active = !VMT.model.supply_collection.suppliers[supplier_id].is_active
		this.rerun()
	}

	this.change_supplier = function(supply_id) {

		var supply = VMT.model.supply_collection.suppliers[supply_id].supply
		VMT.interface.supply_capacity = supply;
	}

	this.update_supply = function(supply_id, value, is_multiplier = false) {

		if (is_multiplier) {
			VMT.model.supply_collection.suppliers[supply_id].supply *= value
		} else {
			VMT.model.supply_collection.suppliers[supply_id].supply = value
		}

		this.rerun()
		
	}

	this.supply_button_click = function(button) {
		
		var multiplier = +button.value;
		var supply_id = VMT.interface.supply_id;
		
		me.update_supply(supply_id, multiplier, true)
		me.change_supplier(supply_id)

	}

	this.load_scenario = function() {

	}

	this.supply_capacity_change = function(input) {
		var value = +input.value;
		var supply_id = VMT.interface.supply_id;
		me.update_supply(supply_id, value, false)
	}

	this.initialise()

}