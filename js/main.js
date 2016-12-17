

var p1 = $.ajax(VMT.settings.shapefile_path)
var p2 = $.ajax(VMT.settings.csv_path)
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
	VMT.csv_processed = new CsvProcessor(csv_data, VMT.settings.column_descriptions_overrides)

}


function startup(ajax_topo_data, ajax_csv_data) {

	VMT.mapholder = new MapHolder()

	parse_ajax_topo_data(ajax_topo_data)
	parse_ajax_csv_data(ajax_csv_data)
	VMT.model = new SupplyAndDemandModel(VMT.csv_processed)
	VMT.controller  = new Controller(VMT.csv_processed)
	VMT.supply_points_layer = new SupplyPointsLayer();
    VMT.demand_allocation_layer = new DemandAllocationLayer()

}