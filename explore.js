(function($) {
//---CONSTANTS
// when the map zoom level is less than MIN_ZOOM_DEFAULT_MARKER, enforce a minimum marker size
var MIN_ZOOM_DEFAULT_MARKER = 13;

//---GLOBALS
var map;
var Hubway = {};
var activeMarkers = {};
var activeStatistic;
var clusters = {};
var cachedDataSource;
var cacheKey = '';
var illustrationCache = {};
var reset = false;
var selectAllStations = false;
var kMeansNumberOfClusters = 0;

// store the active set of selected filters;
// by default, we start with the filters specified below (and a few default stations after the map loads)
var selectedFilters = {
    'startYear': {}, 
    'startMonth': {},
    'startWeekday': {},
    'startHour': {},
    'stationStart': {},
    'member': {},
    'gender': {} 
};
   
var markerOptions = {
    'distance': {'stroke': false, 'fillOpacity': 0.15, 'pane': 'data'},
    'vector': { 'stroke': 'blue', 'fillColor': 'none', 'fillOpacity': 0.2, 'pane': 'data'},
    'data': {'stroke': false, 'fillOpacity': 0.5, 'pane': 'data'},
    'default': {'stroke': false, 'fillOpacity': 0.5},
    
    // these two are only used to show bike stations, so colors are hard-coded
    'stationUnselected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'blue'},
    'stationSelected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'red'},    
};

// The number of stations to show text results for
var maxStations = 5;

// user-set marker scale
var markerZoom = 10;
var defaultMarkerRadius = 7.5;

var cssColors = ['navy','blue','green','blueviolet','aquamarine','maroon','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','gainsboro','ghostwhite','gold','goldenrod','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','limegreen','linen','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','oldlace','olivedrab','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellowgreen'];
// 'purple','fuchsia','gray','white','beige','olive','yellow','black','silver','red','azure','lime','antiquewhite','beige','bisque','blanchedalmond''teal','aqua',

// available filter options for queries
var queryFilters = {
    'day': [
        {'label': 'all', 'set': {'startHour': null}},
        {'label': 'early', 'tooltip': '2:00AM-5:00AM', 'set': {'startHour': [2, 3, 4, 5]}},
        {'label': 'morning', 'tooltip': '6:00AM-10:00AM', 'set': {'startHour': [6, 7, 8, 9]}},
        {'label': 'midday', 'tooltip': '10:00AM-2:00PM', 'set': {'startHour': [10, 11, 12, 13]}},
        {'label': 'afternoon', 'tooltip': '2:00PM-5:00PM', 'set': {'startHour': [14, 15, 16]}},
        {'label': 'evening', 'tooltip': '5:00PM-9:00PM', 'set': {'startHour': [17, 18, 19, 20]}},
        {'label': 'night', 'tooltip': '9:00PM-2:00AM', 'set': {'startHour': [21, 22, 23, 0, 1]}},
    ],
    
    'week': [
        {'label': 'all', 'set': {'startWeekday': null}},
        {'label': 'weekday', 'tooltip': 'Monday-Friday', 'set': {'startWeekday': [0, 1, 2, 3, 4]}},
        {'label': 'weekend', 'tooltip': 'Saturday, Sunday', 'set': {'startWeekday': [5, 6]}}
    ],
    
    'season': [
        {'label': 'all', 'set': {'startMonth': null}},
        {'label': 'spring', 'tooltip': 'March, April, May', 'set': {'startMonth': [3, 4, 5]}},
        {'label': 'summer', 'tooltip': 'June, July, August', 'set': {'startMonth': [6, 7, 8]}},
        {'label': 'fall', 'tooltip': 'September, October, November', 'set': {'startMonth': [9, 10, 11]}},
        {'label': 'winter', 'tooltip': 'December, January, February', 'set': {'startMonth': [12, 1, 2]}}
    ],
    
    'year': [
        {'label': 'all', 'set': {'startYear': null}},
        {'label': '2016', 'set': {'startYear': [2016]}},
        {'label': '2015', 'set': {'startYear': [2015]}},
        {'label': '2014', 'set': {'startYear': [2014]}},
        {'label': '2013', 'set': {'startYear': [2013]}},
        {'label': '2012', 'set': {'startYear': [2012]}},
        {'label': '2011', 'set': {'startYear': [2011]}}
    ],
    
    'member': [
        {'label': 'all', 'set': {'member': null}},
        {'label': 'member', 'tooltip': 'Member', 'set': {'member': [1]}},
        {'label': 'casual', 'tooltip': 'Non-member', 'set': {'member': [0]}},
    ],
    
    'gender': [
        {'label': 'all', 'set': {'gender': null}},
        {'label': 'unspecified', 'set': {'gender': [0]}},
        {'label': 'female', 'set': {'gender': [1]}},
        {'label': 'male', 'set': {'gender': [2]}},                
    ]
};

var stationGroups = [
    {'label': 'Coffee, Coffee', stops: [147, 184, 106, 62]},
    {'label': 'Harvard', stops: [6, 7, 15, 131, 145, 146, 147, 148, 150, 151, 153, 154, 166, 192]},
    {'label': 'MIT', stops: [135, 136, 137, 138, 165, 169, 170]},
    {'label': 'Central Square', stops: [29, 142, 143]},
    {'label': 'Boston', stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 191, 192, 193, 194, 196, 197]},
    {'label': 'Brookline', stops: [129, 130, 131, 132, 188, 190]},
    {'label': 'Cambridge', stops: [133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175]},
    {'label': 'Somerville', stops: [176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 189, 195]}    
];

var kMeansGroups = [0, 3, 5, 7, 10];

//--- kMeans clustering code, inspired by
// https://burakkanber.com/blog/machine-learning-k-means-clustering-in-javascript-part-1/
var kMeans = {

    // global variables
    maxIterations: 100,
    dataExtremes: [],
    dataRanges: [],

    // given an array of multidimensional arrays, return the range for each dimension
    updateDataRangesAndExtremes: function(data) {

        this.ranges = [];
        this.extremes = [];
        
        for (var dimension in data[0]) {        
            var values = data.map(function(x) { return x[dimension]; });
            var min = Math.min.apply(Math, values);
            var max = Math.max.apply(Math, values);
            
            this.dataRanges[dimension] = max - min;
            this.dataExtremes[dimension] = {'min': min, 'max': max};
        }
    },
    
    // generate initial means
    generateInitialMeans: function(numberOfClusters) {
       
        var means = [];
                
        for (var k = 0; k < numberOfClusters; k++) {
            means[k] = [];
            
            for (var dimension in this.dataExtremes) {
                means[k][dimension] = 
                    this.dataExtremes[dimension]['min'] + 
                    (Math.random() * this.dataRanges[dimension]);
            }
        }

        return means;
    },
    
    // assign every data point to a mean
    makeAssignments: function(data, means) {

        var assignments = [];
        
        for (var i in data) {

            var point = data[i];
            var distances = [];

            for (var j in means) {
                var mean = means[j];
                var sum = 0;

                for (var dimension in point) {
                    if (isNaN(point[dimension])) {
                        continue;
                    }
                    var difference = point[dimension] - mean[dimension];
                    difference *= difference;
                    sum += difference;
                }

                distances[j] = sum;
                // distances[j] = Math.sqrt(sum);
            }

            assignments[i] = distances.indexOf(Math.min.apply(Math, distances));
        }

        return assignments;
    },
    
    // modify means based on assignments
    moveMeans: function(data, means, assignments) {

        var sums = Array(means.length);
        var counts = Array(means.length);
        var moved = false;

        for (var j in means) {
            counts[j] = 0;
            sums[j] = Array(means[j].length);
            
            for (var dimension in means[j]) {
                sums[j][dimension] = 0;
            }
        }

        // calculate the sum of every point for every dimension per mean
        for (var point_index in assignments)
        {
            var mean_index = assignments[point_index];
            var point = data[point_index];
            var mean = means[mean_index];

            counts[mean_index]++;

            for (var dimension in mean) {
                sums[mean_index][dimension] += point[dimension];
            }
        }

        for (var mean_index in sums) {

            // if a mean has no points, move it randomly       
            if (counts[mean_index] === 0) {
                sums[mean_index] = means[mean_index];

                for (var dimension in this.dataExtremes) {
                    sums[mean_index][dimension] = 
                        this.dataExtremes[dimension]['min'] + 
                        (Math.random() * this.dataRanges[dimension]);
                }
                
                continue;
            }

            // otherwise, recenter the mean based on the points assigned to it
            for (var dimension in sums[mean_index]) {
                sums[mean_index][dimension] /= counts[mean_index];
            }
        }

        // compare the new to old means and flag if different
        if (means.toString() !== sums.toString()) {
            moved = true;
            means = sums;
        }

        return {'means': means, 'completed': !moved};
    },
    
    getSolutionKey: function(assignments) {

        var clusters = {};
        var key = [];
        
        for (var stationIndex in assignments) {
            var assignedCluster = assignments[stationIndex];
            
            if (clusters[assignedCluster] === undefined) {
                clusters[assignedCluster] = Object.keys(clusters).length;
            }
            
            key[stationIndex] = clusters[assignedCluster];
        }
        
        return key.toString();
    },
    
    run: function(data, numberOfClusters) {

        var solutionSets = {};

        this.updateDataRangesAndExtremes(data);
        
        for (var solutionsCounter = 0; solutionsCounter < 20; solutionsCounter++) {
        
            // generate random centroids and initial assignments
            var means = this.generateInitialMeans(numberOfClusters);
                        
            var assignments = this.makeAssignments(data, means);
        
            // iteratively cluster
            for (var loopCounter = 0; loopCounter < this.maxIterations; loopCounter++) {

                // calculate new means
                var results = this.moveMeans(data, means, assignments);
                means = results['means'];

                // if the old and new mean were the same, then we finished
                if (results['completed']) { 
                               
                    // get unique key for this grouping
                    var key = this.getSolutionKey(assignments);
                
                    // save this solution
                    if (!solutionSets[key]) {
                        solutionSets[key] = {'assignments': assignments, 'means': means, 'count': 1};
                    } else {
                        solutionSets[key]['count']++;
                    }

                    break;
                         
                // if we didn't converge, update cluster assignments and then retry    
                } else {
                    assignments = this.makeAssignments(data, means);
                }
            }
        }   
     
        // return the most popular solutions
        var bestKey;
        Object.keys(solutionSets).forEach(function(key) {
            if (bestKey === undefined || solutionSets[bestKey]['count'] < solutionSets[key]['count']) {
                bestKey = key;
            }
        });

        return solutionSets[bestKey];
    }
};

// generate key for query cache
function getFilterCacheKey(options) {
        
    var key = '';
        
    options.forEach(function(filter) {
        key += filter;

        if (selectedFilters[filter] == null) { 
            return; 

        } else {
            Object.keys(selectedFilters[filter]).forEach(function(unit) {
                key += unit;
            });
        }
    });
  
    return key;
}

// create a hash of filters to use to run a DataSource query
// valid fields: duration, gender, member, startMinute, startYear, startMonth, startWeekday, startHour, stationEnd, stationStart
function updateCache(options) {

    var key = getFilterCacheKey(options);
    
    if (key != cacheKey) {
        cachedDataSource = DataSource.cacheFilter(getFilterOptions(options));    
        cacheKey = key;
    }
}

function getFilterOptions(options) {

    var filter = {};
    
    options.forEach(function(column) {
        if (column == 'stationStart' || column == 'stationEnd') {
            if (Object.keys(Hubway.stations).length == Object.keys(selectedFilters.stationStart).length) {
                filter[column] = null;
            } else {
                filter[column] = Object.keys(selectedFilters[column]);
            }
        }
        filter[column] = selectedFilters[column] == null ? null : Object.keys(selectedFilters[column]);
    });

    return filter;
}

// available queries to run/draw
var illustrations = {

	'starts': {
	    group: 'trips',
	    unit: ' trips/day',
	    unitRounding: 0,
	    markerScale: 50,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,
  	    draw: function() {
    	    removeMarkers();
        	showStationStatistic('starts', ['trips']);
        },

  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);
  	        var results = DataSource.query(cachedDataSource, "stationStart", null, "sum");

            // just an approximation... 
            // 1. get the number of days of the week
            // 2. multiply by the number of weeks in a month, and then the number of months (either all, or 4 for a season)
            var totalNumberOfDays = (selectedFilters['day'] == null ? 7 : selectedFilters['startWeekday'].length);
            totalNumberOfDays = totalNumberOfDays * 4 * (selectedFilters['startMonth'] == null ? 12 : 4);
                 
            Object.keys(results).forEach(function(station) {
                results[station] /= totalNumberOfDays;
            });
                        
            var description = '<div class="results_title">Average trips/day started from each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the most trips:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the fewest trips:');

            return {'trips': results, 'description': description};
        }
	},
	
	'stops': {
	    group: 'trips',
	    unit: 'trips/day',
	    unitRounding: 0,
	    markerScale: 50,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,	    
  	    draw: function() {
    	    removeMarkers();
  	        showStationStatistic('stops', ['trips']);
        },

  	    queryResults: function() { 
            
            // save the current set of filters            
            var selectedFiltersMainQuery = $.extend(true, {}, selectedFilters);
            selectedFilters['stationEnd'] = $.extend(true, {}, selectedFilters['stationStart']);
            selectedFilters['stationStart'] = {};

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationEnd', 'member', 'gender']);
            var results = DataSource.query(cachedDataSource, "stationEnd", null, "sum");
            
            // restore the original filter
            selectedFilters = $.extend(true, {}, selectedFiltersMainQuery);

            // just an approximation... 
            // 1. get the number of days of the week
            // 2. multiply by the number of weeks in a month, and then the number of months (either all, or 4 for a season)
            var totalNumberOfDays = (selectedFilters['day'] == null ? 7 : selectedFilters['startWeekday'].length);
            totalNumberOfDays = totalNumberOfDays * 4 * (selectedFilters['startMonth'] == null ? 12 : 4);
                        
            Object.keys(results).forEach(function(station) {
                results[station] /= totalNumberOfDays;
            });
                        
            var description = '<div class="results_title">Number of trips ending at each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the most trips:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the fewest trips:');

            return {'trips': results, 'description': description};            
        }
	},
	    
	'duration': {
	    group: 'trips',
	    unit: 'minutes',
	    unitRounding: 1,
	    markerScale: 1,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,	    
  	    draw: function() {
    	    removeMarkers();
    	    showStationStatistic('duration', ['duration']);
      	},
      	
  	    queryResults: function() { 

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);
            
  	        var results = DataSource.query(
                cachedDataSource,
                "stationStart", // what to group by (can be any field name), or null for no grouping
                "duration",     // what to aggregate (can be any field name), or null to count results
                "mean"          // how to aggregate (can be sum, min, max or mean)
            );
            
            var description = '<div class="results_title">Average duration of trips started at each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the longest average trip:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the shortest average trip:');

            return {'duration': results, 'description': description};
        }
	},
	
	'utilization': {
	    group: 'trips',
	    unit: 'trips/dock-hour',
	    unitRounding: 3,
	    markerScale: 0.001,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,	    
  	    draw: function() {
  	        removeMarkers();
            showStationStatistic('utilization', ['utilization']);
      	},
      	
  	    queryResults: function() { 

            // save the current set of filters
            var selectedFiltersMainQuery = $.extend(true, {}, selectedFilters);

            var results = {};
            
            //---PEAK START+STOP CALCULATION
            // determine the peak hourly usage ever observed for each station
            // widen the filter to select all months, days, and hours for the current year
            selectedFilters['startMonth'] = null;
            selectedFilters['startWeekday'] = null;
            selectedFilters['startHour'] = null;
        
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour']);
        
            var utilization = DataSource.query(
                cachedDataSource,
                null,                                       // group by
                function(trip) { return trip; },            // what to aggregate (can be any field name), or null to count results
                {
                    ingest: function(v, trip) {
                        if (!v) {
                            v = {};
                        }

                        var startStation = DataSource.FIELDS.stationStart(trip);
                        var endStation = DataSource.FIELDS.stationEnd(trip);
                        
                        // time key: year+month+weekday+hour
                        var key = trip >> 16 & 0x7FFF;

                        if (startStation in v) {
                            v[startStation][key] = 1 + (v[startStation][key] || 0);
                        } else {
                            v[startStation] = {key: 1};
                        }

                        if (endStation in v) {
                            v[endStation][key] = 1 + (v[endStation][key] || 0);
                        } else {
                            v[endStation] = {key: 1};
                        }
                        
                        return v;
                    },
                    
                    finalize: function(v) {
                    
                        var result = {};
                                    
                        Object.keys(v).forEach(function(station) {

                            if (selectedFiltersMainQuery['stationStart'] == null || selectedFiltersMainQuery['stationStart'][station]) {
    
                                result[station] = {'max': -Infinity, 'matchedCounts': []};

                                Object.keys(v[station]).forEach(function(time) {

                                    // add these counts if they match the main query
                                    var trip = time << 16;

                                    var startYear = selectedFiltersMainQuery['startYear'] == null ? 
                                        true : selectedFiltersMainQuery['startYear'][DataSource.FIELDS.startYear(trip)];

                                    var startMonth = selectedFiltersMainQuery['startMonth'] == null ?
                                        true : selectedFiltersMainQuery['startMonth'][DataSource.FIELDS.startMonth(trip)];
                                                 
                                    var startWeekday = selectedFiltersMainQuery['startWeekday'] == null ?
                                        true : selectedFiltersMainQuery['startWeekday'][DataSource.FIELDS.startWeekday(trip)];

                                    var startHour = DataSource.FIELDS.startHour(trip);
                                    var startHourSelected = selectedFiltersMainQuery['startHour'] == null ?
                                        true : selectedFiltersMainQuery['startHour'][startHour];

                                    // update the peak start+stop trips observed
                                    result[station]['max'] = Math.max(result[station]['max'], v[station][time]);
                            
                                    // update the start+stop trips that match the current query filters
                                    if (startYear && startMonth && startWeekday && startHourSelected) {
                                        if (!result[station]['matchedCounts'][startHour]) {
                                            result[station]['matchedCounts'][startHour] = v[station][time];
                                        } else {
                                            result[station]['matchedCounts'][startHour] += v[station][time];
                                        }
                                    }                                    
                                
                                });
                            }
                        });
                                            
                        return result;
                    }
                }
            );

            // restore single-station filter
            selectedFilters = selectedFiltersMainQuery;

            // calculate utilization
            var numberOfYears = selectedFilters['startYear'] == null ? Object.keys(queryFilters['year']).length-1 : Object.keys(selectedFilters['startYear']).length;

            var numberOfDays = selectedFilters['startWeekday'] == null ? 7 : Object.keys(selectedFilters['startWeekday']).length;           
            numberOfDays = selectedFilters['startMonth'] == null ? numberOfDays * 52 : numberOfDays * (52 / 4);
            
            var numberOfHours = selectedFilters['startHour'] == null ? 24 : Object.keys(selectedFilters['startHour']).length;
            
            var results = {'averages': {}};
            Object.keys(utilization).forEach(function(station) {
               
                results['averages'][station] = 0;

                utilization[station]['matchedCounts'].forEach(function(hourlyCount) {
                    results['averages'][station] += hourlyCount;
                });
                
                results['averages'][station] = Hubway.stations[station]['docks'] ? 
                    results['averages'][station] / (Hubway.stations[station]['docks'] * numberOfYears * numberOfDays * numberOfHours) : 0;                
            });
              
            var description = '<div class="results_title">Capacity utilization</div>';
            description += printTopStations(results['averages'], true, maxStations, true, '(utilization estimated as a percentage of the peak observed hourly number of start+stops)');
                    
            return {'utilization': results['averages'], 'description': description};
        }
	},
	
    'popular-routes': {
        group: 'trips',
        buttonName: 'popular routes',
	    unit: 'trips',
	    unitRounding: 0,
	    markerScale: 1,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.vector,
	    clusteringEnabled: false,	    
  	    draw: function() {
                removeMarkers();
            	showStations();
          	    showStationStatistic('popular-routes', ['direction']);
        },

  	    queryResults: function() {

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var results = DataSource.query(
                cachedDataSource,
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
            
            var description = '<div class="results_title">Most frequent stops from selected start stations</div>';
   	                
            Object.keys(resultsByStation).forEach(function(station) {
                
                var sortedKeys = sortStations(resultsByStation[station], true);
                
                topStations[station] = sortedKeys.slice(0, maxStations);
                
                var from = '<strong>From:</strong> ' + Hubway.stations[station]['name'];
                description += printTopStations(resultsByStation[station], true, maxStations, true, from);

            });
            
            return {'direction': topStations, 'description': description};
        }       
    },	

	'distance-all': {
	    group: 'distance',
	    unit: 'meters',
	    unitRounding: 0,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
	    clusteringEnabled: false,	    
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-all', ['min', 'mean', 'max']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var min = DataSource.query(cachedDataSource, "stationStart", "distance", "min");
            var mean = DataSource.query(cachedDataSource, "stationStart", "distance", "mean");
            var max = DataSource.query(cachedDataSource, "stationStart", "distance", "max");
            
            var description = '<div class="results_title">Min/Mean/Max Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (min[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": " + 
                            Math.round(min[station], 0) + "/" + 
                            Math.round(mean[station], 0) + "/" + 
                            Math.round(max[station], 0) + " " + illustrations['distance-all']['unit'] + '</div>';
                }
            });
                        
            return {'min': min, 'mean': mean, 'max': max, 'description': description};
        }	
	},

	'distance-min': {
	    group: 'distance',	
	    unit: 'meters',
	    unitRounding: 0,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
	    clusteringEnabled: true,	    
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-min', ['min']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var min = DataSource.query(cachedDataSource, "stationStart", "distance", "min");
            
            var description = '<div class="results_title">Minimum Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (min[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": " + 
                            Math.round(min[station], 0) + " " + illustrations['distance-all']['unit'] + '</div>';
                }
            });
            
            return {'min': min, 'description': description};
        }	
	},

	'distance-mean': {
	    group: 'distance',	
	    unit: 'meters',
	    unitRounding: 0,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
	    clusteringEnabled: true,	    
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-mean', ['mean']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var mean = DataSource.query(cachedDataSource, "stationStart", "distance", "mean");
            
            var description = '<div class="results_title">Mean Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (mean[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": " + 
                            Math.round(mean[station], 0) + " " + illustrations['distance-all']['unit'] + '</div>';
                }
            });
                
            return {'mean': mean, 'description': description};
        }	
	},

	'distance-max': {
        group: 'distance',
	    unit: 'meters',
	    unitRounding: 0,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
	    clusteringEnabled: true,	    
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-max', ['max']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var max = DataSource.query(cachedDataSource, "stationStart", "distance", "max");
            
            var description = '<div class="results_title">Max Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (max[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": " + 
                            Math.round(max[station], 0) + " " + illustrations['distance-all']['unit'] + '</div>';
                }
            });
            
            var kMeansResults = getClusters(max, kMeansNumberOfClusters);
            
            return {'max': max, 'description': description,
                    'clusters': kMeansResults['clusters'], 'clusterMeans': kMeansResults['means']};
            
        }	
	}
};

// cluster results with the following format: [{station: number}]
// returns a hash of cluster assignments by station and the corresponding centroid values
function getClusters(results, numberOfClusters) {            
            
    var stationsAsArray = Object.keys(results).map(function(station) { return station; });
    var kMeansInput = stationsAsArray.map(function(station) { return [results[station]]; });
    var kMeansResult = kMeans.run(kMeansInput, numberOfClusters);
    
    var clusters = {};
    for (var index in stationsAsArray) {
        var id = stationsAsArray[index];
        clusters[id] = kMeansResult['assignments'][index];
    }
    
    return {'clusters': clusters, 'means': kMeansResult['means']};
}

// takes a hash of type {id: result} and returns a sorted list of station IDs
// by default, this will return a descending list (from most to least)
function sortStations(resultsByStation, descending) {

    var keys = Object.keys(resultsByStation);
    
    var sortedKeys = keys.sort(function(a, b) {
        if (resultsByStation[a] < resultsByStation[b]) {
            return descending ? 1 : -1;
        } else if (resultsByStation[a] > resultsByStation[b]) {
            return descending ? -1 : 1;
        }
        return 0;
    });
    
    return sortedKeys;
}

// print top results
function printTopStations(resultsByStation, sortByDescending, max, printCounts, title) {

    var sortedKeys = sortStations(resultsByStation, sortByDescending);
    sortedKeys = sortedKeys.slice(0, max);

    var description = '<div class="results_group">' + title + '<br><ol>';

    sortedKeys.forEach(function(station) {
        description += "<li>" + Hubway.stations[station]['name'];
        
        if (printCounts) {
            var scale = Math.pow(10, illustrations[activeStatistic]['unitRounding']);
            
            description += ", " + 
                Math.round(resultsByStation[station] * scale) / scale + 
                " " + illustrations[activeStatistic]['unit'];
        }
        
        description += "</li>";
    });

    description += '</ol></div>';
    
    return description;
}



// add filter buttons
function setupFilters(defaults) {

    Object.keys(queryFilters).forEach(function(group) {
        var newFilter = '<div class="filter"><div class="btn-group" id="js_' + group + '"></div></div>';
        $("#js_filters").append(newFilter);
    });

    Object.keys(queryFilters).forEach(function(group) {
        var filters = '';
    
        queryFilters[group].forEach(function(button) {
            var label = button['label'];
            var id = "js_" + group + "_" + label;
            var tooltip = button['tooltip'];
        
            if (tooltip) {
                filters += "<button class='btn btn-default btn-sm js_" + group + "' id='" + id + "' title='" + tooltip + "'>" + label + "</button>";
            } else {
                filters += "<button class='btn btn-default btn-sm js_" + group + "' id='" + id + "'>" + label + "</button>";
            }            
        });
    
        // add buttons to the DOM
        $("#js_"+group).html(filters);
        $(".btn").tooltip({container: "#js_filters"});
    
        // attach event handlers
        queryFilters[group].forEach(function(button) {
    
            var label = button['label'];
            var id = "js_" + group + "_" + label;
            var filter = button['set'];

            $("#"+id).on("click", function() {
                    
                Object.keys(filter).forEach(function(a) {
                    if (filter[a] == null) {
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
            
                redraw();
            });
            
            // make button active if it is the default
            // and add its filter
            if (id in defaults) {
                $("#"+id).addClass("active");
                $("#"+id).trigger("click");
            }
                        
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

    Object.keys(Hubway.stations).forEach(function(id) {
    
        var row = Hubway.stations[id];
        
        var description = '['+ id + '] ' + row.name + ', ' + row['docks'] + ' bikes';        
        marker = addMarker(row.latitude, row.longitude, description, "default", 10 * defaultMarkerRadius, markerOptions.default);
        marker.setStyle(markerOptions.stationUnselected);

        marker.bindPopup(description);
        marker.on('mouseover', function (e) { this.openPopup(); });
        marker.on('mouseout', function (e) { this.closePopup(); });

        // add a reference to the original data
        Hubway.stations[id]['marker'] = marker;                
                        
        if (selectedFilters['stationStart'][row.id]) {
            selectedFilters['stationStart'][row.id] = {'row': row, 'marker': marker};
            marker.setStyle(markerOptions.stationSelected);        
        }
        
        marker.on('click', function (e) { 
            if (!selectedFilters['stationStart'][row.id]) {            
                selectStation(row.id);
            } else {
                removeStation(row.id);
            }
        });
        
    });
}

// select a particular station
function selectStation(id) {

    reset = false;
    delete selectedFilters.stationStart[-1];

    var marker = Hubway.stations[id]['marker'];
                
    selectedFilters['stationStart'][id] = {'row': Hubway.stations[id], 'marker': marker};
    marker.setStyle(markerOptions.stationSelected);

    if (!selectAllStations) {
        redraw();
    }
    
    displaySelectedStationsText();    
}

// remove a particular station
function removeStation(id) {
    
    if (id != -1) {
        var marker = Hubway.stations[id]['marker'];
        marker.setStyle(markerOptions.stationUnselected);

        delete selectedFilters['stationStart'][id];
    }
    
    if (!selectAllStations) {
        redraw();
    }           
    
    displaySelectedStationsText();         
}

// update text with selected stations
function displaySelectedStationsText() {

    var description = '<div class="results_title">Selected stations:</div><div class="results_group">';
    
    Object.keys(selectedFilters['stationStart']).forEach(function(id) {
        if (id == -1) { return; }
        description += Hubway.stations[id]['name'] + '<br>';
    });
    
    description += '</div>'
    
    $("#js_description").html(description);  
}

//---END STATION FUNCTIONS


//---BEGIN MAP DRAWING FUNCTIONS
function showStationStatistic(forStatistic, properties) {
    
    // always remove the data layer to update it
    if (activeMarkers['data']) {
        activeMarkers['data'].forEach(function(marker) {
            map.removeLayer(marker);
        });
    }

    // try to grab results from the cache first
    var cacheKey = "illustration_" + forStatistic + kMeansNumberOfClusters + getFilterCacheKey(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);
    
    var queryResults, meansSorted, means;
    if (illustrationCache[cacheKey]) {
        queryResults = illustrationCache[cacheKey];
        meansSorted = queryResults['clusterMeansSorted'];
        means = queryResults['clusterMeansOriginalArray'];

    } else {
    
        queryResults = illustrations[forStatistic].queryResults();

        // if clustering is enabled, assign each point to a group
        if (kMeansNumberOfClusters && illustrations[forStatistic]['clusteringEnabled']) {
            var clusterBy = properties[0];
            var kMeansResults = getClusters(queryResults[clusterBy], kMeansNumberOfClusters);
        
            queryResults['clusters'] = kMeansResults['clusters'];
            queryResults['clusterMeans'] = kMeansResults['means'];
            
            var means = [];
            var meansSorted = [];
    
            queryResults['clusterMeans'].forEach(function(mean) { 
                means.push(mean[0]);
                meansSorted.push(mean[0]);
            });
                
            meansSorted.sort(function(a, b) { 
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                }
        
                return 0;
            });
            
            queryResults['clusterMeansSorted'] = meansSorted;
            queryResults['clusterMeansOriginalArray'] = means;
        }
        
        // save results to the cache 
        illustrationCache[cacheKey] = queryResults;
    }

    // assign clusters colors in order for consistency
    if (kMeansNumberOfClusters && illustrations[forStatistic]['clusteringEnabled']) {
        meansSorted.forEach(function(x) {
            var index = means.indexOf(x);
            defineCluster(means.indexOf(x));
        });
    }

    properties.forEach(function(property) {

        // add a vector
        if (property === 'direction') {

            Object.keys(queryResults[property]).forEach(function(id) {
    
                var startStation = Hubway.stations[id];

                var maxEndStations = queryResults[property][id].length < 5 ? 
                                        queryResults[property][id].length : 5;
            
                for (var i=0; i < maxEndStations; i++) {
                    var endStationIndex = queryResults[property][id][i];
                    var endStation = Hubway.stations[endStationIndex];
                
                    addVector(startStation.latitude, startStation.longitude, endStation.latitude, endStation.longitude, "default");
                };
            });
        }
    
        // add a marker
        else {

            var markerScale = illustrations[forStatistic].markerScale;

            Object.keys(queryResults[property]).forEach(function(id) {
 
                var station = Hubway.stations[id];
                var markerSize = queryResults[property][id];
                if (isNaN(markerSize)) {
                    return;
                } 
                
                var scale = Math.pow(10, illustrations[forStatistic]['unitRounding']);                
                var description = station['name'] + ", " + Math.round(markerSize * scale) / scale + " " + illustrations[forStatistic]['unit'];

                var useRawMarkerSize = illustrations[forStatistic].useRawMarkerSize;
                var options = illustrations[forStatistic].markerOptions;
        
                if (!useRawMarkerSize) {
                    markerSize = markerScale ? markerZoom * markerSize * Math.sqrt(defaultMarkerRadius / markerScale) : 0;
                }

                var cluster = "default";
                if (queryResults['clusters']) {
                    cluster = queryResults['clusters'][id];
                } else if (properties.length > 1) {
                    cluster = property;
                }

                var marker = addMarker(
                    station.latitude, station.longitude, description, 
                    cluster, markerSize, illustrations[forStatistic].markerOptions); 
    
                marker.bindPopup(description);
                marker.on('mouseover', function (e) { this.openPopup(); });
                marker.on('mouseout', function (e) { this.closePopup(); });
           });
       }
   });
   
   // add description
   $("#js_description").html(queryResults['description']);       
}

function defineCluster(kMeansLabel) {
    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }
}

function addMarker(latitude, longitude, description, kMeansLabel, radius, options) {
   
    defineCluster(kMeansLabel);
    
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

    if (startLat - endLat !== 0 || startLong - endLong !== 0) {
        var polyline = [[startLat, startLong], [endLat, endLong]];
    
        var line = L.polyline(polyline, markerOptions.vector).addTo(map);
    
        if (!activeMarkers['data']) {
            activeMarkers['data'] = [];
        }
    
        activeMarkers['data'].push(line);

    } else {
        
        var line = L.circle([startLat, startLong], 200, markerOptions.vector).addTo(map);    
    
        if (!activeMarkers['data']) {
            activeMarkers['data'] = [];
        }
    
        activeMarkers['data'].push(line);       
    }
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

// if data is shown, redrawn it
function redraw() {
    if (activeStatistic) {

     	var loading = createLoadingOverlay(map.getContainer());
        setTimeout(function() { illustrations[activeStatistic].draw(); loading.remove(); })
    }
}

function setActiveStatistic(statistic, should_redraw) {
	refreshQueryButtons(statistic);
	activeStatistic = statistic;

	if (!reset && ("undefined" === typeof should_redraw || false !== should_redraw)) {
		redraw();
	}
}

function resetMap() {
	removeMarkers();
	activeStatistic = undefined;
	selectedFilters['stationStart'] = {'-1': true};
	showStations();
	$(".js_query").removeClass("active");
	$("#js_description").html('<div class="results_title">No Selected Bike Stations</div>');
	reset = true;
}

//---END MAP DRAWING FUNCTIONS

function addToMap(new_map) {
    // already added (singleton)
    if (map) {
        return $.Deferred().resolve().promise();
    }

    map = new_map;

	var loading = createLoadingOverlay(map.getContainer());

	map.createPane('data');
	map.getPane('data').style.zIndex = 299;

	// redraw points after zoom
	map.on('zoomend', function() {
	    console.log(map.getBounds());
	    redraw();
	});

    // load data source
	var ret = DataSource.loadData("data/trips.bin", "data/stations.json")
		.done(function() {
		
			// LOADED, READY TO GO
			Hubway['stations'] = DataSource.stationsByID();
			
            // draw all station markers
            showStations();
        
            // add "all stations" group
            $("#js_stationList").append("<li><a id='js_stations_select'>Select All</a></li><li class='divider'></li>");
            $("#js_stations_select").on("click", function() {
                selectAllStations = true;
                selectedFilters['stationStart'] = {};
                Object.keys(Hubway.stations).forEach(function(id) {
                    selectStation(id);
                });
                $("#js_description").html('<div class="results_title">All Bike Stations Selected</div>');
                selectAllStations = false;
        
                redraw();
            });
        
            for (var index = 0; index < stationGroups.length; index++) {

                var label = stationGroups[index].label;
                var id = "js_stationGroup_" + index;
                $("#js_stationList").append("<li><a id='" + id + "' class='disabled'>" + label + "</a></li>");

                $("#"+id).on("click", function() {
                                                
                    // unselect all selected stations
                    Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                        removeStation(station);
                    });                
    
                    // subtract the number of items already added to the stations list
                    var selectedItem = $(this).parent('li').index() - 2;
                    
                    stationGroups[selectedItem]['stops'].forEach(function(id) {
                        selectStation(id);
                    });
                
                    $("#js_stations").removeClass("active");
                });
            }
        
            // select default stations
            $("#js_stationGroup_0").trigger("click");
            displaySelectedStationsText();            	

            // remove loading
            loading.remove();
		})
		.fail(function(err) {
			// TODO: error handling
			console.log("ERROR:", err);
		});

	// draw station button
	$("#js_stations_reset").on("click", resetMap);
	
	// set up clusters dropdown
    kMeansGroups.forEach(function(label) {

        var id = "js_kMeansGroups_" + label;
        $("#js_kMeansGroups").append("<li><a id='" + id + "' class='disabled'>" + label + "</a></li>");

        $("#"+id).on("click", function() {

            kMeansNumberOfClusters = label;
            $("#js_kMeans").text("Clusters: " + kMeansNumberOfClusters);
            
            redraw();
        });
    });
	
	// lay out queries
	var currentGroup;
	Object.keys(illustrations).forEach(function(query) {
	    
	    if (currentGroup == undefined) {
	        currentGroup = illustrations[query]['group'];

	    } else if (currentGroup !== illustrations[query]['group']) {
	        currentGroup = illustrations[query]['group'];
	        $("#js_queries").append('<br>');
	    }
	    
	    var name = illustrations[query]['buttonName'] ? illustrations[query]['buttonName'] : query;
	    var button = '<button class="btn btn-default btn-sm js_query" id="js_' + query + '">' + name + '</button>';
	    $("#js_queries").append(button);


	    $("#js_"+query).on("click", function() {
	        setActiveStatistic(query);
	    });
	});
	
	$("#js_markerSize_minus").on("click", function() {
    	markerZoom /= 2;
    	redraw();
	});

	$("#js_markerSize_plus").on("click", function() {
    	markerZoom *= 2;
    	redraw();
	});
	
    // lay out filters
    setupFilters({
        'js_year_2016':true,
        'js_season_all':true,
        'js_week_all':true,
        'js_day_all':true,
        'js_member_all':true,
        'js_gender_all':true
    });

    return ret;
}

// export global object providing an API into
var root = this;
root.ExploreTool = {
    prepareDataSource: function() {
        // can be called multiple times, just starts loading data to have ready
        if (!DataSource.isLoaded()) {
	        DataSource.loadData("data/trips.bin", "data/stations.json");
        }
    },
    addToMap: addToMap,
    setFilters: function(filter_names, should_redraw) {
        // suppress redraw
	    var last_active = activeStatistic;
	    activeStatistic = null;

        for (var i = 0; i < filter_names.length; ++i) {
            if (0 === $("#" + filter_names[i]).trigger("click").length) {
                throw "unknown filter: " + filter_names[i];
            }
        }

        // restore active statistic
        activeStatistic = last_active;

	    // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setActiveStatistic: setActiveStatistic,
    setStations: function(station_ids, should_redraw) {
	    var i;

        // suppress redraw
        selectAllStations = true;

        // remove existing stations
        var to_remove = Object.keys(selectedFilters['stationStart']);
        for (i = 0; i < to_remove.length; ++i) {
            if (-1 === station_ids.indexOf(to_remove[i])) {
	            removeStation(to_remove[i]);
            }
        }

        // add new stations
        for (i = 0; i < station_ids.length; ++i) {
            selectStation(station_ids[i]);
        }

        // stop suppressing redraw
        selectAllStations = false;

        // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setAllStations: function(should_redraw) {
	    // suppress redraw
	    selectAllStations = true;

	    // add new stations
	    Object.keys(Hubway.stations).forEach(selectStation);

	    // stop suppressing redraw
	    selectAllStations = false;

	    // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setStationGroupByLabel: function(label, should_redraw) {
        for (var i = 0; i < stationGroups.length; ++i) {
            if (label === stationGroups[i].label) {
                this.setStations(stationGroups[i]['stops'], should_redraw);
                return;
            }
        }
        throw "unknown group: " + label;
    },
    setClusters: function(clusters, should_redraw) {
	    // suppress redraw
	    var last_active = activeStatistic;
	    activeStatistic = null;

	    // set number of clusters
        if (0 === $("#js_kMeansGroups_" + (clusters || "0")).trigger("click").length) {
            throw "unsupported number of clusters: " + clusters;
        }

	    // restore active statistic
	    activeStatistic = last_active;

	    // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setMarkerSize: function(marker_size, should_redraw) {
        markerScale = marker_size;

	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    showStations: showStations,
    resetMap: resetMap,
    clearMap: function() {
        activeStatistic = null;
        removeMarkers();
    }
};

}).call(this, jQuery);
