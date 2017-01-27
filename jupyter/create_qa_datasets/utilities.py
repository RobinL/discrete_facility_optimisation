
# coding: utf-8

# In[ ]:

import pandas as pd
import psycopg2
import random


def generate_point_dict(start_point, bearing_degrees, distance_km, conn):
    """For each of the supply, generate n demands""" 
    sql = """
        select ST_x(ST_Project(p.point, {distance_meters}, radians({degrees}))::geometry) as lng,
        ST_y(ST_Project(p.point, {distance_meters}, radians({degrees}))::geometry) as lat 
        
        from  (select ST_SetSRID(ST_MakePoint({lng},{lat}),4326) as point) as p
    """
    
    this_sql = sql.format(lat=start_point["lat"], lng=start_point["lng"], degrees=bearing_degrees,
                          distance_meters=distance_km*1000)
    return pd.read_sql(this_sql, conn).loc[0].to_dict()


def calculate_distances(all_combos, conn):
    # Add distance and duration (for testing all set to crowflies distance)
    sql = """
        select ST_Distance(
        ST_Transform(ST_SetSRID(ST_MakePoint({lng1},{lat1}),4326),27700),
        ST_Transform(ST_SetSRID(ST_MakePoint({lng2},{lat2}),4326),27700)
        )/1000 as distance;
    """

    for r in all_combos.iterrows():
        index = r[0]
        row = r[1]

        lat1 = row["supply_lat"]
        lng1 = row["supply_lng"]

        lat2= row["demand_lat"]
        lng2 = row["demand_lng"]

        df_distance = pd.read_sql(sql.format(lat1 = lat1, lat2=lat2, lng1=lng1, lng2=lng2 ),conn)
        distance = df_distance.loc[0,"distance"]

        all_combos.loc[index,"duration_min"] = distance
        all_combos.loc[index,"distance_crowflies_km"] = distance
        all_combos.loc[index,"distance_route_km"] = distance
       
    return(all_combos)


def locate_supplies(num_supplies, sup_distances_km, sup_bearings_degrees, supply_vol, conn):
    supply = []

    start_supply = {
        "lng": -1.242375,
        "lat": 51.5011093,
        "supply": supply_vol[0],
        "supply_name": "supply0"
    }
    supply.append(start_supply)

    for i in range(num_supplies-1):
        distance_km = sup_distances_km[i+1]
        bearing_degrees = sup_bearings_degrees[i+1]
        this_supply = generate_point_dict(start_supply, bearing_degrees, distance_km, conn)
        this_supply["supply"] = supply_vol[i+1]
        this_supply["supply_name"] = "supply" + str(i+1)
        supply.append(this_supply)

    supply_df = pd.DataFrame(supply).reset_index()
    supply_df.columns=["supply_id", "supply_lat", "supply_lng", "supply", "supply_name"]
    return(supply_df)
   
