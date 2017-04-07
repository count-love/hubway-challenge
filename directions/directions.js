jQuery(function($) {
	"use strict";
	
	/* REQUIRES: jQuery, d3 and leaflet */

	// leaflet maps object
	var map, layer;

	function loadTransitLayer(address) {
		// remove old layer
		if (layer) {
			layer.remove();
			layer = null;
		}

		var dfd = $.Deferred();

		// load data
		$.ajax({
			dataType: "json",
			url: address
		}).done(function(received_data) {
			// do not bother drawing (could be race conditions here, should potentially stop multiple loads)
			if (layer) {
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

			// add grid
			layer = L.transitLayer(router);
			layer.addTo(map);

			// resolve
			dfd.resolve();
		}).fail(function(jqXHR, text, err) {
			dfd.reject(text || err);
		});

		return dfd.promise();
	}

	// setup map
	setupMap();

	// load transit overlay
	var disabled = $("input, button").not(":disabled").prop("disabled", true);
	loadTransitLayer("../data/directions-s.json")
		.done(function() {
			// enable interface
			disabled.prop("disabled", false);
		})
		.fail(function() {
			// TODO: write error handling
		});

	// create and configure leaflet map
	function setupMap() {
		// create the map
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
			minZoom: 3,
			maxZoom: 15
		}).addTo(map);

		// add resize event
		$(window).on("resize", function() {
			map.invalidateSize();
		});
	}
	
	// add event handlers
	$("#transit-source").on("click", "[data-source]", function() {
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
		if (layer) {
			old_start = layer.getStart();
		}

		// disable everything
		var disabled = $("input, button").not(":disabled").prop("disabled", true);
		loadTransitLayer($this.data("source"))
			.done(function() {
				// enable interface
				disabled.prop("disabled", false);

				// configure
				configureFromInterface();

				// restore
				if (old_start) {
					layer.buildOverlay(old_start);
				}
			})
			.fail(function() {
				// TODO: write error handling
			});
	});

	function configureFromInterface() {
		if (!layer) return;

		var refresh = false;

		// set mode
		var new_mode = $("[data-mode]").filter(".active").first().data("mode") || L.TransitLayer.MODE_MODE;
		if (layer.getMode() !== new_mode) {
			layer.setMode(new_mode);
			refresh = true;
		}

		// enable modes
		$("#transit-modes").find(":checkbox").each(function() {
			var enabled = !!$(this).prop("checked");

			var mode = layer.getRouter().getModeByName(this.value);
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
		var mode = layer.getRouter().getModeByName("bike");
		if (mode) {
			if (mode.getIndex() !== speed_index) {
				mode.setIndex(speed_index);
				refresh = true;
			}
		}

		if (refresh) {
			layer.refreshOverlay();
		}
	}

	$("#map-mode").on("click", "[data-mode]", function() {
		$(".active").filter("[data-mode]").removeClass("active");
		$(this).addClass("active");

		configureFromInterface();
	});
	$("#transit-modes").on("change", ":checkbox", configureFromInterface);
	$("#bike-speed").on("change", ":radio", configureFromInterface);
});
