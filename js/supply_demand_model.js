// Notes:
// We want to allocate demand to supply, not vice veras

// But note that a single demand_source can be allocated to multiple supply_sources
// Because partial allocation is possible

// Given supply, we need a loss-ordered list of demands

// 

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

    this.attempt_allocation = function(demand_object) {

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

    this.unallocate = function(demand_object) {
    	//Need to unallocate from me.allocations, but also from the demand object
    	delete me.allocations[demand_object.demand_id]
    	delete demand_object[me.supply_id]
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
	var new_row = deep_copy_object(row)
	_.each(supply_cols, function(c) {
		me[c] = new_row[c]
	})

	this.reset_allocations()


}

Supply.prototype = {

    get supply_allocated() {
        reduce_sum = function(a,b) {
        	return a + b.allocation_size}
        return _.reduce(this.allocations, reduce_sum,0)
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

    
}


function Demand(row) {

	var me = this 

	this.reset_allocations = function() {
    	this.allocations = {}	//Populated in form of {supply_id:allocation}
    }

	 //Initialisation code:
	var demand_cols = ["demand","demand_id","demand_lat","demand_lng","demand_name"]
	var new_row = deep_copy_object(row)
	_.each(demand_cols, function(c) {
		me[c] = new_row[c]
	
    })

    me.set_supply_source_stats = function(row) {

        if (row["demand_id"] != this["demand_id"]) {
            throw new Error("You attempted to assign stats to the wrong demand source"); 
        }

        var stats_cols = ["duration_min","distance_crowflies_km","distance_route_km", "supply_id"]
        var d = this.supply_source_stats[row["supply_id"]] = {}

        _.each(stats_cols, function(c) {
            d[c] = row[c]
        })

    }

    this.supply_source_stats = {}
    this.supply_stats_ordered_by_closest = [] //[ supplyid1, supplyid2 etc] 

	this.reset_allocations()





}

Demand.prototype = {

    get demand_allocated() {
        reduce_sum = function(a,b) {return a.allocation_size + b.allocation_size}
        return _.reduce(this.allocations, reduce_sum,0)
    },

    get demand_unallocated() {
    	return this.demand - this.demand_allocated

    },

    get is_full() {
    	if (this.demand_unallocated <=0) {
    		return true
    	} else {
    		return false
    	}
    },

    get closest_supply_id() {
        return this.supply_stats_ordered_by_closest[0]
    }

}

function Allocation(demand_object, supply_object, allocation_size) {
	this.demand_object = demand_object
	this.supply_object = supply_object
	this.allocation_size = allocation_size
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

}


//The demand collection keeps track of the order in which demand objects were allocated.
//Each demand object keeps track of relative loss associated with being allocated in nth position relative to first best.
//By processing this data, this enables a new 'demand allocation' to be created.
//Key thing is to get the data right.

function DemandCollection(processed_csv) {


    function demand_exists(csv_row) {
        return _.has(me.demanders, csv_row["demand_id"])
    }


    this.set_initial_demand_allocation_order = function() {
        //Initial demand allocation is by allocating closest
        //Sort demanders by 

        // from each deamnder we get a supplier

    

        var demand_order = _.sortBy(me.demanders, function(demander) {

            var closest_supply_stats = demander.supply_source_stats[demander.closest_supply_id]
            return closest_supply_stats[optimisation_target]

        })

        debugger;

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
            demander.supply_stats_ordered_by_closest = _.map(sss_ordered, mapfn)

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


function SupplyAndDemandModel(processed_csv, optimisation_target="duration_min") {
    //Has a supply collection and a demand collection
    var me = this;
    this.processed_csv = processed_csv

    // Hack the processed_csv to include a column called 'optimisation target'



    this.supply_collection = new SupplyCollection(processed_csv)
    this.demand_collection = new DemandCollection(processed_csv)

    

    //The first allocation technique is to iterate through demand objects
    //Assign as much as possible to their closest supply until its full
    //Then allocate to second closest etc.

    //But if we do this, some will get assigned to second best,
    //We want to calculate the loss in allocating to second best.

    //Then re-do allocation order by 'how bad it was to allocate to second best'
    //And reallocate.

    //For each demand object, keep track of loss associated with being the nth demand allocated.

    //Then attempt bilateral swaps

    this.find_solution = function() {

        me.demand_collection.set_initial_demand_allocation_order()




    }

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
// debugger;

// console.log("---Before allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// s.attempt_allocation(d1)

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// row["demand_id"] = 1
// d2 = new Demand(row)
// s.attempt_allocation(d2)

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// s.unallocate(d2)

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)

// s.unallocate(d1)

// console.log("---After allocation---")
// console.log(`s.is_full is: ${s.is_full}`)
// console.log(`s.supply_unallocated is: ${s.supply_unallocated}`)
// console.log(`s.supply_allocated is: ${s.supply_allocated}`)