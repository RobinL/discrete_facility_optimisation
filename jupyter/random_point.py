# Get random point and name
import psycopg2
import pandas as pd
from random import randint
import requests
import json

conn_string = "host='localhost' dbname='postgres' user='postgres' password=''"
conn = psycopg2.connect(conn_string)
cur = conn.cursor()

def postcode_to_name(postcode):
    """
    Convert a postcode to a named address using Google Maps API
    """
    
    url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination}"\
    .format(origin=postcode, destination=postcode)
    
    r = requests.get(url)
    return json.loads(r.content)["origin_addresses"][0]

def lat_lng_to_name(lat,lng):
    """
    Convert a postcode to a named address using Google Maps API
    """
    
    url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins={lat},{lng}&destinations={lat},{lng}"\
    .format(lat=lat, lng=lng)
    
    r = requests.get(url)
    return json.loads(r.content)["origin_addresses"][0]

def parse_simple_name(name):
    name = name.replace("Unnamed Road", "")
    name = name.replace(",", "")
    names = name.split(" ")
    return " ".join(names[:2])


def get_random_point_pop_density():
    """
    Get a random point in Great Britain by picking from a list of all
    postcodes at random
    """

    count_sql = """
    select count(*)
    from all_postcodes
    """

    cur.execute(count_sql)
    total_rows = cur.fetchone()[0]
    row_to_get = randint(0,total_rows)

    print row_to_get
    row_sql = """
    select postcode,  
    st_x(st_transform(geom,4326)) as lng,
    st_y(st_transform(geom,4326)) as lat
    from all_postcodes offset {offset} limit 1
    """
    cur.execute(row_sql.format(offset=row_to_get))
    row = cur.fetchone()
    colnames = [desc[0] for desc in cur.description]
    row =dict(zip(colnames,row))

    row["name"] = postcode_to_name(row["postcode"])
    
    row["name"] = parse_simple_name(row["name"])

    return row




# Get a random point using a shapefile

# produce a random point in england and wales

def get_random_point_geography():
    """
    Get a random point in england and wales with
    uniform distribution geographically
    """
    
    sql = """
    select st_contains( 
    (select geom from england_and_wales), 
    st_GeomFromText('POINT('||{e}||' '||{n}||')',27700)
    )
    """

    
    
    for i in range(100):
        
        easting = randint(0,700000)
        northing = randint(0,600000)
        
        cur.execute(sql.format(e=easting, n=northing))
        in_uk = cur.fetchone()[0]
        if in_uk:
            break
            
            
    #     Get lat lng

    sql = """
    select
           st_x(st_transform(st_GeomFromText('POINT('||{e}||' '||{n}||')',27700),4326)) as lng,
           st_y(st_transform(st_GeomFromText('POINT('||{e}||' '||{n}||')',27700),4326)) as lat
     
    """
    
    cur.execute(sql.format(e=easting,n=northing))
    result = cur.fetchone()
    
    return_dict = {}
    
    return_dict["lng"] = result[0]
    return_dict["lat"] = result[1]
    return_dict["name"] = lat_lng_to_name(return_dict["lat"], return_dict["lng"])
    return_dict["name"] = parse_simple_name(return_dict["name"])
    
    return return_dict

