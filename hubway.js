// global variables
var activeMarkers = [];
var map;
var hubway = {data: []};

var mapIconColors = {
    'Boston': 'red', 
    'Cambridge': 'blue',
    'Somerville': 'green',
    'default': 'white'
};
    
var mapIcons = {};
var mapIconsKMeans = [];
Object.keys(mapIconColors).forEach(function(city) {
    var newIcon = L.divIcon({ 
            className: 'empty',
            html: '<div class="marker" style="background:' + mapIconColors[city] + '"></div>'
        });
        
    mapIcons[city] = newIcon;
    mapIconsKMeans.push(newIcon);        
});

function addMarker(row) {
   
    var latitude = row.latitude;
    var longitude = row.longitude;
    var description = row.station + ', ' + row['docksCount'] + ' bikes';
    
    // var myIcon = mapIcons[row['municipality']] ? mapIcons[row['municipality']] : mapIcons['default'];
    var myIcon = mapIconsKMeans[row['municipalityKMeans']];
    
    var marker = L.marker([latitude, longitude], {icon: myIcon}).addTo(map);
    marker.bindPopup(description);
    marker.on('mouseover', function (e) {
            this.openPopup();
        });
    
    activeMarkers.push(marker);    
}

function removeMarkers() {
    activeMarkers.forEach(function(marker) {
        map.removeLayer(marker);
    });
}

function replaceMarkers(data) {
    removeMarkers();
    
	data.forEach(function(row) {
       addMarker(row);
	});
}

function resizeMarkers() {

    var currentZoom = map.getZoom();
    var threshold = 13;

    if (currentZoom >= threshold) { 
        $(".marker").css('width', '10px');
        $(".marker").css('height', '10px');
        $(".marker").css('border-radius', '5px');

    } else {
        $(".marker").css('width', '8px');
        $(".marker").css('height', '8px');
        $(".marker").css('border-radius', '4px');        
    }
}

function resetMapView() {
	// contiguous US
	map.fitBounds([
		[42.254442496693386, -71.28787994384767],
		[42.45740743905049, -70.90164184570314]
	]);	
}

function createLoadingOverlay(obj) {
	var ret = $();
	
	$(obj).each(function() {
		var $obj = $(this);
	
		// get position information
		var pos = $obj.position();
		pos.width = $obj.width();
		pos.height = $obj.height();
		pos.lineHeight = pos.height + "px"; // same line height
		
		// configure overlay
		var el = $('<div class="loading-overlay">Loading...</div>').insertAfter($obj).css(pos);
		
		// add element
		ret = ret.add(el);
	});
	
	return ret;
}

jQuery(function($) {
	var loading = createLoadingOverlay("#map");
	
	// create map
	map = L.map('map', {
		scrollWheelZoom: false
	});
	    
    map.on('zoomend', function() {
        resizeMarkers();
    });    
        	    
    resetMapView();
	
	// specify OSM tiles
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		minZoom: 3,
		maxZoom: 15
	}).addTo(map);
	
	// load data
	 $.ajax({
		dataType: "json",
		url: $("body").data("datasrc") || "data.json"
	}).done(function(data) {
	
		// store to global variable
		hubway = data;

        // add station markers
        hubway.data.forEach(function(row) {
            addMarker(row);
        });
        
		// remove loading
		setTimeout(function() { 
		    loading.remove(); 
		}, 0);

	}).fail(function() {
		// TODO: write me
	});
});
