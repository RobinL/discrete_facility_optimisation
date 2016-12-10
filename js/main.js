d3.csv("data/data.csv", function(data) {

    var column_descriptions_overrides = {}

    csv_processed = new CsvProcessor(data, column_descriptions_overrides)
    debugger;
})