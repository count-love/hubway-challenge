(function($) {

	var params_default = {
		initialPane: 0
	};

	var $story, $container;
	var panes = [], active = -1;
	var map;

	// v
	var is_exploring = false;

	// UI math and variables
	var pane_height;
	var scroll_start = null, scroll_offset_last = 0;

	// map tools
	var installed_explore = false;
	var transit_source = null;
	var layer_transit, pane_transit;

	// turn off
	$.event.special.mousewheel.settings.normalizeOffset = false;

	// debouncing function from John Hann
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	function _debounce(func, threshold, execAsap) {
		var timeout;
		return function debounced() {
			var obj = this, args = arguments;
			function delayed() {
				if (!execAsap)
					func.apply(obj, args);
				timeout = null;
			}
			if (timeout)
				clearTimeout(timeout);
			else if (execAsap)
				func.apply(obj, args);
			timeout = setTimeout(delayed, threshold || 100);
		};
	}

	function _configurePaneActive(pane, active) {
		pane.$indicator.toggleClass("active", active);

		// on hide
		if (!active && pane.config.deactivated) {
			pane.config.deactivated.call(pane);
		}

		// setup map?
		if (active && pane.config.map) {
			Story.configureMap(pane.config.map);
		}

		// on show
		if (active && pane.config.activated) {
			pane.config.activated.call(pane);
		}

		// UPDATE NAV LINKS
		// is first?
		if (pane === panes[0]) {
			$("[data-story-nav=prev]").toggleClass("disabled", active);
		}

		// is last?
		if (pane === panes[panes.length - 1]) {
			$("[data-story-nav=next]").toggleClass("disabled", active);
		}
	}

	function _transitionToIndex(new_active, animate) {
		if ("undefined" === typeof animate || animate) {
			// animate to position
			$container.animate({
				top: pane_height * (0 - new_active)
			}, 300, "easeOutCubic", function() {
				// no change
				if (new_active === active) {
					return;
				}

				// deactivate old
				if (0 <= active) {
					_configurePaneActive(panes[active], false);
				}

				// activate new
				active = new_active;
				_configurePaneActive(panes[active], true);
			});
		}
		else {
			// no animation
			if (active === new_active) {
				return;
			}

			// set top
			$container.css("top", pane_height * (0 - new_active));

			// deactivate old
			if (0 <= active) {
				_configurePaneActive(panes[active], false);
			}

			// activate new
			active = new_active;
			_configurePaneActive(panes[active], true);
		}
	}

	var onMouseWheelStop = _debounce(function() {
		// time
		var time = Date.now() - scroll_start;
		scroll_start = null;

		// distance
		var distance = scroll_offset_last, distance_abs = Math.abs(distance);
		scroll_offset_last = 0;

		// calculate speed
		var speed = distance / time; // pixels per second

		// start by animating to closest
		var new_active;
		if (distance_abs < 0.05 * pane_height) {
			// snap back to position
			new_active = active;
		}
		else if (distance_abs < 0.55 * pane_height) {
			// move forward or backwards one step based on momentum
			new_active = active + (distance < 0 ? 1 : -1);
		}
		else {
			// snap to closest
			new_active = active - Math.round(distance / pane_height);
		}

		// constrain
		if (0 > new_active) {
			new_active = 0;
		}
		else if (new_active >= panes.length) {
			new_active = panes.length - 1;
		}

		// animate to position
		_transitionToIndex(new_active, true);
	}, 100);

	function onMouseWheel(ev) {
		// only vertical scroll
		if (0 === ev.deltaY) { return; }

		// start
		if (null === scroll_start) {
			scroll_start = Date.now();
			$container.stop(true); // stop animation
		}

		// calculate distance
		var distance = ev.deltaY * ev.deltaFactor;

		// new scroll session?
		if (Math.abs(distance) < Math.abs(scroll_offset_last)) {
			distance += scroll_offset_last;
		}

		// new top
		var top = pane_height * (0 - active) + distance;

		// slow down at edges
		// TODO: maybe add some elastic feel?
		if (top > 0) {
			top = 0;
		}
		else if (top < ((1 - panes.length) * pane_height)) {
			top = (1 - panes.length) * pane_height;
		}

		// set top position
		$container.css("top", top);

		// set last distance
		scroll_offset_last = distance;

		// scrolling stopped (debounced)
		onMouseWheelStop();
	}

	var root = this;
	var Story = {
		mapDefaultView: function() {
			map.fitBounds([
				[42.33811807427539, -71.13733291625978],
				[42.376934182549896, -71.00309371948244]
			]);
		},
		setupPage: function(el, params) {
			// merge default parameters
			params = $.extend({}, params_default, params);

			// create map
			map = L.map('map', {
				scrollWheelZoom: false
			});

			// Statmen layer - Toner or Terrain
			//L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
			//	attribution: 'Tiles by <a href="http://stamen.com/" target="_blank">Stamen Design</a> under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data &copy; <a href="http://openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors.',
			//    subdomains: ['a', 'b', 'c', 'd'],
			//	minZoom: 3,
			//	maxZoom: 15
			//}).addTo(map);

			// CARTO - light
			L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>',
				minZoom: 11,
				maxZoom: 15
			}).addTo(map);

			// set default view
			this.mapDefaultView();

			// add events
			$(window).on("resize", this.onResize);
			$("body").on("mousewheel", onMouseWheel);
			// TODO: add touch controls for mobile

			// get story element
			$story = $(el);
			$container = $story.children(".story-container");

			// indicators
			var indicators = $('<ul class="story-indicators">' + (new Array(panes.length + 1)).join('<li></li>') + '</ul>');

			// get panes and set initial size
			pane_height = $story.height();
			panes = $container.children(".story-pane").get().map(function(el) {
				var pane = new StoryPane(el, $('<li></li>').appendTo(indicators));
				pane.$el.css("height", pane_height);
				return pane;
			});

			// append indicators
			indicators.appendTo($story).on("click", "li", function() {
				var index = $(this).index();
				Story.setActivePane(index);
			});

			// navigation links
			$story.on("click", "[data-story-nav]", function() {
				var nav_to = $(this).data("story-nav");

				if ("next" === nav_to) {
					if (active < (panes.length - 1)) {
						Story.setActivePane(active + 1);
					}
				}
				else if ("prev" === nav_to) {
					if (active > 0) {
						Story.setActivePane(active - 1);
					}
				}
				else {
					var index = parseInt(nav_to, 10);
					if (index >= 0 && index < panes.length) {
						Story.setActivePane(index);
					}
					else {
						Story.setActivePane(nav_to);
					}
				}
			});
		},
		onResize: function() {
			// get height
			pane_height = $story.height();

			// resize panes
			for (var i = 0; i < panes.length; ++i) {
				panes[i].$el.height(pane_height);
			}

			// adjust active
			if (0 <= active) {
				$container.css("top", pane_height * (0 - active));
			}

			// invalidate map size
			map.invalidateSize();
		},
		getActivePane: function() {
			if (active >= 0) {
				return panes[active];
			}

			return null;
		},
		setActivePane: function(pane, animate) {
			if (!(pane instanceof StoryPane)) {
				pane = this.getPane(pane);
			}

			if (pane) {
				var index = panes.indexOf(pane);
				if (0 <= index) {
					_transitionToIndex(index, animate);
				}
			}
		},
		getPane: function(index_or_name) {
			// number? treat as index
			if ("number" === typeof index_or_name) {
				if (index_or_name >= 0 && index_or_name < panes.length) {
					return panes[index_or_name];
				}
			}

			// string
			if ("string" === typeof index_or_name) {
				for (var i = 0; i < panes.length; ++i) {
					if (index_or_name === panes[i].name) {
						return panes[i];
					}
				}
			}

			return null;
		},
		installExploreLayer: function() {
			if (installed_explore) {
				return true;
			}

			// return promise
			return ExploreTool.addToMap(map).done(function() {
				installed_explore = true;
			});
		},
		configureExploreLayer: function(config) {
			if (false === config) {
				// if installed? send clear message
				if (installed_explore) {
					ExploreTool.clearMap();
				}
				return;
			}

			// install
			$.when(this.installExploreLayer()).done(function() {
				if (config.stations) {
					ExploreTool.setStations(config.stations, false);
				}
				else if (config.stationGroup) {
					ExploreTool.setStationGroupByLabel(config.stationGroup, false);
				}

				// set number of clusters
				ExploreTool.setClusters(config.clusters || 0, false);

				// set marker size
				ExploreTool.setMarkerSize(config.markerSize || 10, false);

				// set filters
				var filter_arr, filter_hash = $.extend({
					day: "all",
					week: "all",
					season: "all",
					year: "2016",
					member: "all",
					gender: "all"
				}, config.filter || {});

				filter_arr = $.map(filter_hash, function(val, key) {
					return "js_" + key + "_" + val;
				});

				ExploreTool.setFilters(filter_arr, false);

				// set statistic
				ExploreTool.setActiveStatistic(config.statistic || "starts", true);
			});
		},
		installTransitLayer: function(source) {
			// need to reinstall?
			var desired_transit_source = source || "data/directions-s.json";
			if (layer_transit && transit_source !== desired_transit_source) {
				layer_transit.remove();
				layer_transit = null;
			}

			// install transit layer
			if (!layer_transit) {
				return loadTransitLayer(desired_transit_source)
					.fail(function() {
						Story.showOverlayError("Unable to load transit information. Please try refreshing.");
					});
			}

			return true;
		},
		configureTransitLayer: function(config) {
			if (false === config) {
				// if installed? clear layer
				if (layer_transit) {
					layer_transit.clearOverlay();
				}
				return;
			}

			// install
			$.when(this.installTransitLayer(config.source || "data/directions-s.json")).done(function() {
				// set mode (do not redraw)
				layer_transit.setMode(config.mode || "mode", false);

				var router = layer_transit.getRouter(), mode;

				// bike speed
				mode = router.getModeByName("bike");
				if (mode) {
					if (mode.getIndex() !== (config.bikeSpeed || 0)) {
						mode.setIndex(config.bikeSpeed || 0);
					}
				}

				// transit modes
				(mode = router.getModeByName("bike")) && (mode.enabled = config.modeBike || true);
				(mode = router.getModeByName("mbta_subway")) && (mode.enabled = config.modeMbtaSubway || true);
				(mode = router.getModeByName("mbta_bus")) && (mode.enabled = config.modeMbtaBus || true);
				(mode = router.getModeByName("mbta_commuter")) && (mode.enabled = config.modeMbtaCommuter || true);

				// configure transit layer
				if (config.start) {
					layer_transit.buildOverlay(parseInt(config.start, 10));
				}

				// resize map
				if (config.resize !== false) {
					map.flyToBounds(layer_transit.getBounds());
				}

				// TODO: sync layer state to explore interface
			});
		},
		configureMap: function(config) {
			// configure exploration layers
			this.configureExploreLayer(config.toolExplore || false);
			this.configureTransitLayer(config.toolTransit || false);

			// move map view
			if (config.view) {
				if ("default" === config.view) {
					this.mapDefaultView();
				}
				else if ($.isArray(config.view)) {
					if ($.isArray(config.view[0])) {
						// bounds
						map.flyToBounds(config.view);
					}
					else {
						// center
						map.flyTo(config.view);
					}
				}
			}
		},
		showOverlayError: function(message) {
			// TODO: turn into nice map overlay, then fade out
			alert(message);
		}
	};

	root.Story = Story;

	// create class for story panes
	function StoryPane(el, indicator) {
		// create element
		this.$el = $(el);
		this.$indicator = $(indicator);

		// store name
		this.name = this.$el.data("pane");

		// configuration
		this.config = {};
	}

	StoryPane.prototype.isActive = function() {
		return Story.getActivePane() === this;
	};

	StoryPane.prototype.configure = function(config) {
		this.config = config;
	};



	/* SECTION: TRANSIT LAYER CODE */
	function loadTransitLayer(source) {
		var dfd = $.Deferred();

		// load data
		$.ajax({
			dataType: "json",
			url: source
		}).done(function(received_data) {
			// do not bother drawing (could be race conditions here, should potentially stop multiple loads)
			if (layer_transit) {
				return;
			}

			// received data
			var grid = new Grid(received_data.grid);

			// setup router
			var router = new Router(grid);
			router.excludeCoordinatesAndWater(received_data.exclude, received_data.water, 0.3);

			// add modes
			router.addMode(new ModeMultiLookup("bike", received_data.bike, 0, 60, 1));
			router.addMode(new ModeLookup("mbta_bus", received_data.mbta_bus, 90, 2));
			router.addMode(new ModeLookup("mbta_subway", received_data.mbta_subway, 90, 2));
			router.addMode(new ModeLookup("mbta_commuter", received_data.mbta_commuter, 120, 2));
			//router.addMode(new ModeLookup("mbta_ferry", received_data.mbta_ferry, 120, 2));
			router.addMode(new ModeWalk());

			// add pane
			if (!pane_transit) {
				pane_transit = map.createPane('transit');
				pane_transit.style.zIndex = 298;
			}

			// add grid
			layer_transit = L.transitLayer(router, {
				resizeOnAdd: false,
				pane: "transit",
				listenClick: is_exploring
			});
			layer_transit.addTo(map);

			// store source
			transit_source = source;

			// resolve
			dfd.resolve();
		}).fail(function(jqXHR, text, err) {
			dfd.reject(text || err);
		});

		return dfd.promise();
	}
}).call(this, jQuery);
