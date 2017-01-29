# Facility location analysis and optimisation

## Purpose

A javascript webapp which helps to make decisions on the optimal location of facilities.

Supposing you have `d` discrete sources of demand and `s` potential locations for supply, this webapp will enable you to analyse options for which supply points should be built, and how large they should be.  The analysis concentrates on average drive time or distance that results from different options.

The user is able to activate and deactivate supply sites by clicking on them.

The app is generic in that the user imports their own data on the locations of facilities into the app.  There is no backend, so all data imported is kept in the user's browser.  This means it is suitable for use even for sensitive data.

The model can account for imbalances between supply and demand, and will attempt to optimally allocate supply to demand when suppliers get full, causing demanders to have to be allocated to their 2nd closest, 3rd closest supplier etc.

The model uses a couple of heuristics and an iterative approach to solving this optimisation problem.  When high values of the 'optimisation intensity' parameter are selected, the solution found is close to optimal.  For a more powerful approach to optimisation, a library like [COIN OR](https://en.wikipedia.org/wiki/COIN-OR) should be used, but a comparable library is not available in Javascript, so this app uses custom code.

The user selects whether allocations should be made on the basis of drive time, drive distance, or Euclidean distance.

The easiest way to understand this app is to [take a look at the live example](https://robinl.github.io/discrete_facility_optimisation/web/).

## Instructions
A number of test scenarios are built into the app. These include some basic randomised scenarios, and some QA tests. 
 
However, in a real application, the user provides their own data. This can be achieved either by importing data interactively (using the button in the app's toolbar), or by adding `.csv` files to the app and editing the [settings](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/settings.js) file appropriately.

### Optimisation intensity
When 'unlimited supply mode' is turned off, the app attempts to choose an optimal allocation of demand to supply, given the supply constraint.  This is quite computationally intensive, and so an 'optimisation intensity' parameter must be chosen.  The higher the intensity, the longer the app will take to recompute, but the allocation found by the algorithm will be more optimal.

### Setting up for your data

Format your data [like this](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/data/datasets/data.csv).  You need to get travel time data from all demand units to all supply units (i.e. a row for each combination of supply and demand units, represeting the cartesian product of the supply and demand units).  You can find some code to help you understand this [here](https://github.com/RobinL/discrete_facility_optimisation/tree/master/jupyter) - specifically, the .ipynb files contain code that generates a randomised dataset.  **Note that to avoid problems, the data must be fomatted using exactly the same column names and datatypes**.

It is also possible to define 'scenarios' against your dataset.  These define different options for sets of supply facilities, and how large they should be. This allows you to quickly switch between these different scenarios in the app, without having to manually adjust supply units' size and whether they are active or not. 

Scenarios should be formatted like [this](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/data/scenarios/data.csv).  The `supply_id` must exactly match the `supply_id` values specified in your main data file.

Scenarios are optional.  They can be uploaded interactively using the button on the toolbar.  Alternatively, they can be included in the [scenarios directory](https://github.com/RobinL/discrete_facility_optimisation/tree/master/web/data/scenarios).  The file name must exactly match the main data file name in the [data directory](https://github.com/RobinL/discrete_facility_optimisation/tree/master/web/data/datasets).

### Settings
The [settings](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/settings.js) file contains various settings files for the app.

### Quality assurance and caveats
The code base is quite large, and does not have a suite of automated unit tests.  The approach which has been taken to Quality Assurance has been to construct a number of set scenarios, and ensure the app gives sensble results.  These represent tests of the app, but there is no automated process for checking they are all correct.

A quality assurance log, that illustrates the use of these tests, can be found [here](https://github.com/RobinL/discrete_facility_optimisation/blob/master/jupyter/create_qa_datasets/QA%20Log.ipynb).

Note the following caveats and bugs apply:

* When 'unlimited supply mode' is turned off, the app does not guarantee that the allocation is optimal. However, when a high value of 'optimisation intensity' is chosen, tests have shown it produces an allocation which is close to optimal.  To obtain more robust results, try [COIN OR](https://en.wikipedia.org/wiki/COIN-OR).

* The info panel on the left will only update after you move the mouse _outside_ of the red and grey circles that represent the supply points.  Therefore, when you toggle a supply point, make sure you move the mouse outside that supply point before checking the statistics in the info panel.

 


## Implementation

The webapp has various components:

A model, which performs the optimisation, assigning demand units to supply units.

Various object oriented javascript classes that model the entities ([demand unit](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/demand.js), [supply unit](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/supply.js), [demand collection](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/demand_collection.js), [supply collection](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/supply_collection.js), [model](https://github.com/RobinL/discrete_facility_optimisation/blob/master/web/js/custom/supply_demand_model.js) etc).

The data visualisation that represents modelling results, and is implemented in d3.js.

