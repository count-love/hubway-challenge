// global variables
var map;
var hubway = {};
var activeMarkers = {};
var activeStatistic;
var selectedStations = {};
var clusters = {};

// store the active set of selected filters
var selectedFilters = {
    'year': {2016:true}, 
    'month': {1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true,9:true,10:true,11:true,12:true},
    'day': {0:true,1:true,2:true,3:true,4:true,5:true,6:true},
    'hour': {0:true,1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true,9:true,10:true,11:true,12:true,13:true,14:true,15:true,16:true,17:true,18:true,19:true,20:true,21:true,22:true,23:true},
    'member': {0:true,1:true}
};
   
var markerOptions = {
    'distance': {'stroke': false, 'fillOpacity': 0.2, 'pane': 'data'},
    'vector': { 'fillColor': 'blue', 'fillOpacity': 0.2, 'pane': 'data'},
    'data': {'stroke': false, 'fillOpacity': 0.5, 'pane': 'data'},
    'default': {'stroke': false, 'fillOpacity': 0.5},
    
    // these two are only used to show bike stations, so colors are hard-coded
    'stationUnselected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'blue'},
    'stationSelected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'red'},    
};
	   
var defaultMarkerRadius = 100;
var defaultStatisticRadius = 2000;
var cssColors = ['blue','white','red','navy','gray','black','silver','maroon','purple','fuchsia','lime','olive','yellow','green','teal','aqua','antiquewhite','aquamarine','azure','beige','bisque','blanchedalmond','blueviolet','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','gainsboro','ghostwhite','gold','goldenrod','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','limegreen','linen','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','oldlace','olivedrab','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellowgreen'];

// available filter options for queries
var queryFilters = {
    'day': [
        {'label': 'all', 'set': {'hour': null}},
        {'label': 'early', 'tooltip': '2:00AM-5:00AM', 'set': {'hour': [2, 3, 4, 5]}},
        {'label': 'morning', 'tooltip': '6:00AM-10:00AM', 'set': {'hour': [6, 7, 8, 9]}},
        {'label': 'midday', 'tooltip': '10:00AM-2:00PM', 'set': {'hour': [10, 11, 12, 13]}},
        {'label': 'afternoon', 'tooltip': '2:00PM-5:00PM', 'set': {'hour': [14, 15, 16]}},
        {'label': 'evening', 'tooltip': '5:00PM-9:00PM', 'set': {'hour': [17, 18, 19, 20]}},
        {'label': 'night', 'tooltip': '9:00PM-2:00AM', 'set': {'hour': [21, 22, 23, 0, 1]}},
    ],
    
    'week': [
        {'label': 'all', 'set': {'day': null}},
        {'label': 'weekday', 'tooltip': 'Monday-Friday', 'set': {'day': [0, 1, 2, 3, 4]}},
        {'label': 'weekend', 'tooltip': 'Saturday, Sunday', 'set': {'day': [5, 6]}}
    ],
    
    'season': [
        {'label': 'all', 'set': {'month': null}},
        {'label': 'spring', 'tooltip': 'March, April, May', 'set': {'month': [3, 4, 5]}},
        {'label': 'summer', 'tooltip': 'June, July, August', 'set': {'month': [6, 7, 8]}},
        {'label': 'fall', 'tooltip': 'September, October, November', 'set': {'month': [9, 10, 11]}},
        {'label': 'winter', 'tooltip': 'December, January, February', 'set': {'month': [12, 1, 2]}}
    ],
    
    'year': [
        {'label': 'all', 'set': {'year': null}},
        {'label': '2016', 'set': {'year': [2016]}},
        {'label': '2015', 'set': {'year': [2015]}},
        {'label': '2014', 'set': {'year': [2014]}},
        {'label': '2013', 'set': {'year': [2013]}},
        {'label': '2012', 'set': {'year': [2012]}},
        {'label': '2011', 'set': {'year': [2011]}}
    ],
    
    'member': [
        {'label': 'all', 'set': {'member': null}},
        {'label': 'member', 'tooltip': 'Member', 'set': {'member': [1]}},
        {'label': 'casual', 'tooltip': 'Non-member', 'set': {'member': [0]}},
    ]
};

var stationGroups = [
    {'label': 'Favorite Coffee Stops', stops: [184, 106, 62]},
    {'label': 'MIT', stops: [137, 138, 169, 170]}
];

// available queries to run/draw
var illustrations = {

	'trips': {
	    unit: 'trips/day',
	    maxValue: 100,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
  	    draw: function() {
    	    removeMarkers();
  	        showStationStatistic('trips', ['trips']);
        },

  	    queryResults: function() { 

  	        var results = DataSource.query(
                { 
                    startYear: selectedFilters['year'] === null ? null : Object.keys(selectedFilters['year']),
                    startMonth: selectedFilters['month'] === null ? null : Object.keys(selectedFilters['month']),
                    startWeekday: selectedFilters['day'] === null ? null : Object.keys(selectedFilters['day']),
                    startHour: selectedFilters['hour'] === null ? null : Object.keys(selectedFilters['hour'])
                },
                "stationStart", null, "sum"
            );

            // just an approximation... (# months)*(4 weeks/month)*(days/week)
            var totalNumberOfDays = Object.keys(selectedFilters['month']).length * 4 *
               Object.keys(selectedFilters['day']).length;
            
            Object.keys(results).forEach(function(station) {
                results[station] /= totalNumberOfDays;
            });
            
            var description = '<div class="results_title">Number of trips started from each station</div>';
            return {'trips': results, 'description': description};
        }
	},
	    
	'duration': {
	    unit: 'minutes',
	    maxValue: 60,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
  	    draw: function() {
    	    removeMarkers();
            showStationStatistic('duration', ['duration']);
      	},
      	
  	    queryResults: function() { 

  	        var results = DataSource.query(
  	            // which results to include, can be null for all or a hash where keys are field 
  	            // names and values are either a single value or an array of values
  	            // valid fields: duration, gender, member, startMinute, startYear, startMonth, startWeekday, startHour, stationEnd, stationStart
                { 
                    startYear: selectedFilters['year'] === null ? null : Object.keys(selectedFilters['year']),
                    startMonth: selectedFilters['month'] === null ? null : Object.keys(selectedFilters['month']),
                    startWeekday: selectedFilters['day'] === null ? null : Object.keys(selectedFilters['day']),
                    startHour: selectedFilters['hour'] === null ? null : Object.keys(selectedFilters['hour'])
                },
                "stationStart", // what to group by (can be any field name), or null for no grouping
                "duration",     // what to aggregate (can be any field name), or null to count results
                "mean"          // how to aggregate (can be sum, min, max or mean)
            );
            
            var description = '<div class="results_title">Average duration of trips started at each station</div>';
            return {'duration': results, 'description': description};
        }
	},

	'distance': {
	    unit: 'meters',
	    maxValue: 3000,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance', ['min', 'mean', 'max']);
        },
        
  	    queryResults: function() { 

            var min = DataSource.query(
                { 
                    startYear: selectedFilters['year'] === null ? null : Object.keys(selectedFilters['year']),
                    startMonth: selectedFilters['month'] === null ? null : Object.keys(selectedFilters['month']),
                    startWeekday: selectedFilters['day'] === null ? null : Object.keys(selectedFilters['day']),
                    startHour: selectedFilters['hour'] === null ? null : Object.keys(selectedFilters['hour']),
                    stationStart: Object.keys(selectedStations).length == 0 ? null : Object.keys(selectedStations)
                },
                "stationStart", "distance", "min"
            ); 
              	        
            var mean = DataSource.query(
                { 
                    startYear: selectedFilters['year'] === null ? null : Object.keys(selectedFilters['year']),
                    startMonth: selectedFilters['month'] === null ? null : Object.keys(selectedFilters['month']),
                    startWeekday: selectedFilters['day'] === null ? null : Object.keys(selectedFilters['day']),
                    startHour: selectedFilters['hour'] === null ? null : Object.keys(selectedFilters['hour']),
                    stationStart: Object.keys(selectedStations).length == 0 ? null : Object.keys(selectedStations)
                },
                "stationStart", "distance", "mean"
            );

            var max = DataSource.query(
                { 
                    startYear: selectedFilters['year'] === null ? null : Object.keys(selectedFilters['year']),
                    startMonth: selectedFilters['month'] === null ? null : Object.keys(selectedFilters['month']),
                    startWeekday: selectedFilters['day'] === null ? null : Object.keys(selectedFilters['day']),
                    startHour: selectedFilters['hour'] === null ? null : Object.keys(selectedFilters['hour']),
                    stationStart: Object.keys(selectedStations).length == 0 ? null : Object.keys(selectedStations)
                },
                "stationStart", "distance", "max"
            );
            
            var description = '<div class="results_title">Min/Mean/Max Distance Traveled</div>';
            Object.keys(selectedStations).forEach(function(station) {
                if (min[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            hubway.stations[station].station + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            hubway.stations[station].station + ": " + 
                            Math.round(min[station], 0) + "/" + 
                            Math.round(mean[station], 0) + "/" + 
                            Math.round(max[station], 0) + " " + illustrations['distance']['unit'] + '</div>';
                }
            });
            
            return {'min': min, 'mean': mean, 'max': max, 'description': description};
        }	
	},

    'destination': {
	    unit: 'meters',
	    maxValue: 1,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.vector,
  	    draw: function() {
                removeMarkers();
        	    showStations();
      	        showStationStatistic('destination', ['direction']);
        },

  	    queryResults: function() { 

            var maxEndStations = 5;

            var results = DataSource.query(
                { 
                    startYear: selectedFilters['year'] === null ? null : Object.keys(selectedFilters['year']),
                    startMonth: selectedFilters['month'] === null ? null : Object.keys(selectedFilters['month']),
                    startWeekday: selectedFilters['day'] === null ? null : Object.keys(selectedFilters['day']),
                    startHour: selectedFilters['hour'] === null ? null : Object.keys(selectedFilters['hour']),
                    stationStart: Object.keys(selectedStations).length == 0 ? null : Object.keys(selectedStations)
                },
                function(trip) { return trip & 0xffff; }, 
                null,
                null
            );
                        
            var resultsByStation = {};
            Object.keys(results).forEach(function(row) {
                var startStationID = DataSource.FIELDS.stationStart(row);
                var endStationID = DataSource.FIELDS.stationEnd(row);
                
                if (!resultsByStation[startStationID]) {
                    resultsByStation[startStationID] = {};
                }
                
                if (!resultsByStation[startStationID][endStationID]) {
                    resultsByStation[startStationID][endStationID] = 0;
                }
                
                resultsByStation[startStationID][endStationID] = results[row];
            });
                        
            var topStations = {};
            
            var description = '<div class="results_title">Top destinations from selected start stations</div>';
   	                
            Object.keys(resultsByStation).forEach(function(station) {
                
                var keys = Object.keys(resultsByStation[station]);
                
                var sortedKeys = keys.sort(function(a, b) {
                    if (resultsByStation[station][a] < resultsByStation[station][b]) {
                        return 1;
                    } else if (resultsByStation[station][a] > resultsByStation[station][b]) {
                        return -1;
                    }
                    
                    return 0;
                });
                
                topStations[station] = sortedKeys.slice(0, maxEndStations);
                
                description += '<div class="results_group"><strong>From:</strong> ' + hubway.stations[station].station + '<br><ol>';
                
                topStations[station].forEach(function(station) {
                    description += "<li>" + hubway.stations[station].station + "</li>";
                });
                
                description += '</ol></div>';
            });
            
            return {'direction': topStations, 'description': description};
        }       
    }
};

// add filter buttons
function setupFilters() {

    Object.keys(queryFilters).forEach(function(group) {
        var newFilter = '<div class="filter"><div id="js_' + group + '"></div></div>';
        $("#js_filters").append(newFilter);    
    });

    Object.keys(queryFilters).forEach(function(group) {
        var filters = '';
    
        queryFilters[group].forEach(function(button) {
            var label = button['label'];
            var id = "js_" + group + "_" + label;
            var tooltip = button['tooltip'];
        
            if (tooltip) {
                filters += "<button class='btn btn-default js_" + group + "' id='" + id + "' title='" + tooltip + "'>" + label + "</button>";
            } else {
                filters += "<button class='btn btn-default js_" + group + "' id='" + id + "'>" + label + "</button>";        
            }
        });
    
        // add buttons to the DOM
        $("#js_"+group).html(filters);
        $(".btn").tooltip();
    
        // attach handlers
        queryFilters[group].forEach(function(button) {
    
            var label = button['label'];
            var id = "js_" + group + "_" + label;
            var filter = button['set'];
                
            $("#"+id).on("click", function() {
                    
                Object.keys(filter).forEach(function(a) {

                    if (filter[a] === null) {
                        selectedFilters[a] = null;
                    } else {  
                        selectedFilters[a] = {};
                        filter[a].forEach(function(unit) {
                            selectedFilters[a][unit] = true;
                        });
                    }
                });
            
                $(".js_"+group).removeClass('active');
                $(this).addClass('active');
            
                if (activeStatistic !== undefined) {
                    illustrations[activeStatistic].draw();
                }            
            });
        });
    });
}

// update filter buttons to show the current query
function refreshQueryButtons(query) {
    $(".js_query").removeClass('active');
    $("#js_"+query).addClass("active");
}


//--- BEGIN STATION display/selection functions

// add station markers
function showStations() {

    Object.keys(hubway.stations).forEach(function(station_id) {
        var row = hubway.stations[station_id];
    
        var description = row.station + ', ' + row['docksCount'] + ' bikes';        
        marker = addMarker(row.latitude, row.longitude, description, "default", defaultMarkerRadius, markerOptions.default);
        marker.setStyle(markerOptions.stationUnselected);

        marker.bindPopup(description);
        marker.on('mouseover', function (e) { this.openPopup(); });
        marker.on('mouseout', function (e) { this.closePopup(); });

        // add a reference to the original data
        hubway.stations[station_id]['marker'] = marker;                
                        
        if (selectedStations[row.station_id]) {
            selectedStations[row.station_id] = {'row': row, 'marker': marker};
            marker.setStyle(markerOptions.stationSelected);        
        }
        
        marker.on('click', function (e) { 
            if (!selectedStations[row.station_id]) {            
                selectStation(row.station_id);
            } else {
                removeStation(row.station_id);
            }
        });
        
    });
}

// select a particular station
function selectStation(stationID) {

    var marker = hubway.stations[stationID]['marker'];
                
    selectedStations[stationID] = {'row': hubway.stations[stationID], 'marker': marker};
    marker.setStyle(markerOptions.stationSelected);

    if (activeStatistic !== undefined) {
        illustrations[activeStatistic].draw();
    }
    
    displaySelectedStationsText();    
}

// remove a particular station
function removeStation(stationID) {
    
    var marker = hubway.stations[stationID]['marker'];
    marker.setStyle(markerOptions.stationUnselected);

    delete selectedStations[stationID];
    
    if (activeStatistic !== undefined) {
        illustrations[activeStatistic].draw();
    }           
    
    displaySelectedStationsText();         
}

// update text with selected stations
function displaySelectedStationsText() {

    var description = '<div class="results_title">Selected stations:</div><div class="results_group">';
    
    Object.keys(selectedStations).forEach(function(station) {
        description += hubway.stations[station].station + '<br>';
    });
    
    description += '</div>'
    
    $("#js_description").html(description);  
}

//---END STATION FUNCTIONS


//---BEGIN MAP DRAWING FUNCTIONS
function showStationStatistic(forStatistic, properties) {

	var loading = createLoadingOverlay("#map");

    setTimeout(function() {
    
        // always remove the data layer to update it
        if (activeMarkers['data']) {
            activeMarkers['data'].forEach(function(marker) {
                map.removeLayer(marker);
            });
        }

        var queryResults = illustrations[forStatistic].queryResults();
    
        properties.forEach(function(property) {

            // add a vector
            if (property === 'direction') {

                Object.keys(queryResults[property]).forEach(function(station_id) {
        
                    var startStation = hubway.stations[station_id];

                    var maxEndStations = queryResults[property][station_id].length < 5 ? 
                                            queryResults[property][station_id].length : 5;
                
                    for (var i=0; i < maxEndStations; i++) {
                        var endStationIndex = queryResults[property][station_id][i];
                        var endStation = hubway.stations[endStationIndex];
                    
                        addVector(startStation.latitude, startStation.longitude, endStation.latitude, endStation.longitude, "default");
                    };
                });
            }
        
            // add a marker
            else {

                var maxValue = illustrations[forStatistic].maxValue;
    
                Object.keys(queryResults[property]).forEach(function(station_id) {
     
                    var station = hubway.stations[station_id];
                    var markerSize = queryResults[property][station_id];
                    var description = station.station + ", " + Math.round(markerSize, 1) + " " + illustrations[forStatistic]['unit'];

                    var useRawMarkerSize = illustrations[forStatistic].useRawMarkerSize;
                    var options = illustrations[forStatistic].markerOptions;
            
                    if (!useRawMarkerSize) {
                        markerSize = maxValue ? markerSize * Math.sqrt(defaultStatisticRadius / maxValue) : 0;
                    }

                    var cluster = properties.length == 1 ? "default" : property;

                    var marker = addMarker(
                        station.latitude, station.longitude, description, 
                        cluster, markerSize, illustrations[forStatistic].markerOptions); 
        
                    marker.bindPopup(description);
                    marker.on('mouseover', function (e) { this.openPopup(); });
                    marker.on('mouseout', function (e) { this.closePopup(); });
               });
           }
       });
   
       loading.remove();
       
       // add description
       $("#js_description").html(queryResults['description']);
       
   }, 0);
}

function addMarker(latitude, longitude, description, kMeansLabel, radius, options) {
   
    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }
    
    var color = cssColors[clusters[kMeansLabel]];
    
    var markerOptions = {'stroke': options.stroke, 
                         'fillColor': color, 
                         'fillOpacity': options.fillOpacity,
                         'pane': options.pane};
    
    if (options.pane) {
        markerOptions['pane'] = options.pane;
    }

    // add the marker to the map and save a reference    
    var marker = L.circle([latitude, longitude], radius, markerOptions).addTo(map);
    
    var key = options['pane'] ? options['pane'] : "default";
    if (!activeMarkers[key]) {
        activeMarkers[key] = [marker]; 
    } else { 
        activeMarkers[key].push(marker);
    }

    return marker;
}

function addVector(startLat, startLong, endLat, endLong, kMeansLabel) {

    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }

    var polyline = [[startLat, startLong], [endLat, endLong]];
    var colorIndex = clusters[kMeansLabel];
    
    var line = L.polyline(polyline, markerOptions.vector).addTo(map);
    
    if (!activeMarkers['data']) {
        activeMarkers['data'] = [];
    }
    
    activeMarkers['data'].push(line);
}

// remove all markers from the map
function removeMarkers() {

    Object.keys(activeMarkers).forEach(function(key) {
        activeMarkers[key].forEach(function(marker) {
            map.removeLayer(marker);
        });
    });
    
    clusters = {};    
    activeMarkers = { 'default': [] };
}

// reset the map to an overview of Somerville/Cambridge/Boston
function resetMapView() {
	map.fitBounds([
		[42.33811807427539, -71.13733291625978],
		[42.376934182549896, -71.00309371948244]
	]);	
}

// add a "loading" message over the map
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
//---END MAP DRAWING FUNCTIONS

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
	
    // load data source	
	DataSource.loadData("data/trips.bin", "data/stations.json")
		.done(function() {
		
			// LOADED, READY TO GO
			hubway['stations'] = DataSource.stationsByID();
			
            // draw all station markers
            showStations();
        
            for (var index = 0; index < stationGroups.length; index++) {
        
                var label = stationGroups[index].label;    
                var id = "js_stationGroup_" + index;
                $("#js_stationList").append("<li><a id='" + id + "' class='disabled'>" + label + "</a></li>");
            
                $("#"+id).on("click", function() {
                                                
                    // unselect all selected stations
                    Object.keys(selectedStations).forEach(function(station) {
                        removeStation(station);
                    });                
    
                    var selectedItem = $(this).parent('li').index();
                    stationGroups[selectedItem]['stops'].forEach(function(stationID) {
                        selectStation(stationID);
                    });
                
                    $("#js_stations").removeClass("active");
                    $("js_stationList").prop("selectedIndex", selectedItem);
                });
            }
        
            // select default stations
            $("#js_stationGroup_0").trigger("click");
            displaySelectedStationsText();			

            // remove loading
            setTimeout(function() { 
                loading.remove(); 
            }, 0);
			
		})
		.fail(function(err) {
			// TODO: error handling
			console.log("ERROR:", err);
		});	
	
	// attach button events
	$("#js_stations").on("click", function() {
	    removeMarkers();
	    selectedStations = {};
	    showStations();
	    $(".js_query").removeClass("active");	    
	});
	
	// lay out queries
	Object.keys(illustrations).forEach(function(query) {
	    var button = '<button class="btn btn-default js_query" id="js_' + query + '">' + query + '</button>';
	    $("#js_queries").append(button);
	    $("#js_"+query).on("click", function() {
       	    refreshQueryButtons(query);	        
    	    activeStatistic = query;
	        illustrations[query].draw();
	    });
	});
	    
    // lay out filters
    setupFilters();
    
    // defaults
    $("#js_year_2016").addClass("active");
    $("#js_season_all").addClass("active");
    $("#js_week_all").addClass("active");
    $("#js_day_all").addClass("active");
    $("#js_member_all").addClass("active");
});
