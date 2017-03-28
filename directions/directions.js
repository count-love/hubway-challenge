jQuery(function($) {
	"use strict";
	
	/* REQUIRES: jQuery and google maps */
	
	var router;
	var grid;
	var data_bike;
	var data_mbta;
	
	var result;
	
	var map;
	
	// load data
	$.ajax({
		dataType: "json",
		url:"../data/directions-s.json"
	}).done(function(received_data) {
		// received data
		grid = new Grid(received_data.grid);
		
		// setup router
		router = new Router(grid);
		router.excludeCoordinatesAndWater(received_data.exclude, received_data.water, 0.3);
		
		// data
		data_bike = expandReceivedData(received_data.bike);
		data_mbta = expandReceivedData(received_data.mbta);
		
		// debug
		console.log('** loaded **');
		console.log('Grid size', grid.count);
		
		// setup map
		setupMap();
	}).fail(function() {
		// TODO: write data handling
	});

	// create and configure google map
	function setupMap() {
		// create the map
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: (grid.north + grid.south) / 2, lng: (grid.east + grid.west) / 2},
			zoom: 13,
			mapTypeId: 'roadmap',
			
			// simplify UI
			disableDefaultUI: true,
			
			// no panning or zoom
			draggable: false,
			scrollwheel: false,
			panControl: false,
			disableDoubleClickZoom: true,
			
			// hide POI
			clickableIcons: false,
			styles: styleSilver()
		});
		
		// fit the map
		// toooo big
		map.fitBounds({west: grid.west, east: grid.east, north: grid.north, south: grid.south});
		
		// listen for click
		map.addListener("click", function(lm) {
			// get latitude and longitude
			var lat = lm.latLng.lat(), lng = lm.latLng.lng();
			
			// build best mode overlay
			buildBestModeOverlay(lat, lng);
		});
		
		// add grid
		map.data.addGeoJson(grid.toGeoJSON());
		map.data.setStyle({clickable: false, visible: false});
		
		// add bike layer
		//var bikeLayer = new google.maps.BicyclingLayer();
		//bikeLayer.setMap(map);
	}
	
	function expandReceivedData(data) {
		var ret = {};
		for (var i = 0; i < data.length; ++i) {
			if (!(data[i][0] in ret)) {
				ret[data[i][0]] = [];
			}
			
			ret[data[i][0]].push([data[i][1], data[i][2]]);
		}
		return ret;
	}
	
	function clearBestModeOverlay() {
		map.data.setStyle({clickable: false, visible: false});
	}
	
	function buildBestModeOverlay(start_lat, start_lng) {
		// get start grid coordinate
		var start_gc = grid.coordinateToGridIndex(start_lat, start_lng);
		
		if (-1 === start_gc) {
			clearBestModeOverlay();
			// TODO: show message about outside of region?
			return;
		}
		
		// make a router
		
		
		var t0, t1, rt = 0, iter = 10;
		for (var i = 0; i < iter; ++i) {
			t0 = performance.now();
			result = router.routeFrom(start_gc);
			t1 = performance.now();
			rt += t1 - t0;
		}
		console.log(rt / iter);
		
		
		
		// 
		result = router.routeFrom(start_gc);
		
		// failed? probably clicked water
		if (!result) {
			// clear current overlay
			
			clearBestModeOverlay();
			return false;
		}
		
		// redraw map
		map.data.setStyle(function(cell) {
			// based on mode of transit
			switch (result[cell.getProperty("gc")][1]) {
				case -1:
					return {clickable: false, visible: false};
				case 0:
					return {fillColor: 'blue', clickable: false, zIndex: 2, fillOpacity: 0.5, visible: true, strokeWeight: 0};
				case 1:
					return {fillColor: 'green', clickable: false, zIndex: 2, fillOpacity: 0.5, visible: true, strokeWeight: 0};
				case 2:
					return {fillColor: 'red', clickable: false, zIndex: 2, fillOpacity: 0.5, visible: true, strokeWeight: 0};
				case 3:
					return {fillColor: 'orange', clickable: false, zIndex: 2, fillOpacity: 0.5, visible: true, strokeWeight: 0};
			}
		});
	}
	
	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}
	
	function calculateDistanceInMeters(a_long, a_lat, b_long, b_lat) {
		// radius of earth in m
		var r = 6378137;
		
		// convert to radians
		var a_long_rad = deg2rad(a_long);
		var a_lat_rad = deg2rad(a_lat);
		var b_long_rad = deg2rad(b_long);
		var b_lat_rad = deg2rad(b_lat);
		
		var c = Math.cos(a_lat_rad) * Math.cos(b_lat_rad) * Math.cos(b_long_rad - a_long_rad) + Math.sin(a_lat_rad) * Math.sin(b_lat_rad);
		return r * Math.acos(c);
	}
	
	// MODE OVERLAYS
	function Mode(flag) {
		this.enabled = true;
		this.flag = flag || 0;
	}
	
	function ModeLookup(transit_data, penalty, flag) {
		// call parent
		Mode.call(this, flag || 0);
		
		// add lookup data
		if ($.isArray(transit_data)) {
			this.data = {};
			for (var i = 0; i < transit_data.length; ++i) {
				if (!(transit_data[i][0] in this.data)) {
					this.data[transit_data[i][0]] = new Array();
				}
				
				// append it
				this.data[transit_data[i][0]].push(transit_data[i].slice(1));
			}
		}
		else {
			this.data = transit_data;
		}
		
		// store a penalty
		this.penalty = penalty || 0;
	}
	
	// inherit
	ModeLookup.prototype = Object.create(Mode.prototype);
	ModeLookup.prototype.constructor = ModeLookup;
	
	ModeLookup.prototype.routesFrom = function(cur) {
		// not in the data
		if (!(cur in this.data)) {
			return [];
		}
		
		return this.data[cur];
	}
	
	// ROUTER
	function Router(grid) {
		// gird
		this.grid = grid;
		
		// default parameters
		this.penaltyBike = 120; // 3 minutes
		this.penaltyMbta = 600; // 5 minutes
		this.walkPace = 0.72; // seconds per meter (5km/hr or 3.1m/hr)
		
		// exclusion array
		this.closed_initial = new Array();
		
		// transit modes
		this.modes = new Array();
	}
	
	Router.prototype.excludeCoordinatesAndWater = function(exclude, water, water_threshold) {
		var i;
		
		// copy exclude array
		this.closed_initial = new Array(this.grid.count);
		
		for (i = 0; i < exclude.length; ++i) {
			this.closed_initial[exclude[i]] = true;
		}
		
		if (water) {
			// default
			if (!water_threshold) {
				water_threshold = 0.3;
			}
			
			// pre-close water threshold
			for (i = 0; i < this.grid.count; ++i) {
				if (water[i] > water_threshold) {
					this.closed_initial[i] = true;
				}
			}
		}
	}
	
	Router.prototype.routeFrom = function(gc) {
		var i, j;
		
		// seed closed with water / excluded points
		var closed = this.closed_initial.slice();
		
		// starting point is excluded?
		if (closed[gc]) return false;
		
		// fill scores
		var score_g = new Array(grid.count);
		score_g.fill(Number.POSITIVE_INFINITY);
		score_g[gc] = 0;
		
		// came from
		var came_from = new Array(grid.count);
		came_from[gc] = [-1, 0];
		
		// start with grid cell
		var open = [gc];
		
		var walking_time = this.grid.meters * this.walkPace, walking_time_diagonal = walking_time * Math.SQRT2;
		var walking_deltas = [-1, 1, this.grid.countWidth, 0 - this.grid.countWidth]; // , grid.countWidth - 1, grid.countWidth + 1, 0 - grid.countWidth - 1, , 0 - grid.countWidth + 1
		var walking_times = [walking_time, walking_time, walking_time, walking_time];
		
		var cur, nxt, tmp, mode;
		var potential;
		while (open.length) {
			// find lowest score_g to expand next
			tmp = Number.POSITIVE_INFINITY;
			for (i = 0; i < open.length; ++i) {
				if (score_g[open[i]] < tmp) {
					cur = open[i];
					tmp = score_g[cur];
					j = i;
				}
			}
			open.splice(j, 1); // remove open value
			
			// mark as closed
			closed[cur] = true;
			
			// mode to here
			mode = came_from[cur][1];
			
			// expand current
			if (cur in data_bike) {
				for (i = 0; i < data_bike[cur].length; ++i) {
					nxt = data_bike[cur][i][0];
					tmp = score_g[cur] + data_bike[cur][i][1] + this.penaltyBike + walking_time / 2;
					if (!closed[nxt] && tmp < score_g[nxt]) {
						score_g[nxt] = tmp;
						came_from[nxt] = [cur, mode | 1];
						if (-1 === open.indexOf(nxt)) {
							open.push(nxt);
						}
					}
				}
			}
			
			if (cur in data_mbta) {
				for (i = 0; i < data_mbta[cur].length; ++i) {
					nxt = data_mbta[cur][i][0];
					tmp = score_g[cur] + data_mbta[cur][i][1] + this.penaltyMbta + walking_time / 2;
					if (!closed[nxt] && tmp < score_g[nxt]) {
						score_g[nxt] = tmp;
						came_from[nxt] = [cur, mode | 2];
						if (-1 === open.indexOf(nxt)) {
							open.push(nxt);
						}
					}
				}
			}
			
			// walking
			tmp = score_g[cur] + walking_time;
			for (i = 0; i < walking_deltas.length; ++i) {
				nxt = cur + walking_deltas[i];
				
				// boundary conditions
				if (nxt < 0 || nxt >= grid.count) continue;
				
				// check score
				if (!closed[nxt] && tmp < score_g[nxt]) {
					score_g[nxt] = tmp;
					came_from[nxt] = [cur, mode];
					if (-1 === open.indexOf(nxt)) {
						open.push(nxt);
					}
				}
			}
		}
		
		// switch from came_from to travel time for now
		for (i = 0; i < grid.count; ++i) {
			if (came_from[i]) {
				came_from[i][0] = score_g[i];
			}
			else {
				// placeholder for inaccessible
				came_from[i] = [-1, -1];
			}
		}
		
		// mode of transportation
		return came_from;
	}
	
	
	// GRID
	function Grid(config) {
		// store bounds
		this.north = config.bounds.north;
		this.south = config.bounds.south;
		this.east = config.bounds.east;
		this.west = config.bounds.west;
		
		// coordinates
		this.latMin = Math.min(this.north, this.south);
		this.latMax = Math.max(this.north, this.south);
		this.lngMin = Math.min(this.east, this.west);
		this.lngMax = Math.max(this.north, this.south);
		
		// count
		this.countWidth = config.count.width;
		this.countHeight = config.count.height;
		this.count = this.countWidth * this.countHeight;
		
		// size
		this.sizeWidth = config.size.width;
		this.sizeHeight = config.size.height;
		
		// meters
		this.meters = config.meters;
	}
	
	Grid.prototype.coordinateToGridSub = function(lat, lng, check_bounds) {
		// check bounds
		if ("undefined" === typeof check_bounds || false !== check_bounds) {
			if (lat < this.latMin || lat >= this.latMax) return -1;
			if (lng < this.lngMin || lng >= this.lngMax) return -1;
		}
		
		var qx = Math.floor((lng - this.lngMin) / this.sizeWidth);
		var qy = Math.floor((lat - this.latMin) / this.sizeHeight);
		
		return {x: qx, y: qy};
	}
	
	Grid.prototype.coordinateToGridIndex = function(lat, lng, check_bounds) {
		// check bounds
		if ("undefined" === typeof check_bounds || false !== check_bounds) {
			if (lat < this.latMin || lat >= this.latMax) return -1;
			if (lng < this.lngMin || lng >= this.lngMax) return -1;
		}
		
		var qx = Math.floor((lng - this.lngMin) / this.sizeWidth);
		var qy = Math.floor((lat - this.latMin) / this.sizeHeight);
		
		return (qy * this.countWidth) + qx;
	}
	
	Grid.prototype.gridIndexToGridSub = function(index) {
		var qx = index % this.countWidth;
		var qy = (index - qx) / this.countWidth;
		
		return {x: qx, y: qy};
	};
	
	Grid.prototype.gridIndexToCoordinate = function(index) {
		var qx = index % this.countWidth;
		var qy = (index - qx) / this.countWidth;
		
		return {lat: this.latMin + this.sizeHeight * (qy + 0.5), lng: this.lngMin + this.sizeWidth * (qx + 0.5)};
	};
	
	Grid.prototype.toGeoJSON = function() {
		var features = [];
		
		var qx, qy;
		for (var i = 0; i < this.count; ++i) {
			// quantized
			qx = i % this.countWidth;
			qy = (i - qx) / this.countWidth;
			
			// add feature
			features.push({
				type: "Feature",
				geometry: {
					type: "Polygon",
					coordinates: [[
						[this.lngMin + (qx * this.sizeWidth), this.latMin + (qy * this.sizeHeight)],
						[this.lngMin + ((qx + 1) * this.sizeWidth), this.latMin + (qy * this.sizeHeight)],
						[this.lngMin + ((qx + 1) * this.sizeWidth), this.latMin + ((qy + 1) * this.sizeHeight)],
						[this.lngMin + (qx * this.sizeWidth), this.latMin + ((qy + 1) * this.sizeHeight)],
						[this.lngMin + (qx * this.sizeWidth), this.latMin + (qy * this.sizeHeight)]
					]]
				},
				properties: {
					gc: i
				}
			});
		}
		
		
		// return TopoJSON format
		return {type: "FeatureCollection", features: features};
	};
	
	
	// STYLES
	function stylePlain() {
		return [{
				featureType: "poi",
				elementType: "labels",
				stylers: [{visibility: "off"}]
			}];
	}
	
	function styleSilver() {
		// from google style builder
		return [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"administrative.neighborhood","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}];
	}
});
