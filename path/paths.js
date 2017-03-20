jQuery(function($) {
	function resetMapView() {
		// contiguous US
		map.fitBounds([
			[42.254442496693386, -71.28787994384767],
			[42.45740743905049, -70.90164184570314]
		]);	
	}

	function drawPaths(stations, data_graphs) {
		// create map
		map = L.map('map', {
			scrollWheelZoom: false
		});
		
		// reset map view
	    resetMapView();
		
		// specify OSM tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			minZoom: 3,
			maxZoom: 15
		}).addTo(map);
		
		// add lines
		for (var i = 0; i < data_graphs.length; ++i) {
			var cur = data_graphs[i];
			
			var latlngs = [stations[cur.start], stations[cur.end]];
			
			// skip
			if (latlngs[0][0] == 0 || latlngs[1][0] == 0) continue;
			
			// good for graph-2016-10-02
			var weight = 1 + Math.ceil(Math.sqrt(cur.count) / 16);
			var opacity = Math.min(Math.sqrt(cur.count) / 25, 1.0);
			opacity = 1;
			
			// good for symmetric all
//			var weight = Math.ceil(Math.log2(cur.count)) - 12;
//			var opacity = 1; //Math.min(Math.log2(cur.count) / 100.0, 1.0);
//			if (weight < 1) continue;
			
			// polyline
			var polyline = L.polyline(latlngs, {color: 'red', weight: weight, opacity: opacity}).addTo(map);
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
			url: $body.data("graphsrc") || "../data/graph-adjacent-symmetric-2016-10-02.json"
		});
	
	// when done loading
	$.when(ajax_stations, ajax_graph).done(function(resp_stations, resp_graph) {
		var data_stations = resp_stations[0];
		var data_graphs = resp_graph[0];
		
		var stations = {};
		for (var i = 0; i < data_stations.length; ++i) {
			stations[data_stations[i].station_id] = [data_stations[i].latitude, data_stations[i].longitude];
		}
		
		drawPaths(stations, data_graphs);
	});
});
