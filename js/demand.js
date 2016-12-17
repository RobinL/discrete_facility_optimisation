function Demand(row) {

	var me = this 


	 //Copy data from each 
	var demand_cols = VMT.settings.demand_cols
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

        if (VMT.utils.key_not_in_dict(order, me.loss_stats_by_allocation_order)) {
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
            
    },

    get top_allocation() {
        // Sort allocations by allocation size and return
        return _.max(this.allocations, function(a) {
            return a.allocation_size
        })

    }

}