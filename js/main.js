var utils = new UtilityFunctions()

d3.csv("data/data.csv", function(data) {



    var column_descriptions_overrides = {}

    csv_processed = new CsvProcessor(data, column_descriptions_overrides)

    var model = new SupplyAndDemandModel(csv_processed)

    model.find_solution()


    
})