(function(L) {
	// Not for public use, created by the transit layer which directly passes event
	var ControlLegend = L.Control.extend({
		options: {
			position: "bottomright"
		},
		onAdd: function(map) {
			this._last = "off";

			return L.DomUtil.create('div', 'transit-legend');
		},
		onRemove: function(map) {
			// nothing to do
		},
		redrawOff: function() {
			if ("off" === this._last) { return; }

			// add class
			L.DomUtil.addClass(this._container, "off");

			// empty
			this._container.innerHTML = '';
			this._last = "off"; // saves a little bit by preventing redraw
		},
		redrawScale: function(seconds, colors) {
			if ("scale" === this._last) { return; }

			// add class
			L.DomUtil.removeClass(this._container, "off");

			// make (potentially replace with nice d3 based approach)
			var html = '<h6>Travel Time</h6><svg width="240" height="20" version="1.1"><defs><linearGradient id="scale-gradient" x1="0" x2="1" y1="0" y2="0">';
			var maxi = Math.min(seconds.length, colors.length);
			for (var i = 0; i < maxi; ++i) {
				html += '<stop offset="' + Math.round(100 * (i / (maxi - 1))) + '%" stop-color="' + colors[i] + '"></stop>';
			}
			html += '</linearGradient></defs><rect x="0" y="0" width="240" height="20" fill="url(#scale-gradient)"></rect></svg>';
			html += '<div class="scale-extrema"><span class="low">' + (seconds[0] / 60) + ' min</span><span class="high">' + (seconds[maxi - 1] / 60) + ' min</span></div>'
			this._container.innerHTML = html;

			this._last = "scale"; // saves a little bit by preventing redraw
		},
		redrawKey: function(names, colors) {
			if ("key" === this._last) { return; }

			// add class
			L.DomUtil.removeClass(this._container, "off");

			var html = '<h6>Best Mode of Transit</h6>';
			for (var i = 0, maxi = Math.min(names.length, colors.length); i < maxi; ++i) {
				html += '<div class="entry"><span class="swatch" style="background-color:' + colors[i] + ';"></span> ' + names[i] + '</div>';
			}
			this._container.innerHTML = html;
			this._last = "key"; // saves a little bit by preventing redraw
		}
	});

	/* BEGIN LEAFLET LAYER */
	L.TransitLayer = L.FeatureGroup.extend({
		statics: {
			MODE_MODE: "mode",
			MODE_TIME: "time"
		},
		options: {
			resizeOnAdd: true,
			modeNames: ["Walking", "Hubway", "MBTA", "Hubway + MBTA"],
			modeColors: ["blue", "green", "red", "orange"],
			timeScaleDomain: [0, 1800, 3600],
			timeScaleRange: ["#4575b4", "#ffffbf", "#a50026"],
			hybridTimeContours: [5, 15, 30, 45, 60],
			opacityMode: 0.3,
			opacityTime: 0.6,
			listenClick: true,
			legend: true,
			drawStart: true
		},
		initialize: function(router, options) {
			// private properties
			this._start = null;
			this._result = false;
			this._mode = L.TransitLayer.MODE_MODE;
			this._grid = router.grid;
			this._router = router;
			this._legend = null;

			// set options
			L.setOptions(this, options);

			// setup feature group layer
			L.FeatureGroup.prototype.initialize.call(this, []);
		},
		getStart: function() {
			if (this._start) {
				// copy
				return L.latLng(this._start.lat, this._start.lng);
			}
			return null;
		},
		getMode: function() {
			return this._mode;
		},
		setMode: function(mode, refresh) {
			switch (mode) {
				case L.TransitLayer.MODE_MODE:
				case L.TransitLayer.MODE_TIME:
					// new mode
					this._mode = mode;

					// refresh
					if (this._result && ("undefined" === typeof refresh || false !== refresh)) {
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
			if (L.FeatureGroup.beforeAdd) {
				L.FeatureGroup.beforeAdd.call(this, map);
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
			L.FeatureGroup.prototype.onAdd.call(this, map);

			// add listener for click
			map.on("click", this.click, this);

			// resize
			if (this.options.resizeOnAdd) {
				this.sizeMapForGrid(false);
			}

			// create legend
			if (this.options.legend) {
				this._legend = new ControlLegend();
				this._legend.addTo(map);
			}
		},
		onRemove: function(map) {
			// remove legend
			if (this._legend) {
				this._legend.remove();
				this._legend = null;
			}

			// remove listener for click
			map.off("click", this.click, this);

			// call parent
			L.FeatureGroup.prototype.onRemove.call(this, map);
		},
		click: function(ev) {
			if (this.options.listenClick) {
				// build overlay
				if (!this.buildOverlay(ev.latlng)) {
					// click outside of grid
					this.fire("clickoutside", ev)
				}
			}
		},
		getBounds: function() {
			return [
				[this._grid.north, this._grid.west],
				[this._grid.south, this._grid.east]
			];
		},
		sizeMapForGrid: function(inside) {
			if ("undefined" === typeof inside) {
				inside = false;
			}

			if (this._map) {
				// fit bounds
				var zoom = this._map.getBoundsZoom(this.getBounds(), inside);
				this._map.setView([(this._grid.north + this._grid.south) / 2, (this._grid.east + this._grid.west) / 2], zoom);
			}
		},
		buildOverlay: function(latlng) {
			// accept grid coordinate as well
			if ("number" === typeof latlng) {
				latlng = this._grid.gridIndexToLatLng(latlng);
			}

			// convert to latitude and longitude
			this._start = L.latLng(latlng);

			// get start grid coordinate
			var start_gc = this._grid.coordinateToGridIndex(this._start.lat, this._start.lng);

			// outside of grid?
			if (-1 === start_gc) {
				this.clearOverlay();
				return false;
			}

			// route
			this._result = this._router.routeFrom(start_gc);

			// draw overlay
			this.redraw();

			return true;
		},
		_d3Path: function() {
			// used for line calculation
			var lng_start = this._grid.lngMin;
			var lng_step = this._grid.sizeWidth;
			var lat_start = this._grid.latMin;
			var lat_step = this._grid.sizeHeight;

			// d3 line implementation
			var projection = d3.geoTransform({
				point: function(px, py) {
					this.stream.point(lat_start + lat_step * py, lng_start + lng_step * px);
				}
			});

			return d3.geoPath(projection);
		},
		_d3Scale: function() {
			// configure scale
			// #4575b4 #ffffbf #a50026
			// #ffffcc #800026, #004529 #ffffe5 #800026 - from http://colorbrewer2.org/#type=sequential&scheme=YlGn&n=9
			return d3.scaleLinear()
				.domain(this.options.timeScaleDomain)
				.range(this.options.timeScaleRange)
				.interpolate(d3.interpolateHcl)
				.clamp(true);
		},
		_drawMode: function() {
			// make path and contour
			var path = this._d3Path();
			var contour = d3.contours()
				.size([this._grid.countWidth, this._grid.countHeight])
				.thresholds([0.5]);

			var grid, j;
			var band, context;
			for (j = 0; j < this.options.modeColors.length; ++j) {
				// build grid
				grid = this._result.map(function(c) {
					return +(c[1] === j);
				});

				// calculate iso band
				band = contour(grid);
				if (0 === band.length) continue;

				// draw band
				context = L.d3path();
				path.context(context);
				path(band[0]);

				// create curve
				this.addLayer(L.curve(context.toArray(), {
					// stroke
					stroke: true,
					weight: 1,
					color: "black",
					opacity: this.options.opacityMode,
					// fill
					fill: true,
					fillOpacity: this.options.opacityMode,
					fillColor: this.options.modeColors[j],
					// other
					interactive: false
				}));
			}
		},
		_drawTime: function() {
			var scale = this._d3Scale();

			var i, qx, qy;

			var lng_start = this._grid.lngMin;
			var lng_cell = this._grid.sizeWidth;
			var lat_start = this._grid.latMin;
			var lat_cell = this._grid.sizeHeight;

			// build grid
			for (i = 0; i < this._grid.count; ++i) {
				// quantized
				qx = i % this._grid.countWidth;
				qy = (i - qx) / this._grid.countWidth;

				// no result
				if (this._result[i][0] < 0) continue;

				this.addLayer(L.rectangle([
					[lat_start + qy * lat_cell, lng_start + qx * lng_cell],
					[lat_start + (1 + qy) * lat_cell, lng_start + (1 + qx) * lng_cell]
				], {
					// stroke
					stroke: false,
					// fill
					fill: true,
					fillOpacity: this.options.opacityTime,
					fillColor: scale(this._result[i][0]),
					// other
					interactive: false
				}));
			}
		},
		/*
		 _drawTime: function() {
		 // make result grid
		 var grid;
		 grid = this._result.map(function(c) {
		 return c[0];
		 });

		 // make path and contour
		 var path = this._d3Path();
		 var contour = d3.contours()
		 .size([this._grid.countWidth, this._grid.countHeight])
		 .thresholds(d3.range(2.5 * 60, 60 * 60, 2.5 * 60));
		 var scale = this._d3Scale();
		 var context;

		 // calculate iso bands
		 var bands = contour(grid);

		 for (var i = 0; i < bands.length; ++i) {
		 // draw band
		 context = L.d3path();
		 path.context(context);
		 path(bands[i]);

		 // create curve
		 this.addLayer(L.curve(context.toArray(), {
		 // stroke
		 stroke: false,
		 // fill
		 fill: true,
		 fillOpacity: this.options.opacityTime,
		 fillColor: scale(bands[i].value),
		 // other
		 interactive: false
		 }));
		 }
		 },
		 */
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
			// remove existing layers
			this.clearLayers();

			// no result? nothing to do
			if (!this._result) {
				// clear legend
				this._legend && this._legend.redrawOff();

				return;
			}

			// redraw
			switch (this._mode) {
				case L.TransitLayer.MODE_TIME:
					this._drawTime();
					this._legend && this._legend.redrawScale(this.options.timeScaleDomain, this.options.timeScaleRange);
					break;

				case L.TransitLayer.MODE_MODE:
				default:
					this._drawMode();
					this._legend && this._legend.redrawKey(this.options.modeNames, this.options.modeColors);
					break;
			}

			// draw starting location
			if (this.options.drawStart && this._start) {
				this.addLayer(L.circleMarker(this._start, {
					radius: 9,
					color: '#fff',
					weight: 4,
					fill: true,
					fillColor: '#047cff',
					fillOpacity: 1
				}));
			}
		}
	});

	// factor, Leaflet convention
	L.transitLayer = function(router, options) {
		return new L.TransitLayer(router, options);
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
		if (L.Util.isArray(transit_data)) {
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

	ModeMultiLookup.prototype.getIndex = function() {
		return this.index;
	};

	// look up in table offset by index
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
		this.limitOneFlagPerRoute = false;
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

				// check flags
				if (this.limitOneFlagPerRoute && 0 < this.modes[j].flag && 0 < came_from[cur][1] && came_from[cur][1] !== this.modes[j].flag) {
					continue;
				}

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
		this.lngMax = Math.max(this.east, this.west);

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

	Grid.prototype.gridIndexToLatLng = function(index) {
		var qx = index % this.countWidth;
		var qy = (index - qx) / this.countWidth;

		return L.latLng(this.latMin + this.sizeHeight * (qy + 0.5), this.lngMin + this.sizeWidth * (qx + 0.5));
	};
	/* END GRID */

	/* export things */
	var root = this;
	root.Router = Router;
	root.ModeLookup = ModeLookup;
	root.ModeMultiLookup = ModeMultiLookup;
	root.ModeWalk = ModeWalk;
	root.Grid = Grid;
}).call(this, L);
