var utils = new UtilityFunctions()



d3.csv("data/data.csv", function(data) {

    //

    var column_descriptions_overrides = {}

    csv_processed = new CsvProcessor(data, column_descriptions_overrides)

    var model = new SupplyAndDemandModel(csv_processed)


    model.allocate_each_demand_to_closest_supply_in_closeness_order()


    
})