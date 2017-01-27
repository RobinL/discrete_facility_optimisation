VMT.settings = {}
var VMTs = VMT.settings

// Paths to data
VMTs.shapefile_path = "topojson/uk_boundaries.json"
VMTs.csv_path = "data/datasets/data2.csv";

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

VMTs.csv_files = [ {"text": "Random 6 supply 60 demand", 
                    "value": "data/datasets/data2.csv"},
                    
                    {"text": "Random 8 supply 120 demand", 
                    "value": "data/datasets/data5.csv"},
                    
					{"text": "Random 8 supply 100 demand", 
                    "value": "data/datasets/data4.csv"},

                    {"text": "qa_data_01",
                    "value": "data/testing/qa_data_01.csv"},

                    {"text": "qa_data_02",
                    "value": "data/testing/qa_data_02.csv"},

                    {"text": "qa_data_03",
                    "value": "data/testing/qa_data_03.csv"},

                    {"text": "qa_data_04",
                    "value": "data/testing/qa_data_04.csv"},

                    {"text": "qa_data_05",
                    "value": "data/testing/qa_data_05.csv"},

                    {"text": "qa_data_06",
                    "value": "data/testing/qa_data_06.csv"},

                    {"text": "qa_data_07",
                    "value": "data/testing/qa_data_07.csv"},

                    {"text": "qa_data_08",
                    "value": "data/testing/qa_data_08.csv"},

                    {"text": "qa_data_09",
                    "value": "data/testing/qa_data_09.csv"},

                    {"text": "qa_data_09_geo_test",
                    "value": "data/testing/qa_data_09_geo_proof.csv"},

                    {"text": "qa_data_10",
                    "value": "data/testing/qa_data_10.csv"},

                    {"text": "qa_data_11",
                    "value": "data/testing/qa_data_11.csv"},

                    {"text": "qa_data_12",
                    "value": "data/testing/qa_data_12.csv"},

                    {"text": "qa_data_13",
                    "value": "data/testing/qa_data_13.csv"},
                  ]


VMTs.search_intensity_lookup = {
    "low":      {"text": "Low",  
                "value": "low", 
                "iterations_marginal_loss": 5, 
                "iterations_all_pairs": 0,
                "iterations_from_scratch" : 0},

    "medium":   {"text": "Medium", 
                "value": "medium", 
                "iterations_marginal_loss": 10, 
                "iterations_all_pairs": 1,
                "iterations_from_scratch" : 0},

    "high":     {"text": "High (slow)", 
                "value": "high", 
                "iterations_marginal_loss": 12, 
                "iterations_all_pairs": 2,
                "iterations_from_scratch" : 0},

    "veryhigh": {"text": "Ultra (very slow)", 
                "value": "veryhigh", 
                "iterations_marginal_loss": 20, 
                "iterations_all_pairs": 4,
                "iterations_from_scratch" : 1},

    "extreme": {"text": "Extreme (super slow)", 
                "value": "extreme", 
                "iterations_marginal_loss": 20, 
                "iterations_all_pairs": 4,
                "iterations_from_scratch" : 2}           
}

VMTs.show_hide_infopanel = {
    model_summary : true,
    supply_info : false,
    supply_allocation_info : false,
    demand_info : false,
    demand_allocation_info : false,
    key: false
}
