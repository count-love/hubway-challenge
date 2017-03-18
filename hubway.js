// global variables
var activeMarkers = [];
var map;
var hubway = {data: []};

var cssColors = ['black','silver','gray','white','maroon','red','purple','fuchsia','green','lime','olive','yellow','navy','blue','teal','aqua','antiquewhite','aquamarine','azure','beige','bisque','blanchedalmond','blueviolet','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','gainsboro','ghostwhite','gold','goldenrod','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','limegreen','linen','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','oldlace','olivedrab','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellowgreen'];
var mapMarkerColors = [];
cssColors.forEach(function(color) {
    mapMarkerColors.push(
        L.divIcon({ 
            className: 'empty',
            html: '<div class="marker" style="background:' + color + '"></div>'
        })
    );
});

var clusters = {};


function addMarker(row) {
   
    // options: 'municipality', 'municipalityKMeans'
    var clusterBy = 'municipalityKMeans';
   
    var latitude = row.latitude;
    var longitude = row.longitude;
    var description = row.station + ', ' + row['docksCount'] + ' bikes';

    if (clusters[row[clusterBy]] === undefined) {
        clusters[row[clusterBy]] = mapMarkerColors[Object.keys(clusters).length];
    }
    
    var myIcon = clusters[row[clusterBy]];
    
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
		[42.33811807427539, -71.13733291625978],
		[42.376934182549896, -71.00309371948244]
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
