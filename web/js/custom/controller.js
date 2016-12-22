// The controller intermediates between the interface, the model, and the visualisation

function Controller() {

	// We need to maintain a list of supply units which are active
	var me = this;
	this.suppliers_info =  {};

	function init_suppliers() {
		me.suppliers_info = {}
		_.each(VMT.csv_processed.original_csv_data, function(row) {
			var supply_id = row["supply_id"]

			var supply_cols = VMT.settings.supply_cols
			var this_supplier = {}
			_.each(supply_cols, function(col) {
				this_supplier[col] = row[col]
			})
			// this_supplier["active"] = true
			

			me.suppliers_info[supply_id] = this_supplier

			
		})
		// Activate first supplier
		var first_id = _.keys(me.suppliers_info)[0]
		me.suppliers_info[first_id].active = true

	}
	init_suppliers()


	function filter_current_suppliers(row) {
		
		var active_suppliers = []

		_.each(me.suppliers_info, function(supplier) {
			if (supplier.active) {
				active_suppliers.push(supplier.supply_id+"")
			}
		})
		return _.contains(active_suppliers, row["supply_id"]+"")
	}

	this.filter_data = function() {
		VMT.csv_processed.filter_data(filter_current_suppliers)
	}


	// This function is needed when the model needs to be restarted with completely new data
	this.draw_from_scratch = function() {
		var csv_path = VMT.interface.csv_path
		d3.csv(csv_path, function(csv_data) {
			VMT.csv_processed = new CsvProcessor(csv_data, VMT.settings.column_descriptions_overrides)
			init_suppliers()
			me.filter_data()
			VMT.model = new SupplyAndDemandModel(VMT.csv_processed)
		    VMT.supply_points_layer = new SupplyPointsLayer();
		    VMT.demand_allocation_layer = new DemandAllocationLayer()
			VMT.model = new SupplyAndDemandModel(VMT.csv_processed)
			VMT.mapholder.reset_all_layers()
	    	VMT.mapholder.initiate_bounds()
	    	VMT.supply_points_layer.draw_from_scratch()
	    	VMT.demand_allocation_layer.draw_from_scratch()
		})
	}

	// this function is used when a different set of suppliers is selected.
	this.update_suppliers = function() {
		me.filter_data()
		VMT.model = new SupplyAndDemandModel(VMT.csv_processed)
		VMT.mapholder.reset_all_layers()
    	VMT.mapholder.initiate_bounds()
    	VMT.supply_points_layer.draw_from_scratch()
    	VMT.demand_allocation_layer.draw_from_scratch()

	}

	this.toggle_supplier = function(supplier_id) {
		me.suppliers_info[supplier_id]["active"] = !me.suppliers_info[supplier_id]["active"]
		me.update_suppliers()
	}

}