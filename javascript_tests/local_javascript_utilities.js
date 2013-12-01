define(function() {

// this function is just for testing, it is not currently used

function
testFunction()
{

}

function
currentTimeAsString()
{
    return moment().format('h:mm:ss.SS a');
}

function
logConsoleEvent(str)
{
    var theDate = new Date();

    console.log(currentTimeAsString() + ": " + str);
}

function 
deferredTimeout(theSeconds, theStr) 
{
    var dfd = $.Deferred();
    
    setTimeout(function() {
	logConsoleEvent(theStr);
	dfd.resolve();
    },
	       theSeconds * 1000);

    return dfd.promise();
}

function
wrappedDeferred(seconds, theStr)
{
    return function () {
	return deferredTimeout(seconds, theStr);
    };
} 

function
executeSerially(wrappedDeferred0, wrappedDeferred1)
{
    return wrappedDeferred0().then(wrappedDeferred1);
}

function
executeArraySerially(wrappedDeferreds)
{

    var first = true;
    var prev_deferred;

    for (var i = 0; i < wrappedDeferreds.length; i++) {
	wrapper = wrappedDeferreds[i];

	if (i == 0) {
	    prev_deferred = wrapper();
	    first = false;
	} else
	    {
		prev_deferred = prev_deferred.then(wrapper);
	    }
    } 
    
}

function
throttle(functions, secondsBetween)
{
    logConsoleEvent("throttle(): secondsBetween == " + secondsBetween.toString());

/*    // create the wrapped deferreds

    f = functions[0];

    theDeferred = function () { 

	var dfd = $.Defered();
	
	setTimeout(
	    function() {
		f();
		dfd.resolve();
	    },
	    secondsBetween);

    };
*/
    // execute them serially
}

function 
throttleList(listofFunctions)
{
    // in javascript, how do I get the head of a list

    // call the first function

    // when that function completes

    // if it succeeds, 

    // if there are any functions left, then call throttle on the popped list of the queue
    
    // if it fails the queue up a timeout call back, eventually with exponential backup timeout value

    
}
 
// XXX putting some map utilities here, probably should be moved to a map utilities javascript
// not yet sure how to organize javascript code so that it is modular

function
directionsHandler(response, status, i, totalLength)
{
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
}

function
fireOffDirectionsRequest(i, totalLength, startLocation, endLocation)
{
    var request = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    /*
      this approach is necessary to "capture" the scope of the local
    variables i and totalLength, is there a way to make this more
    modular or object oriented?  in the handler call, is there a
    better way to do this?
    */

    directionsService.route
    (request, 
     function(response, status) {
	 directionsHandler(response, status, i);
     }
    );
}
    return {currentTimeAsString: currentTimeAsString,
	   logConsoleEvent: logConsoleEvent,
	   fireOffDirectionsRequest: fireOffDirectionsRequest};
});
