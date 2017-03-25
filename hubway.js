// global variables
var map;
var hubway = {data: []};
var activeMarkers = [];
var overlayMarkers = [];
var selectedStations = {};
var selectedTime = {'year': {}, 'month': {}, 'day': {}, 'hour': {}};

var activeStatistic;
var activeStatisticUnit;
var outlierLowerBound;
var outlierUpperBound;
var useRawMarkerSize;
	   
var markerOptions = {
    'averageTripDistanceByStation': {'stroke': false, 'fillOpacity': 0.2, 'pane': 'data'},
    'selected': {'stroke': false, 'fillOpacity': 1, 'fillColor': 'red'},
    'default': {'stroke': false, 'fillOpacity': 0.5}
};
	   
var defaultMarkerRadius = 100;
var defaultStatisticRadius = 1600;
var cssColors = ['blue','navy','red','white','gray','black','silver','maroon','purple','fuchsia','lime','olive','yellow','green','teal','aqua','antiquewhite','aquamarine','azure','beige','bisque','blanchedalmond','blueviolet','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','gainsboro','ghostwhite','gold','goldenrod','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','limegreen','linen','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','oldlace','olivedrab','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellowgreen'];
var selectedColor = 'red';
var unselectedColor = 'blue';

var years = [2011, 2012, 2013, 2014, 2015, 2016];
var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var days = [1, 2, 3, 4, 5, 6, 7];
var hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];


// assign clusters an index for determining colors
var clusters = {};

function addMarker(latitude, longitude, description, kMeansLabel, radius, options) {
   
    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }
    
    var color = cssColors[clusters[kMeansLabel]];
    
    var marker;
    
    if (options.pane) {
        marker = L.circle([latitude, longitude], 
                          radius, 
                          {'stroke': options.stroke, 
                           'fillColor': color, 
                           'fillOpacity': options.fillOpacity,
                           'pane': options.pane}).addTo(map);
                           
    } else {
    
        marker = L.circle([latitude, longitude], 
                          radius, 
                          {'stroke': options.stroke, 
                           'fillColor': color, 
                           'fillOpacity': options.fillOpacity}).addTo(map);    
    }
    
    activeMarkers.push(marker);
    
    return marker;
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

    activeMarkers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    
    overlayMarkers.forEach(function(marker) {
        map.removeLayer(marker.marker);
    });
    
    clusters = {};    
    activeMarkers = [];
}

// specific illustrations
function showStations() {

    var randomlySeed = !Object.keys(selectedStations).length;

    // add station markers
    hubway.stations.forEach(function(row) {
        var description = row.station + ', ' + row['docksCount'] + ' bikes';        
        marker = addMarker(row.latitude, row.longitude, description, "default", defaultMarkerRadius, markerOptions.default);

        marker.bindPopup(description);
        marker.on('mouseover', function (e) { this.openPopup(); });
        marker.on('mouseout', function (e) { this.closePopup(); });
        
        if (selectedStations[row.station_id] || (Math.random() < 0.05 && randomlySeed)) {
            selectedStations[row.station_id] = {'row': row, 'marker': marker};
            marker.setStyle(markerOptions.selected);        
        }
        
        marker.on('click', function (e) { 
            if (!selectedStations[row.station_id]) {
                selectedStations[row.station_id] = {'row': row, 'marker': this};
                this.setStyle(markerOptions.selected);
            } else {
                delete selectedStations[row.station_id];
                this.setStyle(markerOptions.default);
            }
        });
        
    });
}

function showAverageDistanceByStation() {

    map.getPane('data');

    overlayMarkers.forEach(function(marker) {
        map.removeLayer(marker.marker);
    });

    var description = "<p>";

    Object.keys(selectedStations).forEach(function(station_id) {
        
        if (!hubway.statistics[activeStatistic][station_id]) { return; }
        
        var row = selectedStations[station_id].row;

        var max = 0;
        var min = 0;
        var sum = 0;
        var count = 0;
    
        Object.keys(selectedTime.year).forEach(function(year) {
        if (!hubway.statistics[activeStatistic][station_id][year]) { return; }

            Object.keys(selectedTime.month).forEach(function(month) {
                if (!hubway.statistics[activeStatistic][station_id][year][month]) { return; }
            
                Object.keys(selectedTime.day).forEach(function(day) {
                    if (!hubway.statistics[activeStatistic][station_id][year][month][day]) { return; }

                    Object.keys(selectedTime.hour).forEach(function(hour) {
                        if (!hubway.statistics[activeStatistic][station_id][year][month][day][hour]) { return; }

                        sum += hubway.statistics['averageTripDistanceByStation'][row.station_id][year][month][day][hour].markerSize;
                        
                        if (hubway.statistics['maxTripDistanceByStation'][row.station_id][year][month][day][hour].markerSize > max) {
                            max = hubway.statistics['maxTripDistanceByStation'][row.station_id][year][month][day][hour].markerSize;
                        }
                        
                        if (hubway.statistics['minTripDistanceByStation'][row.station_id][year][month][day][hour].markerSize < min) {
                            min = sum.mean += hubway.statistics['averageTripDistanceByStation'][row.station_id][year][month][day][hour].markerSize;
                        }

                        count++;               
                    }); 
                });
            });
        });
        
        var mean = count === 0 ? 0 : sum / count;
                
        var marker = addMarker(row.latitude, row.longitude, row.station, "max", max, markerOptions[activeStatistic]);
        overlayMarkers.push({'row': row, 'stat': 'maxTripDistanceByStation', 'marker': marker});

        markerSize = addMarker(row.latitude, row.longitude, row.station, "mean", mean, markerOptions[activeStatistic]);
        overlayMarkers.push({'row': row, 'stat': 'averageTripDistanceByStation', 'marker': marker});        

        markerSize = addMarker(row.latitude, row.longitude, row.station, "min", min, markerOptions[activeStatistic]);
        overlayMarkers.push({'row': row, 'stat': 'averageTripDistanceByStation', 'marker': marker});

        description +=  row.station + ", " + Math.round(min, 0) + "-" + Math.round(mean, 0) + "-" + Math.round(max, 0) + " " + activeStatisticUnit + "<br>";
    });
    

    description += "</p>";    
    $("#js_description").html(description);
}

function showCommute(time) {

    var distance = 0.0025;
    
    hubway.stations.forEach(function(row) {

        if (hubway.clustering[time].kMeansLabel[row.station_id] !== undefined) {

            var description = row.station;
            var diameter = hubway.clustering[time].rawData[row.station_id].meanDistance * 800;
            var cluster = hubway.clustering[time].kMeansLabel[row.station_id]; 
            var direction = hubway.clustering[time].rawData[row.station_id].meanVector;

            addMarker(row.latitude, row.longitude, description, cluster, defaultMarkerRadius, markerOptions.default);
            addVector(row.latitude, row.longitude, direction, distance, cluster);
        }
    });    
}

function getStatisticMax(name, outlierBelow, outlierAbove) {
    var maxValue = 0;
    
    Object.keys(hubway.statistics[name]).forEach(function(station) {
        Object.keys(hubway.statistics[name][station]).forEach(function(year) {
            if (!selectedTime['year'][year]) { return; }
                        
            Object.keys(hubway.statistics[name][station][year]).forEach(function(month) {
                if (!selectedTime['month'][month]) { return; }
                                
                Object.keys(hubway.statistics[name][station][year][month]).forEach(function(day) {
                    if (!selectedTime['day'][day]) { return; }
                                        
                    Object.keys(hubway.statistics[name][station][year][month][day]).forEach(function(hour) {
                        if (!selectedTime['hour'][hour]) { return; }
                                                    
                        if (maxValue === undefined || maxValue < hubway.statistics[name][station][year][month][day][hour].markerSize) {
            
                            var potentialValue = hubway.statistics[name][station][year][month][day][hour].markerSize;
                                                        
                            if (potentialValue > outlierBelow && potentialValue < outlierAbove) {
                                maxValue = potentialValue;
                            }
                        }
                    });
                });
            });
        });
    });   
    
    return maxValue; 
}

function showStationStatistic(name, units, useRawMarkerSize, outlierBelow, outlierAbove) {

    var maxValue = getStatisticMax(name, outlierBelow, outlierAbove);
    
    hubway.stations.forEach(function(row) {
        if (hubway.statistics[name][row.station_id]) {
            var station = row.station_id;
        
            var sum = 0;
            var count = 0;

            Object.keys(hubway.statistics[name][station]).forEach(function(year) {
                if (!selectedTime['year'][year]) { return; }
            
                Object.keys(hubway.statistics[name][station][year]).forEach(function(month) {
                    if (!selectedTime['month'][month]) { return; }
                
                    Object.keys(hubway.statistics[name][station][year][month]).forEach(function(day) {
                        if (!selectedTime['day'][day]) { return; }
                    
                        Object.keys(hubway.statistics[name][station][year][month][day]).forEach(function(hour) {
                            if (!selectedTime['hour'][hour]) { return; }
                            
                            var markerSize = hubway.statistics[name][row.station_id][year][month][day][hour].markerSize;
                            
                            if (markerSize > outlierBelow && markerSize < outlierAbove) {
                                sum += markerSize;
                                count++; 
                            }
                        });
                    });
                });
            });
            
            var average = sum / count;
            
            if (count === 0) {
                average = 0;
            }

            var description = row.station + ", " + 
                                "sum: " + sum + " " + activeStatisticUnit + ", " +
                                "avg: " + Math.round(average, 1) + " " + activeStatisticUnit;

            var markerSize = average;
            var marker;
            
            if (!useRawMarkerSize) {
                markerSize = markerSize * (defaultStatisticRadius / maxValue);
            }

            if (markerOptions[name]) {
                marker = addMarker(row.latitude, row.longitude, description, "default", markerSize, markerOptions[name]);
            } else { 
                marker = addMarker(row.latitude, row.longitude, description, "default", markerSize, markerOptions.default);
            }

            marker.bindPopup(description);
            marker.on('mouseover', function (e) { this.openPopup(); });
            marker.on('mouseout', function (e) { this.closePopup(); });                

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

function setupTimeFilter(options, label, div) {

    var filters = label + ": ";

    options.forEach(function(time) {
        var id = "js_" + label + "_" + time;
        filters += "<label for='" + id + "'>" + time + "</label><input type='checkbox' id='" + id + "'>";
    });
    
    // add filters to the DOM
    $(div).html(filters);
    
    // attach handlers
    options.forEach(function(time) {
        var checkbox = "#js_" + label + "_" + time;
        
        $(checkbox).on("change", function() {
            if ($(this).prop('checked')) {
                selectedTime[label][time] = true;
            } else {
                delete selectedTime[label][time];
            }  
        });

        if (time == '2016' || time == '7' || Math.random() < 0.2) {
            $(checkbox).prop('checked', true);
            $(checkbox).trigger('change');
        }
    });
}

jQuery(function($) {
	var loading = createLoadingOverlay("#map");
	
	// create map
	map = L.map('map', {
		scrollWheelZoom: false
	});
	          
	map.createPane('data');
	map.getPane('data').style.zIndex = 299;
	            	    
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

        // default show
        showStations();
                
		// remove loading
		setTimeout(function() { 
		    loading.remove(); 
		}, 0);

	}).fail(function() {
		// TODO: write me
	});
	
	// button events
	$("#js_show_stations").on("click", function() {
	    removeMarkers();
	    showStations();
	});
	
	$("#js_show_morning").on("click", function() {
	    removeMarkers();
	    showCommute('byDirectionAndDistanceMorning');
	});
	
	$("#js_show_evening").on("click", function() {
        removeMarkers();
        showCommute('byDirectionAndDistanceEvening');
	});
	
	$("#js_show_avg_trip_duration").on("click", function() {
	    removeMarkers();
	    activeStatistic = 'averageTripDurationByStation';
	    activeStatisticUnit = 'minutes';
	    outlierLowerBound = 0;
	    outlierUpperBound = 180;
	    useRawMarkerSize = false;
        showStationStatistic(activeStatistic, 
                             activeStatisticUnit,
                             useRawMarkerSize, 
                             outlierLowerBound, outlierUpperBound);
	});
	
	$("#js_show_avg_number_trips").on("click", function() {
	    removeMarkers();
	    activeStatistic = 'averageTripsByStation';
  	    activeStatisticUnit = 'trips';
  	    outlierLowerBound = 0;
	    outlierUpperBound = 10000;
	    useRawMarkerSize = false;
        showStationStatistic(activeStatistic, 
                             activeStatisticUnit,
                             useRawMarkerSize, 
                             outlierLowerBound, outlierUpperBound);
	});	

	$("#js_show_avg_trip_distance").on("click", function() {
	    removeMarkers();
	    showStations();
	    activeStatistic = 'averageTripDistanceByStation';
	    activeStatisticUnit = 'meters';
	    useRawMarkerSize = true;
        showAverageDistanceByStation();
	});
    
    // lay out time filters
    setupTimeFilter(years, "year", "#js_years");
    setupTimeFilter(months, "month", "#js_months");
    setupTimeFilter(days, "day", "#js_days");
    setupTimeFilter(hours, "hour", "#js_hours");
});
