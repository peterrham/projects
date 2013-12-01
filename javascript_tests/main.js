
console.log("foo bar main.js");
console.log("inside #2 main.js");

window.onload = function() {console.log("onload called");};

// require(["util", "module2", "gmaps_calc_route", "jquery_throttle_test_script"], 
// 	function(util, module2, gmaps_calc_route, jquery_throttle_test_script)

require(["gmaps_calc_route"], 
 	function(gmaps_calc_route)
{

    console.log("after setting the function");

    $(document).ready(function() {
	console.log("document ready called");

	gmaps_calc_route.initialize();

	$("#submit_button_name").click(function(){
	    gmaps_calc_route.calcRoute();
	});
});
});






