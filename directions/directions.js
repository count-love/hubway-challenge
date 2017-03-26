jQuery(function($) {
	"use strict";
	
	/* REQUIRES: jQuery and google maps */
	
	var grid;
	var data_bike;
	var data_mbta;
	
	var map;
	
	// load data
	$.ajax({
		dataType: "json",
		url:"../data/directions.json"
	}).done(function(received_data) {
		// received data
		grid = new Grid(received_data.grid);
		data_bike = expandReceivedData(received_data.bike);
		data_mbta = expandReceivedData(received_data.mbta);
		
		console.log(data_bike);
		
		// setup map
		setupMap();
	}).fail(function() {
		// TODO: write data handling
	});

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
			styles: [{
				featureType: "poi",
				elementType: "labels",
				stylers: [{visibility: "off"}]
			}]
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
		var router = new Router();
		router.routeFrom(start_gc);
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
	
	// ROUTER
	function Router() {
		// default parameters
		this.penaltyBike = 180; // 3 minutes
		this.penaltyMbta = 300; // 5 minutes
		this.walkPace = 0.72; // seconds per meter (5km/hr or 3.1m/hr)
	}
	
	Router.prototype.routeFrom = function(gc) {
		// none are closed
		var closed = new Array(grid.count);
		
		// fill scores
		var score_g = new Array(grid.count);
		score_g.fill(Number.POSITIVE_INFINITY);
		score_g[gc] = 0;
		
		// came from
		var came_from = new Array(grid.count);
		came_from[gc] = [-1, 0];
		
		// start with grid cell
		var open = [gc];
		
		var walking_deltas = [-1, 1, grid.countWidth, 0 - grid.countWidth]; // only allow lateral moves for now
		var walking_time = grid.meters * this.walkPace;
		
		var i, j, cur, nxt, tmp, mode;
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
					tmp = score_g[cur] + data_bike[cur][i][1] + this.penaltyBike;
					if (tmp < score_g[nxt]) {
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
					tmp = score_g[cur] + data_mbta[cur][i][1] + this.penaltyMbta;
					if (tmp < score_g[nxt]) {
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
				if (tmp < score_g[nxt]) {
					score_g[nxt] = tmp;
					came_from[nxt] = [cur, mode];
					if (-1 === open.indexOf(nxt)) {
						open.push(nxt);
					}
				}
			}
		}
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
	
	Grid.prototype.gridIndexToGridSub = function(coordinate) {
		var qx = coordinate % this.countWidth;
		var qy = (coordinate - qx) / this.countWidth;
		
		return {x: qx, y: qy};
	};
	
	Grid.prototype.gridIndexToCoordinate = function(coordinate) {
		var qx = coordinate % this.countWidth;
		var qy = (coordinate - qx) / this.countWidth;
		
		return {lat: this.latMin + this.sizeHeight * (qy + 0.5), lng: this.lngMin + this.sizeWidth * (qx + 0.5)};
	};
});
