// global variables
var map;
var hubway = {};
var activeMarkers = {};
var activeStatistic;
var clusters = {};
var cachedDataSource;
var cacheKey = '';
var reset = false;
var selectAllStations = false;
var kMeansNumberOfClusters = 5;

// store the active set of selected filters;
// by default, we start with the filters specified below (and a few default stations after the map loads)
var selectedFilters = {
    'startYear': {}, 
    'startMonth': {},
    'startDay': {},
    'startHour': {},
    'member': {},
    'stationStart': {}
};
   
var markerOptions = {
    'distance': {'stroke': false, 'fillOpacity': 0.2, 'pane': 'data'},
    'vector': { 'stroke': 'blue', 'fillColor': 'none', 'fillOpacity': 0.2, 'pane': 'data'},
    'data': {'stroke': false, 'fillOpacity': 0.5, 'pane': 'data'},
    'default': {'stroke': false, 'fillOpacity': 0.5},
    
    // these two are only used to show bike stations, so colors are hard-coded
    'stationUnselected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'blue'},
    'stationSelected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'red'},    
};

// The number of stations to show text results for
var maxStations = 5;

var defaultMarkerRadius = 100;
var defaultStatisticRadius = 2000;
var cssColors = ['blue','navy','maroon','gray','maroon','lime','green','teal','aqua','antiquewhite','aquamarine','beige','bisque','blanchedalmond','blueviolet','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','gainsboro','ghostwhite','gold','goldenrod','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','limegreen','linen','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','oldlace','olivedrab','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellowgreen'];
// 'purple','fuchsia', 'white','olive','yellow','black','silver','red','azure'

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
        {'label': 'all', 'set': {'startDay': null}},
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
    ]
};

var stationGroups = [
    {'label': 'Favorite Coffee Stops', stops: [147, 184, 106, 62]},
    {'label': 'Harvard', stops: [6, 7, 15, 131, 145, 146, 147, 148, 150, 151, 153, 154, 166, 192]},
    {'label': 'MIT', stops: [137, 138, 169, 170]},
    {'label': 'Central Square', stops: [29, 142, 143]},
    {'label': 'Boston', stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 191, 192, 193, 194, 196, 197]},
    {'label': 'Brookline', stops: [129, 130, 131, 132, 188, 190]},
    {'label': 'Cambridge', stops: [133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175]},
    {'label': 'Somerville', stops: [176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 189, 195]}    
];

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


// create a hash of filters to use to run a DataSource query
// valid fields: duration, gender, member, startMinute, startYear, startMonth, startWeekday, startHour, stationEnd, stationStart
function updateCache(options) {

    // generate key
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
        
    if (key != cacheKey) {
        console.log("Updating cache: %s", key);
        cachedDataSource = DataSource.cacheFilter(getFilterOptions(options));    
        cacheKey = key;
    }
}

function getFilterOptions(options) {

    var filter = {};
    
    options.forEach(function(column) {    
        if (column == 'stationStart' || column == 'stationEnd') {
            filter[column] = Object.keys(selectedFilters[column]).length == 0 ? null : Object.keys(selectedFilters[column]);
        } else if (column == 'member') {
            alert('MEMBER NOT CURRENTLY SET UP!');
        } else {
            filter[column] = selectedFilters[column] == null ? null : Object.keys(selectedFilters[column]);
        }
    });

    return filter;
}

// available queries to run/draw
var illustrations = {

	'starts': {
	    group: 'trips',
	    unit: 'trips/day',
	    unitRounding: 0,
	    maxValue: 50,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
  	    draw: function() {
    	    removeMarkers();
  	        showStationStatistic('starts', ['trips']);
        },

  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);
  	        var results = DataSource.query(cachedDataSource, "stationStart", null, "sum");

            // just an approximation... 
            // 1. get the number of days of the week
            // 2. multiply by the number of weeks in a month, and then the number of months (either all, or 4 for a season)
            var totalNumberOfDays = (selectedFilters['day'] == null ? 7 : selectedFilters['startDay'].length);
            totalNumberOfDays = totalNumberOfDays * 4 * (selectedFilters['startMonth'] == null ? 12 : 4);
                        
            Object.keys(results).forEach(function(station) {
                results[station] /= totalNumberOfDays;
            });
            
            kMeansResults = getClusters(results, kMeansNumberOfClusters);
            
            var description = '<div class="results_title">Number of trips started from each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the most trips:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the fewest trips:');

            return {'trips': results, 'description': description,
                    'clusters': kMeansResults['clusters'], 'clusterMeans': kMeansResults['means']};
        }
	},
	
	'stops': {
	    group: 'trips',
	    unit: 'trips/day',
	    unitRounding: 0,
	    maxValue: 50,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
  	    draw: function() {
    	    removeMarkers();
  	        showStationStatistic('stops', ['trips']);
        },

  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);
            var results = DataSource.query(cachedDataSource, "stationEnd", null, "sum");

            // just an approximation... 
            // 1. get the number of days of the week
            // 2. multiply by the number of weeks in a month, and then the number of months (either all, or 4 for a season)
            var totalNumberOfDays = (selectedFilters['day'] == null ? 7 : selectedFilters['startDay'].length);
            totalNumberOfDays = totalNumberOfDays * 4 * (selectedFilters['startMonth'] == null ? 12 : 4);
                        
            Object.keys(results).forEach(function(station) {
                results[station] /= totalNumberOfDays;
            });
            
            kMeansResults = getClusters(results, kMeansNumberOfClusters);            
            
            var description = '<div class="results_title">Number of trips ending at each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the most trips:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the fewest trips:');
            
            return {'trips': results, 'description': description,
                    'clusters': kMeansResults['clusters'], 'clusterMeans': kMeansResults['means']};
        }
	},
	    
	'duration': {
	    group: 'trips',
	    unit: 'minutes',
	    unitRounding: 1,
	    maxValue: 10,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
  	    draw: function() {
    	    removeMarkers();
            showStationStatistic('duration', ['duration']);
      	},
      	
  	    queryResults: function() { 

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);
            
  	        var results = DataSource.query(
                cachedDataSource,
                "stationStart", // what to group by (can be any field name), or null for no grouping
                "duration",     // what to aggregate (can be any field name), or null to count results
                "mean"          // how to aggregate (can be sum, min, max or mean)
            );

            kMeansResults = getClusters(results, kMeansNumberOfClusters);
            
            var description = '<div class="results_title">Average duration of trips started at each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the longest average trip:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the shortest average trip:');
            
            return {'duration': results, 'description': description,
                    'clusters': kMeansResults['clusters'], 'clusterMeans': kMeansResults['means']};            
        }
	},

	'distance-all': {
	    group: 'distance',
	    unit: 'meters',
	    unitRounding: 0,
	    maxValue: 3000,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-all', ['min', 'mean', 'max']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);

            var min = DataSource.query(cachedDataSource, "stationStart", "distance", "min");
            var mean = DataSource.query(cachedDataSource, "stationStart", "distance", "mean");
            var max = DataSource.query(cachedDataSource, "stationStart", "distance", "max");
            
            var description = '<div class="results_title">Min/Mean/Max Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (min[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": " + 
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
	    maxValue: 3000,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-min', ['min']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);

            var min = DataSource.query(cachedDataSource, "stationStart", "distance", "min");
            
            var description = '<div class="results_title">Minimum Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (min[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": " + 
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
	    maxValue: 3000,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-mean', ['mean']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);

            var mean = DataSource.query(cachedDataSource, "stationStart", "distance", "mean");
            
            var description = '<div class="results_title">Mean Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (mean[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": " + 
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
	    maxValue: 3000,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-max', ['max']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);

            var max = DataSource.query(cachedDataSource, "stationStart", "distance", "max");
            
            var description = '<div class="results_title">Max Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (mean[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            hubway.stations[station]['name'] + ": " + 
                            Math.round(mean[station], 0) + " " + illustrations['distance-all']['unit'] + '</div>';
                }
            });
            
            return {'max': max, 'description': description};
        }	
	},

    'popular': {
        group: 'popular',
	    unit: 'trips',
	    unitRounding: 0,
	    maxValue: 1,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.vector,
  	    draw: function() {
                removeMarkers();
        	    showStations();
      	        showStationStatistic('popular', ['direction']);
        },

  	    queryResults: function() {

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart']);

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
                
                var from = '<strong>From:</strong> ' + hubway.stations[station]['name'];
                description += printTopStations(resultsByStation[station], true, maxStations, true, from);

            });
            
            return {'direction': topStations, 'description': description};
        }       
    }
};

// cluster results with the following format: [{station: number}]
// returns a hash of cluster assignments by station and the corresponding centroid values
function getClusters(results, numberOfClusters) {
            
    var stationsAsArray = Object.keys(results).map(function(station) { return station; });
    var kMeansInput = stationsAsArray.map(function(station) { return [results[station]]; });
    var kMeansResult = kMeans.run(kMeansInput, 5);
    
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
        description += "<li>" + hubway.stations[station]['name'];
        
        if (printCounts) {
            description += ", " + 
                Math.round(resultsByStation[station], illustrations[activeStatistic]['unitRounding']) + 
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
            
                if (activeStatistic !== undefined) {
          	        setTimeout(function() { illustrations[activeStatistic].draw(); }, 0);
                }            
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

    Object.keys(hubway.stations).forEach(function(id) {
    
        var row = hubway.stations[id];
        
        var description = row.name + ', ' + row['docks'] + ' bikes';        
        marker = addMarker(row.latitude, row.longitude, description, "default", defaultMarkerRadius, markerOptions.default);
        marker.setStyle(markerOptions.stationUnselected);

        marker.bindPopup(description);
        marker.on('mouseover', function (e) { this.openPopup(); });
        marker.on('mouseout', function (e) { this.closePopup(); });

        // add a reference to the original data
        hubway.stations[id]['marker'] = marker;                
                        
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

    var marker = hubway.stations[id]['marker'];
                
    selectedFilters['stationStart'][id] = {'row': hubway.stations[id], 'marker': marker};
    marker.setStyle(markerOptions.stationSelected);

    if (activeStatistic !== undefined && !selectAllStations) {
        setTimeout(function() { illustrations[activeStatistic].draw(); }, 0);
    }
    
    displaySelectedStationsText();    
}

// remove a particular station
function removeStation(id) {
    
    var marker = hubway.stations[id]['marker'];
    marker.setStyle(markerOptions.stationUnselected);

    delete selectedFilters['stationStart'][id];
    
    if (activeStatistic !== undefined && !selectAllStations) {
        setTimeout(function() { illustrations[activeStatistic].draw(); }, 0);
    }           
    
    displaySelectedStationsText();         
}

// update text with selected stations
function displaySelectedStationsText() {

    var description = '<div class="results_title">Selected stations:</div><div class="results_group">';
    
    Object.keys(selectedFilters['stationStart']).forEach(function(station) {
        description += hubway.stations[station]['name'] + '<br>';
    });
    
    description += '</div>'
    
    $("#js_description").html(description);  
}

//---END STATION FUNCTIONS


//---BEGIN MAP DRAWING FUNCTIONS
function showStationStatistic(forStatistic, properties) {

	var loading = createLoadingOverlay("#map");
    
    // always remove the data layer to update it
    if (activeMarkers['data']) {
        activeMarkers['data'].forEach(function(marker) {
            map.removeLayer(marker);
        });
    }

    var queryResults = illustrations[forStatistic].queryResults();
    
    // if clustering data is available, assign colors sorted by the first dimension
    if (queryResults['clusterMeans']) {

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
        
        meansSorted.forEach(function(x) {
            var index = means.indexOf(x);
            defineCluster(means.indexOf(x));
        });
    }

    properties.forEach(function(property) {

        // add a vector
        if (property === 'direction') {

            Object.keys(queryResults[property]).forEach(function(id) {
    
                var startStation = hubway.stations[id];

                var maxEndStations = queryResults[property][id].length < 5 ? 
                                        queryResults[property][id].length : 5;
            
                for (var i=0; i < maxEndStations; i++) {
                    var endStationIndex = queryResults[property][id][i];
                    var endStation = hubway.stations[endStationIndex];
                
                    addVector(startStation.latitude, startStation.longitude, endStation.latitude, endStation.longitude, "default");
                };
            });
        }
    
        // add a marker
        else {

            var maxValue = illustrations[forStatistic].maxValue;

            Object.keys(queryResults[property]).forEach(function(id) {
 
                var station = hubway.stations[id];
                var markerSize = queryResults[property][id];
                if (isNaN(markerSize)) {
                    return;
                } 
                
                var description = station['name'] + ", " + Math.round(markerSize, 1) + " " + illustrations[forStatistic]['unit'];

                var useRawMarkerSize = illustrations[forStatistic].useRawMarkerSize;
                var options = illustrations[forStatistic].markerOptions;
        
                if (!useRawMarkerSize) {
                    markerSize = maxValue ? markerSize * Math.sqrt(defaultStatisticRadius / maxValue) : 0;
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

   loading.remove();
   
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
                    Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                        removeStation(station);
                    });                
    
                    var selectedItem = $(this).parent('li').index();
                    stationGroups[selectedItem]['stops'].forEach(function(id) {
                        selectStation(id);
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
	
	// draw station button
	$("#js_stations_reset").on("click", function() {
	    removeMarkers();
	    activeStatistic = undefined;
	    selectedFilters['stationStart'] = {};
	    showStations();
	    $(".js_query").removeClass("active");	    
	    $("#js_description").html('<div class="results_title">No Selected Bike Stations</div>');
	    reset = true;
	});

	$("#js_stations_select").on("click", function() {
        selectAllStations = true;
	    selectedFilters['stationStart'] = {};
	    Object.keys(hubway.stations).forEach(function(id) {
	        selectStation(id);
	    });
	    $("#js_description").html('<div class="results_title">All Bike Stations Selected</div>');
	    selectAllStations = false;
        
        if (activeStatistic) {	    
	        setTimeout(function() { illustrations[activeStatistic].draw(); }, 0);
	    }
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
	    
	    var button = '<button class="btn btn-default js_query" id="js_' + query + '">' + query + '</button>';
	    $("#js_queries").append(button);
	    
	    
	    $("#js_"+query).on("click", function() {
       	    if (!reset) {
           	    refreshQueryButtons(query);
        	    activeStatistic = query;
  	            setTimeout(function() { illustrations[query].draw(); }, 0);
  	        }
	    });
	});
	    
    // lay out filters
    setupFilters({
        'js_year_2016':true,
        'js_season_all':true,
        'js_week_all':true,
        'js_day_all':true,
        'js_member_all':true
    });
});
