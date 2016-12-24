// SupplyPointsLayer draws 
//
function SupplyPointsLayer() {
	// As a vis componenet, this should only deal with drawing the data
    
    this.draw_from_scratch = function() {

        d3.select("#supply_location_layer").selectAll("*").remove()
        g = d3.select("#supply_location_layer")
        
        //Now our 'current points' contain all the information we need to draw the voronoi map
        //For each filtered point, covert the lat lng into x y point in svg space
        var g = d3.select("#supply_location_layer")

        var supply_locations_sel = g.selectAll(".supply_locations")
            .data(VMT.model.supply_collection.suppliers_array)
            .enter()

        supply_locations_sel.append("circle")
            .attr("class", "supply_locations")
            .on("click", supply_on_click)

        this.update()

    }


    this.update = function() {

        var facility_locations_sel = d3.selectAll(".supply_locations")

        var va = facility_locations_sel
            .data(VMT.model.supply_collection.suppliers_array)


        va.attr("cy", function(d) {
                return VMT.mapholder.latlng_to_xy(d.supply_lat, d.supply_lng).y;
            })
            .attr("cx", function(d) {
                return VMT.mapholder.latlng_to_xy(d.supply_lat, d.supply_lng).x;
            })
            .style('fill', function(d) {
                if (d.is_active) {
                    return "red"
                } else {
                    return "grey"
                }
            })
            .attr("r", function(d) {
                return 10
            })
            .attr("fill-opacity", function(d) {
                return 1
            })
            .attr("stroke", "black")
            
    }


    function supply_on_click() {
        var supply_id = this.__data__.supply_id
        VMT.controller.toggle_supplier(supply_id)
    }

    var me = this;
    this.controller = VMT.controller;
    this.draw_from_scratch()
    

}
SupplyPointsLayer.prototype ={

    get suppliers_array() {
        var suppliers = []
        _.each(this.controller.suppliers_info, function(supplier, key) {
            suppliers.push(supplier)
        })
        return suppliers
    }

}
