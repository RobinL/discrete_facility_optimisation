// Notes:
// Could attempt to reduce supply incrementally and reallocate each point as required to 2nd best etc.

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

        var allocation_counter = 1

        _.each(demand_objects_in_order, function(demand) {
            // if (demand.demand_id == "0") { debugger;}
            demand.allocate_to_supply_in_closeness_order(me.supply_collection, allocation_counter)
            allocation_counter += 1
        })
        
    }


    this.compute_best_possible_loss = function(){
        // For each demand object, allocate and then unallocate (i.e. compute loss for each 
        //demand if it were allocated first)

        // Ensure allocations are empty
        reset_all_allocations()

        _.each(me.demand_collection.demanders, function(demand) {
 
            demand.allocate_to_supply_in_closeness_order(me.supply_collection, allocation_order = 1, record_stats=false)

            demand.unallocate_all_supply()

        })

    }
    
    this.allocate_each_demand_to_closest_supply_in_closeness_order = function() {

        var demand_order = get_demanders_order_in_order_of_distance_to_nearest_supply()
        me.allocate_from_order(demand_order)
                
    }

    this.allocate_by_marginal_loss = function() {

        //Allocate each one and then find the next best by marginal loss
        var allocation_counter = 1
        var dc = me.demand_collection.demanders
        var dc = _.clone(dc)
        var demanders_in_order = []

        // Make a copy of the demand collaction because we will be popping from it!

        function get_demand_by_marginal_loss(allocation_number) {
            var this_demand = _.sortBy(dc, function(demand) {
                return -demand.marginal_loss(allocation_number)
            })[0]
            demanders_in_order.push(this_demand)
            delete dc[this_demand.demand_id]
        }

      
        while (_.keys(dc).length>0) {
            var this_demand = get_demand_by_marginal_loss(allocation_counter)
            allocation_counter +=1
        }

        // Now allocate
        me.allocate_from_order(demanders_in_order)

    }

    function attempt_swap(demand_a,demand_b) {


        //We can save an allocation set just as a list.  Reapplying is easy.

        // Start by saving original allocation 

        var saved_allocations = {}
        function save_allocations(allocation_name) {

            saved_allocations[allocation_name] = {}
            saved_allocations[allocation_name]["allocations"] = []
            saved_allocations[allocation_name]["loss"] = demand_a.loss + demand_b.loss

            _.each([demand_a, demand_b], function(d) {
                _.each(d.allocations, function(a) {
                    saved_allocations[allocation_name]["allocations"].push(a)
                })
            })
        }
        save_allocations("original_allocation")

        // Want to allocate the demand from a and b optimally


        // AAAABBBB
        // BBBBAAAA
        // ABABABA
        // BABABABA
        
        demand_a.unallocate_all_supply()
        demand_b.unallocate_all_supply()
        demand_a.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        demand_b.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        save_allocations("AAABBB")
        
        demand_a.unallocate_all_supply()
        demand_b.unallocate_all_supply()
        demand_a.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        demand_b.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        save_allocations("BBBAAA")

        demand_a.unallocate_all_supply()
        demand_b.unallocate_all_supply()
        for (var i = 0; i < 10; i++) {
            debugger;
            demand_a.allocate_to_closest_available_supply(me.supply_collection)
            demand_b.allocate_to_closest_available_supply(me.supply_collection)
        }
        save_allocations("ABABAB")


        demand_a.unallocate_all_supply()
        demand_b.unallocate_all_supply()
        for (var i = 0; i < 10; i++) {
            demand_b.allocate_to_closest_available_supply(me.supply_collection)
            demand_a.allocate_to_closest_available_supply(me.supply_collection)
        }
        save_allocations("BABABA")

        var best_allocation_object = _.min(saved_allocations, function(d) {
            return d.loss
        })
        best_allocations = best_allocation_object.allocations 

        // Apply allocations 
        demand_a.unallocate_all_supply()
        demand_b.unallocate_all_supply()

        // Now register best allocations 
        _.each(best_allocations, function(this_allocation) {
            this_allocation.demand_object.allocations[this_allocation.supply_object.supply_id] = this_allocation
            this_allocation.supply_object.allocations[this_allocation.demand_object.demand_id] = this_allocation

        })
        

        if (best_allocation_object.loss < saved_allocations["original_allocation"].loss) {
            var aa = best_allocation_object.loss
            var bb = saved_allocations["original_allocation"].loss

            var best_total = _.reduce(best_allocation_object.allocations, function(a,b){return a + b.allocation_size},0)
            var orig_total = _.reduce(saved_allocations["original_allocation"].allocations, function(a,b){return a + b.allocation_size},0)

            debugger;
        }

        

    }

    this.reallocate_pairwise = function() {
        _.each(me.demand_collection_array, function(demander) {
            
            var neighbours = _.map(demander.neighbours, function(d) {return d})
            // debugger;
             // var neighbours = _.map(me.demand_collection.demanders, function(d) {return d})

            _.each(neighbours, function(neighbour) {
                if (neighbour.demand_id != demander.demand_id)
                attempt_swap(neighbour, demander)
            })
        })
    }


    this.compute_best_possible_loss()
    // console.log(_.keys(this.supply_collection.suppliers).length)
    this.allocate_each_demand_to_closest_supply_in_closeness_order()

    for (var i = 0; i < 30; i++) {
        this.allocate_by_marginal_loss()
        console.log(me.total_loss)
    }
    // console.log(`Total supply allocated: model ${me.supply_collection.total_supply_allocated}`)

    console.log("----")

    for (var i = 0; i < 5; i++) {
        // console.log(`Total supply allocated before: model ${me.supply_collection.total_supply_allocated}`)
        this.reallocate_pairwise()
        console.log(me.total_loss)
        // console.log(`Total supply allocated after: model ${me.supply_collection.total_supply_allocated}`)

    }

    // Iteratively allocate based on greatest loss.

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


// row = {
//   "demand": 21.6620191555,
//   "demand_id": "0",
//   "demand_lat": 50.9201278763,
//   "demand_lng": -2.67073887071,
//   "demand_name": "Green Ln",
//   "supply": 35.6895004806,
//   "supply_id": 0,
//   "supply_lat": 51.7493139942,
//   "supply_lng": -0.240862847712,
//   "supply_name": "Roehyde Way",
//   "duration_min": 158.883333333,
//   "distance_crowflies_km": 192.761854658,
//   "distance_route_km": 235.458
// }



// s = new Supply(row)
// d1 = new Demand(row)
// s.set_demand_source_stats(row)
// d1.set_supply_source_stats(row)


// console.log("---Before allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// s.attempt_one_allocation(d1)

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