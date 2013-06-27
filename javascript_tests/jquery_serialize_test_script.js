
logConsoleEvent("jquery_serialize_test_script.js");			

var step1 = wrappedDeferred(2, "step1");
var step2 = wrappedDeferred(3, "step2");
var step3 = wrappedDeferred(3, "step3");

// executeSerially(step1, step2);

var theArray = [];

theArray.push(step1);

theArray.push(step2);

theArray.push(step3);

theArray.push(step3);

theArray.push(step3);

theArray.push(step3);

executeArraySerially(theArray);


