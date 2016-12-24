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

            var sss = demander.all_supply_source_stats

            var sss_ordered = _.sortBy(sss, function(d) {return d[VMT.interface.optimisation_target]})
            var mapfn = function(d) {return d.supply_id}

            demander.supply_ids_ordered_by_closest = _.map(sss_ordered, mapfn)

            ;
        })

    }

    // For each demand in collection, get neighbours
    this.assign_neighbours = function() {

        // Compute voronoi
        var voronoi = d3.voronoi()
            .x(function(d) {
                return VMT.mapholder.latlng_to_xy(d.demand_lat, d.demand_lng).x;
            })
            .y(function(d) {
                return VMT.mapholder.latlng_to_xy(d.demand_lat, d.demand_lng).y;
            })

        // Want to get links associated with this cell 
        var diagram = voronoi(me.demanders_array)
        var links = diagram.links()

        // Links is an array with source and target
        _.each(me.demanders, function(demander, demand_id) {
            me.demanders[demand_id]["neighbours"] = {}
            _.each(links, function(link) {
                if (link.source.demand_id == demander.demand_id) {
                    me.demanders[demand_id]["neighbours"][link.target.demand_id] = link.target
                }
                if (link.target.demand_id == demander.demand_id) {
                    me.demanders[demand_id]["neighbours"][link.source.demand_id] = link.source
                }

            })
        })
    }


    var me = this;

    this.processed_csv = processed_csv;
    this.demanders = {}
    this.demand_allocation_order = []  //ordered list of demand ids

    this.add_all()
    this.order_suppliers_by_closest()
    this.assign_neighbours()

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
    },

    get demanders_array() {
        return _.map(this.demanders, function(d) {return d})
    }
}
