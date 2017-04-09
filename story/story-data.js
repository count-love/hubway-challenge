// actually install the story
jQuery(function($) {
	Story.setupPage("#story");
	Story.setupController("#sidebar-info");
	Story.setupExploreTool("#sidebar-tools");
	Story.swapSwappables();

	Story.getPane("intro").configure({
		map: {
			view: "default",
			toolExplore: {} // shows stations
		}
	});

	// [2016, all times, all stations, starts, 7-clustering]
	Story.getPane("under-util-1").configure({
		map: {
			view: "default",
			toolExplore: {
				statistic: "starts"
			}
		}
	}).addAlternate("stops", {
		map: {
			view: "default",
			toolExplore: {
				statistic: "stops"
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
				clusters: 7,
				highlightStation: 159
			}
		}
	}).addAlternate("eastCambridge", {
		map: {
			view: [[42.36009778602673, -71.11192703247072], [42.37427109825652, -71.0750198364258]],
			toolExplore: {
				statistic: "utilization",
				clusters: 7,
				highlightStation: 157
			}
		}
	}).addAlternate("brookline", {
		map: {
			view: [[42.339450396797275, -71.1198663711548], [42.35886103664428, -71.08295917510988]],
			toolExplore: {
				statistic: "utilization",
				clusters: 7,
				highlightStation: 47
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
	}).addAlternate("danaParkUtilization", {
		map: {
			view: [[42.350012811890636, -71.12578868865968], [42.36942019026506, -71.08888149261476]],
			toolExplore: {
				statistic: "utilization",
				clusters: 7,
				highlightStation: 159				
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
	}).addAlternate("eastCambridgeUtilization", {
		map: {
			view: [[42.36009778602673, -71.11192703247072], [42.37427109825652, -71.0750198364258]],
			toolExplore: {
				statistic: "utilization",
				clusters: 7,
				highlightStation: 157
			}
		}
	});

	Story.getPane("under-util-brookline").configure({
		map: {
			view: [[42.339450396797275, -71.1198663711548], [42.35886103664428, -71.08295917510988]],
            toolExplore: {
				statistic: "utilization",
				clusters: 7,
				highlightStation: 47				
			}        
		}
	}).addAlternate("popular", {
		map: {
			view: [[42.33215399891373, -71.12051010131837], [42.370973789813014, -71.04669570922853]],
			toolExplore: {
			    stations: [47],
			    statistic: "popular-routes"
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
	Story.getPane("funFacts").configure({});
	
	Story.getPane("funFacts-city-struct").configure({
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
	}).addAlternate("backBay", {
		map: {
			toolTransit: {
				start: 2902
			}
		}
	}).addAlternate("fenway", {
		map: {
			toolTransit: {
				start: 2285
			}
		}
	}).addAlternate("memberPace", {
		map: {
		    view: [[42.29724647750399, -71.176815032959], [42.41927472203913, -70.96429824829103]],
			toolExplore: {
			    filter: {
			        member: "member"
			    },
				statistic: "duration"
			}
		}
	}).addAlternate("casualPace", {
		map: {
		    view: [[42.29724647750399, -71.176815032959], [42.41927472203913, -70.96429824829103]],
			toolExplore: {
			    filter: {
			        member: "casual"
			    },
				statistic: "duration"
			}
		}
	});
	
	Story.getPane("funFacts-city-popular").configure({
	    map: {
	    	view: "default",
	        toolExplore: {
                statistic: "distance-min"
	        }
	    }
    }).addAlternate("mit", {
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
				stationGroup: "Tufts",
				statistic: "popular-routes"
			}
		}
	}).addAlternate("cambridge", {
	    map: {
			toolExplore: {
				stationGroup: "Cambridge",
				statistic: "popular-routes"
			}	    
	    }
	}).addAlternate("fortPoint", {
	    map: {
			toolExplore: {
				stationGroup: "Fort Point",
				statistic: "popular-routes"
			}	    
	    }	
	}).addAlternate("touristStops", {
	    map: {
		    view: [[42.3310753291462, -71.11879348754884], [42.39208625055673, -71.05321884155275]],
			toolExplore: {
			    filter: {
			        member: "casual"
			    },
				statistic: "stops",
				clusters: 3
			}
	    }	
	}).addAlternate("touristPopular", {
	    map: {
		    view: [[42.29724647750399, -71.176815032959], [42.41927472203913, -70.96429824829103]],
			toolExplore: {
			    filter: {
			        member: "casual"
			    },
				statistic: "popular-routes",
			}
	    }	
	}).addAlternate("memberPopular", {
	    map: {
		    view: [[42.29724647750399, -71.176815032959], [42.41927472203913, -70.96429824829103]],
			toolExplore: {
			    filter: {
			        member: "member"
			    },
				statistic: "popular-routes",
			}
	    }	
	});
	
	Story.getPane("funFacts-work-life").configure({
	    map: {
	        view: "default",
	        toolExplore: {
	            filter: {
	                day: "morning"
	            },
                statistic: "stops"
	        }
	    }
    }).addAlternate("evening", {
		map: {
			toolExplore: {
			    filter: {
			        day: "evening",
			    },
				statistic: "stops"
			}
		}
    }).addAlternate("menAll", {
		map: {
			toolExplore: {
			    filter: {
			        gender: "male"
			    },
				statistic: "starts"
			}
		}
    }).addAlternate("womenAll", {
		map: {
			toolExplore: {
			    filter: {
			        gender: "female"
			    },
				statistic: "starts"
			}
		}
	}).addAlternate("menMorning", {
		map: {
			toolExplore: {
			    filter: {
			        gender: "male",
			        day: "morning",
			    },
				statistic: "starts"
			}
		}
    }).addAlternate("womenMorning", {
		map: {
			toolExplore: {
			    filter: {
			        gender: "female",
			        day: "morning"
			    },
				statistic: "starts"
			}
		}
	});

	// set initial pane
	Story.setActivePane(0, false);
});
