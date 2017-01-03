function Key() {

	d3.select("#key_show_hide").html("")


	var me = this;
	this.padding = 5

	function get_supply_data() {

		var max_supply = VMT.model.supply_collection.max_supply;
		var min_supply = VMT.model.supply_collection.min_supply;
		
		var supply_size_scale = d3.scaleLinear().domain([0, max_supply]).range([5,15])
		
		var data_range = d3.range(3)
		var supplies_scale = d3.scaleLinear().domain([0, data_range.slice(-1)]).range([min_supply, max_supply])
		var supplies = _.map(data_range, function(d) {return supplies_scale(d)})

		var size_data = _.map(supplies, function(d) {return supply_size_scale(d)})

		var cumulator = -size_data[0]
		var position_data = _.map(size_data, function(d) {
			cumulator += d*2 + me.padding
			return cumulator
		})

		var text_scale = d3.scaleLinear().domain([0, data_range.slice(-1)]).range([min_supply,max_supply])
		var formatter = d3.format(",.1f")
		var text_data = _.map(data_range, function(d) {
			return `Supply size: ${formatter(text_scale(d))}`
		})

		var d3_data = _.zip(size_data, position_data, text_data)

		return {d3_data: d3_data,
				height: cumulator+me.padding * 3 + size_data[0]}
	}

	this.draw_supply_key = function() {
		// draw three circles
		var data_dict = get_supply_data()
		
		var info_title = d3.select("#key_show_hide").append("div")
			.attr("class", "info_title")
		info_title.append("h2").html("Key").attr("class", "info_title_content")

		info_title.append("button")
					.attr("class", "info_title_content hide_header hide_button")
					.html("Hide")
					.attr("value", "key")


		d3.select("#key_show_hide").append("h4").html("Supply point scale")
		

		me.supply_key_svg = d3.select("#key_show_hide").append("svg")
					.attr("width", 300)
					.attr("height", data_dict["height"])
					.attr("class", "key_svgs")

       
       	var supply_key_g = me.supply_key_svg.append("g")
       		.attr("transform", "translate(" + 20 + "," + 5 + ")");

		var key_elements = supply_key_g.selectAll(".supply_key_circles")
			.data(data_dict["d3_data"])
			.enter()
		
		key_elements.append("circle")
			.attr("r", function(d) {return d[0]})
			.attr("cx", function(d) {return 0})
			.attr("cy", function(d) {return d[1]})
			.attr("fill", "red")
			.attr("fill-opacity", function(d) {
                return 1
            })
            .attr("stroke", "black")
            .attr("class", "supply_key_circles_circles")


		key_elements.append("text")
			.attr("x", function(d) {return 50+me.padding})
			.attr("y", function(d) {return d[1]})
			.attr("dy", function(d) {return d[0]/2})
			.text(function(d){ return d[2]})
			.attr("class", "supply_key_circles_text")

	}

	this.update_supply_key = function() {

		//Prep data
		var data_dict = get_supply_data()
		var d3_data = data_dict["d3_data"]


		me.supply_key_svg.selectAll(".supply_key_circles_circles").data(d3_data)
			.attr("r", function(d) {return d[0]})
			.attr("cx", function(d) {return 0})
			.attr("cy", function(d) {return d[1]})

		me.supply_key_svg.selectAll(".supply_key_circles_text").data(d3_data)
			.attr("x", function(d) {return 50+me.padding})
			.attr("y", function(d) {return d[1]})
			.attr("dy", function(d) {return d[0]/2})
			.text(function(d){ return d[2]})

	}	

	this.draw_demand_key = function() {

		// Data is just the demand scale 
		var max_demand = VMT.model.demand_collection.max_demand
		var min_demand = VMT.model.demand_collection.min_demand
		var colour_range = VMT.settings.demand_point_colour_scheme 
    	var point_colour_scale = VMT.utils.get_colour_scale_from_min_max_and_range_linear(0, max_demand, colour_range)

    	var points = d3.range(5)

    	var minmaxscale = d3.scaleLinear().domain([0, points.slice(-1)]).range([min_demand, max_demand])
    	

    	// Space out points between min demand and max demand
    	var point_demand = _.map(points, function(d) {return minmaxscale(d)})
    	var colour_points = _.map(point_demand, function(d) {return point_colour_scale(d)})
    	var formatter = d3.format(",.1f")
    	var text = _.map(point_demand, function(d,i) {
    		if (i%2==0) {
    			return `Demand size: ${formatter(d)}`
    		} else {
    			return ""
    		}
    	})

    	var d3_data = _.zip(colour_points, text)

    	d3.select("#key_show_hide").append("h4").html("Demand points")

		me.demand_key_svg = d3.select("#key_show_hide").append("svg")
					.attr("width", 300)
					.attr("height", points.length * (10+me.padding))
					.attr("class", "key_svgs")

		var demand_key_g = me.demand_key_svg.append("g")
       		.attr("transform", "translate(" + 20 + "," + 5 + ")");

		var key_elements = demand_key_g.selectAll(".demand_key_circles")
			.data(d3_data)
			.enter()

		key_elements.append("circle")
			.attr("r", function(d) {return 3})
			.attr("cx", function(d) {return 0})
			.attr("cy", function(d,i) {return i*10 + me.padding*i})
			.attr("fill", function(d) {return d[0]})
            .attr("class", "supply_key_circles_circles")

        key_elements.append("text")
			.attr("x", function(d) {return 50+me.padding})
			.attr("y", function(d,i) {return i*10 + me.padding*i})
			.attr("dy", function(d) {return 10/2})
			.text(function(d){ return d[1]})
			.attr("class", "supply_key_circles_text")

	}

	function get_loss_data() {


		var data_range = d3.range(5)

		// Need loss scales
		var colour_range = VMT.settings.demand_line_colour_scheme 
	    var min_loss = VMT.model.min_loss
	    var max_loss = VMT.model.max_loss
	    var line_colour_scale = VMT.utils.get_colour_scale_from_min_max_and_range_linear(0, max_loss, colour_range)
	    var line_width_scale = d3.scaleLinear().domain([0,max_loss]).range([0,3])

	    // Scale mapping range to min to max loss lines 
	    var loss_scale = d3.scaleLinear().domain([0, data_range.slice(-1)]).range([min_loss, max_loss])
	    var loss_lines_data = _.map(data_range, function(d) {return loss_scale(d)})

	    var colours = _.map(loss_lines_data, function(d) {return line_colour_scale(d)})
	    var width = _.map(loss_lines_data, function(d) {return line_width_scale(d)})

	    var formatter = d3.format(",.0f")
	    var text = _.map(loss_lines_data, function(d) {return `Cost: ${formatter(d)}`})

	    var d3_data = _.zip(colours,width,text)

	    return d3_data

	}

	this.draw_loss_key = function() {

		var d3_data = get_loss_data()

	    d3.select("#key_show_hide").append("h4").html("Cost scale")

	    me.loss_key_svg = d3.select("#key_show_hide").append("svg")
					.attr("width", 300)
					.attr("height", d3_data.length * (10+me.padding))
					.attr("class", "key_svgs")

		var loss_key_g = me.loss_key_svg.append("g")
       		.attr("transform", "translate(" + 20 + "," + 5 + ")");

       	var key_elements = loss_key_g.selectAll(".loss_lines_key")
			.data(d3_data)
			.enter()

		key_elements
			.append("line")
            .attr("x1", function(d,i) {return -30})
            .attr("y1", function(d,i) {return i*10 + me.padding*i})
            .attr("x2", function(d,i) {return 25})
            .attr("y2", function(d,i) {return i*10 + me.padding*i})
            .style("stroke", function(d) {
                return d[0]
            })
            .style("stroke-width", function(d) {
                return d[1]
            })
			.attr("class", "loss_lines_key_lines")

        key_elements.append("text")
			.attr("x", function(d) {return 50+me.padding})
			.attr("y", function(d,i) {return i*10 + me.padding*i})
			.attr("dy", function(d) {return 10/2})
			.text(function(d,i){ if (i%2==0) 
				{return d[2]} else {return ""} })
			.attr("class", "loss_lines_key_text")

	}

	this.update_loss_key = function() {

		var d3_data = get_loss_data()


		me.loss_key_svg.selectAll(".loss_lines_key_lines")
			.data(d3_data)
			.style("stroke", function(d) {
                return d[0]
            })
            .style("stroke-width", function(d) {
                return d[1]
            })

		me.loss_key_svg.selectAll(".loss_lines_key_text")
			.data(d3_data)
			.text(function(d,i){ if (i%2==0) 
				{return d[2]} else {return ""} })



	}

	this.draw_supply_key()
	this.draw_demand_key()
	this.draw_loss_key()
}