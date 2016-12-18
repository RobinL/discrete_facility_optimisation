//The demand collection keeps track of the order in which demand objects were allocated.
//Each demand object keeps track of relative loss associated with being allocated in nth position relative to first best.
//By processing this data, this enables a new 'demand allocation' to be created.
//Key thing is to get the data right.

function DemandCollection(processed_csv) {


    function demand_exists(csv_row) {
        return _.has(me.demanders, csv_row["demand_id"])
    }


    this.iterate_demand_allocation = function() {

    }

    this.add_row = function(csv_row) {
        if (!demand_exists(csv_row)) {

            var this_demand = new Demand(csv_row)
            me.demanders[csv_row["demand_id"]] = this_demand
            this_demand.set_supply_source_stats(csv_row)

        } else {

            var this_demand = me.demanders[csv_row["demand_id"]]
            this_demand.set_supply_source_stats(csv_row) 
        }
    }

    this.add_all = function() {
        _.each(me.processed_csv["current_data"], function(row) {
            me.add_row(row)
        })


    }

    // For each Demand in the collection, order suppliers by closest
    this.order_suppliers_by_closest = function() {

        _.each(me.demanders, function(demander,demand_id) {

            var sss = demander.supply_source_stats

            var sss_ordered = _.sortBy(sss, function(d) {return d["duration_min"]})
            var mapfn = function(d) {return d.supply_id}

            demander.supply_ids_ordered_by_closest = _.map(sss_ordered, mapfn)

            ;
        })

    }


    var me = this;

    this.processed_csv = processed_csv;
    this.demanders = {}
    this.demand_allocation_order = []  //ordered list of demand ids

    this.add_all()
    this.order_suppliers_by_closest()

}


DemandCollection.prototype = {

    get total_demand() {
        return _.reduce(this.demanders, function(a,b) {
            return a + b.demand
        },0)

    },

    get min_demand() {
        var min_demander = _.min(this.demanders, function(d) {
            return d.demand
        })
        return min_demander.demand
    },

    get max_demand() {
        var max_demander = _.max(this.demanders, function(d) {
            return d.demand
        })
        return max_demander.demand 
    }
}
