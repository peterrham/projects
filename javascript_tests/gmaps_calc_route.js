// XXX use a global variable to contain the polylines, delete it each try
// migrate to some application global object or something later
// let's see how this works

// XXX extending this to include markers which have the same setMap()
// method which is using a type of duck typing, since the prototypes
// of neither of these "classes" share that method, apparently.
// I still need to learn about javascript prototypes/classes


// define(['loglevel', 'jquery-1.11.1', "local_javascript_utilities"], function(ll, gmaps, jquery, l) {

// XXX removing the asynch definetely broke the above, also, this did not help improve this
// XXX testing with above 

define(['loglevel', 'async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false', 'jquery-1.11.1', "local_javascript_utilities"], function(ll, gmaps, jquery, l) {

    ll.info("gmaps_calc_route");

    // XXX I'm not sure of the best way to define a module local
    // variable, either make this module in inside an immediate
    // function, or else perhaps just like this, or maybe there's a
    // provision for it in the requirejs module definition

    var moduleContext = {
	polylineArray: [], 
    };

    moduleContext.addPolyline = function (aPolyline) {
	this.polylineArray.push(aPolyline);
    };

    moduleContext.cleanupPolylines = function () {

	ll.info("cleanupPolylines()");

	var polyline; 

	for (var i = 0, len = this.polylineArray.length; i < len; i++) {
	    polyline = this.polylineArray[i];
	    polyline.setMap(null);
	}

	this.polylineArray = [];
    };
    
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


    function addToPolyLineArray(x)
    {
	gPolylineArray.push(x);
    }

    function
    cleanUpPolylineArray()
    {
	var polyline; 

	for (var i = 0, len = gPolylineArray.length; i < len; i++) {
	    polyline = gPolylineArray[i];
	    polyline.setMap(null);
	}

	gPolylineArray = new Array();
    }

    function zoomToBoundingBox()
    {

	ll.info("zoomToBoundingBox(): called");
	
	var polyline; 

	var bounds = new google.maps.LatLngBounds();

	// XXX reaching into an object's context with a public member access, ok style?
	for (var i = 0, len = moduleContext.polylineArray.length; i < len; i++) {
	    ll.info("zoomToBoundingBox(): i == " + i);
	    console.log(5);
	    polyline = moduleContext.polylineArray[i];
	    ll.info("zoomToBoundingBox(): polyline == " + polyline);

	    // XXX to much logging here, find a way to be more systematic about logging
	    console.log(polyline.constructor);
	    console.log(polyline.constructor.name);
	    console.log(polyline);
	    console.dir(polyline);

	    polyline.getPath().forEach(function(e){
		bounds.extend(e);
	    })
	}

	map.fitBounds(bounds);

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
	    'font-size: 15px;';
	
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

    var directionDisplay;
    var directionsService = new google.maps.DirectionsService();
    var map;


    // XXX this function is somewhat redundant with non-promise way of geocoding, duplicated code


    function
    noGeolocation()
    {
	ll.info("noGeolocation(): called");
	// XXX may want to comment this out and not raise an alert and use a default location like 0,0 (west of africa) or middle of the us
	alert("Your browser does not report your current location.");
    }

    function currentLocationPromise()
    {
	var dfd = $.Deferred();

	if (navigator.geolocation) {
	    ll.info("geolocation:YES");

	    navigator.geolocation.getCurrentPosition(
		function(position) {
		    ll.info("currentLocationPromise(): got it!");
		    var currentLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		    map.setCenter(currentLocation);
		    alert("Geolocation service succeeded.");
		}, 
		noGeolocation
	    );

	} else{
	    ll.info("geolocation:NO");
	}

    }

    function createMarkerWithLabel(map, position, labelText) 
    {
	createMarkerWithLabelImage(map, position, "largeTDBlueIcons/blank.png", labelText);
    }

    function createMarkerWithNumber(map, position, num)
    {
	createMarkerWithLabelImage(map, position, "largeTDBlueIcons/marker" + num + ".png", "");
    }

    function createMarkerWithLabelImage(map, position, markerImageURL, labelText)
    {
    	var marker = new google.maps.Marker({
	    map: map,
	    position: position,
//	    draggable:true
	    });
	

	var pinIcon = new google.maps.MarkerImage(
//	    "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00",
//	    "http://maps.google.com/mapfiles/marker.png",
//	    "largeTDBlueIcons/marker" + labelText + ".png",
//	    "https://maps.gstatic.com/mapfiles/markers2/marker_greenA.png", 
//	    "https://maps.gstatic.com/mapfiles/markers2/marker_green1.png", 
	    markerImageURL,
	    null, /* size is determined at runtime */
	    null, /* origin is 0,0 */
	    null, /* anchor is bottom center of the scaled image */
//	    new google.maps.Size(20,34)
	    null
	);  

	marker.setIcon(pinIcon);

	var label = new Label({
	    map: map
	});

	// XXX need to change the name and use of global variable
	addToPolyLineArray(marker);

	label.bindTo('position', marker, 'position');
	label.set('zIndex', 1234);
	label.set('text', labelText);

	// XXX is there a better way to clear this
	addToPolyLineArray(label);
    }

    function geocodePromise(geocoder, address){
	ll.info("geocodePromise()");

	var dfd = $.Deferred();
	
	geocoder.geocode( { 'address': address}, function(results, status) {

	    ll.info("before calling resolve");

	    if (status == google.maps.GeocoderStatus.OK) {

		var theLocation = results[0].geometry.location;

		ll.info("theLocation = " + theLocation);

		dfd.resolve(theLocation);
	    } else {
		alert("Geocode was not successful for the following reason: " + status);
	    }
	});

	return dfd.promise();
    }

    // XXX Global variables?
    var directionsDisplay;

    function createMapWithCenterAt(center)
    {

	directionsDisplay = new google.maps.DirectionsRenderer();

	var mapOptions = {
	    zoom: 11,
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    center: center,
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

    }

    function createMapWithCenterAtDefaultLocation() {

	var chicago = new google.maps.LatLng(41.850033, -87.6500523);
	
	createMapWithCenterAt(chicago);
    }

    // XXX this makes an asynchronous call to getCurrentPosition, so I
    // need a promise, especially in the case where takes a long time
    // to approve the geocode reading manually while the rest of the
    // script completes do I need to find a way to wrap a generic
    // function into a promise

    function asynchCenterMap() {
	ll.info("asynchCenterMap()");
	var dfd = $.Deferred();

	if (navigator.geolocation) {
	    ll.info("geolocation:YES");

	    // XXX I want to do this via promises I think in the future
	    navigator.geolocation.getCurrentPosition(
		function(position) {
		    ll.info("got the browser geo code location!");
		    
		    var currentLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

		    createMapWithCenterAt(currentLocation);
		    dfd.resolve();
		}, 
		// XXX should this function have an argument list? What is passed by default? Would there be an error if something was?
		function() {
		    ll.info("arguments = " + arguments);
		    var objects = arguments;
		    
		    ll.info("objects.length = " + objects.length);
		    ll.info("objects[0] = " + objects[0]);
		    ll.info("objects[0].message = " + objects[0].message);
		    noGeolocation();
		    createMapWithCenterAtDefaultLocation();
		    dfd.resolve();
		    }
	    );

	} else{
	    ll.info("geolocation:NO");
	    // XXX some code redundancy here with above, can promises help with this logic?
	    createMapWithCenterAtDefaultLocation();
	    dfd.resolve();
	}

	return dfd.promise();

    }

    function testDeferred()

    {
	// XXX the use of promises below are experiments and not necessary for the execution of this program, need to clean these up
	// into an experimental section that is optionally run, or some test framework code

	// here's an alternative way to use promises, that is more in parallel

	geocodePromise(geocoder, mom).done(
	    function(x)  {
		ll.info('in parallel mom is done!');
		ll.info('mom is ' + x);
		momLocation = x;
	    });

	geocodePromise(geocoder, home).done(
	    function(x)  {
		ll.info('in parallel home is done!');
		ll.info('home is ' + x);
		homeLocation = x;
	    });

	$.when(geocodePromise(geocoder, mom), geocodePromise(geocoder, home))
	    .then(function (result){
		// XXX for some reason the "mom" results is returned and not the home results
		// first one is returned as the return value?
		ll.info('in parallel using when: using promises "then" result = ' + result);
	    });

	var deferreds = [];

	deferreds.push(geocodePromise(geocoder, mom));
	deferreds.push(geocodePromise(geocoder, home));

	$.when.apply($, deferreds)
	    .then(function (){
		var objects = arguments;
		ll.info('in parallel: objects = ' + objects);
		ll.info('in parallel: objects[0] = ' + objects[0]);
		ll.info('in parallel: objects[1] = ' + objects[1]);
	    });

	// using multiple deferred's without the apply
	deferreds.push(geocodePromise(geocoder, mom));
	deferreds.push(geocodePromise(geocoder, home));

	// let's try this in parallel
	$.when(geocodePromise(geocoder, mom), geocodePromise(geocoder, home), geocodePromise(geocoder, home))
	    .then(function (mom, home, homeAgain){
		var objects = arguments;
		ll.info('without apply: mom = ' + mom);
		ll.info('without apply: home = ' + home);
		ll.info('without apply: homeAgain = ' + homeAgain);
	    });
    }
    
    function initialize() {
	ll.info("initialize():");

	// XXX I want to find a way to create a deferred with and
	// immediate function, see if it can be more elegant than
	// creating a named function

	asynchCenterMap().then(
	    function() {
		ll.info("inside center map callback()");

		var geocoder = new google.maps.Geocoder();

		var home = "4717 89th Avenue, SE, Mercer Island, WA 98040";

		var mom = "419 State Street, Johnstown, PA 15905";

		var momLocation;
		var homeLocation;
		// XXX I'm glad that I have succeeded at least partially using promises, but 
		// this could be better. I have not figured promises out fully yet

		geocodePromise(geocoder, mom)
		    .then(function (result) {
			momLocation = result; 
			ll.info("momLocation = " + momLocation);
			createMarkerWithLabel(map, momLocation, mom);

			return geocodePromise(geocoder, home);})
		    .then(function (result) { 
			homeLocation = result;
			ll.info("homeLocation = " + homeLocation);
			createMarkerWithLabel(map, homeLocation, home);
		    });

		var testPromises = false;

		if (testPromises) {
		    testDeferred();
		}
	    });
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
	ll.info("dumpDirectionsResponse()");
	ll.info("my object: %o", response);

	var routes=response.routes.length;
	var legs;
	var steps;
	var paths;
	var path;

	var n=0;
	for (var i=0;i<routes;i++){
	    legs=response.routes[i].legs.length;
	    for (var j=0;j<legs;j++){
		steps=response.routes[i].legs[j].steps.length;
		for(var k=0;k<steps;k++){
		    paths=response.routes[i].legs[j].steps[k].path.length;
		    for(var m=0;m<paths;m++){
			path = response.routes[i].legs[j].steps[k].path[m];
			ll.info("path: %o", path);
			ll.info("path as string: %s", path.toString());
		    }
		}
	    }
	}
    }

// XXX PRH, how can I draw the lines in progressive color spectrum, or perhaps line width:
/*

http://www.livephysics.com/physical-constants/optics-pc/wavelength-colors/

Approximate wavelength For the various colors

Color	Wavelength (nm)
Red	780 - 622
Red	780 - 622
Orange	622 - 597
Yellow	597 - 577
Green	577 - 492
Blue	492 - 455
Violet	455 - 390

1 Angstrom = 10-10 meters. 
*/
    // XXX this is a key function and it's meaning has changed, not sure how many legs it is handling
    // this is the next place to work
    function
    drawDirectionsPolyline(i, n, result)
    {

	var hue = 360 * (i/n);
	var hueStr = 'hsl(' + hue + ',100%,50%)';

	var polyline = new google.maps.Polyline({
	    path: [],
	    // blue
//XXX PRH	    strokeColor: '#0000FF',

	    // red
	    strokeColor: '#FF0000',
	    strokeColor: hueStr,
	    strokeWeight: 2 // 5 was too thick
	});

	if (!result) {
	    ll.info("result is *NULL*");
	    return;
	}

	if (result.routes != null) {
	} else {
	    ll.info("routes is *NULL*");
	    return;
	}

	// assumes only one route
	var path = result.routes[0].overview_path;
	
	$(path).each(function(index, item) {
	    polyline.getPath().push(item);
	});

	polyline.setMap(map);

	// the new way using a module object and segregating the
	// different type of overlays to their own array in the module
	moduleContext.addPolyline(polyline);

	// XXX, before, assumes only one leg
//	var leg = result.routes[0].legs[0];
	
	// iterate over the legs
	var legs = result.routes[0].legs;

	$(legs).each(function(index, leg) {
	    createMarkerWithNumber(map, leg.start_location, index + 1);
	});

	createMarkerWithNumber(map, legs[legs.length-1].end_location, legs.length + 1);

    }

    function
    newCalcRoutePromise(i, totalLength, startLocation, endLocation)
    {
	var dfd = $.Deferred();

	ll.info("newCalcRoutePromise(): startLocation == " + startLocation);

	ll.info("newCalcRoutePromise(): endLocation == " + endLocation);

	if (startLocation === undefined) {
	    ll.info("startLocation undefined");
	    return;

	}

	if (endLocation === undefined) {
	    ll.info("endLocation undefined");
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
		    ll.info("status == *OK*");
		    ll.info("directionsService callback(): i == " + i.toString());
		    drawDirectionsPolyline(i, totalLength, response);
		    ll.info("after calling Polyline()");
		} else {
		    clearSummaryPanel();
		    appendToSummaryPanel('<br>' + status);

		    ll.info("status == *ERROR*");
		    ll.info("status == " + status.toString());
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

	    ll.info("usePromiseApproach");

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

	ll.info("sumDirectionsDuration");

	$.each(response.routes, function(index, value) {
	    ll.info("route = " + index);

	    $.each(value.legs, function(index, value) {
		ll.info("leg = " + index);
		
		totalSeconds += value.duration.value;
	    });
	});

	ll.info("totalSeconds == " + totalSeconds);

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

	ll.info("totalDistance == " + totalDistance);

	return totalDistance;
    }

    // XXX this is a module level variable, should it have a prefix in
    // a standard javascript coding convention? certainly it is
    // private in scope

    var resultsTableConfig =  {
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
	    ll.info("index = " + index);
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
	    ll.info("index = " + index);
	    cell = row.insertCell(index);
	    cell.innerHTML = tableDescriptor.columnDefinitions[index];
	});    
    }

    function
    createResultsTable()
    {
	$("#results_table").html("");

	addTableHeader(resultsTableConfig);
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

		ll.info("got directionsResponse");

		ll.info("batchElement = " + batchElement);
		ll.info(batchElement);
		ll.info(batchElement.batch);
		ll.info(batchElement.start);
		ll.info(batchElement.end);
		
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

	ll.info("result == " + result);

	return dfd.promise();
    }

    function
    batchDirectionsStrategy()
    {
	this.execute = 
	    function(my_lines) 
	{
	    ll.info("use batchDirectionsStrategy");

	    var max_gmaps_waypoints = 8;

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

	    ll.info("quotient = " + quotient);
	    
	    var remainder = n % y;

	    ll.info("remainder = " + remainder);

	    var lim;

	    if (remainder == 0) {
		lim = quotient;
	    } else {
		lim = quotient + 1;
	    }

	    ll.info("lim = " + lim);
	    
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
		    ll.info(my_lines[i]);
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
		    ll.info("one request finished");
		});
	    }
	    
	    $.when.apply($, deferredArray).then(function() {
		ll.info("all the deferreds have completed");
		ll.info("batch.length == " + batch.length);

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
		    addRowToTable(index + 1, resultsTableConfig, rowHash);

		    // add the last stop
		    if (index == (legs.length - 1)) {
			rowHash = {};
			rowHash["#"] = index + 2;
			rowHash["address"] = leg.end_address;
			addRowToTable(index + 2, resultsTableConfig, rowHash);		    
		    }
		});
		
		ll.info("number of legs = " + legs.length);

		
		// iterate over the batch and sum the total time first
		var totalSeconds = 0;
		var totalDistance = 0; // in meters

		$.each(batch, function(index, batchElement) {
		    totalSeconds += sumDirectionsDuration(batchElement.response);
		    totalDistance += sumDirectionsDistance(batchElement.response);
		});

		ll.info("totalSeconds (total) = " + totalSeconds);
		ll.info("totalDistance (total) = " + totalDistance);

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
		    
		    ll.info("nElements == " + nElements);

		    $.each(batch, function(index, batchElement) {
			var response = batchElement.response;
			var numRoutes = response.routes.length;
			var numLegs = response.routes[0].legs.length;

			ll.info("index == " + index);
			ll.info("numRoutes == " + numRoutes);
			ll.info("numLegs == " + numLegs);

			i += displayDirectionsResult(i, batchElement.response);

			// this is the last element in the batch

			if (index == nElements - 1) {


			    addAddressToPanel(i + 1, response.routes[0].legs[numLegs - 1].end_address);
			}
		    });

		    ll.info("at the end of the batch");
		    // try to zoom to the bounding box of all the lines, first try is to zoom to anything
		    zoomToBoundingBox();
		})
		();
		// end of iterating over the batch

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

	    ll.info("useDirectApproach");
	    
	    for (var i = 0; i < (n - 1); i++) {
		ll.info("directApproach(): i == " + i.toString());

		l.fireOffDirectionsRequest(i, n, my_lines[i], my_lines[i+1]);

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

	    ll.info("usingThrottledApproach");

	    // create an array of functions to call asynch

	    var theFuncArray = new Array();

	    function
	    createClosure(i, totalLength, src, dst)
	    {
		return function() {
		    l.fireOffDirectionsRequest(i, totalLength, src, dst);
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


    // XXX I'm not sure if this function calculates multiple legs or
    // just a single leg, seems like a single leg, but I'm not sure

    function 
    calcRoute() 
    {
	ll.info("inside calcRoute()");

	// XXX, not sure if I should be cleaning up the array or not and how to do so
	cleanUpPolylineArray();

	moduleContext.cleanupPolylines();

	clearSummaryPanel();

	createResultsTable();

	var textArea = $("#status_text_area");

	textArea.text('Calculating: ' + l.currentTimeAsString() + " ...");

	var inputList = $("#inputList");

	var lines = inputList.val();

	ll.info("after lines");

	ll.info(lines);

	var my_lines = lines.split(/\n/); 

	my_lines = removeNewlines(my_lines);

	var n = my_lines.length;

	ll.info(n);

	ll.info(my_lines);

	ll.info("check n");

	if (n < 2) {
	    alert('Need at least two addresses!');
	    return;
	}

	// experiment with various strategies
	// XXX factoring out the strategy can be configured another way?, It's wasteful to create a direction strategy and not use it
	
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
