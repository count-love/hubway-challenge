(function($) {

	var panes = [];
	var map;

	var root = this;
	var Story = {
		mapDefaultView: function() {
			map.fitBounds([
				[42.33811807427539, -71.13733291625978],
				[42.376934182549896, -71.00309371948244]
			]);
		},
		setupPage: function() {
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

			// add resize event
			$(window).on("resize", function() {
				map.invalidateSize();
			});

		},
		addPane: function(pane) {
			panes.push(pane);
		}
	};
	root.Story = Story;

	// create class for story panes
	root.StoryPane = function() {

	};

	// TODO: move to data file
	$(function() {
		Story.setupPage();
	});
}).call(this, jQuery);
