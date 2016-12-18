// Initially just show the demand points and draw lines to the prisons
Handlebars.registerHelper('short_number', function(value) {
    return d3.format(",.1f")(value)
});

function DemandAllocationLayer() {

  var me = this;

  //Take the geojson stream and convert to the leaflet coordinate system
  function leafletProjectPoint(x, y) {
      var point = VMT.mapholder.map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
  }

  function nullProjectPoint(x, y) {
        this.stream.point(x, y);
  }

  function path_generator(d) {
        return d ? "M" + d.join("L") + "Z" : null
  }

  var voronoi_fn = d3.voronoi()
                .x(function(d) {
                    return VMT.mapholder.latlng_to_xy(d.demand_lat, d.demand_lng).x;
                })
                .y(function(d) {
                    return VMT.mapholder.latlng_to_xy(d.demand_lat, d.demand_lng).y;
                })
                .extent([
                    [-1e6, -1e6],
                    [1e6, 1e6]  //Need silly extent otherwise some circles get deleted when you zoom in too much
                ])


  this.update = function() {
    
    //Update data
    update_demand_circles()
    update_demand_lines()
    update_demand_voronoi()

  }

  this.draw_from_scratch = function() {


        //Get layers 
    
        me.voronoi_cells_layer = d3.select("#voronoi_cells_layer")
        me.demand_lines_layer = d3.select("#demand_lines_layer")
        me.demand_points_layer = d3.select("#demand_points_layer")
        me.facility_location_layer = d3.select("#supply_location_layer")
        me.voronoi_borders_layer = d3.select("#voronoi_borders_layer")
        me.clip_path_layer = d3.select("#clip_path_layer")

        
        draw_demand_circles()
        draw_demand_lines()
        draw_demand_voronoi()
        draw_clipping_mask()

        this.update()

  }

  function draw_clipping_mask() {

    // Draw clip
        var transform = d3.geoTransform({
            point: leafletProjectPoint
        })

        var path = d3.geoPath().projection(transform);

        // Draw the clipping path and apply it
        me.clip_path_layer.select("#EWClipPath").remove()
        me.clip_path_layer.append("svg:clipPath")
            .attr("id", "EWClipPath")
            .append("svg:path")
            .datum(VMT.geo_collection)
            .attr("d", path);

        me.voronoi_borders_layer.attr("clip-path", "url(#EWClipPath)")
        me.voronoi_cells_layer.attr("clip-path", "url(#EWClipPath)")
  }

  function draw_demand_circles() {


    var circles = me.demand_points_layer.selectAll(".locations_circles")
            .data(VMT.model.demand_collection_array)

    circles = circles.enter().append("circle")
            .attr("class", "locations_circles")
            .attr("r", function(d) {
                return 3
            })
            .style("stroke", "black")
            .style("stroke-width", 0)
  }

  function update_demand_circles() {

    var colour_range = VMT.settings.demand_point_colour_scheme 
    var min = VMT.model.demand_collection.min_demand
    var max = VMT.model.demand_collection.max_demand

    var point_colour_scale = VMT.utils.get_colour_scale_from_min_max_and_range_linear(min, max, colour_range)
    var circles = me.demand_points_layer.selectAll(".locations_circles")
            .data(VMT.model.demand_collection_array)

    circles.attr("cx", function(d) {
                var point = VMT.mapholder.latlng_to_xy(d.demand_lat, d.demand_lng)
                return point.x
            })
            .attr("cy", function(d) {
                var point = VMT.mapholder.latlng_to_xy(d.demand_lat, d.demand_lng)
                return point.y
            })
            .attr("fill", function(d) {
              return point_colour_scale(d.demand)
            })
  }

  function draw_demand_lines() {
  }

  function update_demand_lines() {

    me.demand_lines_layer.selectAll(".demand_data_lines").remove()

    // Need a list of all of the allocations - there will be one line per allocation 
    var allocations = VMT.model.allocation_collection

    // Need to map allocations to a suitable data structure
    var d3_data = _.map(allocations, function(allocation) {
      var d = allocation.demand_object
      var demand_point =  VMT.mapholder.latlng_to_xy(d.demand_lat, d.demand_lng)
      var s = allocation.supply_object
      var supply_point =  VMT.mapholder.latlng_to_xy(s.supply_lat, s.supply_lng)
      var allocation_size = allocation.allocation_size
      return {
        x1: demand_point.x,
        y1: demand_point.y,
        x2: supply_point.x,
        y2: supply_point.y,
        allocation_size: allocation_size
      }
    })

    // Line 

    var colour_range = VMT.settings.demand_line_colour_scheme 
    var min = VMT.model.min_allocation
    var max = VMT.model.max_allocation
    var line_colour_scale = VMT.utils.get_colour_scale_from_min_max_and_range_linear(min, max, colour_range)
    var line_width_scale = d3.scaleLinear().domain([min,max]).range([0.5,3])
    
    me.demand_lines_layer.selectAll(".demand_data_lines")
          .data(d3_data)
          .enter()
          .append("line")
            .attr("x1", function(d) {return d.x1})
            .attr("y1", function(d) {return d.y1})
            .attr("x2", function(d) {return d.x2})
            .attr("y2", function(d) {return d.y2})
            .style("stroke", function(d) {
                return line_colour_scale(d.allocation_size)
            })
            .style("stroke-width", function(d) {
                return line_width_scale(d.allocation_size)
            })

  }

  function draw_demand_voronoi() {

    // Need to get suitable datastructure.
    // Each demand has a 'topallocation'
    var voronoi_cell_data = voronoi_fn.polygons(VMT.model.demand_collection_array)
    var v_cells = me.voronoi_cells_layer.selectAll(".voronoicells").data(voronoi_cell_data)
    v_cells.enter().append("path")
            .attr("class", "voronoicells")
            .attr("fill", function(d) {
                return "black"
            })
          
          .on("mouseover", voronoi_cell_on_mouseover)

  }

  function update_demand_voronoi() {

    var voronoi_cell_data = voronoi_fn.polygons(VMT.model.demand_collection_array)

    var v_cells = me.voronoi_cells_layer.selectAll(".voronoicells").data(voronoi_cell_data)

    v_cells
      .style("fill-opacity", 0.5)
      .attr("d", function(d) {
          return path_generator(d)
      })
      
  }


  function voronoi_cell_on_mouseover() {
    
    var template_dict = this.__data__.data
    var source = $("#debug_demand_info").html();
    var template = Handlebars.compile(source);
    var html = template(template_dict);

    d3.select('#debug_panel').html(html)

  }

  this.draw_from_scratch();

}


// From https://bl.ocks.org/mbostock/cd52a201d7694eb9d890
function computeTopology(diagram) {
  var cells = diagram.cells,
      arcs = [],
      arcIndex = -1,
      arcIndexByEdge = {};

  return {
    objects: {
      voronoi: {
        type: "GeometryCollection",
        geometries: cells.map(function(cell) {
          var cell,
              site = cell.site,
              halfedges = cell.halfedges,
              cellArcs = [],
              clipArc;

          halfedges.forEach(function(halfedge) {
            var edge = diagram.edges[halfedge];
            if (edge.right) {
              var l = edge.left.index,
                  r = edge.right.index,
                  k = l + "," + r,
                  i = arcIndexByEdge[k];
              if (i == null) arcs[i = arcIndexByEdge[k] = ++arcIndex] = edge;
              cellArcs.push(site === edge.left ? i : ~i);
              clipArc = null;
            } else if (clipArc) { // Coalesce border edges.
              if (edge.left) edge = edge.slice(); // Copy-on-write.
              clipArc.push(edge[1]);
            } else {
              arcs[++arcIndex] = clipArc = edge;
              cellArcs.push(arcIndex);
            }
          });

          // Ensure the last point in the polygon is identical to the first point.
          var firstArcIndex = cellArcs[0],
              lastArcIndex = cellArcs[cellArcs.length - 1],
              firstArc = arcs[firstArcIndex < 0 ? ~firstArcIndex : firstArcIndex],
              lastArc = arcs[lastArcIndex < 0 ? ~lastArcIndex : lastArcIndex];
          lastArc[lastArcIndex < 0 ? 0 : lastArc.length - 1] = firstArc[firstArcIndex < 0 ? firstArc.length - 1 : 0].slice();

          return {
            type: "Polygon",
            data: site.data,
            arcs: [cellArcs]
          };
        })
      }
    },
    arcs: arcs
  };
}