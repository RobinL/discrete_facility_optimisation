//Assumes you've got jquery and underscore.js

/**
 * Takes data as received from d3.csv and processes it ready for use
 * Builds a property called 'column_description_data' that holds useful things
 * like the domains and descriptive names of columns, and whether they are categorical or continuous
 * @csv_data {List} a list of dicts, each one representing a row 
 */
 
function CsvProcessor(csv_data, 
                      manual_overrides = {},
                      default_colour_name = "none_given", 
                      default_colour_range = ["#6AE817","#FFA200","#B30409"], 
                      default_categorical_colours = d3.schemeCategory20,
                      default_filter = function(d){return d}) {

    // If no manual overrides are provided this will be undefined.

    // Approach is to automatically contruct a column description dictionary
    // Then override the automatically constructed on with any manual overrides

    function key_not_in_dict(k, dict) {
        return !(_.has(dict, k))
    }

    function apply_manual_overrides() {

        var cdd = me.column_descriptions_data 
        
        _.each(me.manual_overrides, function(overrides, col_name) {
            var this_col_desc = cdd[col_name]
            // Iterate through each value setting cdd
            _.each(overrides, function(override_value, override_key) {
                this_col_desc[override_key] = override_value
            })

        })

    }

    function process_column_descriptions() {

        var representative_row = csv_data[0]

        me.column_descriptions_data = {} 
        var cdd = me.column_descriptions_data //aliais to shorten code.

        _.each(representative_row, function(value, col_name) {  //d is dict, k is key
            cdd[col_name] = {"manually_included": false,
                             "long_name": col_name,
                             "colour_name": default_colour_name,
                             "colour_range": default_colour_range,
                             "key": col_name
                        }
        })

        // Search through each column detecting whether it's categorical or continuous
        _.each(cdd, function(val, col_name) {
         
            // Look through data - if we can parsefloat every value then we call it numeric otherwise categorical
            var categorical = _.some(me.original_csv_data, function(row) {
                
                this_value = row[col_name];

                if (this_value !== "") {
                    var pf = parseFloat(this_value)
                    if (isNaN(pf)) {
                        return true
                    }
                }
                return false

            })

            cdd[col_name]["is_categorical"] = categorical

            //Defaults for these will be different if user has indicated its categorical

            if (_.has(manual_overrides[col_name],"is_categorical")) {
                categorical = manual_overrides[col_name]["is_categorical"]
            }

            if (categorical) {
                cdd[col_name]["format"] = function(d) {return d;}
                cdd[col_name]["val_parser"] = function(d) {return d;}
                cdd[col_name]["colour_range"] = default_categorical_colours
            } else {
                cdd[col_name]["format"] = d3.format(",.1f")
                cdd[col_name]["val_parser"] = parseFloat
            }


        });


        // Finally apply manual overrides
        apply_manual_overrides()

    }

    function parse_columns() {

        _.each(me.original_csv_data, function(row) {

            _.each(me.column_descriptions_data, function(cdd_dict, col_name) {
                row[col_name] = cdd_dict["val_parser"](row[col_name])

            })
        })

    }

    //Filter the data 
    this.filter_data = function(filter_func = function(row) {return true;}) {
        me.current_data = _.filter(me.original_csv_data,filter_func)
        me.update_domains()
        me.set_colour_scales_from_col_desc()
    }

    this.update_domains = function() {

        // Iterate through the me.current_data setting domains
        // Where it's a categorical var, domain is unique values
        // Where it's a continuous var, domain is minmax

        function cat(col_name) {

            var cdd = me.column_descriptions_data[col_name]

            var uniques = _.uniq(me.current_data, function(item, key) {
               return item[col_name]
            })

            uniques = _.map(uniques, function(d) {
               return d[col_name]
            })

            cdd["domain"] = uniques

        }



        function con(col_name) {

            var all_values = _.map(me.current_data, function(row) {
               return row[col_name]
            });

            var all_values = _.filter(all_values, function(d) {
               return !(isNaN(d))
            })

            var minMetric = Math.min.apply(null, all_values);
            var maxMetric = Math.max.apply(null, all_values);

            // Need to split min to max depending on how many items in colour scale
            // get colour scale 
            var cdd = me.column_descriptions_data[col_name]
            cdd["domain"] = [minMetric, maxMetric]

        }

        _.each(me.column_descriptions_data, function(cdd_dict, col_name) {
            if (cdd_dict["is_categorical"]) {
                cat(col_name)
            } else {
                con(col_name)
            }
        })

        // Then update from manual overrides
        apply_manual_overrides()

    }

    // Use domains and colour information in column_descriptions_data to create colour scales for each variable
    this.set_colour_scales_from_col_desc = function() {

        function cat(col_name) {

            var cdd = me.column_descriptions_data[col_name]

            var uniques = _.uniq(me.current_data, function(item, key) {
               return item[col_name]
            })

            uniques = _.map(uniques, function(d) {
               return d[col_name]
            })

            cdd["colour_domain"] = uniques

            cdd["colour_scale"] = d3.scaleOrdinal()
                                    .domain(cdd["colour_domain"])
                                    .range(cdd["colour_range"])
        }



        function con(col_name) {

            var all_values = _.map(me.current_data, function(row) {
               return row[col_name]
            });

            var all_values = _.filter(all_values, function(d) {
               return !(isNaN(d))
            })

            var minMetric = Math.min.apply(null, all_values);
            var maxMetric = Math.max.apply(null, all_values);

            // Need to split min to max depending on how many items in colour scale
            // get colour scale 
            var cdd = me.column_descriptions_data[col_name]


            var num_colours = cdd["colour_range"].length
            var diff = maxMetric - minMetric

            var step = diff / (cdd["colour_range"].length - 1)
            var domain = d3.range(num_colours).map(function(d) {return minMetric + d*step})

            cdd["colour_domain"] = domain

            cdd["colour_scale"] = d3.scaleLinear()
                .domain(cdd["colour_domain"])
                .range(cdd["colour_range"]);


        }

        _.each(me.column_descriptions_data, function(cdd_dict, col_name) {
            if (cdd_dict["is_categorical"]) {
                cat(col_name)
            } else {
                con(col_name)
            }
        })

        apply_manual_overrides()

        
    }

    var me = this;
    this.manual_overrides = _.clone(manual_overrides)
    this.original_csv_data = _.clone(csv_data)
    this.column_descriptions_data = manual_overrides;
    process_column_descriptions()
    parse_columns()
    this.filter_data(default_filter) 


}


