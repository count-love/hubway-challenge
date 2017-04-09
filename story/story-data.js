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
			}
		}
	}).addAlternate("stops", {
		map: {
			view: "default",
			toolExplore: {
				statistic: "stops",
			}
		}
	});

	Story.getPane("under-util-2").configure({
		map: {
			view: "default",
			toolExplore: {
				statistic: "utilization",
                clusters: 7
			}
		}
	}).addAlternate("danaPark", {
		map: {
			view: [[42.350012811890636, -71.12578868865968], [42.36942019026506, -71.08888149261476]],
			toolExplore: {
				statistic: "utilization",
				clusters: 7
			}
		}
	}).addAlternate("eastCambridge", {
		map: {
			view: [[42.36009778602673, -71.11192703247072], [42.37427109825652, -71.0750198364258]],
			toolExplore: {
				statistic: "utilization",
				clusters: 7
			}
		}
	}).addAlternate("brookline", {
		map: {
			view: [[42.339450396797275, -71.1198663711548], [42.35886103664428, -71.08295917510988]],
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

	Story.getPane("under-util-east-cambridge").configure({
		map: {
			view: "default",
			toolTransit: {
				start: 5873,
				resize: false
			}
		}
	});

	Story.getPane("under-util-brookline").configure({
		map: {
			view: [[42.339450396797275, -71.1198663711548], [42.35886103664428, -71.08295917510988]],
            toolExplore: {
				statistic: "utilization",
				clusters: 7
			}        
		}
	}).addAlternate("popular", {
		map: {
			view: [[42.33215399891373, -71.12051010131837], [42.370973789813014, -71.04669570922853]],
			toolExplore: {
			    stations: [47],
			    statistic: "popular-routes",
			}
		}
	});
	
	Story.getPane("under-util-boston").configure({
		map: {
			view: "default",
            toolExplore: {
				statistic: "utilization",
				clusters: 7
			}        
		}
	}).addAlternate("winter", {
		map: {
			view: "default",
			toolExplore: {
			    filter: {
			        season: "winter"
			    },
			    statistic: "utilization",
			}
		}
	});
	
	Story.getPane("potential-new-station-lead").configure({
		map: {
			view: "default",
            toolTransit: {
                start: 5979,
                resize: false
			}        
		}
	}).addAlternate("east-somerville", {
		map: {
			view: "default",
			toolTransit: {
                start: 8591,
                resize: false
			}
		}
	}).addAlternate("brookline", {
		map: {
			view: "default",
			toolTransit: {
                start: 1799,
                resize: false
			}
		}
	});
	
	// no change
	Story.getPane("tidbits").configure({});
	
	Story.getPane("tidbits-city-struct").configure({
		map: {
			toolTransit: {
				source: "data/directions-l.json",
				start: 6835
			}
		}
	}).addAlternate("harvard", {
		map: {
			toolTransit: {
				source: "data/directions-l.json",
				start: 7561,
				mode: "time"
			}
		}
	});
	
	Story.getPane("tidbits-city-popular").configure({
		map: {
			toolExplore: {
				stationGroup: "MIT",
				statistic: "popular-routes"
			}
		}
	}).addAlternate("tufts", {
		map: {
			toolExplore: {
				filter: {
					member: "member"
				},
				stations: [182, 183, 185, 181],
				statistic: "popular-routes"
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
