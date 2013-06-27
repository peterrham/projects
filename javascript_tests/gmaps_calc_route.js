
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

	    var label = new Label({
		map: map
            });
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

    // assumes only one leg
    var leg = result.routes[0].legs[0];

    var marker = new google.maps.Marker({
	map: map,
	position: leg.start_location
    });

    var label = new Label({
	map: map
    });
    
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

    // XXX This is tricky, combining deferred's and timeouts
    // The purpose of this is to throttle, but it probably won't if everything goes in parallel
    // but I guess that promises prevent that? Will I get a rush all at once if the timers
    // all expire at the same time? I will also be breaking the directions into segments
    // in order to call the api less times
    
    setTimeout(function() {

	directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
		logConsoleEvent("status == *OK*");
		logConsoleEvent("directionsService callback(): i == " + i.toString());
		drawDirectionsPolyline(i, totalLength, response);
		logConsoleEvent("after calling Polyline()");
	    } else {

		var summaryPanel = document.getElementById('directions_panel');
		summaryPanel.innerHTML += ("\n" + status);
		// + status;
		logConsoleEvent("status == *ERROR*");
		logConsoleEvent("status == " + status.toString());
	    }
	    dfd.resolve();
	})}, 2000);

    return dfd.promise();
}


// main function for this page

function 
calcRoute() 
{
    var summaryPanel = document.getElementById('directions_panel');

    summaryPanel.innerHTML = '... trying to calculate ...' + currentTimeAsString();

    var waypts = [];

    var lines = document.listOfLocations.inputList.value;

    //      alert(lines);

    my_lines = lines.split(/\n/); 

    // strip out the empty lines

    var old_mylines = my_lines;
    my_lines = [];

    for (var i in old_mylines) {
	var the_line = old_mylines[i];
	logConsoleEvent("*");
	logConsoleEvent(the_line)
	if (old_mylines[i].length > 0) {
	    my_lines.push(old_mylines[i]);
	}
	
    }

    var max_gmaps_waypoints = 9;

    var n = my_lines.length;

    // alert(n);

    //      alert(my_lines);
    if (n < 2) {
	alert('Need at least two addresses!');
    } else {


        var start = my_lines[0];
        var end = my_lines[n-1];

	var totalLength = my_lines.length;
	// XXX refactoring this function

	var useThrottledApproach = true;

	if (useThrottledApproach) {
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


	    for (var i = 0; i < (totalLength - 1); i++) {
		// I hope that we are capturing this close effectively, still worried about side-effects
		// does not look like much of a risk of side effects here
		// will i change for the function?
		var theFunc = createClosure(i, totalLength, my_lines[i], my_lines[i+1]);
		
		theFuncArray.push(theFunc);
	    }
	    
	    // This is the big function call ....

	    executeFunctionArrayAsynch(theFuncArray);

	    return;
	}

	var useDirectApproach = true;


	if (useDirectApproach){
	    logConsoleEvent("useDirectApproach");
	    for (var i = 0; i < (totalLength - 1); i++) {
		logConsoleEvent("directApproach(): i == " + i.toString());

                fireOffDirectionsRequest(i, totalLength, my_lines[i], my_lines[i+1]);

	    }
	    return;
	    
	}

	var usePromiseApproach = false;

	if (usePromiseApproach) {


	    
	    var pre_promise = null;
	    var next_promise = null;

	    for (var i = 0; i < (totalLength - 1); i++) {
		logConsoleEvent("calcRoute(): i == " + i.toString());

		if (pre_promise) {
		    // XXX PRH, this is were I'm worried about using promises incorrectly
	            next_promise = pre_promise.then(function() {
			newCalcRoutePromise(i, totalLength, my_lines[i], my_lines[i+1]);
		    });
                } else
		{
		    next_promise = newCalcRoutePromise(i, totalLength, my_lines[i], my_lines[i+1]);
	        }
		
		pre_promise = next_promise;
	    }
	    return;
	}

	
	var last_address_index = min(max_gmaps_waypoints, n - 1);

	for (var i in my_lines) {
	    //      alert(my_lines[i]);
	    if (i > 0 && i < max_gmaps_waypoints) {
		waypts.push({location:my_lines[i], stopover:true});
		logConsoleEvent(my_lines[i]);

	    }
	}

	if (waypts.length > max_gmaps_waypoints) {
	    summaryPanel.innerHTML = '<b>too many addresses, max is 9!... ' + '</b><br>';
	    summaryPanel.innerHTML += my_lines.length;
	    return;
	}
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

		if (true) drawDirectionsPolyline(response);

		if (false) directionsDisplay.setDirections(response);

		var route = response.routes[0];
		var summaryPanel = document.getElementById('directions_panel');
		summaryPanel.innerHTML = '';

		var totalMins = 0;
		// For each route, display summary information.
		for (var i = 0; i < route.legs.length; i++) {
		    var routeSegment = i + 1;

		    summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment + '</b><br>';
		    summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
		    summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
		    summaryPanel.innerHTML += route.legs[i].distance.text + '<br>';
		    summaryPanel.innerHTML += route.legs[i].duration.text + '<br>';
		    totalMins += route.legs[i].duration.value;
		}

		summaryPanel.innerHTML += 'Total minutes = ' + totalMins / 60 + '<br>';

	    } else {            

		var summaryPanel = document.getElementById('directions_panel');
		summaryPanel.innerHTML = '... directions failed! ....';
	    }
	}
			       );

    }
}
