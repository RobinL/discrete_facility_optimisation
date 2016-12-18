function MapHolder() {

	this.tilelayer = new L.TileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png")
	this.map = new L.Map("map", {
	                        center: [52.53, -0.09],
	                        zoom: 7,
	                        errorTileUrl: 'error.png'
	                    })
	                    .addLayer(this.tilelayer);



	//Add an svg that sits on top of the leaflet map, which we draw the d3 svg elements to
	this.svg = d3.select(this.map.getPanes().overlayPane).append("svg")
	this.svg.attr("id", "v_map_overlay")

	var g = this.svg.append("g").attr("class", "leaflet-zoom-hide")


	//Add a layer for each element

	var voronoi_cells_layer = g.append("g").attr("id", "voronoi_cells_layer")
	var demand_lines_layer = g.append("g").attr("id", "demand_lines_layer")
	var demand_points_layer = g.append("g").attr("id", "demand_points_layer")
	var supply_location_layer = g.append("g").attr("id", "supply_location_layer")
	var voronoi_borders_layer = g.append("g").attr("id", "voronoi_borders_layer")
	var clip_path_layer = g.append("g").attr("id", "clip_path_layer")

	var me = this

	this.redraw = function() {


        var bounds = this.map.getBounds(),
            topLeft = this.map.latLngToLayerPoint(bounds.getNorthWest()),
            bottomRight = this.map.latLngToLayerPoint(bounds.getSouthEast())
        

        //The SVG overlay needs to cover the whole of the map area
        this.svg.style("width", this.map.getSize().x + 'px')
                .style("height", this.map.getSize().y + 'px')
                .style("margin-left", topLeft.x + "px")
                .style("margin-top", topLeft.y + "px");;

       //Account for padding etc. to make sure the overlay is correctly placed
       g.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
	}

	this.reset_all_layers = function() {
        g.selectAll("g").remove()

    	//Add a layer for each element
        voronoi_cells_layer = g.append("g").attr("id", "voronoi_cells_layer")
        demand_lines_layer = g.append("g").attr("id", "demand_lines_layer")
        demand_points_layer = g.append("g").attr("id", "demand_points_layer")
        supply_location_layer = g.append("g").attr("id", "supply_location_layer")
        voronoi_borders_layer = g.append("g").attr("id", "voronoi_borders_layer")
        clip_path_layer = g.append("g").attr("id", "clip_path_layer")

    }

    this.latlng_to_xy = function(lat,lng) {
    	var latlng = new L.LatLng(lat, lng);
        var point = me.map.latLngToLayerPoint(latlng);
        return {x:point.x, y:point.y}
    }

    this.redraw()


}




