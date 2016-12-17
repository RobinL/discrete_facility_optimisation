// SupplyPointsLayer draws 
//
function SupplyPointsLayer() {
	// As a vis componenet, this should only deal with drawing the data
    
    this.draw_from_scratch = function() {

        VMT.mapholder.redraw()

        //Get layer 
        g = d3.select("#supply_location_layer")
        
        //Now our 'current points' contain all the information we need to draw the voronoi map
        //For each filtered point, covert the lat lng into x y point in svg space
        var g = d3.select("#supply_location_layer")

        var supply_locations_sel = g.selectAll(".supply_locations")
            .data(me.suppliers_array)
            .enter()

        
        supply_locations_sel.append("circle")
            .attr("class", "supply_locations")

    }


    this.update = function() {

        var facility_locations_sel = d3.selectAll(".supply_locations")
        this.recalculate_supply_xys()

        var va = facility_locations_sel
            .data(me.suppliers_array)

        va
            .attr("cy", function(d) {
                return d.y
            })
            .attr("cx", function(d) {
                return d.x
            })
            .style('fill', function(d) {
                if (d.active) {
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

    this.recalculate_supply_xys = function() {
        //Use leaflet's internal functions to convert the 
        //points' lat lng into x y values corresponding to the leaflet map
        _.each(VMT.controller.suppliers_info, function(supplier, key) {

            var point = VMT.mapholder.latlng_to_xy(supplier.supply_lat, supplier.supply_lng)

            supplier.x = point.x;
            supplier.y = point.y;
        })
    }

    var me = this;
    this.controller = VMT.controller;
    this.draw_from_scratch()
    this.update()

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
