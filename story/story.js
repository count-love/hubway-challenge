(function($) {

	var params_default = {
		initialPane: 0
	};

	var $story, $container;
	var panes = [], active = -1;
	var map;

	// UI math and variables
	var pane_height;
	var scroll_start = null, scroll_offset_last = 0;

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

	/* TEST */

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
				for (var i = 0; i < this.panes; ++i) {
					if (index_or_name === panes[i].name) {
						return panes[i];
					}
				}
			}

			return null;
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
	}

	StoryPane.prototype.isActive = function() {
		return Story.getActivePane() === this;
	};
}).call(this, jQuery);
