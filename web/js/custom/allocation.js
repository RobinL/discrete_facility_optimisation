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
        var loss_per_unit_size = this.demand_object.all_supply_source_stats[supply_id][VMT.interface.optimisation_target]
        return this.allocation_size * loss_per_unit_size
    },


}