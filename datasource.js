(function($) {
	"use strict";
	
	/* REQUIRES: jQuery, jBinary, jDataView */

	// establish the root object (window in browsers))
	var root = this;
	
	// private properties
	var loaded = false;
	var trips, stations; // data
	var distances, angles; // computed
	
	
	function _int2(v) {
		return Math.floor(v / 0x100000000);
	}

	// public functions
	root.DataSource = {
		// [duration, gender, member, minute, year, month, weekday, hour, end station, start station].
		FIELDS: {
			stationStart: function(v) { return v & 0xff; },
			stationEnd: function(v) { return v >> 8 & 0xff; },
			startYear: function(v) { return 2011 + (v >> 28 & 7); },
			startMonth: function(v) { return v >> 24 & 15; },
			startWeekday: function(v) { return v >> 21 & 7; },
			startHour: function(v) { return v >> 16 & 31; },
			startMinute: function(v) { return 15 * ((v >> 31 & 1) + (2 * (_int2(v) & 1))); },
			duration: function(v) { return _int2(v) >> 4 & 0xff; },
			gender: function(v) { return _int2(v) >> 2 & 3; },
			member: function(v) { return _int2(v) >> 1 & 1; }
		},
		AGGREGATORS: {
			sum: {
				ingest: function(v, u) {
					return (u || 0) + (v || 0);
				}
			},
			mean: {
				ingest: function(v, u) {
					if (Number.isNaN(u)) return v;
					if (!v) {
						return {count: 1, sum: u};
					}
					v.count++;
					v.sum += u;
					return v;
				},
				finalize: function(v) {
					return v.sum / v.count;
				}
			},
			min: {
				ingest: function(v, u) {
					return Math.min(v || Number.POSITIVE_INFINITY, u || Number.POSITIVE_INFINITY);
				}
			},
			max: {
				ingest: function(v, u) {
					return Math.max(v || Number.NEGATIVE_INFINITY, u || Number.NEGATIVE_INFINITY);
				}
			}
		},
		COMPUTED: {
			distance: {
				initialize: function() {
					if (!distances) {
						_cacheDistances();
					}
				},
				compute: function(trip) {
					return distances[trip & 0xffff];
				}
			},
			angle: {
				initialize: function() {
					if (!angles) {
						_cacheAngles();
					}
				},
				compute: function(trip) {
					return angles[trip & 0xffff];
				}
			}
		},
		isLoaded: function() {
			return loaded;
		},
		loadData: function(src_trips, src_stations) {
			// make a promise
			var dfd_trips = new $.Deferred(), dfd_stations = new $.Deferred(), that = this;
			
			jBinary.loadData(src_trips, function(err, data) {
				// ran into an error?
				if (err) {
					dfd_trips.rejectWith(that, [err]);
					return;
				}
				
				// notify progress
				dfd_trips.notifyWith(that, ["downloaded-trips"]);
				
				var t0 = performance.now();
				
				// create data view
				var bin = DataView ? new DataView(data) : new jDataView(data);
				
				// parse
				try {
					_parseFromDataView(bin);
				}
				catch (e) {
					dfd.rejectWith(that, [err]);
					return;
				}
				
				var t1 = performance.now();
				console.log(t1 - t0);
				
				// notify progress
				dfd_trips.notifyWith(that, ["parsed-trips"]);
				
				// set loaded and resolve
				loaded = true;
				dfd_trips.resolveWith(that);
			});
			
			$.ajax({
				dataType: "json",
				url: src_stations
			}).done(function(data) {
				// notify progress
				dfd_stations.notifyWith(that, ["downloaded-stations"]);
				
				// confirm that it is indeed an array
				if ($.isArray(data)) {
					// store stations
					stations = data;
					
					// not really needed, but consistent with binary
					dfd_stations.notifyWith(that, ["parsed-stations"]);
					
					// mark as resolved
					dfd_stations.resolveWith(that);
				}
				else {
					// reject
					dfd_stations.rejectWith(that, ["Expected array of stations."]);
				}
			}).fail(function(jqXHR, text, err) {
				// reject
				dfd_stations.rejectWith(that, [err, text]);
			});
			
			return $.when(dfd_trips, dfd_stations);
		},
		debugLogSampleData: function(num) {
			for (var i = 0; i < (num||10); ++i) {
				var j = Math.floor(Math.random() * trips.length);
				console.log(i, j);
				console.log(trips[j]);
				console.log("stationStart", this.FIELDS.stationStart(trips[j]));
				console.log("stationEnd", this.FIELDS.stationEnd(trips[j]));
				console.log("startYear", this.FIELDS.startYear(trips[j]));
				console.log("startMonth", this.FIELDS.startMonth(trips[j]));
				console.log("startWeekday", this.FIELDS.startWeekday(trips[j]));
				console.log("startHour", this.FIELDS.startHour(trips[j]));
				console.log("startMinute", this.FIELDS.startMinute(trips[j]));
				console.log("duration", this.FIELDS.duration(trips[j]));
				console.log("gender", this.FIELDS.gender(trips[j]));
				console.log("member", this.FIELDS.member(trips[j]));
			}
			
			console.log(this.query({startYear: [2011, 2012], startMonth: 6}, "startMonth", null, "sum"));
		},
		stations: function() {
			var ret = [];
			for (var i = 0; i < stations.length; ++i) {
				ret.push($.extend({}, stations[i]));
			}
			return ret;
		},
		stationsByID: function() {
			var ret = {};
			for (var i = 0; i < stations.length; ++i) {
				ret[stations[i].id] = $.extend({}, stations[i]);
			}
			return ret;
		},
		query: function(filters, grouper, value, aggregator) {
			var cbGrouper = grouper ? _compileGrouperToCb(grouper) : function() { return 0; };
			var cbValue = value ? _compileValueToCb(value) : function() { return 1; };
			var cbAggregator = _compileAggregatorToCb(aggregator || "sum");
			
			// variables for iterating
			var i;
			var group, val, ret = {};
			
			// allow passing in a set of filters
			if ($.isArray(filters)) {
				// received array of prefiltered rows, just evaluate those rows
				var t;
				for (i = 0; i < filters.length; ++i) {
					t = filters[i];
				
					// assemble group
					group = cbGrouper(t);
					
					// get value
					val = cbValue(t);
					
					// aggregate
					ret[group] = cbAggregator.ingest(ret[group], val);
				}
			}
			else {
				// received set of filters, evaluate all rows
				var cbFilters = filters ? _compileFiltersToCb(filters) : null;
				
				for (i = 0; i < trips.length; ++i) {
					// check filters
					if (cbFilters && !cbFilters(trips[i])) {
						continue;
					}
					
					// assemble group
					group = cbGrouper(trips[i]);
					
					// get value
					val = cbValue(trips[i]);
					
					// aggregate
					ret[group] = cbAggregator.ingest(ret[group], val);
				}
			}
			
			// finalize
			if (cbAggregator.finalize) {
				for (var prop in ret) {
					if (ret.hasOwnProperty(prop)) {
						ret[prop] = cbAggregator.finalize(ret[prop]);
					}
				}
			}
			
			// no grouper? return single value
			if (!grouper) {
				return ret[0];
			}
			
			return ret;
		},
		cacheFilter: function(filters, threshold) {
			// compile filters to callback
			var cbFilters = filters ? _compileFiltersToCb(filters) : null;
			
			// include everything? nothing to cache
			if (!cbFilters) {
				return filters;
			}
			
			// default threshold
			if (typeof threshold === "undefined") {
				threshold = 0.25;
			}
			
			// when to check threshold
			var check_threshold = Math.floor(trips.length / 4);
			
			// return
			var ret = new Array();
			
			for (var i = 0; i < trips.length; ++i) {
				// append it
				if (cbFilters(trips[i])) {
					ret.push(trips[i]);
				}
				
				// abort if not efficient
				if (i === check_threshold) {
					if (ret.length > (threshold * check_threshold)) {
						return filters;
					}
				}
			}
			
			return ret;
		}
	};
	
	// private functions
	function _parseFromDataView(bin) {
		// get number of trips
		var length = bin.getUint32(0, false);
		
		// allocate array
		trips = new Array(length);
		
		// load trips
		var first, cur, last = 0;
		for (var i = 0, j = 4; i < length; ++i) {
			first = bin.getUint8(j);
				
			if (0 === (first & 128)) {
				// one byte
				cur = first;
				j += 1;
			}
			else if (128 === (first & 192)) {
				// two bytes
				cur = ((first & 63) << 8) + bin.getUint8(j + 1);
				j += 2;
			}
			else if (192 === (first & 224)) {
				// three bytes
				cur = ((first & 31) << 16) + (bin.getUint8(j + 1) << 8) + bin.getUint8(j + 2);
				j += 3;
			}
			else if (224 === (first & 240)) {
				// four bytes
				cur = ((first & 15) << 24) + (bin.getUint8(j + 1) << 16) + (bin.getUint8(j + 2) << 8) + bin.getUint8(j + 3);
				j += 4;
			}
			else if (240 === (first & 248)) {
				// five bytes
				cur = ((first & 7) * 0x100000000) + (bin.getUint8(j + 1) * 0x1000000) + (bin.getUint8(j + 2) << 16) + (bin.getUint8(j + 3) << 8) + bin.getUint8(j + 4);
				j += 5;
			}
			else if (248 === (first & 252)) {
				// six bytes
				cur = ((first & 3) * 0x10000000000) + (bin.getUint8(j + 1) * 0x100000000) + (bin.getUint8(j + 2) * 0x1000000) + (bin.getUint8(j + 3) << 16) + (bin.getUint8(j + 4) << 8) + bin.getUint8(j + 5);
				j += 6;
			}
			else if (252 === (first & 254)) {
				// seven bytes
				cur = ((first & 1) * 0x1000000000000) + (bin.getUint8(j + 1) * 0x10000000000) + (bin.getUint8(j + 2) * 0x100000000) + (bin.getUint8(j + 3) << 24) + (bin.getUint8(j + 4) << 16) + (bin.getUint8(j + 5) << 8) + bin.getUint8(j + 6);
				j += 7;
			}
			else if (254 === first) {
				// eight bytes
				cur = (bin.getUint8(j + 1) * 0x1000000000000) + (bin.getUint8(j + 2) * 0x10000000000) + (bin.getUint8(j + 3) * 0x100000000) + (bin.getUint8(j + 4) * 0x1000000) + (bin.getUint8(j + 5) << 16) + (bin.getUint8(j + 6) << 8) + bin.getUint8(j + 7);
				j += 8;
			}
			
			last += cur; // since difference encoded
			trips[i] = last;
		}
	}
	
	function _compileFiltersToCb(filters) {
		switch (typeof filters) {
			case "function": // allow direct callback
				return filters;
			
			case "object":
				var filters_cb = [];
				for (var prop in filters) {
					if (filters.hasOwnProperty(prop)) {
						if (null === filters[prop]) continue; // null? no filter needed
						filters_cb.push(_compileFilterToCb(prop, filters[prop]));
					}
				}
				
				// no filters
				if (filters_cb.length === 0) {
					return null;
				}
				
				// single filter
				if (filters_cb.length === 1) {
					return filters_cb[0];
				}
				
				return function(row) {
					for (var j = 0; j < filters_cb.length; ++j) {
						if (!filters_cb[j](row)) {
							return false;
						}
					}
					return true;
				};
				
			default:
				throw "Unrecognized type for grouping: " + typeof filters;
		}
	}
	
	function _compileFilterToCb(name, filter) {
		// get value callback
		if (!(name in root.DataSource.FIELDS)) {
			throw "Unrecognized column for filtering: " + name;
		}
		var cb = root.DataSource.FIELDS[name];
		
		// allow direct callbacks
		if ("function" === typeof filter) {
			return function(row) {
				return filter(cb(row));
			};
		}
		
		// array of possible values?
		if ($.isArray(filter)) {
			var hash = {};
			for (var j = 0; j < filter.length; ++j) {
				hash[filter[j]] = true;
			}
			return function(row) {
				return true === hash[cb(row)];
			};
		}
		
		// equal
		return function(row) {
			return filter === cb(row);
		};
	}
	
	function _compileGrouperToCb(grouper) {
		switch (typeof grouper) {
			case "function": // allow direct callback
				return grouper;
			
			case "string":
				if (grouper in root.DataSource.FIELDS) {
					return root.DataSource.FIELDS[grouper];
				}
				throw "Unrecognized column for grouping: " + grouper;
			
			default:
				throw "Unrecognized type for grouping: " + typeof grouper;
		}
	}
	
	function _compileValueToCb(value) {
		switch (typeof value) {
			case "function": // allow direct callback
				return value;
			
			case "string":
				if (value in root.DataSource.FIELDS) {
					return root.DataSource.FIELDS[value];
				}
				
				if (value in root.DataSource.COMPUTED) {
					if (root.DataSource.COMPUTED[value].initialize) {
						root.DataSource.COMPUTED[value].initialize();
					}
					
					return root.DataSource.COMPUTED[value].compute;
				}
				
				throw "Unrecognized column for value: " + value;
			
			case "object":
				if (value.initialize) {
					value.initialize();
				}
				
				return value.compute;
			
			default:
				throw "Unrecognized type for value: " + typeof value;
		}
	}
	
	function _compileAggregatorToCb(aggregator) {
		switch (typeof aggregator) {
			case "function": // allow direct callback
				return {ingest: aggregator};
			
			case "string":
				if (aggregator in root.DataSource.AGGREGATORS) {
					return root.DataSource.AGGREGATORS[aggregator];
				}
				throw "Unrecognized column for aggregator: " + aggregator;
				
			case "object":
				return aggregator;
			
			default:
				throw "Unrecognized type for aggregator: " + typeof aggregator;
		}
	}
	
	// computed helpers
	function _cacheDistances() {
		var i, j, i_id, j_id, dist;
		
		// allocate distances array
		distances = new Array(256 * 256);
		for (i = 0; i < (stations.length - 1); ++i) {
			i_id = stations[i].station_id;
			
			// set zero down diagonal
			distances[i_id << 8 | i_id] = 0;
			
			for (j = i + 1; j < stations.length; ++j) {
				j_id = stations[j].station_id;
				
				dist = _calculateDistance(stations[i].longitude, stations[i].latitude, stations[j].longitude, stations[j].latitude);
				
				distances[i_id << 8 | j_id] = dist;
				distances[j_id << 8 | i_id] = dist;
			}
		}
	}
	
	function _deg2rad(deg) {
		return deg * Math.PI / 180;
	}
	
	function _calculateDistance(a_long, a_lat, b_long, b_lat) {
		// radius of earth in m
		var r = 6371 * 1000;
		
		// convert to radians
		var a_long_rad = _deg2rad(a_long);
		var a_lat_rad = _deg2rad(a_lat);
		var b_long_rad = _deg2rad(b_long);
		var b_lat_rad = _deg2rad(b_lat);
		
		var c = Math.cos(a_lat_rad) * Math.cos(b_lat_rad) * Math.cos(b_long_rad - a_long_rad) + Math.sin(a_lat_rad) * Math.sin(b_lat_rad);
		return r * Math.acos(c);
	}
	
	function _cacheAngles() {
		var i, j, i_id, j_id, ang;
		var delta_x, delta_y;
		
		// allocate angles array
		angles = new Array(256 * 256);
		for (i = 0; i < (stations.length - 1); ++i) {
			i_id = stations[i].station_id;
			
			// set NaN down diagonal
			angles[i_id << 8 | i_id] = NaN;
			
			for (j = i + 1; j < stations.length; ++j) {
				j_id = stations[j].station_id;
				
				delta_x = stations[i].longitude - stations[j].longitude;
				delta_y = stations[i].latitude - stations[j].latitude;
				
				ang = Math.atan2(delta_y, delta_x);
				
				// positive
				if (ang < 0) {
					ang += 2 * Math.PI;
				}
				
				angles[i_id << 8 | j_id] = ang;
				angles[j_id << 8 | i_id] = ang;
			}
		}
	}
}).call(this, jQuery);
