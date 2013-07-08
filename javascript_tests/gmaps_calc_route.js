
// XXX use a global variable to contain the polylines, delete it each try
// migrate to some application global object or something later
// let's see how this works

// XXX extending this to include markers which have the same setMap()
// method which is using a type of duck typing, since the prototypes
// of neither of these "classes" share that method, apparently.
// I still need to learn about javascript prototypes/classes

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

    logConsoleEvent("noGeolocation(): called");
    handleNoGeolocation(browserSupportFlag);
}

function currentLocationPromise()
{
    var dfd = $.Deferred();

    if (navigator.geolocation) {
        logConsoleEvent("geolocation:YES");

	navigator.geolocation.getCurrentPosition(
	    function(position) {
		logConsoleEvent("currentLocationPromise(): got it!");
		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		map.setCenter(initialLocation);
	    }, 
	    noGeolocation
	);

    } else{
        logConsoleEvent("geolocation:NO");
    }

}

function geocodePromise(address){
    logConsoleEvent("geocodePromise()");

    var dfd = $.Deferred();
    
    geocoder.geocode( { 'address': address}, function(results, status) {

	logConsoleEvent("before calling resolve");

	
	if (status == google.maps.GeocoderStatus.OK) {

	    theLocation = results[0].geometry.location;


	    logConsoleEvent("location = " + theLocation);

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

    logConsoleEvent("codeAddress()");

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
    
    logConsoleEvent("initialize():");

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
        logConsoleEvent("geolocation:YES");

	navigator.geolocation.getCurrentPosition(
	    function(position) {
		logConsoleEvent("got the browser geo code location!");
		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		map.setCenter(initialLocation);
	    }, 
	    noGeolocation
	);

    } else{
        logConsoleEvent("geolocation:NO");
    }

    codeAddress();

    var home = "4717 89th Avenue, SE, Mercer Island, WA 98040";

    var mom = "419 State Street, Johnstown, PA 15905";

    /*
      geocodePromise(mom).done(
      function(x)  {
      logConsoleEvent('mm is done!');
      logConsoleEvent('mom is ' + x);
      momLocation = x;
      }
      );

      geocodePromise(home).done(
      function(x)  {
      logConsoleEvent('home is done!');
      logConsoleEvent('home is ' + x);
      homeLocation = x;
      }
      );

      $.when(geocodePromise(mom), geocodePromise(home))
      .then(function (result){
      logConsoleEvent('result = ' + result);
      });
    */

    geocodePromise(mom)
	.then(function (result) { momLocation = result; return geocodePromise(home);})
	.then(function (result) { homeLocation = result; return geocodePromise(mom);})
	.then(function (result) { 
	    logConsoleEvent("momLocation = " + momLocation);
	    logConsoleEvent("homeLocation = " + homeLocation);});
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
    logConsoleEvent("dumpDirectionsResponse()");
    logConsoleEvent("my object: %o", response);

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
		    logConsoleEvent("path: %o", path);
		    logConsoleEvent("path as string: %s", path.toString());
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
	logConsoleEvent("result is *NULL*");
	return;
    }

    if (result.routes != null) {
    } else {
	logConsoleEvent("routes is *NULL*");
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
	logConsoleEvent("last one");
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

    logConsoleEvent("newCalcRoutePromise(): startLocation == " + startLocation);

    logConsoleEvent("newCalcRoutePromise(): endLocation == " + endLocation);

    if (startLocation === undefined) {
	logConsoleEvent("startLocation undefined");
	return;

    }

    if (endLocation === undefined) {
	logConsoleEvent("endLocation undefined");
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
		logConsoleEvent("status == *OK*");
		logConsoleEvent("directionsService callback(): i == " + i.toString());
		drawDirectionsPolyline(i, totalLength, response);
		logConsoleEvent("after calling Polyline()");
	    } else {
		clearSummaryPanel();
		appendToSummaryPanel('<br>' + status);

		logConsoleEvent("status == *ERROR*");
		logConsoleEvent("status == " + status.toString());
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

	logConsoleEvent("usePromiseApproach");

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
makeDirectionsRequest(start, end, waypts)
{
    var request = {
        origin: start,
        destination: end,
        waypoints: waypts,
        optimizeWaypoints: false,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {

	    if (false) dumpDirectionsResponse(response);

	    // XXX PRH, this is not quite correct, the function
	    // draws only one segment

	    if (true) drawDirectionsPolyline(0, waypts.length + 1, response);

	    if (false) directionsDisplay.setDirections(response);

	    var route = response.routes[0];

	    var totalMins = 0;
	    // For each route, display summary information.

	    for (var i = 0; i < route.legs.length; i++) {
		var routeSegment = i + 1;

		appendToSummaryPanel('<b>Route Segment: ' + routeSegment + '</b><br>');
		appendToSummaryPanel(route.legs[i].start_address + ' to ');
		appendToSummaryPanel(route.legs[i].end_address + '<br>');
		appendToSummaryPanel(route.legs[i].distance.text + '<br>');
		appendToSummaryPanel(route.legs[i].duration.text + '<br>');
		totalMins += route.legs[i].duration.value;
	    }

	    appendToSummaryPanel('Total minutes = ' + totalMins / 60 + '<br>');

	} else {            
	    appendToSummaryPanel('... directions failed! ....');
	}
    });
}

function
batchDirectionsStrategy()
{
    this.execute = 
	function(my_lines) 
    {
	var max_gmaps_waypoints = 8;

	logConsoleEvent("use batchDirectionsStrategy");

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

	logConsoleEvent("quotient = " + quotient);
	
	var remainder = n % y;

	logConsoleEvent("remainder = " + remainder);

	var lim;

	if (remainder == 0) {
	    lim = quotient;
	} else {
	    lim = quotient + 1;
	}

	logConsoleEvent("lim = " + lim);
	
	var start_index;
	var end_index;
	
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
		logConsoleEvent(my_lines[i]);
		waypts.push({location:my_lines[i], stopover:true});
	    }

	    makeDirectionsRequest(start, end, waypts);
	}   
    }
}

function
directDirectionsStrategy()
{
    this.execute = 
	function(my_lines) 
    {
	var n = my_lines.length;

	logConsoleEvent("useDirectApproach");
	
	for (var i = 0; i < (n - 1); i++) {
	    logConsoleEvent("directApproach(): i == " + i.toString());

            fireOffDirectionsRequest(i, n, my_lines[i], my_lines[i+1]);

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
		fireOffDirectionsRequest(i, totalLength, src, dst);
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
    cleanUpPolylineArray();

    clearSummaryPanel();

    appendToSummaryPanel('... trying to calculate ...' + currentTimeAsString());
    appendToSummaryPanel('<br>');

    var lines = document.listOfLocations.inputList.value;

    logConsoleEvent(lines);

    my_lines = lines.split(/\n/); 

    my_lines = removeNewlines(my_lines);

    var n = my_lines.length;

    logConsoleEvent(n);

    logConsoleEvent(my_lines);

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

