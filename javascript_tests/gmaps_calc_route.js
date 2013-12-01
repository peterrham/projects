// XXX use a global variable to contain the polylines, delete it each try
// migrate to some application global object or something later
// let's see how this works

// XXX extending this to include markers which have the same setMap()
// method which is using a type of duck typing, since the prototypes
// of neither of these "classes" share that method, apparently.
// I still need to learn about javascript prototypes/classes

define(["local_javascript_utilities", "async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"], 
       function(local_javascript_utilities, google_maps) {

function
secondsToMinutes(seconds)
{
	return seconds / 60;
}

function
metersToMiles(meters)
{
    return meters * 0.000621371192;
}

var gPolylineArray = new Array();


function
cleanUpPolylineArray()
{
    var polyline; 

    // XXX should there be variable declarations for i and len?

    for (i = 0, len = gPolylineArray.length; i < len; i++) {
        polyline = gPolylineArray[i];
	polyline.setMap(null);
    }

    gPolylineArray = new Array();
}

// gmaps overlay stuff

// Define the overlay, derived from google.maps.OverlayView
function Label(opt_options) {
    // Initialization
    this.setValues(opt_options);
    
    // Here go the label styles
    var span = this.span_ = document.createElement('span');
    span.style.cssText = 'position: relative; left: -50%; top: -10px; ' +
        'white-space: nowrap;color:#000000;' +
        'padding: 2px;font-family: Arial; font-weight: bold;' +
        'font-size: 30px;';
    
    var div = this.div_ = document.createElement('div');
    div.appendChild(span);
    div.style.cssText = 'position: absolute; display: none';
};

Label.prototype = new google.maps.OverlayView;

Label.prototype.onAdd = function() {
    var pane = this.getPanes().overlayImage;
    pane.appendChild(this.div_);
    
    // Ensures the label is redrawn if the text or position is changed.
    var me = this;
    this.listeners_ = [
        google.maps.event.addListener(this, 'position_changed',
				      function() { me.draw(); }),
        google.maps.event.addListener(this, 'text_changed',
				      function() { me.draw(); }),
        google.maps.event.addListener(this, 'zindex_changed',
				      function() { me.draw(); })
    ];
};

// Implement onRemove
Label.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    
    // Label is removed from the map, stop updating its position/text.
    for (var i = 0, I = this.listeners_.length; i < I; ++i) {
        google.maps.event.removeListener(this.listeners_[i]);
    }
};

// Implement draw
Label.prototype.draw = function() {
    var projection = this.getProjection();
    var position = projection.fromLatLngToDivPixel(this.get('position'));
    var div = this.div_;
    div.style.left = (position.x + 10) + 'px';
    div.style.top = (position.y + 10) + 'px';
    div.style.display = 'block';
    div.style.zIndex = this.get('zIndex'); //ALLOW LABEL TO OVERLAY MARKER
    this.span_.innerHTML = this.get('text').toString();
};

var geocoder;


var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

var browserSupportFlag =  new Boolean();

function handleNoGeolocation(errorFlag) {
    if (errorFlag == false) {
	alert("Geolocation service succeeded.");
	//     initialLocation = newyork;
    } else {
	alert("Your browser doesn't support geolocation.");
	//      initialLocation = siberia;
    }
    //    map.setCenter(initialLocation);
}

function
noGeolocation()
{

    local_javascript_utilities.logConsoleEvent("noGeolocation(): called");
    handleNoGeolocation(browserSupportFlag);
}

function currentLocationPromise()
{
    var dfd = $.Deferred();

    if (navigator.geolocation) {
        local_javascript_utilities.logConsoleEvent("geolocation:YES");

	navigator.geolocation.getCurrentPosition(
	    function(position) {
		local_javascript_utilities.logConsoleEvent("currentLocationPromise(): got it!");
		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		map.setCenter(initialLocation);
	    }, 
	    noGeolocation
	);

    } else{
        local_javascript_utilities.logConsoleEvent("geolocation:NO");
    }

}

function geocodePromise(address){
    local_javascript_utilities.logConsoleEvent("geocodePromise()");

    var dfd = $.Deferred();
    
    geocoder.geocode( { 'address': address}, function(results, status) {

	local_javascript_utilities.logConsoleEvent("before calling resolve");

	
	if (status == google.maps.GeocoderStatus.OK) {

	    theLocation = results[0].geometry.location;


	    local_javascript_utilities.logConsoleEvent("location = " + theLocation);

            var marker = new google.maps.Marker({
		map: map,
		position: results[0].geometry.location

            });

	    // XXX need to change the name and use of global variable
	    gPolylineArray.push(marker);

	    var label = new Label({
		map: map
            });

	    // XXX PRH, should name this to another array and store better in an 
	    // "application object" rather than a global variable

	    gPolylineArray.push(label);
            label.set('zIndex', 1234);
            label.bindTo('position', marker, 'position');
	    label.set('text', "Home");
	    //          label.bindTo('text', marker, 'position');

	    dfd.resolve(theLocation);
	} else {
            alert("Geocode was not successful for the following reason: " + status);
	}
    });

    return dfd.promise();
}

function codeAddress() {

    local_javascript_utilities.logConsoleEvent("codeAddress()");

    var address = "4717 89th Avenue, SE, Mercer Island, WA 98040";

    geocoder.geocode( { 'address': address}, function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
            var marker = new google.maps.Marker({
		map: map,
		position: results[0].geometry.location
            });
	    gPolylineArray.push(marker);
	} else {
            alert("Geocode was not successful for the following reason: " + status);
	}
    });
}


// XXX Global variables?

var momLocation;
var homeLocation;
var directionsDisplay;

function initialize() {
    local_javascript_utilities.logConsoleEvent("initialize():");

    directionsDisplay = new google.maps.DirectionsRenderer();

    // XXX global variable
    geocoder = new google.maps.Geocoder();

    var chicago = new google.maps.LatLng(41.850033, -87.6500523);

    var mapOptions = {
	zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: chicago,
	zoomControl: true,
	panControl: true,
	zoomControl: true,
	mapTypeControl: true,
	scaleControl: true,
	streetViewControl: true,
	overviewMapControl: true

    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    directionsDisplay.setMap(map);

    if (navigator.geolocation) {
        local_javascript_utilities.logConsoleEvent("geolocation:YES");

	navigator.geolocation.getCurrentPosition(
	    function(position) {
		local_javascript_utilities.logConsoleEvent("got the browser geo code location!");
		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		map.setCenter(initialLocation);
	    }, 
	    noGeolocation
	);

    } else{
        local_javascript_utilities.logConsoleEvent("geolocation:NO");
    }

    codeAddress();

    var home = "4717 89th Avenue, SE, Mercer Island, WA 98040";

    var mom = "419 State Street, Johnstown, PA 15905";

    /*
      geocodePromise(mom).done(
      function(x)  {
      local_javascript_utilities.logConsoleEvent('mm is done!');
      local_javascript_utilities.logConsoleEvent('mom is ' + x);
      momLocation = x;
      }
      );

      geocodePromise(home).done(
      function(x)  {
      local_javascript_utilities.logConsoleEvent('home is done!');
      local_javascript_utilities.logConsoleEvent('home is ' + x);
      homeLocation = x;
      }
      );

      $.when(geocodePromise(mom), geocodePromise(home))
      .then(function (result){
      local_javascript_utilities.logConsoleEvent('result = ' + result);
      });
    */

    geocodePromise(mom)
	.then(function (result) { momLocation = result; return geocodePromise(home);})
	.then(function (result) { homeLocation = result; return geocodePromise(mom);})
	.then(function (result) { 
	    local_javascript_utilities.logConsoleEvent("momLocation = " + momLocation);
	    local_javascript_utilities.logConsoleEvent("homeLocation = " + homeLocation);});
}

function 
min (x, y)
{
    if (x < y) return x
    else return y;
}

// for debugging and learning about directions
function
dumpDirectionsResponse(response)
{
    local_javascript_utilities.logConsoleEvent("dumpDirectionsResponse()");
    local_javascript_utilities.logConsoleEvent("my object: %o", response);

    var routes=response.routes.length;
    var legs;
    var steps;
    var paths;
    var path;

    var n=0;
    for (i=0;i<routes;i++){
	legs=response.routes[i].legs.length;
	for (j=0;j<legs;j++){
            steps=response.routes[i].legs[j].steps.length;
            for(k=0;k<steps;k++){
                paths=response.routes[i].legs[j].steps[k].path.length;
		for(m=0;m<paths;m++){
		    path = response.routes[i].legs[j].steps[k].path[m];
		    local_javascript_utilities.logConsoleEvent("path: %o", path);
		    local_javascript_utilities.logConsoleEvent("path as string: %s", path.toString());
		}
	    }
	}
    }
}

function
drawDirectionsPolyline(i, n, result)
{

    var polyline = new google.maps.Polyline({
	path: [],
	strokeColor: '#0000FF',
	strokeWeight: 5
    });

    if (!result) {
	local_javascript_utilities.logConsoleEvent("result is *NULL*");
	return;
    }

    if (result.routes != null) {
    } else {
	local_javascript_utilities.logConsoleEvent("routes is *NULL*");
	return;
    }

    // assumes only one route
    path = result.routes[0].overview_path;
    
    $(path).each(function(index, item) {
	polyline.getPath().push(item);
    });

    polyline.setMap(map);

    gPolylineArray.push(polyline);

    // assumes only one leg
    var leg = result.routes[0].legs[0];

    var marker = new google.maps.Marker({
	map: map,
	position: leg.start_location
    });

    gPolylineArray.push(marker);

    var label = new Label({
	map: map
    });
    
    gPolylineArray.push(label);

    label.bindTo('position', marker, 'position');
    label.set('text', (i+1).toString());

    // decide to draw the destination or not, since we are doing this in a loop

    if (i == (n - 2)) {
	local_javascript_utilities.logConsoleEvent("last one");
	var marker = new google.maps.Marker({
	    map: map,
	    position: leg.end_location
	});

	label.bindTo('position', marker, 'position');
	label.set('text', (i+2).toString());

    }
}

function
newCalcRoutePromise(i, totalLength, startLocation, endLocation)
{
    var dfd = $.Deferred();

    local_javascript_utilities.logConsoleEvent("newCalcRoutePromise(): startLocation == " + startLocation);

    local_javascript_utilities.logConsoleEvent("newCalcRoutePromise(): endLocation == " + endLocation);

    if (startLocation === undefined) {
	local_javascript_utilities.logConsoleEvent("startLocation undefined");
	return;

    }

    if (endLocation === undefined) {
	local_javascript_utilities.logConsoleEvent("endLocation undefined");
	return;

    }
    var request = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    // XXX This is tricky, combining deferred's and timeouts The
    // purpose of this is to throttle, but it probably won't if
    // everything goes in parallel but I guess that promises prevent
    // that? Will I get a rush all at once if the timers all expire at
    // the same time? I will also be breaking the directions into
    // segments in order to call the api less times
    
    setTimeout(function() {

	directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
		local_javascript_utilities.logConsoleEvent("status == *OK*");
		local_javascript_utilities.logConsoleEvent("directionsService callback(): i == " + i.toString());
		drawDirectionsPolyline(i, totalLength, response);
		local_javascript_utilities.logConsoleEvent("after calling Polyline()");
	    } else {
		clearSummaryPanel();
		appendToSummaryPanel('<br>' + status);

		local_javascript_utilities.logConsoleEvent("status == *ERROR*");
		local_javascript_utilities.logConsoleEvent("status == " + status.toString());
	    }
	    dfd.resolve();
	})}, 2000);

    return dfd.promise();
}

// XXX this promise based strategy does not quite work, it only draws
// the first segment which could mean that the promise part does not
// work!

function
promiseDirectionsStrategy()
{
    this.execute = 
	function(my_lines) 
    {
	
	// XXX lot's of redundancy between the loops in the 3
	// strategies we can factor this out

	local_javascript_utilities.logConsoleEvent("usePromiseApproach");

	var n = my_lines.length;

	var pre_promise = null;
	var next_promise = null;

	for (var i = 0; i < (n - 1); i++) {
	    if (pre_promise) {
		// XXX PRH, this is were I'm worried about using promises incorrectly
		next_promise = pre_promise.then(function() {
		    newCalcRoutePromise(i, n, my_lines[i], my_lines[i+1]);
		});
            } else
	    {
		next_promise = newCalcRoutePromise(i, n, my_lines[i], my_lines[i+1]);
	    }
	    
	    pre_promise = next_promise;
	}
    }
}

function
sumDirectionsDuration(response)
{
    var totalSeconds = 0;

    local_javascript_utilities.logConsoleEvent("sumDirectionsDuration");

    $.each(response.routes, function(index, value) {
	local_javascript_utilities.logConsoleEvent("route = " + index);

	$.each(value.legs, function(index, value) {
	    local_javascript_utilities.logConsoleEvent("leg = " + index);
	    
	    totalSeconds += value.duration.value;
	});
    });

    local_javascript_utilities.logConsoleEvent("totalSeconds == " + totalSeconds);

    return totalSeconds;
}

function
sumDirectionsDistance(response)
{
    var totalDistance = 0;

    $.each(response.routes, function(index, value) {
	$.each(value.legs, function(index, value) {
	    totalDistance += value.distance.value;
	});
    });

    local_javascript_utilities.logConsoleEvent("totalDistance == " + totalDistance);

    return totalDistance;
}


// perhaps this can be generated to adding an object to a table the
// table object can have a list of row and column names

var APP_GLOBAL_OBJ = {
    resultsTable :  {
	id : "results_table",
	columnDefinitions : [
	    "#",
	    "travel distance",
	    "travel time",
	    "address",
	    "street",
	    "city",
	    "state",
	    "post code",
	    "country",
	]
    }
};



function
addAddressToPanel(i, address)
{
    appendToSummaryPanel(i + ': ');
    appendToSummaryPanel(address);
    appendToSummaryPanel('<br>');
}

function
addRowToTable(rowNumber, tableDescriptor, rowHash)
{
    var table = document.getElementById(tableDescriptor.id);

    var row = table.insertRow(rowNumber);
    
    var cell;

    $(tableDescriptor.columnDefinitions).each(function(index, item) {
	local_javascript_utilities.logConsoleEvent("index = " + index);
	cell = row.insertCell(index);
	cell.innerHTML = rowHash[item] || "";
    });    
}

function
addTableHeader(tableDescriptor)
{
    var table = document.getElementById(tableDescriptor.id);

    var row = table.insertRow(0);

    var cell;

    $(tableDescriptor.columnDefinitions).each(function(index, item) {
	local_javascript_utilities.logConsoleEvent("index = " + index);
	cell = row.insertCell(index);
	cell.innerHTML = tableDescriptor.columnDefinitions[index];
    });    
}

function
createResultsTable()
{
    $("#results_table").html("");

    addTableHeader(APP_GLOBAL_OBJ.resultsTable);
}

function
displayDirectionsResult(j, response)
{	    
    var route = response.routes[0];

    var totalMins = 0;

    // For each route, display summary information.

    for (var i = 0; i < route.legs.length; i++) {
	var routeSegment = i + 1;
	addAddressToPanel(routeSegment + j , route.legs[i].start_address);
    }

    return route.legs.length;
}


function
makeDirectionsRequest(batchElement, start, end, waypts)
{
    var request = {
        origin: start,
        destination: end,
        waypoints: waypts,
        optimizeWaypoints: false,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    // let's add promises to this in order to synchronize the gmaps
    // requests which can come back out of order ....

    var dfd = $.Deferred();

    var result = directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {

	    local_javascript_utilities.logConsoleEvent("got directionsResponse");

	    local_javascript_utilities.logConsoleEvent("batchElement = " + batchElement);
	    local_javascript_utilities.logConsoleEvent(batchElement);
	    local_javascript_utilities.logConsoleEvent(batchElement.batch);
	    local_javascript_utilities.logConsoleEvent(batchElement.start);
	    local_javascript_utilities.logConsoleEvent(batchElement.end);
	    
	    batchElement.response = response;

	    if (false) dumpDirectionsResponse(response);

	    // XXX PRH, this is not quite correct, the function
	    // draws only one segment

	    if (true) drawDirectionsPolyline(0, waypts.length + 1, response);

	    if (false) directionsDisplay.setDirections(response);

	    dfd.resolve();

	} else {            
	    appendToSummaryPanel('... directions failed! ....');
	}
    });

    local_javascript_utilities.logConsoleEvent("result == " + result);

    return dfd.promise();
}

function
batchDirectionsStrategy()
{
    this.execute = 
	function(my_lines) 
    {
	var max_gmaps_waypoints = 8;

	local_javascript_utilities.logConsoleEvent("use batchDirectionsStrategy");

	var n = my_lines.length;

	// break the list into chunks so that we can run the
	// directions service on a list that does not go beyond the
	// usage limit in terms of number of points, after we do that,
	// then we can throttle those requests

	// we need to break the requests into chunks
	// each chunk will have:
	// 1) start
	// 2) waypts
	// 3) end

	// XXX this loop is hard to visualize, I think that I need a picture ..

	// this is the gap
	var y = max_gmaps_waypoints + 1;

	var quotient = Math.floor(n / y);

	local_javascript_utilities.logConsoleEvent("quotient = " + quotient);
	
	var remainder = n % y;

	local_javascript_utilities.logConsoleEvent("remainder = " + remainder);

	var lim;

	if (remainder == 0) {
	    lim = quotient;
	} else {
	    lim = quotient + 1;
	}

	local_javascript_utilities.logConsoleEvent("lim = " + lim);
	
	var start_index;
	var end_index;
	
	var deferredArray = [];

	// this is the start of an object that represents the batch 
	// in order to post-process the batch

	var batch = [];

	for (var x = 0; x < lim; x++) {
	    start_index = x * y;

	    if (x == (lim - 1)) {
		end_index = n - 1;
	    } else {
		end_index = start_index + y;
	    }

	    var start = my_lines[start_index];	
	    var end = my_lines[end_index];

	    var waypts = [];
	    

	    for (var i = start_index + 1; i < end_index; i++) {
		local_javascript_utilities.logConsoleEvent(my_lines[i]);
		waypts.push({location:my_lines[i], stopover:true});
	    }

	    var promise = null;
	    
	    (function () {
		var batchElement = {};
		batchElement.batch = batch;
		batchElement.start = start;
		batchElement.end = end;

		batch.push(batchElement);

		promise = makeDirectionsRequest(batchElement, start, end, waypts);
	    }());

 
	    deferredArray.push(promise);

	    promise.then(function() {
		local_javascript_utilities.logConsoleEvent("one request finished");
	    });
	}
	
	$.when.apply($, deferredArray).then(function() {
	    local_javascript_utilities.logConsoleEvent("all the deferreds have completed");
	    local_javascript_utilities.logConsoleEvent("batch.length == " + batch.length);

	    // turn the batch into a leg array
	    var legs = [];

	    $.each(batch, function(index, batchElement) {

		var response = batchElement.response;

		$.each(response.routes[0].legs, function(index, element) {
		    legs.push(element);

		});

	    });
	    
	    // iterate over the legs, there will be one more stop than leg
	    $.each(legs, function(index, leg) {
		var rowHash = {};
		rowHash["#"] = index + 1;
		rowHash["travel distance"] = metersToMiles(leg.distance.value).toFixed(1);
		rowHash["travel time"] = secondsToMinutes(leg.duration.value).toFixed(1);
		rowHash["address"] = leg.start_address;
		addRowToTable(index + 1, APP_GLOBAL_OBJ.resultsTable, rowHash);

		// add the last stop
		if (index == (legs.length - 1)) {
		    rowHash = {};
		    rowHash["#"] = index + 2;
		    rowHash["address"] = leg.end_address;
		    addRowToTable(index + 2, APP_GLOBAL_OBJ.resultsTable, rowHash);		    
		}
	    });
		
	    local_javascript_utilities.logConsoleEvent("number of legs = " + legs.length);

		   
	    // iterate over the batch and sum the total time first
	    var totalSeconds = 0;
	    var totalDistance = 0; // in meters

	    $.each(batch, function(index, batchElement) {
		totalSeconds += sumDirectionsDuration(batchElement.response);
		totalDistance += sumDirectionsDistance(batchElement.response);
	    });

	    local_javascript_utilities.logConsoleEvent("totalSeconds (total) = " + totalSeconds);
	    local_javascript_utilities.logConsoleEvent("totalDistance (total) = " + totalDistance);

	    var totalMinutes = secondsToMinutes(totalSeconds);

	    var totalMiles = metersToMiles(totalDistance);

	    var textArea = document.getElementById('summary_metrics_text_area');
	    textArea.innerHTML = "Minutes (total): " + totalMinutes.toFixed(1) + '<br>';
	    textArea.innerHTML += "Distance (miles) (total): " + totalMiles.toFixed(1) + '<br>';
	    textArea.innerHTML += "Speed (miles per hour): " + (totalMiles / (totalMinutes / 60)).toFixed(1) + '<br>';
	    textArea.innerHTML += '<br>';

	    // iterate over the batch

	    (function() {

		var i = 0;
		var nElements = batch.length;
		
		local_javascript_utilities.logConsoleEvent("nElements == " + nElements);

		$.each(batch, function(index, batchElement) {
		    var response = batchElement.response;
		    var numRoutes = response.routes.length;
		    var numLegs = response.routes[0].legs.length;

		    local_javascript_utilities.logConsoleEvent("index == " + index);
		    local_javascript_utilities.logConsoleEvent("numRoutes == " + numRoutes);
		    local_javascript_utilities.logConsoleEvent("numLegs == " + numLegs);

		    i += displayDirectionsResult(i, batchElement.response);

		    // this is the last element in the batch

		    if (index == nElements - 1) {


			addAddressToPanel(i + 1, response.routes[0].legs[numLegs - 1].end_address);
		    }
		});
	    })();

	});

    }
}

function
directDirectionsStrategy()
{
    this.execute = 
	function(my_lines) 
    {
	var n = my_lines.length;

	local_javascript_utilities.logConsoleEvent("useDirectApproach");
	
	for (var i = 0; i < (n - 1); i++) {
	    local_javascript_utilities.logConsoleEvent("directApproach(): i == " + i.toString());

            local_javascript_utilities.fireOffDirectionsRequest(i, n, my_lines[i], my_lines[i+1]);

	}
    }
}

function
throttledDirectionsStrategy()
{
    this.execute = 
	function(my_lines) 
    {
	
	var n = my_lines.length;

	console.log("usingThrottledApproach");

	// create an array of functions to call asynch

	var theFuncArray = new Array();

	function
	createClosure(i, totalLength, src, dst)
	{
	    return function() {
		local_javascript_utilities.fireOffDirectionsRequest(i, totalLength, src, dst);
	    };
	}

	for (var i = 0; i < (n - 1); i++) {
	    var theFunc = createClosure(i, n, my_lines[i], my_lines[i+1]);
	    theFuncArray.push(theFunc);
	}
	
	executeFunctionArrayAsynch(theFuncArray);
    };
}

// strip out the empty lines

function
removeNewlines(str)
{
    var my_lines = [];

    // YYY (area for improvement) perhaps a map function could be used

    $.each(str, function(index, value) {
	if (value.length > 0) {
	    my_lines.push(value);
	}
	});

    return my_lines;
}

// main function for this page

function
clearSummaryPanel()
{
    var summaryPanel = document.getElementById('directions_panel');
    summaryPanel.innerHTML = '';
}

function
appendToSummaryPanel(str)
{
    var summaryPanel = document.getElementById('directions_panel');
    summaryPanel.innerHTML += str;
}

function 
calcRoute() 
{
    console.log("inside calcRoute()");

    require(["print", "mod_mylog"], function (print, mod_mylog) {
	print.doit();
	mod_mylog.mylog("using mod_mylog");
    });

    console.log("after require print");

    cleanUpPolylineArray();

    clearSummaryPanel();

    createResultsTable();

    var textArea = document.getElementById('status_text_area');
    textArea.innerHTML = 'Calculating: ' + local_javascript_utilities.currentTimeAsString() + " ...";

    var lines = document.listOfLocations.inputList.value;

    local_javascript_utilities.logConsoleEvent(lines);

    my_lines = lines.split(/\n/); 

    my_lines = removeNewlines(my_lines);

    var n = my_lines.length;

    local_javascript_utilities.logConsoleEvent(n);

    local_javascript_utilities.logConsoleEvent(my_lines);

    local_javascript_utilities.logConsoleEvent("check n");

    if (n < 2) {
	alert('Need at least two addresses!');
	return;
    }

    // experiment with various strategies

    var directionsStrategy = new throttledDirectionsStrategy();
    
    directionsStrategy = new directDirectionsStrategy();

    directionsStrategy = new promiseDirectionsStrategy();

    directionsStrategy = new batchDirectionsStrategy();

    directionsStrategy.execute(my_lines);
}

    return {
	initialize: function() {initialize();},
	calcRoute: function() {calcRoute();},
    }

}); // end of define module
