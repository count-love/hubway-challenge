// actually install the story
jQuery(function($) {
	Story.setupPage("#story");

	//Story.getPane("")

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

	// set initial pane
	Story.setActivePane(0, false);
});
