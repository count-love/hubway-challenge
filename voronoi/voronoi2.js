jQuery(function($) {
	function resetMapView() {
		map.fitBounds([
			[42.254442496693386, -71.28787994384767],
			[42.45740743905049, -70.90164184570314]
		]);	
	}

	function buildVoronoi(stations, data_graphs) {
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
		
		var latitude_pad = 0.01 * (latitude_max - latitude_min);
		var longitude_pad = 0.01 * (longitude_max - longitude_min);
		
		// list of sites
		var sites = stations.map(function(sta) {
			return [sta.latitude, sta.longitude];
		});
		
		// make voronoi
		var voronoi = d3.voronoi().extent([
			[latitude_min - latitude_pad, longitude_min - longitude_pad],
			[latitude_max + latitude_pad, longitude_max + longitude_pad]
		]);
		var polygons = voronoi.polygons(sites);
		
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
		
		// add polygons
		for (var i = 0; i < polygons.length; ++i) {
			var cur = polygons[i];
			if (!cur) continue;
			console.log(cur);
			
			// good for graph-2016-10-02
//			if (cur.count < 10) continue;
//			var weight = Math.ceil(Math.sqrt(cur.count));
//			var opacity = Math.min(Math.sqrt(cur.count) / 25, 1.0);
			
			// polyline
			var polygon = L.polygon(cur, {color: 'black', fill: false}).addTo(map);
		}
		
		// add icons
		var icon = L.divIcon({ 
            className: 'empty',
            html: '<div class="marker" style="background:red;"></div>'
        });
        
        for (var i = 0; i < sites.length; ++i) {
	        var marker = L.marker(sites[i], {icon: icon}).addTo(map);
        }
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
