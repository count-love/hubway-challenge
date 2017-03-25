jQuery(function($) {
	function processAllData() {
		var count_start = {};
		for (var i = 0; i < trips.length; ++i) {
			var k = trips[i] & masks.stationStart >> shifts.stationStart;
			count_start[k] = 1 + (count_start[k] || 0);
		}
		console.log(count_start);
	}
	
	DataSource.loadData("data/trips.bin")
		.done(function() {
			// LOADED, READY TO GO
			console.log("loaded!");
			this.debugLogSampleData();
		})
		.fail(function(err) {
			// TODO: error handling
			console.log("ERROR:", err);
		});
});
