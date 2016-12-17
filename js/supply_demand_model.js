// Notes:
// We want to allocate demand to supply, not vice veras

// But note that a single demand_source can be allocated to multiple supply_sources
// Because partial allocation is possible

// Given supply, we need a loss-ordered list of demands

// 

//SWAP STRATEGY:
//Precompute 'list of neighbours' for each demand point as soon as we see the 'demand points'
//To compute a swap, unallocate from a, and its neighbour b.  
//Allocate to a then b
//Allocate to b then a
//Choose the best loss.


//FIRST THING - write well-organised code that simply allocates each demand to closest court, unless it's full, in which case, do not allocate

var optimisation_target = "duration_min"  //Where's best to put this?

function SupplyAndDemandModel(processed_csv, optimisation_target="duration_min") {
    //Has a supply collection and a demand collection
    var me = this;
    this.processed_csv = processed_csv

    this.supply_collection = new SupplyCollection(processed_csv)
    this.demand_collection = new DemandCollection(processed_csv)

    // It's the model, not the demand collection that stores the allocation order.
    // The demand collection just holds a list of all demand items.

    function get_demanders_order_in_order_of_distance_to_nearest_supply() {
        //Initial demand allocation is by allocating closest
        //Sort demanders by 

        // from each deamnder we get a supplier
        var dc = me.demand_collection
        var sc = me.supply_collection

        var allocation_order = _.sortBy(dc.demanders, function(demander) {
            var closest_supply_stats = demander.supply_source_stats[demander.closest_supply_id]
            return closest_supply_stats[optimisation_target]
        })

        return allocation_order
    }



    function reset_all_allocations() {
        _.each(me.allocation_collection, function(allocation) {
            allocation.unallocate()
        })
    }

    this.allocate_from_order = function(demand_objects_in_order) {
        
        reset_all_allocations()

        _.each(demand_objects_in_order, function(demand) {
            demand.allocate_to_supply_in_closeness_order(me.supply_collection)
        })
        
    }


    this.compute_best_possible_loss = function(){
        // For each demand object, allocate and then unallocate (i.e. compute loss for each 
        //demand if it were allocated first)

        // Ensure allocations are empty
        reset_all_allocations()

        _.each(me.demand_collection.demanders, function(demand) {
 
            demand.allocate_to_supply_in_closeness_order(me.supply_collection)

            demand.update_loss_stats_by_allocation_order(demand.loss,1, add_to_counter=false)
            me.allocation_collection
            demand.unallocate_all_supply()

        })

    }
    

    //The first allocation technique is to iterate through demand objects
    //Assign as much as possible to their closest supply until its full
    //Then allocate to second closest etc.

    //But if we do this, some will get assigned to second best,
    //We want to calculate the loss in allocating to second best.

    //Then re-do allocation order by 'how bad it was to allocate to second best'
    //And reallocate.

    //For each demand object, keep track of loss associated with being the nth demand allocated.

    //Then attempt bilateral swaps



    this.allocate_each_demand_to_closest_supply_in_closeness_order = function() {

        // First need to 
        var demand_order = get_demanders_order_in_order_of_distance_to_nearest_supply()
        me.allocate_from_order(demand_order)
                
    }

    this.compute_best_possible_loss()
    this.allocate_each_demand_to_closest_supply_in_closeness_order()


}

SupplyAndDemandModel.prototype = {
    get allocation_collection() {
        var allocation_collection = []
        _.each(this.supply_collection.suppliers, function(supply) {
            _.each(supply.allocations, function(allocation) {
                allocation_collection.push(allocation)
            })

        })
        return allocation_collection
    },

    get total_loss() {
        var total_loss = 0
        var reduce_fn = function(a,b) {return a + b.loss}
        return _.reduce(this.allocation_collection, reduce_fn, 0)

    },

    get demand_collection_array() {

        var return_array = []
        _.each(this.demand_collection.demanders, function(d) {
            return_array.push(d)
        })
        return return_array


    },

    get min_allocation() {
        var min_a = _.min(this.allocation_collection, function(d) {
            return d.allocation_size
        })
        return min_a.allocation_size
    },

    get max_allocation() {
        var max_a = _.max(this.allocation_collection, function(d) {
            return d.allocation_size
        })
        return max_a.allocation_size
    },

    
}


row = {
  "demand": 21.6620191555,
  "demand_id": "0",
  "demand_lat": 50.9201278763,
  "demand_lng": -2.67073887071,
  "demand_name": "Green Ln",
  "supply": 35.6895004806,
  "supply_id": 0,
  "supply_lat": 51.7493139942,
  "supply_lng": -0.240862847712,
  "supply_name": "Roehyde Way",
  "duration_min": 158.883333333,
  "distance_crowflies_km": 192.761854658,
  "distance_route_km": 235.458
}



s = new Supply(row)
d1 = new Demand(row)
s.set_demand_source_stats(row)
d1.set_supply_source_stats(row)


console.log("---Before allocation---")
console.log(`s.is_full is: ${s.is_full}`)
console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
console.log(`s.supply_allocated is: ${s.supply_allocated}`)

s.attempt_one_allocation(d1)

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// row["demand_id"] = 1
// d2 = new Demand(row)
// s.attempt_one_allocation(d2)

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// s.unallocate_one_demand(d2)
// s.unallocate_all_demand()

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// s.unallocate_one_demand(d1)

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)
// debugger;