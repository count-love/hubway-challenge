/*
 * Leaflet.curve v0.1.0 - a plugin for Leaflet mapping library. https://github.com/elfalem/Leaflet.curve
 * (c) elfalem 2015
 */
/*
 * note that SVG (x, y) corresponds to (long, lat)
 */

L.Curve = L.Path.extend({
	options: {
	},
	
	initialize: function(path, options) {
		L.setOptions(this, options);
		this._initialUpdate = true;
		this._setPath(path);
	},
	
	getPath: function(){
		return this._coords;
	},
	
	setPath: function(path) {
		this._setPath(path);
		return this.redraw();
	},
	
	getBounds: function() {
		return this._bounds;
	},

	_setPath: function(path) {
		this._coords = path;
		this._bounds = this._computeBounds();
	},
	
	_computeBounds: function() {
		var bound = new L.LatLngBounds();

		var coord;
		var lastPoint = null;
		var lastCommand = null;

		// used within certain commands
		var controlPoint, controlPoint1, controlPoint2, endPoint;
		var diffLat, diffLng;

		for(var i = 0; i < this._coords.length; ++i){
			coord = this._coords[i];
			if ("string" === typeof coord) {
				lastCommand = coord;
			}
			else if ("H" === lastCommand) {
				bound.extend([lastPoint.lat,coord[0]]);
				lastPoint = new L.LatLng(lastPoint.lat,coord[0]);
			}
			else if ("V" === lastCommand) {
				bound.extend([coord[0], lastPoint.lng]);
				lastPoint = new L.latLng(coord[0], lastPoint.lng);
			}
			else if ("C" === lastCommand) {
				controlPoint1 = new L.LatLng(coord[0], coord[1]);
				coord = this._coords[++i];
				controlPoint2 = new L.LatLng(coord[0], coord[1]);
				coord = this._coords[++i];
				endPoint = new L.LatLng(coord[0], coord[1]);

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			}
			else if ("S" === lastCommand) {
				controlPoint2 = new L.LatLng(coord[0], coord[1]);
				coord = this._coords[++i];
				endPoint = new L.LatLng(coord[0], coord[1]);

				controlPoint1 = lastPoint;
				if (lastPoint.controlPoint2) {
					diffLat = lastPoint.lat - lastPoint.controlPoint2.lat;
					diffLng = lastPoint.lng - lastPoint.controlPoint2.lng;
					controlPoint1 = new L.LatLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			}
			else if ("Q" === lastCommand) {
				controlPoint = new L.LatLng(coord[0], coord[1]);
				coord = this._coords[++i];
				endPoint = new L.LatLng(coord[0], coord[1]);

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			}
			else if ("T" === lastCommand) {
				endPoint = new L.LatLng(coord[0], coord[1]);

				controlPoint = lastPoint;
				if(lastPoint.controlPoint){
					diffLat = lastPoint.lat - lastPoint.controlPoint.lat;
					diffLng = lastPoint.lng - lastPoint.controlPoint.lng;
					controlPoint = new L.LatLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			}
			else if ("L" === lastCommand || "M" === lastCommand) {
				bound.extend(coord);
				lastPoint = new L.LatLng(coord[0], coord[1]);
			}
			else {
				throw "unsupported command: " + lastCommand;
			}
		}
		return bound;
	},
	
	//TODO: use a centroid algorithm instead
	getCenter: function () {
		return this._bounds.getCenter();
	},
	
	_update: function(){
		if (!this._map) { return; }
		
		this._updatePath();
	},
	
	_updatePath: function() {
		this._renderer._updateCurve(this);
	},

	_project: function() {
		var pxBounds = new L.Bounds();
		var coord, lastCoord, curCommand = null, curPoint;

		// build list of points
		this._points = [];
		for (var i = 0; i < this._coords.length; ++i) {
			coord = this._coords[i];
			if ("string" === typeof coord){
				this._points.push(coord);
				curCommand = coord;
			}
			else {
				switch (coord.length) {
					case 2:
						curPoint = this._map.latLngToLayerPoint(coord);
						pxBounds.extend(curPoint);
						lastCoord = coord;
						break;
					case 1:
						if ("H" === curCommand) {
							curPoint = this._map.latLngToLayerPoint([lastCoord[0], coord[0]]);
							pxBounds.extend(curPoint);
							lastCoord = [lastCoord[0], coord[0]];
						}
						else{
							curPoint = this._map.latLngToLayerPoint([coord[0], lastCoord[1]]);
							pxBounds.extend(curPoint);
							lastCoord = [coord[0], lastCoord[1]];
						}
						break;
				}
				this._points.push(curPoint);
			}
		}

		// add padding around bounds
		var w = this._clickTolerance(),
			p = new L.Point(w, w);

		if (this._bounds.isValid() && pxBounds.isValid()) {
			pxBounds.min._subtract(p);
			pxBounds.max._add(p);
			this._pxBounds = pxBounds;
		}
	}
});

L.curve = function (path, options){
	return new L.Curve(path, options);
};

L.SVG.include({
	_updateCurve: function(layer) {
		this._setPath(layer, this._curvePointsToPath(layer._points));

		if (layer.options.animate) {
			var path = layer._path;
			var length = path.getTotalLength();
			
			if (!layer.options.dashArray) {
				path.style.strokeDasharray = length + " " + length;
			}
			
			if (layer._initialUpdate) {
				// TODO: look at SVG's other handling
				path.animate([
						{strokeDashoffset: length},
						{strokeDashoffset: 0}
					], layer.options.animate);
				layer._initialUpdate = false;
			}
		}
	},
	
 	_curvePointsToPath: function(points) {
		var point, curCommand = null, str = "";
		for (var i = 0; i < points.length; ++i) {
			point = points[i];
			if ("string" === typeof point) {
				curCommand = point;
				str += curCommand;
			}
			else{
				switch (curCommand) {
					case "H":
						str += point.x + " ";
						break;
					case "V":
						str += point.y + " ";
						break;
					default:
						str += point.x + "," + point.y + " ";
						break;
				}
			}
		}
		return str || "M0 0";
	}
});

L.Canvas.include({
	_updateCurve: function(layer) {
		if (!this._drawing) { return; }

		var i, /*j, len2, p,*/
			points = layer._points,
			len = points.length,
			ctx = this._ctx;

		if (!len) { return; }

		this._drawnLayers[layer._leaflet_id] = layer;

		ctx.beginPath();

		if (ctx.setLineDash) {
			ctx.setLineDash(layer.options && layer.options._dashArray || []);
		}

		var curCommand = null;
		for (i = 0; i < points.length; ++i) {
			if ("string" === typeof points[i]) {
				curCommand = points[i];

				// close path
				if ("Z" === curCommand) {
					ctx.closePath();
				}
			}
			else if ("M" === curCommand) {
				// move to coordinate
				ctx.moveTo(points[i].x, points[i].y);
			}
			else {
				switch (curCommand) {
					case "H":
					case "V":
					case "L":
						ctx.lineTo(points[i].x, points[i].y);
						break;

					case "C":
						ctx.bezierCurveTo(points[i].x, points[i].y, points[++i].x, points[i].y, points[++i].x, points[i].y);
						break;

					default:
						throw "unsupported canvas command: " + curCommand;
				}
			}
		}

		// fill and stroke
		this._fillStroke(ctx, layer);
	}
});

/* ADDED BY NATHAN 2017, a D3 path bridge for generating Leaflet curves */
/* modeled closely after the d3.path function */
var pi = Math.PI,
	tau = 2 * pi,
	epsilon = 1e-6,
	tauEpsilon = tau - epsilon;

L.D3Path = function() {
	this._x0 = this._y0 = // start of current subpath
		this._x1 = this._y1 = null; // end of current subpath
	this._ = [];
};

L.D3Path.prototype = {
	constructor: L.D3Path,
	moveTo: function(x, y) {
		this._.push("M", [(this._x0 = this._x1 = +x), (this._y0 = this._y1 = +y)]);
	},
	closePath: function() {
		if (this._x1 !== null) {
			this._x1 = this._x0;
			this._y1 = this._y0;
			this._.push("Z");
		}
	},
	lineTo: function(x, y) {
		this._.push("L", [(this._x1 = +x), (this._y1 = +y)]);
	},
	quadraticCurveTo: function(x1, y1, x, y) {
		this._.push("Q", [(+x1), (+y1)], [(this._x1 = +x), (this._y1 = +y)]);
	},
	bezierCurveTo: function(x1, y1, x2, y2, x, y) {
		this._.push("C", [(+x1), (+y1)], [(+x2), (+y2)], [(this._x1 = +x), (this._y1 = +y)]);
	},
	arcTo: function(x1, y1, x2, y2, r) {
		x1 = +x1;
		y1 = +y1;
		x2 = +x2;
		y2 = +y2;
		r = +r;
		var x0 = this._x1,
			y0 = this._y1,
			x21 = x2 - x1,
			y21 = y2 - y1,
			x01 = x0 - x1,
			y01 = y0 - y1,
			l01_2 = x01 * x01 + y01 * y01;

		// Is the radius negative? Error.
		if (r < 0) throw new Error("negative radius: " + r);

		// Is this path empty? Move to (x1,y1).
		if (this._x1 === null) {
			this._.push("M", [(this._x1 = x1), (this._y1 = y1)]);
		}

		// Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
		else if (!(l01_2 > epsilon)) {}

		// Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
		// Equivalently, is (x1,y1) coincident with (x2,y2)?
		// Or, is the radius zero? Line to (x1,y1).
		else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
			this._.push("L", [(this._x1 = x1), (this._y1 = y1)]);
		}

		// Otherwise, draw an arc!
		else {
			var x20 = x2 - x0,
				y20 = y2 - y0,
				l21_2 = x21 * x21 + y21 * y21,
				l20_2 = x20 * x20 + y20 * y20,
				l21 = Math.sqrt(l21_2),
				l01 = Math.sqrt(l01_2),
				l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
				t01 = l / l01,
				t21 = l / l21;

			// If the start tangent is not coincident with (x0,y0), line to.
			if (Math.abs(t01 - 1) > epsilon) {
				this._.push("L", [(x1 + t01 * x01), (y1 + t01 * y01)]);
			}

			this._.push("A", [r, r, 0, 0, (+(y01 * x20 > x01 * y20)), (this._x1 = x1 + t21 * x21), (this._y1 = y1 + t21 * y21)]);
		}
	},
	arc: function(x, y, r, a0, a1, ccw) {
		x = +x;
		y = +y;
		r = +r;
		var dx = r * Math.cos(a0),
			dy = r * Math.sin(a0),
			x0 = x + dx,
			y0 = y + dy,
			cw = 1 ^ ccw,
			da = ccw ? a0 - a1 : a1 - a0;

		// Is the radius negative? Error.
		if (r < 0) throw new Error("negative radius: " + r);

		// Is this path empty? Move to (x0,y0).
		if (this._x1 === null) {
			this._.push("M", [x0, y0]);
		}

		// Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
		else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
			this._.push("L", [x0, y0]);
		}

		// Is this arc empty? We’re done.
		if (!r) return;

		// Does the angle go the wrong way? Flip the direction.
		if (da < 0) da = da % tau + tau;

		// Is this a complete circle? Draw two arcs to complete the circle.
		if (da > tauEpsilon) {
			this._.push("A", [r, r, 0, 1, cw, (x-dx), (y - dy)]);
			this._.push("A", [r, r, 0, 1, cw, (this._x1 = x0), (this._y1 = y0)]);
		}

		// Is this arc non-empty? Draw an arc!
		else if (da > epsilon) {
			this._.push("A", [r, r, 0, (+(da >= pi)), cw, (this._x1 = x + r * Math.cos(a1)), (this._y1 = y + r * Math.sin(a1))]);
		}
	},
	rect: function(x, y, w, h) {
		x = +x;
		y = +y;
		this._.push("M", [(this._x0 = this._x1 = x), (this._y0 = this._y1 = y)]);
		this._.push("H", x + w, "V", y + h, "H", x, "Z");
	},
	toArray: function() {
		return this._;
	}
};

L.d3path = function() {
	return new L.D3Path();
};
