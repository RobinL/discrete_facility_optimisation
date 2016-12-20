var UtilityFunctions = function() {
	this.key_not_in_dict  = function (k, dict) {
        return !(_.has(dict, k))
    }

    this.first_in_dict = function(dict) {
    	return dict[_.keys(dict)[0]]
    }

    this.get_colour_scale_from_min_max_and_range_linear = function(min, max, colour_range) {

    	    var num_colours = colour_range.length
            var diff = max - min

            var step = diff / (colour_range.length - 1)
            var domain = d3.range(num_colours).map(function(d) {return min + d*step})

            return d3.scaleLinear()
                .domain(domain)
                .range(colour_range);

    }

    this.get_colour_scale_from_min_max_and_range_log = function(min, max, colour_range) {

    		// http://blockbuilder.org/RobinL/6b27f9abc591002779d294f1fdff6b72
    	    var num_colours = colour_range.length
            var diff = max - min
            var step = diff / (colour_range.length - 1)

            //Imagine colours = ["red", "amber", "green"]
            //And domain = [1,10]

            //Log scale 
            var logScaleNumeric =  d3.scaleLog().domain([min,max]).range([min,max])

            //Arrange colours equally along domain
            //Using example, for_inversion = [1,5.5,10]
            var for_inversion = d3.range(num_colours).map(function(d) {return min + d*step})  

            //log_colour_values in example will be something like [1,2,10]
    		var log_colour_values = for_inversion.map(logScale.invert)
    		var logColour_scale = d3.scaleLog().domain(log_colour_values).range(colour_range)


            return logColour_scale

    }

    this.get_mean = function(arr) {
        return _.reduce(arr, function(memo, num) {
            return memo + num;
        }, 0) / (arr.length === 0 ? 1 : arr.length);
    }

    this.draw_options = function(selector, data) {

      d3.select(selector).selectAll('option')
          .data(data)
          .enter()
          .append("option")
          .attr("value", function(d) {
              return d["value"]
          })
          .text(function(d) {
              return d["text"]
          })

    };

    this.remove_punctuation_and_whitespace = function(mystr){
      var mystr = mystr.toString()
      return  mystr.replace(/[^\w\s]|_/g, "")
         .replace(/\s+/g, "");
    }


}

VMT.utils = new UtilityFunctions()