jQuery(function($) {
	"use strict";
	
	/* REQUIRES: jQuery, d3 and Google maps */
	
	// grid and router
	var router;
	var grid;
	
	// current result (for redrawing)
	var start, stop;
	var result = false;
	var mode = "mode"; // mode or time
	
	// google maps object
	var map;
	var directionsService = null; // = new google.maps.DirectionsService();
	var directionsRenderer = [];
	
	// disable fields
	var disabled = $("input, button").not(":disabled").prop("disabled", true);
	
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
		
		// add modes
		router.addMode(new ModeMultiLookup("bike", received_data.bike, 0, 60, 1));
		router.addMode(new ModeLookup("mbta_bus", received_data.mbta_bus, 90, 2));
		router.addMode(new ModeLookup("mbta_subway", received_data.mbta_subway, 90, 2));
		router.addMode(new ModeLookup("mbta_commuter", received_data.mbta_commuter, 120, 2));
		//router.addMode(new ModeLookup("mbta_ferry", received_data.mbta_ferry, 120, 2));
		router.addMode(new ModeWalk());
		
		// debug
		console.log('** loaded **');
		console.log('Grid size', grid.count);
		
		// setup map
		setupMap();
		
		// enable interface
		disabled.prop("disabled", false);
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
			
			// has direction services?
			if (directionsService) {
				// has stop?
				if (stop) {
					// clear the map
					start = null;
					stop = null;
					result = false;
					
					// clear the overlay
					clearOverlay();
					
					return;
				}
				
				// has start?
				if (start) {
					// store top point
					stop = [lat, lng];
					
					// build directions
					buildDirections(start[0], start[1], lat, lng);
					
					return;
				}
			}
			
			// store current starting longitude and latitude
			start = [lat, lng];
			
			// build best mode overlay
			buildOverlay(lat, lng);
		});
		
		// add grid
		map.data.addGeoJson(grid.toGeoJSON());
		map.data.setStyle({clickable: false, visible: false});
		
		// add bike layer
		//var bikeLayer = new google.maps.BicyclingLayer();
		//bikeLayer.setMap(map);
	}
	
	// add event handlers
	$(window).on("resize", function() {
		google.maps.event.trigger(map, "resize");
	})
	
	$("#transit-modes").on("click", ":checkbox", function() {
		if (router) {
			var cur_mode = this.value, enabled = !!$(this).prop("checked");
			
			// router...
			router.getModeByName(this.value).enabled = enabled;
			
			// toggle bike speed options
			if ("bike" === cur_mode) {
				$("#bike-speed")[enabled ? "show" : "hide"]("fast");
			}
			
			// refresh
			refresh();
		}
	});
	
	$("#map-mode").on("click", "[data-mode]", function() {
		var $this = $(this), new_mode = $this.data("mode");
		
		// no change
		if (mode === new_mode) {
			return;
		}
		
		// update interface
		// slight browser optimization?
		$(".active").filter("[data-mode]").removeClass("active");
		$this.addClass("active");
		
		// set mode
		mode = new_mode;
		
		if (router) {
			refresh();
		}
	});
	
	$("#bike-speed").on("click", ":radio", function() {
		if (router) {
			router.getModeByName("bike").setIndex(parseInt(this.value, 10));
			
			refresh();
		}
	});
	
	function refresh() {
		if (start) {
			buildOverlay(start[0], start[1]);
		}
	}
	
	function clearOverlay() {
		map.data.setStyle({clickable: false, visible: false});
		
		for (var i = 0; i < directionsRenderer.length; ++i) {
			directionsRenderer[i].setMap(null);
		}
		directionsRenderer.length = 0; // clear array
	}
	
	function buildOverlay(start_lat, start_lng) {
		// get start grid coordinate
		var start_gc = grid.coordinateToGridIndex(start_lat, start_lng);
		
		if (-1 === start_gc) {
			clearOverlay();
			// TODO: show message about outside of region?
			return false;
		}
		
		/*
		var t0, t1, rt = 0, iter = 10;
		for (var i = 0; i < iter; ++i) {
			t0 = performance.now();
			result = router.routeFrom(start_gc);
			t1 = performance.now();
			rt += t1 - t0;
		}
		console.log(rt / iter);
		*/
		
		// route
		result = router.routeFrom(start_gc);
		
		// failed? probably clicked water
		if (!result) {
			// clear current overlay
			clearOverlay();
			return false;
		}
		
		// draw overlay
		drawOverlay();
	}
	
	function drawOverlay() {	
		if (!result) {
			// clear current overlay
			clearOverlay();
			return;
		}
		
		// transit time
		if ("time" === mode) {
			// calculate rng
			var rng = d3.extent(result, function(a) { return a[0]; });
			
			// make scale
			var scale = d3.scaleLinear().domain([0, 1800, 3600])
				.range(["#4575b4", "#ffffbf", "#a50026"])
				.interpolate(d3.interpolateHcl)
				.clamp(true);
			
			// redraw map
			map.data.setStyle(function(cell) {
				var tm = result[cell.getProperty("gc")][0];
				if (tm < 0) {
					return {clickable: false, visible: false};
				}
				return {fillColor: scale(tm), clickable: false, zIndex: 2, fillOpacity: 0.5, visible: true, strokeWeight: 0};
			});
			
			return;
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
	
	function buildDirections(start_lat, start_lng, stop_lat, stop_lng) {
		// get start grid coordinate
		var start_gc = grid.coordinateToGridIndex(start_lat, start_lng);
		var stop_gc = grid.coordinateToGridIndex(stop_lat, stop_lng);
		
		// nothing to do
		if (!result || -1 === start_gc || -1 === stop_gc || start_gc === stop_gc) {
			return;
		}
		
		// clear overlay first
		clearOverlay();
		
		// send directly to google or piece together?
		var mode;
		switch (result[stop_gc][1]) {
			case 0:
				fetchDirectionsLeg({lat: start_lat, lng: start_lng}, {lat: stop_lat, lng: stop_lng}, google.maps.TravelMode.WALKING);
				break;
			case 1:
				// piece together
				break;
			case 2:
				fetchDirectionsLeg({lat: start_lat, lng: start_lng}, {lat: stop_lat, lng: stop_lng}, google.maps.TravelMode.TRANSIT);
				break;
			case 3:
				// piece together
				break;
			default:
				return; // nothing to do
		}
	}
	
	function fetchDirectionsLeg(start, stop, mode) {
		var request = {
			origin: new google.maps.LatLng(start.lat, start.lng),
			destination: new google.maps.LatLng(stop.lat, stop.lng),
			travelMode: mode,
			provideRouteAlternatives: false
		};
		
		directionsService.route(request, function(result, status) {
			if ("OK" === status) {
				// create a renderer
				var display = new google.maps.DirectionsRenderer({
					draggable: false,
					hideRouteList: true,
					preserveViewport: true,
					suppressMarkers: true
				});
				display.setMap(map);
				
				// set the directions
				display.setDirections(result);
				
				// store it
				directionsRenderer.push(display);
			}
			else {
				// TODO: display error?
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
	function Mode(name, penalty, flag) {
		this.name = name;
		this.enabled = true;
		this.penalty = penalty || 0;
		this.flag = flag || 0;
		this.router = null;
	}
	
	function ModeLookup(name, transit_data, penalty, flag) {
		// call parent
		Mode.call(this, name, penalty || 0, flag || 0);
		
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
	}
	ModeLookup.prototype = Object.create(Mode.prototype);
	ModeLookup.prototype.constructor = ModeLookup;
	
	// route from... just look up in table
	ModeLookup.prototype.routesFrom = function(rtr, cur) {
		// not in the data
		if (!(cur in this.data)) {
			return [];
		}
		
		return this.data[cur];
	}
	
	function ModeMultiLookup(name, transit_data, index, penalty, flag) {
		// call parent
		Mode.call(this, name, penalty || 0, flag || 0);
		
		// store index
		this.index = index || 0;
		
		// store raw
		this.raw = transit_data.slice();
		
		// cache lookup data
		this.data = {};
		for (var i = 0; i < transit_data.length; ++i) {
			if (!(transit_data[i][0] in this.data)) {
				this.data[transit_data[i][0]] = new Array();
			}
			
			// append it
			this.data[transit_data[i][0]].push([transit_data[i][1], transit_data[i][2 + index]]);
		}
	}
	ModeMultiLookup.prototype = Object.create(Mode.prototype);
	ModeMultiLookup.prototype.constructor = ModeMultiLookup;
	
	// route from... just look up in table
	ModeMultiLookup.prototype.setIndex = function(index) {
		// store index
		this.index = index;
		
		// cache lookup data
		this.data = {};
		for (var i = 0; i < this.raw.length; ++i) {
			// null? skip value
			if (null === this.raw[i][2 + index]) {
				continue;
			}
			
			if (!(this.raw[i][0] in this.data)) {
				this.data[this.raw[i][0]] = new Array();
			}
			
			// append it
			this.data[this.raw[i][0]].push([this.raw[i][1], this.raw[i][2 + index]]);
		}
	}
	
	// route from... just look up in table
	ModeMultiLookup.prototype.routesFrom = function(rtr, cur) {
		// not in the data
		if (!(cur in this.data)) {
			return [];
		}
		
		return this.data[cur];
	}
	
	function ModeWalk(pace, penalty, flag) {
		// call parent
		Mode.call(this, "walk", penalty || 0, flag || 0);
		
		// store pace
		this.pace = pace || 0.72; // seconds per meter (5km/hr or 3.1m/hr)
		
		// allow diagonal movements?
		this.allow_diagonal = true;
	}
	ModeWalk.prototype = Object.create(Mode.prototype);
	ModeWalk.prototype.constructor = ModeLookup;
	
	// route from... look up coordinates
	ModeWalk.prototype.routesFrom = function(rtr, cur) {
		var qx = cur % rtr.grid.countWidth;
		var qy = (cur - qx) / rtr.grid.countWidth;
		
		// return
		var ret = new Array();
		
		// lateral
		var time_lateral = rtr.grid.meters * this.pace;
		if (qx > 0) {
			ret.push([cur - 1, time_lateral]);
		}
		if (qx < (rtr.grid.countWidth - 1)) {
			ret.push([cur + 1, time_lateral]);
		}
		if (qy > 0) {
			ret.push([cur - rtr.grid.countWidth, time_lateral]);
		}
		if (qy < (rtr.grid.countHeight - 1)) {
			ret.push([cur + rtr.grid.countWidth, time_lateral]);
		}
		
		// diagonal
		if (this.allow_diagonal) {
			var time_diagonal = time_lateral * Math.SQRT2;
			
			if (qx > 0 && qy > 0) {
				ret.push([cur - rtr.grid.countWidth - 1, time_lateral]);
			}
			if (qx < (rtr.grid.countWidth - 1) && qy > 0) {
				ret.push([cur - rtr.grid.countWidth + 1, time_lateral]);
			}
			
			if (qx > 0 && qy < (rtr.grid.countHeight - 1)) {
				ret.push([cur + rtr.grid.countWidth - 1, time_lateral]);
			}
			if (qx < (rtr.grid.countWidth - 1) && qy < (rtr.grid.countHeight - 1)) {
				ret.push([cur + rtr.grid.countWidth + 1, time_lateral]);
			}
		}
		
		return ret;
	}
	
	// ROUTER
	function Router(grid) {
		// gird
		this.grid = grid;
		
		// transit modes
		this.modes = new Array();
		
		// exclusion array
		this.closed_initial = new Array();
	}
	
	Router.prototype.addMode = function(mode) {
		for (var i = 0; i < this.modes; ++i) {
			if (this.modes[i].name === name) {
				throw "There is already a mode with name " + mode + ".";
			}
		}
		
		// add mode
		this.modes.push(mode);
	}
	
	Router.prototype.getModeByName = function(name) {
		for (var i = 0; i < this.modes.length; ++i) {
			if (this.modes[i].name === name) {
				return this.modes[i];
			}
		}
		return null;
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
			
			for (j = 0; j < this.modes.length; ++j) {
				// skip
				if (!this.modes[j].enabled) continue;
				
				potential = this.modes[j].routesFrom(this, cur);
				for (i = 0; i < potential.length; ++i) {
					nxt = potential[i][0];
					
					// already closed?
					if (closed[nxt]) continue;
					
					// check score
					tmp = score_g[cur] + potential[i][1] + this.modes[j].penalty;
					if (tmp < score_g[nxt]) {
						// update best score for next grid point
						score_g[nxt] = tmp;
						
						// since better route, update how we arrived to grid point
						came_from[nxt] = [cur, mode | this.modes[j].flag];
						
						// add to open set
						if (-1 === open.indexOf(nxt)) {
							open.push(nxt);
						}
					}
				}
			}
		}
		
		// switch from came_from to travel time for now
		for (i = 0; i < this.grid.count; ++i) {
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
