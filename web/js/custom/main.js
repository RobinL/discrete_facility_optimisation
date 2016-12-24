
VMT.interface = new Interface()
VMT.mapholder = new MapHolder()

var p1 = $.ajax(VMT.settings.shapefile_path)
var p2 = $.ajax(VMT.interface.csv_path)
$.when(p1, p2).done(startup)

function parse_ajax_topo_data(topo_data) {

	var geo_collection = topo_data[0]
    var geo_collection = topojson.feature(geo_collection, geo_collection.objects.subunits)

    //England, Wales
    geo_collection.features = [geo_collection.features[0], geo_collection.features[4]]
    VMT.geo_collection = geo_collection

}

function parse_ajax_csv_data(csv_data) {

	var csv_data = d3.csvParse(csv_data[0])
	// _.each(csv_data, function(d) {d["supply"] = d["supply"]})
	VMT.csv_processed = new CsvProcessor(csv_data, VMT.settings.column_descriptions_overrides)

}


function startup(ajax_topo_data, ajax_csv_data) {

	parse_ajax_topo_data(ajax_topo_data)
	parse_ajax_csv_data(ajax_csv_data)
    
    VMT.controller  = new Controller(VMT.csv_processed)
    
    VMT.mapholder.map.on("zoom", function() {
    	VMT.mapholder.reset_all_layers()
    	VMT.mapholder.initiate_bounds()
    	VMT.supply_points_layer.draw_from_scratch()
    	VMT.demand_allocation_layer.draw_from_scratch()
    })

    VMT.mapholder.map.on("viewreset moveend", function() {
    	VMT.mapholder.initiate_bounds()
    })

}



