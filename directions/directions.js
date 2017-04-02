jQuery(function($) {
	"use strict";
	
	/* REQUIRES: jQuery, d3 and leaflet */
	
	// grid and router
	var router;
	var grid;
	
	// current result (for redrawing)
	var start, stop;
	var result = false;
	var mode = "mode"; // mode or time
	
	// leaflet maps object
	var map, layer;
	
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

	// create and configure leaflet map
	function setupMap() {
		// create the map
		map = L.map('map', {
			scrollWheelZoom: false
		});
		
		// Statmen layer - Toner or Terrain
		L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
			attribution: 'Tiles by <a href="http://stamen.com/" target="_blank">Stamen Design</a> under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data &copy; <a href="http://openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors.',
            subdomains: ['a', 'b', 'c', 'd'],
			minZoom: 3,
			maxZoom: 15
		}).addTo(map);
	
		// Tangram layer - requires tangram inclusion
		//Tangram.leafletLayer({
		//	scene: "directions.yaml",
		//	attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> by <a href="https://mapzen.com/" target="_blank">Mapzen</a> | &copy; OSM contributors'
		//}).addTo(map);
		
		// fit bounds
		map.fitBounds([
			[grid.north, grid.west],
			[grid.south, grid.east]
		]);
		
		// listen for click
		map.on("click", function(ev) {
			// get latitude and longitude
			var lat = ev.latlng.lat, lng = ev.latlng.lng;
			
			// store current starting longitude and latitude
			start = [lat, lng];
			
			// build best mode overlay
			buildOverlay(lat, lng);
		});
		
		// add grid
		layer = L.geoJSON(grid.toGeoJSON(), {
			style: _styleCell
		});
		layer.addTo(map);
	}
	
	// add event handlers
	$(window).on("resize", function() {
		map.invalidateSize();
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
		result = false;
		layer.eachLayer(function(l) { layer.resetStyle(l); });
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
		layer.eachLayer(function(l) { layer.resetStyle(l); });
	}
			
	// make scale
	var scale = d3.scaleLinear().domain([0, 1800, 3600])
		.range(["#4575b4", "#ffffbf", "#a50026"])
		.interpolate(d3.interpolateHcl)
		.clamp(true);
	
	var CellStyles = {
		NONE: {stroke: false, fill: false, interactive: false},
		WALK: {stroke: false, fill: true, fillOpacity: 0.5, fillColor: 'blue', interactive: false},
		BIKE: {stroke: false, fill: true, fillOpacity: 0.5, fillColor: 'green', interactive: false},
		MBTA: {stroke: false, fill: true, fillOpacity: 0.5, fillColor: 'red', interactive: false},
		MIX: {stroke: false, fill: true, fillOpacity: 0.5, fillColor: 'orange', interactive: false},
	};
	
	function _styleCell(feature) {
		if (!result) {
			return CellStyles.NONE;
		}
		
		// get feature
		var gc = feature.properties.gc;
		
		if ("time" === mode) {
			var tm = result[gc][0];
			if (tm < 0) {
				return CellStyles.NONE;
			}
			
			// color code
			return {stroke: false, fill: true, fillOpacity: 0.5, fillColor: scale(tm), interactive: false};
		}
		
		switch (result[gc][1]) {
			case 0:
				return CellStyles.WALK;
			case 1:
				return CellStyles.BIKE;
			case 2:
				return CellStyles.MBTA;
			case 3:
				return CellStyles.MIX;
			default:
				return CellStyles.NONE;
		}
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
});
