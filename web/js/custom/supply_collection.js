//You give SupplyCollection rows and it 
//creates a suplpy object if it hasn't seen it before
//Or add statistics to an existing supply object if it already exists
//Note that it will have to handle 
function SupplyCollection(processed_csv) {

    function supply_exists(csv_row) {
        return _.has(me.suppliers, csv_row["supply_id"])
    }

    this.add_row = function(csv_row) {
        if (!supply_exists(csv_row)) {

            var this_supply = new Supply(csv_row)
            me.suppliers[csv_row["supply_id"]] = this_supply

            this_supply.set_demand_source_stats(csv_row)

        } else {
            var this_supply = me.suppliers[csv_row["supply_id"]]
            this_supply.set_demand_source_stats(csv_row) 
        }

    }

    this.add_all = function() {
        
        _.each(me.processed_csv["current_data"], function(row) {
            me.add_row(row)
        })
    }

    var me = this;
    this.processed_csv = processed_csv;
    this.suppliers = {}
    this.add_all()


}

//Getter means you can ask by ID

SupplyCollection.prototype = {

    get total_supply() {
        return _.reduce(this.active_suppliers, function(a,b) {
            return a + b.supply
        },0)

    },

    get total_supply_allocated() {
        return _.reduce(this.active_suppliers, function(a,b) {
            return a + b.supply_allocated
        },0)
    },

    get active_suppliers() {
        var me = this;
        return _.filter(me.suppliers, function(supplier) {
            return supplier.is_active
        })
    },

    get suppliers_array() {
        return _.map(this.suppliers, function(d) {return d})
    },

    get max_supply() {

        if (this.active_suppliers.length > 0) {
            var max_supplier = _.max(this.active_suppliers, function(d) {
                return d.supply
            })
            return max_supplier.supply 
        } else {
            return 0
        }
    },
    get min_supply() {

        if (this.active_suppliers.length > 0) {
            var min_supplier = _.min(this.active_suppliers, function(d) {
                return d.supply
            })
            return min_supplier.supply 
        } else {
            return 0
        }
    },





}