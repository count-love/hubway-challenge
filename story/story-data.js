// actually install the story
jQuery(function($) {
	Story.setupPage("#story");
	Story.setupTabs("#sidebar-tabs");
	Story.setupExploreTool("#sidebar-tools");

	// [2016, all times, all stations, starts, 7-clustering]
	Story.getPane("under-util-1").configure({
		map: {
			view: "default",
			toolExplore: {
				statistic: "starts",
				clusters: 7
			}
		}
	}).addAlternate("stops", {
		map: {
			view: "default",
			toolExplore: {
				statistic: "stops",
				clusters: 7
			}
		}
	});

	Story.getPane("under-util-2").configure({
		map: {
			view: "default",
			toolExplore: {
				statistic: "utilization"
			}
		}
	});

	Story.getPane("under-util-3").configure({
		map: {
			view: "default",
			toolExplore: {
				statistic: "utilization",
				clusters: 7
			}
		}
	});

	Story.getPane("under-util-dana-park").configure({
		map: {
			view: "default",
			toolTransit: {
				source: "data/directions-s.json",
				start: 4181,
				resize: false
			}
		}
	});

	/*
	Story.getPane("two").configure({
		map: {
			toolTransit: {
				source: "data/directions-s.json",
				start: 6555,
				mode: "mode"
			},
			toolExplore: false
		}
	});

	Story.getPane("three").configure({
		map: {
			view: "default",
			toolTransit: false,
			toolExplore: {
				stationGroup: "MIT"
			}
		}
	});

	Story.getPane("four").configure({
		map: {
			toolTransit: {
				source: "data/directions-l.json",
				start: 5962,
				mode: "time"
			},
			toolExplore: false
		}
	});
	*/

	// set initial pane
	Story.setActivePane(0, false);
});
