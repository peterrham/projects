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
