
    if (false) {

	logConsoleEvent("throttle(): before");

	function
	a()
	{
	    logConsoleEvent("a()");
	}

	function
	b()
	{
	    logConsoleEvent("b()");
	}

	var theArray = [];

	theArray.push(a);

	theArray.push(b);

	throttle(theArray,3);

	logConsoleEvent("throttle(): after");

    }

// testing a simpler throttle which takes a single function and "throttles" it, meaning reruns it at a maximum rate


// it will be called once every second and not once every iteration. In native JS it would look like:

var i = null;
function throttle(func, delay){
    if (i) {
	window.clearTimeout(i);
    }
    i = window.setTimeout(func, delay)
}

/*
  if (false) {
  ar a = _.throttle(function(){console.log('called')}, 1000);
  while(true) {
  a();
  }
  }
*/

if (false ) {

    var timer = 0;

    function throttle_b(func, delay) {

	console.log("in thottle_b()");
	return function() {
	    console.log("in the function");
            var context = this,
            args = [].slice.call(arguments);

            clearTimeout(timer);
            timer = setTimeout(function() {
		console.log("in sub_function");
		func.apply(context, args);
            }, delay);
	};
    }


    console.log('before throtte_b()');

    the_func = throttle_b(function(){console.log('called')}, 2000);
    console.log('after throtte_b()');

    for (i = 0; i<10; i++) {
	// console.log('in the loop');
	the_func();
    }
}

// XXX is "setInterval()" standard? It certainly works in Chrome, but
// I have never heard of it before

// this test sets up a repeating function, not sure if it's a true
// closure, since I'm not sure about the scope of the variable x,
// global or local?

if (false) {
    var x = 0;


    var theInterval = 
	setInterval(function() {console.log("repeating ..." + x++)}, 1000);

}

// test to terminate an interval after a certain number of iterations
// works
if (false) {
    
    var x = 0;
    
    var theInterval = 
	setInterval(function() 
		    {
			if (x < 10) {
			console.log("repeating ..." + x++);
			}
			else {
			    console.log("stopping");
			    window.clearInterval(theInterval);
			}
		    },
		    1000);
}

// next step is to write a function that executes another function ten times and then stops

if (false) {

function
f()
{
    console.log("inside f()");
}    
    f();

function
tenTimes(theFunction)
{
    for (var i = 0; i < 10; i++) {
    theFunction();
    }
}

    tenTimes(f);
}


// next step is to write a function that executes another function ten times and then stops

function
f()
{
    console.log("inside f()");
}

if (false) {

    f();

function
tenTimesTimer(theFunction)
{

    var x = 0;
    
    var theInterval = 
	setInterval(function() 
		    {
			if (x < 10) {
			console.log("repeating ..." + x++);
			    theFunction();
			}
			else {
			    console.log("stopping");
			    window.clearInterval(theInterval);
			}
		    },
		    1000);

}

    tenTimesTimer(f);
}

// works
//
function
nTimesTimer(nTimes, nMilliseconds, theFunction)
{
    var x = 0;
    
    var theInterval = 
	setInterval(function() 
		    {
			if (x < nTimes) {
			console.log("repeating ..." + x++);
			    theFunction();
			}
			else {
			    console.log("stopping");
			    window.clearInterval(theInterval);
			}
		    },
		    nMilliseconds);

}

if (false) {
    nTimesTimer(5, 2000, f);
}

function
executeFunctionArray(arr)
{

    $.each(arr, function (index, value) {
	console.log("in array, before calling value()");
	value();
    });
}

function
executeFunctionArrayAsynch(arr)
{
    console.log("inside: executeFunctionArrayAsync");
    
    // this is not actually making a copy of the array, so it will mutate it ...
    // making this a new variable for clarity and in case I'm wrong ...

    var closureArray = arr;

    var timeOutObj = window.setTimeout(function () {
	if (closureArray.length == 0) {
	    console.log("array is now empty, doing nothing");
	}
	else {
	    console.log("array is not empty, shifting the array");
	    var theFuncToCall = closureArray.shift();
	    
	    theFuncToCall();

	    executeFunctionArrayAsynch(closureArray);
	}
    }, 
				       1000);

    console.log("at end of executeFunctionArrayAsynch()");


}

// how do I take a list of functions and execute them in between a timer

if (true) {

    var functionArray = new Array();

    function
    f1()
    {
	console.log("inside nested f1()");
    }

    function
    f2()
    {
	console.log("inside nested f2()");
    }
    
    functionArray[0] = f1;
    functionArray[1] = f2;

    // this is calling an array of functions synchronously
    executeFunctionArray(functionArray);

    var emptyArray = new Array();

    // how do I can any array of functions *A*synchronously
    if (false) {
	executeFunctionArrayAsynch(emptyArray);
    }
    if (true) {
	executeFunctionArrayAsynch(functionArray);
    }
}


