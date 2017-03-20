jQuery(function($) {
	function buildGraph(nodes, links) {
		var svg = d3.select("svg"),
		    width = +svg.attr("width"),
		    height = +svg.attr("height");
		
		var color = d3.scaleOrdinal(d3.schemeCategory20);
		
		var simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.id; }))
		    .force("charge", d3.forceManyBody())
		    .force("center", d3.forceCenter(width / 2, height / 2));
		
		var link = svg.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(links)
			.enter().append("line")
			.attr("stroke-width", function(d) { return Math.sqrt(d.count); });
		
		var node = svg.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(nodes)
			.enter().append("circle")
			.attr("r", 5)
			.attr("fill", function(d) { return color(d.municipality); })
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));
		
		node.append("title")
			.text(function(d) { return d.name; });
		
		simulation
			.nodes(nodes)
			.on("tick", ticked);
		
		simulation.force("link")
			.links(links);
		
		function ticked() {
			link
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
		
			node
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
		}
		
		function dragstarted(d) {
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}
		
		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}
		
		function dragended(d) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
	}
	
	var $body = $("body");
	
	// load data
	var ajax_stations = $.ajax({
			dataType: "json",
			url: $body.data("stationssrc") || "../data/stations.json"
		});
	var ajax_graph = $.ajax({
			dataType: "json",
			url: $body.data("graphsrc") || "../data/graph-symmetric-2016-10-02.json"
		});
	
	// when done loading
	$.when(ajax_stations, ajax_graph).done(function(resp_stations, resp_graph) {
		var data_stations = resp_stations[0];
		var data_graphs = resp_graph[0];
		
		var nodes = $.map(data_stations, function (val) {
			return {id: val.station_id, name: val.station, municipality: val.municipality};
		});
		
		var links = $.map(data_graphs, function (val) {
			return {source: val.start, target: val.end, count: val.count};
		});
		
		buildGraph(nodes, links);
	});
});
