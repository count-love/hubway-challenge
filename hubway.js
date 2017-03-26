// global variables
var map;
var hubway = {data: []};
var activeMarkers = {'default': []};
var selectedTime = {
    'year': {2016:true}, 
    'month': {1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true,9:true,10:true,11:true,12:true},
    'day': {0:true,1:true,2:true,3:true,4:true,5:true,6:true},
    'hour': {0:true,1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true,9:true,10:true,11:true,12:true,13:true,14:true,15:true,16:true,17:true,18:true,19:true,20:true,21:true,22:true,23:true}};
	   
var markerOptions = {
    'distance': {'stroke': false, 'fillOpacity': 0.2, 'pane': 'data'},
    'vector': { 'fillColor': 'blue', 'fillOpacity': 0.2, 'pane': 'data'},
    'stationUnselected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'blue'},
    'stationSelected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'red'},
    'data': {'stroke': false, 'fillOpacity': 0.5, 'pane': 'data'},
    'default': {'stroke': false, 'fillOpacity': 0.5}
};
	   
var defaultMarkerRadius = 100;
var defaultStatisticRadius = 2000;
var cssColors = ['blue','white','red','navy','gray','black','silver','maroon','purple','fuchsia','lime','olive','yellow','green','teal','aqua','antiquewhite','aquamarine','azure','beige','bisque','blanchedalmond','blueviolet','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','gainsboro','ghostwhite','gold','goldenrod','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','limegreen','linen','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','oldlace','olivedrab','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellowgreen'];

var activeStatistic;
var selectedStations = {};
var clusters = {};

var availableTimes = {
    'year': [2016, 2015, 2014, 2013, 2012, 2011],
    'month': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    'day': [1, 2, 3, 4, 5, 6, 7],
    'hour': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
};

var timeSets = {
    'early': {'hour': [2, 3, 4, 5]},
    'morning': {'hour': [6, 7, 8, 9,]},
    'midday': {'hour': [10, 11, 12, 13]},
    'afternoon': {'hour': [14, 15, 16]},
    'evening': {'hour': [17, 18, 19, 20]},
    'night': {'hour': [21, 22, 23, 0, 1]},
    'weekday': {'day': [0, 1, 2, 3, 4]},
    'weekend': {'day': [5, 6]},
    'spring': {'month': [3, 4, 5]},
    'summer': {'month': [6, 7, 8]},
    'fall': {'month': [9, 10, 11]},
    'winter': {'month': [12, 1, 2]}
};

var illustrations = {

    'direction': {
	    unit: 'meters',
	    maxValue: 1,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.vector,
  	    draw: debounce(function() {
      	        showStationStatistic('direction', ['direction']);
           	    $("#js_description").html("Top 5 end stations from selected start stations");
  	        }, 100),

  	    queryResults: function() { 

            var results = DataSource.query(
                { 
                    startYear: Object.keys(selectedTime['year']),
                    startMonth: Object.keys(selectedTime['month']),
                    startWeekday: Object.keys(selectedTime['day']),
                    startHour: Object.keys(selectedTime['hour']),
                    stationStart: Object.keys(selectedStations),
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
                
                topStations[station] = sortedKeys;
            });
            
            return {'direction': topStations};
        }       
    },

	'distance': {
	    unit: 'meters',
	    maxValue: 3000,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
  	    draw: debounce(function() {
      	        showStationStatistic('distance', ['min', 'mean', 'max']);
  	        }, 100),

  	    queryResults: function() { 

            var min = DataSource.query(
                { 
                    startYear: Object.keys(selectedTime['year']),
                    startMonth: Object.keys(selectedTime['month']),
                    startWeekday: Object.keys(selectedTime['day']),
                    startHour: Object.keys(selectedTime['hour']),
                    stationStart: Object.keys(selectedStations)
                },
                "stationStart", "distance", "min"
            ); 
              	        
            var mean = DataSource.query(
                { 
                    startYear: Object.keys(selectedTime['year']),
                    startMonth: Object.keys(selectedTime['month']),
                    startWeekday: Object.keys(selectedTime['day']),
                    startHour: Object.keys(selectedTime['hour']),
                    stationStart: Object.keys(selectedStations)
                },
                "stationStart", "distance", "mean"
            );

            var max = DataSource.query(
                { 
                    startYear: Object.keys(selectedTime['year']),
                    startMonth: Object.keys(selectedTime['month']),
                    startWeekday: Object.keys(selectedTime['day']),
                    startHour: Object.keys(selectedTime['hour']),
                    stationStart: Object.keys(selectedStations)
                },
                "stationStart", "distance", "max"
            );
            
            return {'min': min, 'mean': mean, 'max': max};
        }	
	},
	    
	'meanDuration': {
	    unit: 'minutes',
	    maxValue: 60,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
  	    draw: debounce(function() {
      	        showStationStatistic('meanDuration', ['meanDuration']);
  	        }, 100),

  	    queryResults: function() { 

  	        var results = DataSource.query(
  	            // which results to include, can be null for all or a hash where keys are field 
  	            // names and values are either a single value or an array of values
  	            // valid fields: duration, gender, member, startMinute, startYear, startMonth, startWeekday, startHour, stationEnd, stationStart
                { 
                    startYear: Object.keys(selectedTime['year']),
                    startMonth: Object.keys(selectedTime['month']),
                    startWeekday: Object.keys(selectedTime['day']),
                    startHour: Object.keys(selectedTime['hour'])
                },
                "stationStart", // what to group by (can be any field name), or null for no grouping
                "duration",     // what to aggregate (can be any field name), or null to count results
                "mean"          // how to aggregate (can be sum, min, max or mean)
            ); 
            
            return {'meanDuration': results};
        }
	},
	
	'numberOfTrips': {
	    unit: 'trips/day',
	    maxValue: 200,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
  	    draw: debounce(function() {
      	        showStationStatistic('numberOfTrips', ['numberOfTrips']);
  	        }, 100),

  	    queryResults: function() { 

  	        var results = DataSource.query(
                { 
                    startYear: Object.keys(selectedTime['year']),
                    startMonth: Object.keys(selectedTime['month']),
                    startWeekday: Object.keys(selectedTime['day']),
                    startHour: Object.keys(selectedTime['hour'])
                },
                "stationStart", null, "sum"
            );

            // just an approximation... (# months)*(4 weeks/month)*(days/week)
            var totalNumberOfDays = Object.keys(selectedTime['month']).length * 4 *
               Object.keys(selectedTime['day']).length;
            
            Object.keys(results).forEach(function(station) {
                results[station] /= totalNumberOfDays;
            });
            
            return {'numberOfTrips': results};
        }
	},
};

function debounce(func, threshold, execAsap) {
    var timeout;
    
    return function debounced() {
        var obj = this, args = arguments;
        
        function delayed() {
            if (!execAsap) { func.apply(obj, args); }
            timeout = null;
        }
        
        if (timeout) {  
            clearTimeout(timeout);
        } else if (execAsap) {
            func.apply(obj, args);
        }
        
        timeout = setTimeout(delayed, threshold || 100);
    };
}

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
    
    if (options.pane) {
        if (!activeMarkers[options.pane]) { 
            activeMarkers[options.pane] = [marker]; 
        } else { 
            activeMarkers[options.pane].push(marker); 
        }
        
    } else {
        activeMarkers['default'].push(marker);
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

function removeMarkers() {

    Object.keys(activeMarkers).forEach(function(key) {
        activeMarkers[key].forEach(function(marker) {
            map.removeLayer(marker);
        });
    });
    
    clusters = {};    
    activeMarkers = { 'default': [] };
}

// add station markers
function showStations() {

    var randomlySeed = !Object.keys(selectedStations).length;

    Object.keys(hubway.stations).forEach(function(station_id) {
        var row = hubway.stations[station_id];
    
        var description = row.station + ', ' + row['docksCount'] + ' bikes';        
        marker = addMarker(row.latitude, row.longitude, description, "default", defaultMarkerRadius, markerOptions.default);
        marker.setStyle(markerOptions.stationUnselected);

        marker.bindPopup(description);
        marker.on('mouseover', function (e) { this.openPopup(); });
        marker.on('mouseout', function (e) { this.closePopup(); });
        
        if (selectedStations[row.station_id] || (Math.random() < 0.02 && randomlySeed)) {
            selectedStations[row.station_id] = {'row': row, 'marker': marker};
            marker.setStyle(markerOptions.stationSelected);        
        }
        
        marker.on('click', function (e) { 
            if (!selectedStations[row.station_id]) {
                selectedStations[row.station_id] = {'row': row, 'marker': this};
                this.setStyle(markerOptions.stationSelected);
                
                if (activeStatistic !== undefined) {
                    illustrations[activeStatistic].draw();
                }
                
            } else {
                delete selectedStations[row.station_id];
                this.setStyle(markerOptions.stationUnselected);
                
                if (activeStatistic !== undefined) {
                    illustrations[activeStatistic].draw();
                }                
            }
        });
        
    });
}

function showStationStatistic(forStatistic, properties) {

	loading = createLoadingOverlay("#map");

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
   }, 0);
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

// add time-related checkboxes
function setupTimeFilter(group) {

    var filters = group + ": ";

    availableTimes[group].forEach(function(time) {
        var id = "js_" + group + "_" + time;
        filters += "<label><input type='checkbox' id='" + id + "'>" + time + "</label>";
    });
    
    // add checkboxes to the DOM
    $("#js_"+group).html(filters);
    
    // attach handlers
    availableTimes[group].forEach(function(time) {
        var checkbox = "#js_" + group + "_" + time;
        
        $(checkbox).on("change", function() {
            if ($(this).prop('checked')) {
                selectedTime[group][time] = true;
            } else {
                delete selectedTime[group][time];
            }  
            
            if (activeStatistic !== undefined) {
                illustrations[activeStatistic].draw();
            }            
        });

        if (time == '2016') { $(checkbox).prop('checked', true); };
    });
}

function refreshDataFilter(activeFilter) {
    
    var filters = ['trips', 'duration', 'distance', 'direction'];

    filters.forEach(function(filter) {
        
        if (activeFilter === filter) {
            $('#js_'+filter).addClass('active');
        } else {
            $('#js_'+filter).removeClass('active');        
        }
    });
}

function refreshTimeFilter(set) {
    
    var enabled = 1;
    
    Object.keys(timeSets[set]).forEach(function(group) {
        timeSets[set][group].forEach(function(time) {
            enabled = enabled && selectedTime[group][time];
        });
    });
        
    var buttonID = "#js_" + set;
    
    if (enabled) {
        $(buttonID).addClass('active');
    } else {
        $(buttonID).removeClass('active');
    }
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
        console.log("Unable to load data.json");
	});
	
	DataSource.loadData("data/trips.bin", "data/stations.json")
		.done(function() {
			// LOADED, READY TO GO
		})
		.fail(function(err) {
			// TODO: error handling
			console.log("ERROR:", err);
		});	
	
	// button events
	$("#js_stations").on("click", function() {
	    removeMarkers();
	    showStations();
	});
	
	$("#js_direction").on("click", function() {
	    removeMarkers();
	    showStations();
	    activeStatistic = 'direction';
	    illustrations[activeStatistic].draw();
	    refreshDataFilter('direction');
	});
	
	$("#js_duration").on("click", function() {
	    removeMarkers();
	    activeStatistic = 'meanDuration';
	    illustrations[activeStatistic].draw();
  	    refreshDataFilter('duration');
    });

	$("#js_trips").on("click", function() {
	    removeMarkers();
	    activeStatistic = 'numberOfTrips';
	    illustrations[activeStatistic].draw();
  	    refreshDataFilter('trips');	    
	});	

	$("#js_distance").on("click", function() {
	    if (!activeStatistic || activeStatistic !== 'distance') {
	        removeMarkers();
	        showStations();
      	    refreshDataFilter('distance');
	    }
	    
	    activeStatistic = 'distance';
	    illustrations[activeStatistic].draw();	    
	});
    
    // lay out checkboxes for year selection
    setupTimeFilter('year');
    
    // attach button events to time sets, like "morning" and "summer"
    Object.keys(timeSets).forEach(function(set) {
        var button = "#js_" + set;
        
        $(button).on("click", function(e) {
            
            // toggle the button state
            var enabled = $(this).hasClass('active');
            
            // toggle the appropriate time filter button and checkboxes
            if (!enabled) {
                $(button).addClass('active');
                
                Object.keys(timeSets[set]).forEach(function(group) {
                    timeSets[set][group].forEach(function(unit) {
                        selectedTime[group][unit] = true;
                    }); 
                });
                
            } else {
                $(button).removeClass('active');

                Object.keys(timeSets[set]).forEach(function(group) {
                    timeSets[set][group].forEach(function(unit) {
                        delete selectedTime[group][unit];
                    });
                });
            }
            
            if (activeStatistic !== undefined) {
                illustrations[activeStatistic].draw();
            }
        });
        
        refreshTimeFilter(set);
    });
});
