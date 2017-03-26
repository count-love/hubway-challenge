(function($) {
	"use strict";
	
	/* REQUIRES: jQuery, jBinary, jDataView */

	// establish the root object (window in browsers))
	var root = this;
	
	// store data
	var trips, loaded = false;
	
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
				ingest: function(v, u) { return u + (v || 0); }
			},
			mean: {
				ingest: function(v, u) {
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
				ingest: function(v, u) { if ("undefined" === typeof v || u < v) return u; return v; }
			},
			max: {
				ingest: function(v, u) { if ("undefined" === typeof v || u > v) return u; return v; }
			}
		},
		isLoaded: function() {
			return loaded;
		},
		loadData: function(src) {
			// make a promise
			var dfd = new jQuery.Deferred(), that = this;
			
			jBinary.loadData(src, function(err, data) {
				// ran into an error?
				if (err) {
					dfd.rejectWith(that, err);
					return;
				}
				
				// notify progress
				dfd.notifyWith(that, "downloaded");
				
				var t0 = performance.now();
				
				// create data view
				var bin = DataView ? new DataView(data) : new jDataView(data);
				
				// parse
				try {
					_parseFromDataView(bin);
				}
				catch (e) {
					dfd.rejectWith(that, err);
					return;
				}
				
				var t1 = performance.now();
				console.log(t1 - t0);
				
				// notify progress
				dfd.notifyWith(that, "parsed");
				
				// set loaded and resolve
				loaded = true;
				dfd.resolveWith(that);
			});
			
			return dfd.promise();
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
		query: function(filters, grouper, value, aggregator) {
			var cbFilters = filters ? _compileFiltersToCb(filters) : null;
			var cbGrouper = grouper ? _compileGrouperToCb(grouper) : function() { return 0; };
			var cbValue = value ? _compileValueToCb(value) : function() { return 1; };
			var cbAggregator = _compileAggregatorToCb(aggregator || "sum");
			
			
			var group, val, ret = {};
			
			for (var i = 0; i < trips.length; ++i) {
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
						filters_cb.push(_compileFilterToCb(prop, filters[prop]));
					}
				}
				
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
				throw "Unrecognized column for value: " + value;
			
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
}).call(this, jQuery);
