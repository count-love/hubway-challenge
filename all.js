jQuery(function($) {
	function exampleQuery() {	
		// start timing
		var t0 = performance.now();
		
		// run query
		// valid fields: duration, gender, member, startMinute, startYear, startMonth, startWeekday, startHour, stationEnd, stationStart
		// valid computed fields: angle, distance
		var results = DataSource.query(
			{ // which results to include, can be null for all or a hash where keys are field names and values are either a single value or an array of values
				startYear: [2011, 2012],
				startMonth: 6
			},
			"stationStart", // what to group by (can be any field name), or null for no grouping
			"duration", // what to aggregate (can be any field name or a computed field), or null to count results
			"sum" // how to aggregate (can be sum, min, max or mean)
		);
		
		// stop timing
		var t1 = performance.now();
		
		// log it
		console.log(results);
		console.log(t1 - t0);
	}
	
	DataSource.loadData("data/trips.bin", "data/stations.json")
		.done(function() {
			// LOADED, READY TO GO
			exampleQuery();
		})
		.fail(function(err) {
			// TODO: error handling
			console.log("ERROR:", err);
		});
});
