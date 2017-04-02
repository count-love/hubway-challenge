jQuery(function($) {
	"use strict";
	
	/* REQUIRES: jQuery, d3 and leaflet */

	// leaflet maps object
	var map, layer;
	
	// disable fields
	var disabled = $("input, button").not(":disabled").prop("disabled", true);

	function loadTransitLayer(address) {
		// remove old layer
		if (layer) {
			layer.remove();
			layer = null;
		}

		var dfd = $.Deferred();

		// load data
		$.ajax({
			dataType: "json",
			url: address
		}).done(function(received_data) {
			// do not bother drawing (could be race conditions here, should potentially stop multiple loads)
			if (layer) {
				return;
			}

			// add grid
			layer = L.transitLayer(received_data);
			layer.addTo(map);

			// resolve
			dfd.resolve();
		}).fail(function(jqXHR, text, err) {
			dfd.reject(text || err);
		});

		return dfd.promise();
	}

	// setup map
	setupMap();

	// load transit overlay
	loadTransitLayer("../data/directions-s.json")
		.done(function() {
			// enable interface
			disabled.prop("disabled", false);
		})
		.fail(function() {
			// TODO: write error handling
		});

	// create and configure leaflet map
	function setupMap() {
		// create the map
		map = L.map('map', {
			scrollWheelZoom: false
		});
		
		// Statmen layer - Toner or Terrain
		//L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
		//	attribution: 'Tiles by <a href="http://stamen.com/" target="_blank">Stamen Design</a> under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data &copy; <a href="http://openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors.',
        //    subdomains: ['a', 'b', 'c', 'd'],
		//	minZoom: 3,
		//	maxZoom: 15
		//}).addTo(map);
		
		// CARTO - light
		L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>',
			minZoom: 3,
			maxZoom: 15
		}).addTo(map);

		// add resize event
		$(window).on("resize", function() {
			map.invalidateSize();
		});
	}
	
	// add event handlers
	$("#transit-modes").on("click", ":checkbox", function() {
		if (layer) {
			var cur_mode = this.value, enabled = !!$(this).prop("checked");
			
			// router...
			layer.getRouter().getModeByName(this.value).enabled = enabled;
			
			// toggle bike speed options
			if ("bike" === cur_mode) {
				$("#bike-speed")[enabled ? "show" : "hide"]("fast");
			}
			
			// refresh
			layer.refreshOverlay();
		}
	});
	
	$("#map-mode").on("click", "[data-mode]", function() {
		var $this = $(this), new_mode = $this.data("mode");

		if (layer) {
			// no change
			if (layer.getMode() === new_mode) {
				return;
			}

			// update interface
			// slight browser optimization?
			$(".active").filter("[data-mode]").removeClass("active");
			$this.addClass("active");

			// set mode
			layer.setMode(new_mode);
		}
	});
	
	$("#bike-speed").on("click", ":radio", function() {
		if (layer) {
			layer.getRouter().getModeByName("bike").setIndex(parseInt(this.value, 10));
			
			layer.refreshOverlay();
		}
	});

	/* BEGIN LEAFLET LAYER */
	L.TransitLayer = L.GeoJSON.extend({
		statics: {
			MODE_MODE: "mode",
			MODE_TIME: "time"
		},
		options: {
			resizeOnAdd: true,
			modeColors: ["blue", "green", "red", "orange"],
			timeScaleDomain: [0, 1800, 3600],
			timeScaleRange: ["#4575b4", "#ffffbf", "#a50026"],
			opacityMode: 0.3,
			opacityTime: 0.6
		},
		initialize: function(data, options) {
			// private properties
			this._start = null;
			this._result = false;
			this._scale = null;
			this._mode = L.TransitLayer.MODE_MODE;
			this._grid = new Grid(data.grid);
			this._router = new Router(this._grid);

			// setup router
			this._router.excludeCoordinatesAndWater(data.exclude, data.water, 0.3);

			// add modes
			// TODO: potentially generalize mode configuration to allow modes to be defined in the JSON
			this._router.addMode(new ModeMultiLookup("bike", data.bike, 0, 60, 1));
			this._router.addMode(new ModeLookup("mbta_bus", data.mbta_bus, 90, 2));
			this._router.addMode(new ModeLookup("mbta_subway", data.mbta_subway, 90, 2));
			this._router.addMode(new ModeLookup("mbta_commuter", data.mbta_commuter, 120, 2));
			//this._router.addMode(new ModeLookup("mbta_ferry", data.mbta_ferry, 120, 2));
			this._router.addMode(new ModeWalk());

			// set options
			L.setOptions(this, options);

			// setup GeoJSON layer
			L.GeoJSON.prototype.initialize.call(this, this._grid.toGeoJSON(), {
				style: L.bind(this.styleCell, this)
			});
		},
		getMode: function() {
			return this._mode;
		},
		setMode: function(mode) {
			switch (mode) {
				case L.TransitLayer.MODE_MODE:
				case L.TransitLayer.MODE_TIME:
					// new mode
					this._mode = mode;

					// refresh
					if (this._result) {
						this.refreshOverlay();
					}

					break;
				default:
					throw "Invalid mode: " + mode;
			}
		},
		getRouter: function() {
			return this._router;
		},
		beforeAdd: function(map) {
			// call parent
			if (L.GeoJSON.beforeAdd) {
				L.GeoJSON.beforeAdd.call(this, map);
			}

			// resize
			if (this.options.resizeOnAdd) {
				try {
					map.getCenter();
				}
				catch (e) {
					// hacky
					var old_map = this._map;
					this._map = map;
					this.sizeMapForGrid(false);
					this._map = old_map;
				}
			}
		},
		onAdd: function(map) {
			// call parent
			L.GeoJSON.prototype.onAdd.call(this, map);

			// add listener for click
			map.on("click", this.click, this);

			// resize
			if (this.options.resizeOnAdd) {
				this.sizeMapForGrid(false);
			}
		},
		onRemove: function(map) {
			// remove listener for click
			map.off("click", this.click, this);

			// call parent
			L.GeoJSON.prototype.onRemove.call(this, map);
		},
		click: function(ev) {
			this.buildOverlay(ev.latlng);
		},
		sizeMapForGrid: function(inside) {
			if ("undefined" === typeof inside) {
				inside = false;
			}

			if (this._map) {
				// fit bounds
				var zoom = this._map.getBoundsZoom([
					[this._grid.north, this._grid.west],
					[this._grid.south, this._grid.east]
				], inside);
				this._map.setView([(this._grid.north + this._grid.south) / 2, (this._grid.east + this._grid.west) / 2], zoom);
			}
		},
		buildOverlay: function(latlng) {
			// convert to latitude and longitude
			this._start = L.latLng(latlng);

			// get start grid coordinate
			var start_gc = this._grid.coordinateToGridIndex(this._start.lat, this._start.lng);

			// outside of grid?
			if (-1 === start_gc) {
				// TODO: show message about outside of region?
				this.clearOverlay();
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
			this._result = this._router.routeFrom(start_gc);

			// draw overlay
			this.redraw();
		},
		clearOverlay: function() {
			this._result = false;
			this.redraw();
		},
		refreshOverlay: function() {
			if (this._start) {
				this.buildOverlay(this._start);
			}
		},
		redraw: function() {
			// prepare
			this.prepareToDraw();

			// reset style
			var that = this;
			that.eachLayer(function(l) { that.resetStyle(l); });
		},
		prepareToDraw: function() {
			// #4575b4 #ffffbf #a50026
			// #ffffcc #800026, #004529 #ffffe5 #800026 - from http://colorbrewer2.org/#type=sequential&scheme=YlGn&n=9

			// configure scale
			this._scale = d3.scaleLinear()
				.domain(this.options.timeScaleDomain)
				.range(this.options.timeScaleRange)
				.interpolate(d3.interpolateHcl)
				.clamp(true);
		},
		styleCell: function(feature) {
			if (!this._result) {
				return {stroke: false, fill: false, interactive: false};
			}

			// get feature
			var gc = feature.properties.gc;

			// time
			if (L.TransitLayer.MODE_TIME === this._mode) {
				var tm = this._result[gc][0];
				if (tm < 0) {
					return {stroke: false, fill: false, interactive: false};
				}

				// color code
				return {stroke: false, fill: true, fillOpacity: this.options.opacityTime, fillColor: this._scale(tm), interactive: false};
			}

			// mode color
			var mode = this._result[gc][1];
			if (mode >= 0 && mode < this.options.modeColors.length) {
				return {stroke: false, fill: true, fillOpacity: this.options.opacityMode, fillColor: this.options.modeColors[mode], interactive: false};
			}

			// none
			return {stroke: false, fill: false, interactive: false};
		}
	});

	// factor, Leaflet convention
	L.transitLayer = function(options) {
		return new L.TransitLayer(options);
	};
	/* END LEAFLET LAYER */

	/* BEGIN ROUTER MODES - individual routing modes that can be used be the router */
	function Mode(name, penalty, flag) {
		this.name = name;
		this.enabled = true;
		this.penalty = penalty || 0;
		this.flag = flag || 0;
	}
	
	function ModeLookup(name, transit_data, penalty, flag) {
		// call parent
		Mode.call(this, name, penalty || 0, flag || 0);
		
		// add lookup data
		if ($.isArray(transit_data)) {
			this.data = {};
			for (var i = 0; i < transit_data.length; ++i) {
				if (!(transit_data[i][0] in this.data)) {
					this.data[transit_data[i][0]] = [];
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
	};
	
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
				this.data[transit_data[i][0]] = [];
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
				this.data[this.raw[i][0]] = [];
			}
			
			// append it
			this.data[this.raw[i][0]].push([this.raw[i][1], this.raw[i][2 + index]]);
		}
	};
	
	// route from... just look up in table
	ModeMultiLookup.prototype.routesFrom = function(rtr, cur) {
		// not in the data
		if (!(cur in this.data)) {
			return [];
		}
		
		return this.data[cur];
	};
	
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
		var ret = [];
		
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
				ret.push([cur - rtr.grid.countWidth - 1, time_diagonal]);
			}
			if (qx < (rtr.grid.countWidth - 1) && qy > 0) {
				ret.push([cur - rtr.grid.countWidth + 1, time_diagonal]);
			}
			
			if (qx > 0 && qy < (rtr.grid.countHeight - 1)) {
				ret.push([cur + rtr.grid.countWidth - 1, time_diagonal]);
			}
			if (qx < (rtr.grid.countWidth - 1) && qy < (rtr.grid.countHeight - 1)) {
				ret.push([cur + rtr.grid.countWidth + 1, time_diagonal]);
			}
		}
		
		return ret;
	};
	/* END ROUTING MODES */
	
	/* BEGIN ROUTER - a router that uses a basic  */
	function Router(grid) {
		// gird
		this.grid = grid;
		
		// transit modes
		this.modes = [];
		
		// exclusion array
		this.closed_initial = [];
	}
	
	Router.prototype.addMode = function(mode) {
		for (var i = 0; i < this.modes; ++i) {
			if (this.modes[i].name === mode.name) {
				throw "There is already a mode with name " + mode + ".";
			}
		}
		
		// add mode
		this.modes.push(mode);
	};
	
	Router.prototype.getModeByName = function(name) {
		for (var i = 0; i < this.modes.length; ++i) {
			if (this.modes[i].name === name) {
				return this.modes[i];
			}
		}
		return null;
	};
	
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
	};
	
	Router.prototype.routeFrom = function(gc) {
		var i, j;
		
		// seed closed with water / excluded points
		var closed = this.closed_initial.slice();
		
		// starting point is excluded?
		if (closed[gc]) return false;
		
		// fill scores
		var score_g = new Array(this.grid.count);
		score_g.fill(Number.POSITIVE_INFINITY);
		score_g[gc] = 0;
		
		// came from
		var came_from = new Array(this.grid.count);
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
	};
	/* END ROUTER */

	/* BEGIN GRID - set of tools for handling a geographic grid, with equally size cells that are sequentially numbered */
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
	};
	
	Grid.prototype.coordinateToGridIndex = function(lat, lng, check_bounds) {
		// check bounds
		if ("undefined" === typeof check_bounds || false !== check_bounds) {
			if (lat < this.latMin || lat >= this.latMax) return -1;
			if (lng < this.lngMin || lng >= this.lngMax) return -1;
		}
		
		var qx = Math.floor((lng - this.lngMin) / this.sizeWidth);
		var qy = Math.floor((lat - this.latMin) / this.sizeHeight);
		
		return (qy * this.countWidth) + qx;
	};
	
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
	/* END GRID */
});
