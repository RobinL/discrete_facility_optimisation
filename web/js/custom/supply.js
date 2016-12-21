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

        if (demand_object.is_fully_allocated) {
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
	var supply_cols = VMT.settings.supply_cols

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
    	if (this.supply_unallocated <= 1e-5) {  //not zero to account for floating point errors
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