jQuery(function($) {
	function exampleQuery() {
		// run query
		// valid fields: duration, gender, member, startMinute, startYear, startMonth, startWeekday, startHour, stationEnd, stationStart
		// valid computed fields: angle, distance
		var results = DataSource.query(
			{ // which results to include, can be null for all or a hash where keys are field names and values are either a single value or an array of values
				startYear: [2011, 2012],
				startMonth: 6
			},
			"stationStart", // what to group by (can be any field name), or null for no grouping
			"distance", // what to aggregate (can be any field name or a computed field), or null to count results
			"sum" // how to aggregate (can be sum, min, max or mean)
		);
	}
	
	function profileCallback(cb) {
		var i;
		var iterations = 20;
		var times = new Array(iterations), sum = 0, t0, t1;
		for (i = 0; i < iterations; ++i) {
			t0 = performance.now();
			cb();
			t1 = performance.now();
			
			times[i] = t1 - t0;
			sum += t1 - t0;
		}
		
		// calculate statistics
		var mean = sum / iterations;
		var std = 0;
		for (i = 0; i < iterations; ++i) {
			std += Math.pow(times[i] - mean, 2);
		}
		std = Math.sqrt(std / iterations);
		
		console.log('Performance: ' + Math.round(mean) + ' ms ± ' + Math.round(std) + ' ms');
	}
	
	DataSource.loadData("data/trips.bin", "data/stations.json")
		.done(function() {
			// LOADED, READY TO GO
			exampleQuery();
			
			profileCallback(function() {
				DataSource.query(null, null, null, "sum");
			});
		})
		.fail(function(err) {
			// TODO: error handling
			console.log("ERROR:", err);
		});
});
