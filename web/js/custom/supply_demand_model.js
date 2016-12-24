// Notes:
// Could attempt to reduce supply incrementally and reallocate each point as required to 2nd best etc.



function SupplyAndDemandModel(processed_csv) {
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
            var closest_supply_stats = demander.active_supply_source_stats[demander.closest_active_supply_id]
            return closest_supply_stats[VMT.interface.optimisation_target]
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
            demand.allocate_to_supply_in_closeness_order(me.supply_collection, allocation_counter)
            allocation_counter += 1
        })
        
    }

    this.compute_best_possible_loss_for_each_demand = function(){
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

        //////////////////////////////
        // Efficiency considerations//
        //////////////////////////////
        // If A and B are both allocated to their closest court, then do not proceed.

        if (demand_a.is_fully_allocated_to_closest_court & demand_b.is_fully_allocated_to_closest_court) {
            return null;
        }

        //////////////////////////////
        // Want to allocate the demand from a and b optimally

        demand_a.unallocate_all_supply()
        demand_b.unallocate_all_supply()
        demand_a.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        demand_b.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        save_allocations("AAABBB")
        
        demand_a.unallocate_all_supply()
        demand_b.unallocate_all_supply()

        demand_b.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        demand_a.allocate_to_supply_in_closeness_order(me.supply_collection, -1)
        save_allocations("BBBAAA")

         //////////////////////////////
        // Efficiency considerations//
        //////////////////////////////
        // If AB and BA are the same, then it's unlikely ABABA and BABAB are going to be better

        // if (saved_allocations["AAABBB"].loss != saved_allocations["BBBAAA"].loss) {
        //////////////////////////////

            demand_a.unallocate_all_supply()
            demand_b.unallocate_all_supply()
            for (var i = 0; i < 10; i++) {
                demand_a.allocate_to_closest_available_supply(me.supply_collection)
                demand_b.allocate_to_closest_available_supply(me.supply_collection)
                if (demand_a.is_fully_allocated & demand_b.is_fully_allocated) {
                    break;
                }

            }
            save_allocations("ABABAB")

            demand_a.unallocate_all_supply()
            demand_b.unallocate_all_supply()
            for (var i = 0; i < 10; i++) {
                demand_b.allocate_to_closest_available_supply(me.supply_collection)
                demand_a.allocate_to_closest_available_supply(me.supply_collection)
                if (demand_a.is_fully_allocated & demand_b.is_fully_allocated) {
                    break;
                }
            }
            save_allocations("BABABA")
        // }   

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
        

    }

    this.reallocate_pairwise = function() {
        
        // Do a single round of 'reallocate all'
        var dc = me.demand_collection_array
        var demand_a = dc.pop()
        while (dc.length > 1) {
            _.each(dc, function(demand_b) {
                attempt_swap(demand_a, demand_b)
            })
            demand_a = dc.pop()
        }

        // TODO:  Could be clever here - is it safe to assume that we only need to do pairwise swaps 
        // where one (both?) of the pairs is on a border between two supply alloactions.

        // One way to be clever would be to precompute a swap list when we load in data.
    }

    this.run_model = function() {

        this.compute_best_possible_loss_for_each_demand()
        this.allocate_each_demand_to_closest_supply_in_closeness_order()

        var parameters = VMT.settings.search_intensity_lookup[VMT.interface.search_intensity]



        for (var i = 0; i < parameters.iterations_marginal_loss; i++) {
            this.allocate_by_marginal_loss()
        }

        for (var i = 0; i < parameters.iterations_all_pairs; i++) {
            this.reallocate_pairwise()
        }


    }

    this.filter_suppliers = function() {

        // // Copy all active suppliers to demander.supply_source_stats 
        // VMT.mode.supply_collection.suppliers_info
        _.each(me.demand_collection.demanders, function(demand) {
            // Copy over active supply info.
            demand.active_supply_source_stats = {}

            _.each(me.supply_collection.active_suppliers, function(supply) {
                var supply_id = supply.supply_id    
                demand.active_supply_source_stats[supply_id] = demand.all_supply_source_stats[supply_id]
            })
        })

    }

    this.filter_suppliers()
    this.run_model()

    

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

    get min_loss() {
        var min_a = _.min(this.allocation_collection, function(d) {
            return d.loss
        })
        return min_a.loss
    },

    get max_loss() {
        var max_a = _.max(this.allocation_collection, function(d) {
            return d.loss
        })
        return max_a.loss
    },

    get demand_allocated() {

        var total_demand = this.demand_collection.total_demand
        var reduce_fn = function(a,b) {return a + b.allocation_size};
        var allocated = _.reduce(this.allocation_collection, reduce_fn, 0)

        return allocated

    },

    get demand_unallocated() {
        return this.demand_collection.total_demand  - this.demand_allocated
    },

    get supply_allocated() {

        var total_supply = this.supply_collection.total_supply
        var reduce_fn = function(a,b) {return a + b.allocation_size};
        var allocated = _.reduce(this.allocation_collection, reduce_fn, 0)

        return allocated

    },

    get supply_unallocated() {
        return this.supply_collection.total_supply - this.supply_allocated
    }
    
}


// Results:

// Initial allocation, no iteration:  17467.19
// Iterate marginal loss, no swap:  14691
// Swap neighbours only AB or BA: 14709.68085
// Swap all, AB or BA:   14263
// Swap neighbours only AB, BA, ABAB, BABA: 14435
// Swap all, AB, BA, ABAB, BABA:  14172
// Swap all, AB, BA, ABAB, BABA, many iterations 14158.241263


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
// d1.set_all_supply_source_stats(row)


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