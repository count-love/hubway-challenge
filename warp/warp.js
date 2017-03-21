jQuery(function($) {
	$('<div id="tooltip"></div>').appendTo("body");
	
	function ttMouseOver(d) {
		// make sure d has properties and value
		if (!d.name) return;
		
		d3.select("#tooltip").transition().duration(200).style("opacity", 0.9);      
		
		d3.select("#tooltip").html("<h4>" + d.name + "</h4><p>" + d.municipality + "</p>")
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 28) + "px");
	}
	
	function ttMouseOut() {
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);
	}
	
	function buildWarp(warp) {
		// get svg
		var svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height");
		
		// stations
		var stations = warp.stations;
		
		var pos_orig_long, pos_orig_lat;
		var pos_warp_long, pos_warp_lat;
		
		// extents
		pos_orig_long = d3.extent(stations, function(a) { return a.position.longitude; });
		pos_orig_lat = d3.extent(stations, function(a) { return a.position.latitude; });
		pos_warp_long = d3.extent(stations, function(a) { return a.warped.longitude; });
		pos_warp_lat = d3.extent(stations, function(a) { return a.warped.latitude; });
		
		// calculate padding
		var pos_orig_pad = 0.05 * Math.max(pos_orig_long[1] - pos_orig_long[0], pos_orig_lat[1] - pos_orig_lat[0]);
		var pos_warp_pad = 0.05 * Math.max(pos_warp_long[1] - pos_warp_long[0], pos_warp_lat[1] - pos_warp_lat[0]);
		
		// figure out scales
		var scale_orig_long = d3.scaleLinear().domain([pos_orig_long[0] - pos_orig_pad, pos_orig_long[1] + pos_orig_pad]).range([0, width]);
		var scale_orig_lat = d3.scaleLinear().domain([pos_orig_lat[0] - pos_orig_pad, pos_orig_lat[1] + pos_orig_pad]).range([height, 0]);
		var scale_warp_long = d3.scaleLinear().domain([pos_warp_long[0] - pos_warp_pad, pos_warp_long[1] + pos_warp_pad]).range([0, width]);
		var scale_warp_lat = d3.scaleLinear().domain([pos_warp_lat[0] - pos_warp_pad, pos_warp_lat[1] + pos_warp_pad]).range([height, 0]);
		
		// update stations
		stations = stations.map(function (sta) {
			sta.position.x = scale_orig_long(sta.position.longitude);
			sta.position.y = scale_orig_lat(sta.position.latitude);
			sta.warped.x = scale_warp_long(sta.warped.longitude);
			sta.warped.y = scale_warp_lat(sta.warped.latitude);
			return sta;
		});
		
		// colors
		var color = d3.scaleOrdinal(d3.schemeCategory20);
		
		var node = svg.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(stations);
			
		node
			.enter()
			.append("circle")
			.attr("r", 5)
			.attr("fill", function(d) { return color(d.municipality); })
			.attr("cx", function(d) { return d.position.x; })
			.attr("cy", function(d) { return d.position.y; })
			.on("mouseover", ttMouseOver)
			.on("mouseout", ttMouseOut);
			
		prop = "position";
		
		svg.on("click", function() {
			prop = ("position" === prop ? "warped" : "position");
			
			svg
				.selectAll("circle")
				.transition()
				.attr("cx", function(d) { return d[prop].x; })
				.attr("cy", function(d) { return d[prop].y; });
		});
	}
	
	var $body = $("body");
	
	// load data
	$.ajax({
			dataType: "json",
			url: $body.data("warpsrc") || "../data/warp.json"
		}).done(function(data_warp) {
			buildWarp(data_warp);
		});
});
