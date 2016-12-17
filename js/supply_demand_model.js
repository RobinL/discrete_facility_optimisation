// Notes:
// We want to allocate demand to supply, not vice veras

// But note that a single demand_source can be allocated to multiple supply_sources
// Because partial allocation is possible

// Given supply, we need a loss-ordered list of demands

// 

//FIRST THING - write well-organised code that simply allocates each demand to closest court, unless it's full, in which case, do not allocate

var optimisation_target = "duration_min"  //Where's best to put this?

function deep_copy_object(obj) {
   new_object = $.extend(true, {}, obj);
   return new_object
}


function Supply(row) {

	var me = this 

	this.reset_allocations = function() {
    	this.allocations = {}	//Populated in form of {demand_id:allocation}
    }

    this.attempt_one_allocation = function(demand_object) {

    	//If there's space, make an allocation of demand to supply
    	if (me.is_full) {
    		return false
    	}
    	
    	else if (me.supply_unallocated >= demand_object.demand_unallocated) {  //Supply exceeds demand
    		allocation_size = demand_object.demand_unallocated
    	}
    	else { //Demand exceeds supply
    		allocation_size = me.supply_unallocated
    	}
    	allocation = new Allocation(demand_object, me, allocation_size)
    	
    	//Register allocation to both supply and demand objects
    	me.allocations[demand_object.demand_id] = allocation
    	demand_object.allocations[me.supply_id] = allocation

    	return true 
    }

    this.unallocate_one_demand = function(demand_object) {
    	//Need to unallocate from me.allocations, but also from the demand object
    	me.allocations[demand_object.demand_id].unallocate()
   
    }

    this.unallocate_all_demand = function() {
        _.each(me.allocations, function(allocation, key) {
            allocation.unallocate()
        })
    }

    //Each csv row contains data about a specific supply/demand combo (travel time etc.)
    //Each supply object wants to be aware of this data
    this.set_demand_source_stats = function(row) {
    	if (row["supply_id"] != this["supply_id"]) {
    		throw new Error("You attempted to assign stats to the wrong supply source"); 
    	}

    	var stats_cols = ["duration_min","distance_crowflies_km","distance_route_km", "demand_id"]
    	var d = this.demand_source_stats[row["demand_id"]] = {}
    	_.each(stats_cols, function(c) {
    		d[c] = row[c]
    	})

    }

    this.demand_source_stats = {}
    // this.demand_source_order = [] // ["demand_id1", "demand_id2"] etc - this determines the order in which we access demand sources


    //Initialisation code:
	var supply_cols = ["supply","supply_id","supply_lat","supply_lng","supply_name"]

	// var new_row = deep_copy_object(row)
	_.each(supply_cols, function(c) {
		me[c] = row[c]
	})

	this.reset_allocations()


}

Supply.prototype = {

    get supply_allocated() {
        reduce_sum = function(a,b) {return a + b.allocation_size}
        return _.reduce(this.allocations, reduce_sum, 0)
    },

    get supply_unallocated() {
    	return this.supply - this.supply_allocated
    },

    get is_full() {
    	if (this.supply_unallocated <=0) {
    		return true
    	} else {
    		return false
    	}
    },

    get toString() {
        var lines = []
        lines.push(`Supply ID ${this.supply_id}: ${this.supply_name}`)
        lines.push(`Total supply: ${this.supply}`)
        lines.push(`Allocated = ${this.supply_allocated}`)
        _.each(this.allocations, function(a) {
            lines.push(a.toString)
        })
        lines.push(`Unallocated = ${this.supply_unallocated}`)

        return lines.join("\n")
    },

    get loss() {
        // Iterate through allocations computing loss from each one
        var total_loss = 0
        var reduce_fn = function(a,b) {return a + b.loss}
        return _.reduce(this.allocations, reduce_fn ,0)
    }

    
}


function Demand(row) {

	var me = this 


	 //Copy data from each 
	var demand_cols = ["demand","demand_id","demand_lat","demand_lng","demand_name"]
	// var new_row = deep_copy_object(row)
	_.each(demand_cols, function(c) {
		me[c] = row[c]
	
    })

    this.set_supply_source_stats = function(row) {


        if (row["demand_id"] != this["demand_id"]) {
            throw new Error("You attempted to assign stats to the wrong demand source"); 
        }

        var stats_cols = ["duration_min","distance_crowflies_km","distance_route_km", "supply_id"]
        var d = this.supply_source_stats[row["supply_id"]] = {}

        _.each(stats_cols, function(c) {
            d[c] = row[c]
        })

    }

    this.unallocate_all_supply = function() {
        _.each(me.allocations, function(allocation, key) {
            allocation.unallocate()
        })
    }

    this.allocate_to_supply_in_closeness_order = function(supply_collection) {

        // While there's still demand left to be allocated
        for (var i = 0; i < me.supply_ids_ordered_by_closest.length; i++) {
            
            var supply_id = me.supply_ids_ordered_by_closest[i]
            var this_supply = supply_collection.suppliers[supply_id]

            this_supply.attempt_one_allocation(me)

            if (me.is_fully_allocated) {
                break;
            }
            
        }

    }
    this.allocations = {}
    this.supply_source_stats = {}
    this.supply_ids_ordered_by_closest = [] 
	this.loss_stats_by_allocation_order = {}

    this.update_loss_stats_by_allocation_order = function(loss, order, add_to_counter=true) {

        if (add_to_counter) {
            var addition = 1;
        } else {
            var addition = 0;
        }

        var template = {"loss": loss, "count": addition}

        if (utils.key_not_in_dict(order, me.loss_stats_by_allocation_order)) {
            me.loss_stats_by_allocation_order[order] = template;
        } else {
            // If already exists recompute average loss for this allocation order
            var this_record = me.loss_stats_by_allocation_order[order] 
            var count = this_record.count
            var new_loss = (count * this_record.loss + loss*addition)/(count + addition)

            //If count is zero and addition is zero, set to this loo
            if (count == 0 & addition == 0) {
                new_loss = loss
            }

            var update = {"loss": new_loss, "count": count+addition}
            me.loss_stats_by_allocation_order[order] = update;

        }

    }






}

Demand.prototype = {

    get demand_allocated() {

        reduce_sum = function(a,b) {return a + b.allocation_size}
        return _.reduce(this.allocations, reduce_sum,0)
    },

    get demand_unallocated() {
    	return this.demand - this.demand_allocated

    },


    get is_fully_allocated() {
    	if (this.demand_unallocated <=0) {
    		return true
    	} else {
    		return false
    	}
    },

    get closest_supply_id() {

        return this.supply_ids_ordered_by_closest[0]
    },
    
    get loss() {
        // Iterate through allocations computing loss from each one
        var total_loss = 0
        var reduce_fn = function(a,b) {return a + b.loss}
        return _.reduce(this.allocations, reduce_fn ,0)
            
        }

}

function Allocation(demand_object, supply_object, allocation_size) {
	var me = this;
    this.demand_object = demand_object;
	this.supply_object = supply_object;
	this.allocation_size = allocation_size;

    this.unallocate = function() {
        // Unregister this allocation on the supply and demand object
        delete this.demand_object.allocations[this.supply_object.supply_id]
        delete this.supply_object.allocations[this.demand_object.demand_id]
    }


}


Allocation.prototype = {
    get loss() {
        var supply_id = this.supply_object.supply_id
        var loss_per_unit_size = this.demand_object.supply_source_stats[supply_id][optimisation_target]
        return this.allocation_size * loss_per_unit_size
    },

    get toString() {
        return `    An allocation of ${this.allocation_size} from Demander ${this.demand_object.demand_id}:${this.demand_object.demand_name}::${this.demand_object.demand} -> Supplier ${this.supply_object.supply_id}:${this.supply_object.supply_name}::${this.supply_object.supply}`
    }
}

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
        return _.reduce(this.suppliers, function(a,b) {
            return a + b.supply
        },0)

    }

}


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
    //TODO
    get allocations() {
        return "not implemented yet"
    },

    get total_demand() {
        return _.reduce(this.demanders, function(a,b) {
            return a + b.demand
        },0)

    }
}


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

    }
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