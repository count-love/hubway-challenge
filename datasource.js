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
}).call(this, jQuery);
