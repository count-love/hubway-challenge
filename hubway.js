// global variables
var activeMarkers = [];
var map;
var hubway = {data: []};

var cssColors = ['blue','gray','white','black','silver','maroon','red','purple','fuchsia','green','lime','olive','yellow','navy','teal','aqua','antiquewhite','aquamarine','azure','beige','bisque','blanchedalmond','blueviolet','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','gainsboro','ghostwhite','gold','goldenrod','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','limegreen','linen','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','oldlace','olivedrab','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellowgreen'];

// assign clusters an index for determining colors
var clusters = {};

function addMarker(latitude, longitude, description, kMeansLabel, size) {
   
    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }
    
    var color = cssColors[clusters[kMeansLabel]];
    var id = "marker" + activeMarkers.length;
    var myIcon = L.divIcon({ 
        className: 'empty',
        html: '<div class="marker" id="' + id + '" style="background:' + color + '"></div>'
    });

    var marker = L.marker([latitude, longitude], {icon: myIcon}).addTo(map);
    
    if (size == "default") {
        $("#"+id).css('width', 10);
        $("#"+id).css('height', 10);
        
    } else {
        $("#"+id).css('width', size.width);
        $("#"+id).css('height', size.height);    
    }
    
    marker.bindPopup(description);
    marker.on('mouseover', function (e) { this.openPopup(); });
    marker.on('mouseout', function (e) { this.closePopup(); }); 
    
    activeMarkers.push(marker);   
}

function addVector(startLat, startLong, direction, magnitude, kMeansLabel) {

    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }

    var endLat = startLat + Math.sin(direction) * magnitude;
    var endLong = startLong + Math.cos(direction) * magnitude;

    var polyline = [[startLat, startLong], [endLat, endLong]];
    var colorIndex = clusters[kMeansLabel];
    
    var line = L.polyline(polyline, {color: cssColors[colorIndex]}).addTo(map);
    
    activeMarkers.push(line);
}

function removeMarkers() {
    clusters = {};

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

// specific illustrations
function showCommute(time) {

    var distance = 0.0025;
    
    hubway.stations.forEach(function(row) {

        if (hubway.clustering[time].kMeansLabel[row.station_id] !== undefined) {

            var description = row.station;
            var diameter = hubway.clustering[time].rawData[row.station_id].meanDistance * 800;
            var size = {'width': diameter, 'height': diameter};
            var cluster = hubway.clustering[time].kMeansLabel[row.station_id]; 
            var direction = hubway.clustering[time].rawData[row.station_id].meanVector;

            addMarker(row.latitude, row.longitude, description, cluster, size);    
            addVector(row.latitude, row.longitude, direction, distance, cluster);
        }
    });    
}

function showStationStatistic(name, month, units) {

    var maxSize = 200;
    var maxValue;

    Object.keys(hubway.statistics[name]).forEach(function(station) {
        Object.keys(hubway.statistics[name][station]).forEach(function(time) {
            if (maxValue === undefined || maxValue < hubway.statistics[name][station][time].markerSize) {
                maxValue = hubway.statistics[name][station][time].markerSize;
            }
        });
    });

    hubway.stations.forEach(function(row) {
        if (hubway.statistics[name][row.station_id] && hubway.statistics[name][row.station_id][month]) {

            var description = row.station + ", " + Math.round(hubway.statistics[name][row.station_id][month].markerSize) + " " + units;
            var diameter = maxSize * (hubway.statistics[name][row.station_id][month].markerSize / maxValue);
            var size = {'width': diameter, 'height': diameter};

            addMarker(row.latitude, row.longitude, description, "default", size);    
        }
    }); 
}

function resetMapView() {

    // Somerville, Cambridge, Boston
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
        hubway.stations.forEach(function(row) {
            var description = row.station + ', ' + row['docksCount'] + ' bikes';
            var size = {'width': row['docksCount'], 'height': row['docksCount']};
            // var clusterBy = hubway.clustering['byStationLocation'].kMeansLabel[row.station_id]; 
            
            addMarker(row.latitude, row.longitude, description, "default", size);    
        });
        
		// remove loading
		setTimeout(function() { 
		    loading.remove(); 
		}, 0);

	}).fail(function() {
		// TODO: write me
	});
	
	// button events
	$("#js_show_morning").on("click", function() {
	    removeMarkers();
	    showCommute('byDirectionAndDistanceMorning');
	});
	
	$("#js_show_evening").on("click", function() {
        removeMarkers();
        showCommute('byDirectionAndDistanceEvening');
	});
	
	$("#js_show_avg_trip_times").on("click", function() {
	    removeMarkers();
        showStationStatistic('averageTripTimeByStation', 1, 'minutes');	    
	});
	
    // lay out date slider  
    $("#js_dateSlider").slider({
        min: 1,
        max: 12,
        step: 1,
        range: false,
        values: 1,
        slide: function(event, ui) {
            removeMarkers();
            showStationStatistic('averageTripTimeByStation', ui.value, 'minutes');
        },
        change: function(event, ui) {
            removeMarkers();
            showStationStatistic('averageTripTimeByStation', ui.value, 'minutes');
        }        
    });
	
	
});
