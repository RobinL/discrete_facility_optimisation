VMT.settings = {}
var VMTs = VMT.settings

// Paths to data
VMTs.shapefile_path = "topojson/uk_boundaries.json"
VMTs.csv_path = "data/data.csv"




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

VMTs.csv_files = [ 
					{"text": "Random 3 supply 6 demand", 
                    "value": "data/data.csv"},
                    
					{"text": "Random 10 supply 60 demand", 
                    "value": "data/data2.csv"},

                    {"text": "Random 12 supply 140 demand", 
                    "value": "data/data3.csv"},
                  ]


VMTs.search_intensity_lookup = {
    "low":      {"text": "Low",  
                "value": "low", 
                "iterations_marginal_loss": 5, 
                "iterations_all_pairs": 0},

    "medium":   {"text": "Medium", 
                "value": "medium", 
                "iterations_marginal_loss": 10, 
                "iterations_all_pairs": 0},

    "high":     {"text": "High (slow)", 
                "value": "high", 
                "iterations_marginal_loss": 12, 
                "iterations_all_pairs": 1},

    "veryhigh": {"text": "Ultra (very slow)", 
                "value": "veryhigh", 
                "iterations_marginal_loss": 20, 
                "iterations_all_pairs": 5},
}