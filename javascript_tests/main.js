
console.log("foo bar main.js");
console.log("inside #2 main.js");

window.onload = function() {console.log("onload called");};


require(["util", "module2", "gmaps_calc_route", "jquery_throttle_test_script"], function(util, module2, gmaps_calc_route, 
											 jquery_throttle_test_script) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".
    
    console.log("shirt is " + util.color);

    console.log("team is " + module2.team);

    console.log("after setting the function");

    $(document).ready(function() {
	console.log("document ready called");

	gmaps_calc_route.initialize();

	$("#submit_button_name").click(function(){
	    gmaps_calc_route.calcRoute();
	});
    });
});
