jQuery(function($) {
	// reset the map to an overview of Somerville/Cambridge/Boston
	function resetMapView(map) {
		map.fitBounds([
			[42.33811807427539, -71.13733291625978],
			[42.376934182549896, -71.00309371948244]
		]);
	}
	
	// create map
	map = L.map('map', {
		scrollWheelZoom: false
	});
	            	  
	// reset view  
    resetMapView(map);
	
	// specify OSM tiles
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		minZoom: 11,
		maxZoom: 15
	}).addTo(map);
	
	// add explore tools
	ExploreTool.addToMap(map);
});
