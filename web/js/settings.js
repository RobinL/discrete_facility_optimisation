VMT.settings = {}
var VMTs = VMT.settings

// Paths to data
VMTs.shapefile_path = "topojson/uk_boundaries.json"
VMTs.csv_path = "data/data.csv"

// Which variable to use to optimise
VMTs.optimisation_target = "duration_min"


VMTs.column_descriptions_overrides = {
    "demand": {
        "long_name": "Demand",
    }
};

//Colour options for shading
VMTs.colour_options = {
    "Red (high) to green (low)": ["#6AE817","#FFA200", "#B30409"]
};


VMTs.duration_thresholds = [30,60,120]


VMTs.supply_cols = ["supply","supply_id","supply_lat","supply_lng","supply_name"]
VMTs.demand_cols = ["demand","demand_id","demand_lat","demand_lng","demand_name"]

VMTs.demand_point_colour_scheme = VMT.utils.first_in_dict(VMTs.colour_options)
VMTs.demand_line_colour_scheme = VMT.utils.first_in_dict(VMTs.colour_options)