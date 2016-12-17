// The controller intermediates between the data visualisation and the supply and demand model

function Controller(processed_csv) {

	// We need to maintain a list of supply units which are active
	var me = this;
	this.suppliers_info =  {};

	
	
	function init_suppliers() {
		_.each(processed_csv.original_csv_data, function(row) {
			var supply_id = row["supply_id"]

			var supply_cols = VMT.settings.supply_cols
			var this_supplier = {}
			_.each(supply_cols, function(col) {
				this_supplier[col] = row[col]
			})
			this_supplier["active"] = false
			

			me.suppliers_info[supply_id] = this_supplier

			
		})
		// Activate first supplier
		var first_id = _.keys(me.suppliers_info)[0]
		me.suppliers_info[first_id].active = true

	}

	init_suppliers()


	

}