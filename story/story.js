(function($) {

	var params_default = {
		initialPane: 0
	};

	var $story, $container, $explore;
	var panes = [], pane_index = {}, active = -1;
	var map;

	// blocking modes
	var is_redrawing = false, is_exploring = false;

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

		// UPDATE ALTERNATES
		if (active && pane.hasAlternate) {
			pane.$el.find("[data-story-alt]").removeClass("active").filter("[data-story-alt=default]").addClass("active");
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

	// add a "loading" message over the map
	function _createLoadingOverlay(obj) {
		var ret = $();

		$(obj).each(function() {
			var $obj = $(this);

			// get position information
			var pos = $obj.position();
			pos.width = $obj.width();
			pos.height = $obj.height();
			pos.lineHeight = pos.height + "px"; // same line height

			// configure overlay
			var el = $('<div class="loading-overlay">Loading...</div>')[$obj.is("body") ? "appendTo" : "insertAfter"]($obj).css(pos);

			// add element
			ret = ret.add(el);
		});

		return ret;
	}

	function _setIsExploring(new_is_exploring) {
		// already set
		if (new_is_exploring === is_exploring) return;

		// slideover with tools
		var $st = $("#sidebar-tools").show(); // , width = $st.width();

		if (new_is_exploring) {
			// disable story pane
			if (0 <= active) {
				_configurePaneActive(panes[active], false);
			}

			// animate
			//$st.css("right", 0 - width).animate({right: 0}, 350);

			// just show
			$st.show();

			// start exploration
			if (layer_transit) {
				layer_transit.options.listenClick = true;
				Story.showOverlay("Click the map to set a new start location.", "info");
			}
		}
		else {
			// stop exploration
			if (layer_transit) {
				layer_transit.options.listenClick = false;
			}

			// animate out
			//$st.css("right", 0).animate({right: 0 - width}, 350, "swing", function() {
			//	$st.hide();
			//});

			$st.hide();

			// enable story pane
			if (0 <= active) {
				_configurePaneActive(panes[active], true);
			}
		}

		// toggle buttons
		var buttons = $("[data-story-mode]");
		buttons.closest("li").toggleClass("active", !new_is_exploring);
		buttons.filter("[data-story-mode=explore]").closest("li").toggleClass("active", new_is_exploring);

		is_exploring = new_is_exploring;
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
		if (distance_abs < 0.15 * pane_height) {
			// snap back to position
			new_active = active;
		}
		else if (distance_abs < 1.55 * pane_height || true) {
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
		// is exploring? disable mouse wheel
		if (is_exploring || is_redrawing) { return; }

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

		// limit scrolling to one pane
		if (distance < (0 - pane_height)) {
			distance = 0 - pane_height;
		}
		else if (distance > pane_height) {
			distance = pane_height;
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

	function onClickAlternate(ev) {
		ev.preventDefault();

		// needs active pane
		if (active < 0) {
			return;
		}

		// switch pane
		var $this = $(this), pane = panes[active], alt = $this.data("story-alt");

		// already listed as active
		if ($this.hasClass("active")) {
			return;
		}

		// set alternate
		if ("default" === alt) {
			Story.configureMap(pane.config.map);
		}
		else if (alt in pane.altConfigs) {
			Story.configureMap(pane.altConfigs[alt].map)
		}
		else {
			return;
		}

		// update styling
		pane.$el.find("[data-story-alt]").removeClass("active").filter("[data-story-alt='" + alt + "']").addClass("active");
	}

	function onClickMode(ev) {
		ev.preventDefault();

		var new_mode = $(this).data("story-mode");
		_setIsExploring("explore" === new_mode);
	}

	function onExploreDisable(ev) {
		var layer = $(ev.target).data("story-layer");
		if (!layer) { return; }

		switch (layer) {
			case "explore":
				if (ExploreTool) {
					ExploreTool.clearMap();
				}
				break;

			case "transit":
				if (layer_transit) {
					layer_transit.clearOverlay();
					layer_transit.options.listenClick = false;
				}
		}
	}

	function onExploreEnable(ev) {
		var layer = $(ev.target).data("story-layer");
		if (!layer) { return; }

		var loading;

		switch (layer) {
			case "explore":
				// already installed?
				if (installed_explore) {
					// show stations... TODO: might do weird things if something already drawn?
					ExploreTool.showStations();
				}
				else {
					loading = _createLoadingOverlay(map.getContainer());
					$.when(Story.installExploreLayer())
						.done(function() {
							// remove loading
							loading.remove();
						});
				}
				break;

			case "transit":
				var default_start = [42.350932577852824, -71.08943939208986];
				if (layer_transit) {
					// already loaded
					layer_transit.options.listenClick = true;

					// show overlay
					layer_transit.buildOverlay(layer_transit.getStart() || default_start);
					Story.showOverlay("Click the map to set a new start location.", "info");
				}
				else {
					loading = _createLoadingOverlay(map.getContainer());
					$.when(Story.installTransitLayer())
						.done(function() {
							// remove loading
							loading.remove();

							// listen for click
							if (layer_transit) {
								layer_transit.options.listenClick = true;
								layer_transit.buildOverlay(default_start);
								Story.showOverlay("Click the map to set a new start location.", "info");
							}
						});
				}
		}
	}

	var root = this;
	var Story = {
		mapDefaultView: function() {
			map.fitBounds([[42.29724647750399, -71.176815032959], [42.41927472203913, -70.96429824829103]]);
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
			var indicators = $('<ul class="story-indicators"></ul>');

			// get panes and set initial size
			pane_height = $story.height();
			panes = $container.children(".story-pane").get().map(function(el) {
				var indicator = $('<li></li>').appendTo(indicators);
				var pane = new StoryPane(el, indicator);

				// set height
				pane.$el.css("height", pane_height);

				// add tooltip
				indicator.tooltip({
					placement: "left",
					title: pane.$el.find("h2").first().text(),
					container: "#story"
				});

				return pane;
			});

			// make panes index
			panes.forEach(function(pane) {
				pane_index[pane.name] = pane;
			});

			// append indicators
			indicators.appendTo($story).on("click", "li", function() {
				var index = $(this).index();
				Story.setActivePane(index);
			});

			// navigation links
			$story.on("click", "[data-story-nav]", function(ev) {
				ev.preventDefault();

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
			$story.on("click", "[data-story-alt]", onClickAlternate);
			$story.on("click", "[data-story-mode]", onClickMode);
		},
		setupTabs: function(el) {
			$(el).on("click", "[data-story-mode]", onClickMode);
		},
		setupExploreTool: function(el) {
			// explore tool
			$explore = $(el);

			// listen for toggling collapsed
			$explore.on("show.bs.collapse", onExploreEnable);
			$explore.on("hide.bs.collapse", onExploreDisable);

			// add transit listeners
			addTransitListeners();
		},
		onResize: function() {
			// get height
			pane_height = $story.height();

			// resize panes
			for (var i = 0; i < panes.length; ++i) {
				panes[i].$el.css("height", pane_height);
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
				if (index_or_name in pane_index) {
					return pane_index[index_or_name];
				}
			}

			return null;
		},
		installExploreLayer: function() {
			if (installed_explore) {
				return true;
			}

			// return promise
			return ExploreTool
				.addToMap(map)
				.done(function() {
					installed_explore = true;
				})
				.fail(function() {
					Story.showOverlay("Unable to load ride information. Please try refreshing.");
				});
		},
		configureExploreLayer: function(config) {
			if (false === config) {
				// close in explore
				$("#tool-explore").removeClass("in").css("height", "0px");

				// if installed? send clear message
				if (installed_explore) {
					ExploreTool.clearMap();
				}

				return true;
			}

			// close in explore
			$("#tool-explore").addClass("in").css("height", "auto");

			// install
			return $.when(this.installExploreLayer()).done(function() {
				if (config.stations) {
					if ("all" === config.stations) {
						ExploreTool.setAllStations(false);
					}
					else {
						ExploreTool.setStations(config.stations, false);
					}
				}
				else if (config.stationGroup) {
					ExploreTool.setStationGroupByLabel(config.stationGroup, false);
				}
				else {
					ExploreTool.setAllStations(false);
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
					.done(function() {
						layer_transit.on("clickoutside", function() {
							if ("data/directions-s.json" === transit_source) {
								Story.showOverlay("The current transit information is limited to the city center. Switch to the metro area to explore a larger area.");
							}
							else {
								Story.showOverlay("We do not have transit or bike data in that area. Stick a little closer to Boston for best results.");
							}
						});
					})
					.fail(function() {
						Story.showOverlay("Unable to load transit information. Please try refreshing.");
					});
			}

			return true;
		},
		configureTransitLayer: function(config) {
			if (false === config) {
				// close in explore
				$("#tool-transit").removeClass("in").css("height", "0px");

				// if installed? clear layer
				if (layer_transit) {
					layer_transit.clearOverlay();
				}
				return true;
			}

			// open in explore
			$("#tool-transit").addClass("in").css("height", "auto");

			// install
			return $.when(this.installTransitLayer(config.source || "data/directions-s.json")).done(function() {
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

				// configure transit interface
				configureTransitInterface();
			});
		},
		configureMap: function(config) {
			// set is redrawing
			is_redrawing = true;
			var loading = _createLoadingOverlay(map.getContainer());

			// configure exploration layers
			setTimeout(function() {
				$.when(
					Story.configureExploreLayer(config.toolExplore || false),
					Story.configureTransitLayer(config.toolTransit || false)
				).always(function() {
					loading.remove();
					is_redrawing = false;
				});
			}, 0);

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
		showOverlay: function(message, message_class, tm) {
			var msg = $('<div class="overlay"></div>').addClass("overlay-" + (message_class || "warning")).text(message).appendTo("body");
			msg.fadeIn(200, function() {
				var tmout, close = function() {
					msg.fadeOut(400, function() {
						msg.remove();
					})
				};

				msg.on("click", function() {
					// clear timeout
					tmout && clearTimeout(tmout);
					close();
				});

				if (false === tm) {
					return;
				}

				tmout = setTimeout(close, tm || 8000);
			});
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

		// allow specifying alternate configurations
		this.hasAlternate = false;
		this.altConfigs = {};
	}

	StoryPane.prototype.isActive = function() {
		return Story.getActivePane() === this;
	};

	StoryPane.prototype.configure = function(config) {
		this.config = config;
		return this;
	};

	StoryPane.prototype.addAlternate = function(name, config) {
		this.hasAlternate = true;
		this.altConfigs[name] = config;
		return this;
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

	// add event handlers
	function addTransitListeners() {
		$("#transit-source").on("click", "[data-source]", function () {
			var $this = $(this), old_start = null;

			// already selected
			if ($this.hasClass("active")) {
				return;
			}

			// update interface
			// slight browser optimization?
			$(".active").filter("[data-source]").removeClass("active");
			$this.addClass("active");

			// old start
			if (layer_transit) {
				old_start = layer_transit.getStart();
			}

			// disable everything
			var disabled = $("input, button", "#tool-transit").not(":disabled").prop("disabled", true);
			Story.installTransitLayer($this.data("source"))
				.done(function () {
					// enable interface
					disabled.prop("disabled", false);

					// adjust bounds
					map.flyToBounds(layer_transit.getBounds());

					// configure
					configureTransitFromInterface();

					// restore
					if (old_start) {
						layer_transit.buildOverlay(old_start);
					}
				});
		});


		$("#map-mode").on("click", "[data-mode]", function () {
			$(".active").filter("[data-mode]").removeClass("active");
			$(this).addClass("active");

			configureTransitFromInterface();
		});
		$("#transit-modes").on("change", ":checkbox", configureTransitFromInterface);
		$("#bike-speed").on("change", ":radio", configureTransitFromInterface);
	}

	function configureTransitFromInterface() {
		if (!layer_transit) return;

		var refresh = false;

		// set mode
		var new_mode = $("[data-mode]").filter(".active").first().data("mode") || L.TransitLayer.MODE_MODE;
		if (layer_transit.getMode() !== new_mode) {
			layer_transit.setMode(new_mode);
			refresh = true;
		}

		// enable modes
		$("#transit-modes").find(":checkbox").each(function() {
			var enabled = !!$(this).prop("checked");

			var mode = layer_transit.getRouter().getModeByName(this.value);
			if (mode) {
				if (mode.enabled !== enabled) {
					mode.enabled = enabled;
					refresh = true;
				}
			}

			// special interface change
			if ("bike" === this.value) {
				$("#bike-speed")[enabled ? "show" : "hide"]("fast");
			}
		});


		// bike speed
		var speed_index = parseInt($("#bike-speed").find(":radio").filter(":checked").val(), 10);
		var mode = layer_transit.getRouter().getModeByName("bike");
		if (mode) {
			if (mode.getIndex() !== speed_index) {
				mode.setIndex(speed_index);
				refresh = true;
			}
		}

		if (refresh) {
			layer_transit.refreshOverlay();
		}
	}

	function configureTransitInterface() {
		if (!layer_transit) return;

		var elems;

		// set source
		elems = $("[data-source]", "#tool-transit");
		elems.removeClass("active");
		elems.filter("[data-source='" + transit_source + "']").addClass("active");

		// set mode
		elems = $("[data-mode]", "#tool-transit");
		elems.removeClass("active");
		elems.filter("[data-mode='" + layer_transit.getMode() + "']").addClass("active");

		// enable modes
		$("#transit-modes").find(":checkbox").each(function() {
			var mode = layer_transit.getRouter().getModeByName(this.value);
			if (mode) {
				$(this).prop("checked", mode.enabled);
			}

			// special interface change
			if ("bike" === this.value) {
				$("#bike-speed")[mode.enabled ? "show" : "hide"]("fast");
			}
		});

		// set bike speed
		elems = $("#bike-speed").find(":radio");
		elems.prop("checked", false);
		var mode = layer_transit.getRouter().getModeByName("bike");
		if (mode) {
			elems.filter("[value='" + mode.getIndex() + "']").prop("checked", true);
		}
	}
}).call(this, jQuery);
