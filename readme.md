# Facility location analysis and optimisation

## Purpose

A javascript webapp which helps to determine the optimal location of facilities.

Supposing you have _d_ discrete sources of demand and _s_ potential locations for supply, this webapp will enable you to analyse the travel time and distance that results from different supply options.

The model can account for imbalances between supply and demand, and will attempt to optimally allocate supply to demand when suppliers get full, and demanders have to be allocated to their 2nd closest, 3rd closest supplier etc.

It can optimise on drive time, drive distance, or Euclidean distance.

The easiest way to understand this app is to [take a look at the live example](https://robinl.github.io/discrete_facility_optimisation/web/).


## Implementation

The webapp has various components:

A model, which performs the optimisation, assigning demand units to supply units.

Various object oriented javascript classes that model the entities ([demand unit](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/demand.js), [supply unit](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/supply.js), [demand collection](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/demand_collection.js), [supply collection](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/supply_collection.js), [model](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/supply_demand_model.js) etc).

The data visualisation that represents modelling results, and is implemented in d3.js.

## Setting up for your data

You can easily use this webapp with your data, using the following steps:

Format your data [like this](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/data/datasets/data.csv).  You need to get travel time data from all demand units to all supply units (i.e. the cartesian product).  You can find some code to help you with this [here](https://github.com/RobinL/discrete_facility_optimisation/tree/master/jupyter) - see the .ipynb files for some code that creates some random data for you.