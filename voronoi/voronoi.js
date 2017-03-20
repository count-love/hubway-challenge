jQuery(function($) {
	function redrawPolygon(polygon) {
		polygon.attr("d", function(d) {
			return d ? "M" + d.join("L") + "Z" : null;
		});
	}
	
	function redrawLink(link) {
		link
			.attr("x1", function(d) { return d.source[0]; })
			.attr("y1", function(d) { return d.source[1]; })
			.attr("x2", function(d) { return d.target[0]; })
			.attr("y2", function(d) { return d.target[1]; });
	}
	
	function redrawSite(site) {
		site
			.attr("cx", function(d) { return d[0]; })
			.attr("cy", function(d) { return d[1]; });
	}
	
	function buildVoronoi(stations, links) {
		var latitude_min, latitude_max, longitude_min, longitude_max;
		
		stations = stations.filter(function(sta) {
			return sta.longitude != 0 && sta.latitude != 0;
		});
		
		for (var i = 0; i < stations.length; ++i) {
			// latitude
			if (!latitude_min || latitude_min > stations[i].latitude) {
				latitude_min = stations[i].latitude;
			}
			if (!latitude_max || latitude_max < stations[i].latitude) {
				latitude_max = stations[i].latitude;
			}
			
			// longitude
			if (!longitude_min || longitude_min > stations[i].longitude) {
				longitude_min = stations[i].longitude;
			}
			if (!longitude_max || longitude_max < stations[i].longitude) {
				longitude_max = stations[i].longitude;
			}
		}
		
		var latitude_pad = 0.05 * (latitude_max - latitude_min);
		var longitude_pad = 0.05 * (longitude_max - longitude_min);
		
		// get svg
		var svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height");
		var lat = d3.scaleLinear().domain([latitude_min - latitude_pad, latitude_max + latitude_pad]).range([0, height]);
		var long = d3.scaleLinear().domain([longitude_min - longitude_pad, longitude_max + longitude_pad]).range([0, width]);
		
		// map sites
		var sites = stations.map(function(sta) {
			return [long(sta.longitude), lat(sta.latitude)];
		});
		
		// make voronoi
		var voronoi = d3.voronoi().extent([[-1, -1], [width + 1, height + 1]]);
		
		// draw polygons
		var polygon = svg.append("g").attr("class", "polygons").selectAll("path").data(voronoi.polygons(sites)).enter().append("path").call(redrawPolygon);
		
		// draw links
		var link = svg.append("g").attr("class", "links").selectAll("line").data(voronoi.links(sites)).enter().append("line").call(redrawLink);
		
		// draw sites
		var site = svg.append("g").attr("class", "sites").selectAll("circle").data(sites).enter().append("circle").attr("r", 2.5).call(redrawSite);
	}
	
	var $body = $("body");
	
	// load data
	$.ajax({
			dataType: "json",
			url: $body.data("stationssrc") || "../data/stations.json"
		}).done(function(data_stations) {
			buildVoronoi(data_stations);
		});
});
