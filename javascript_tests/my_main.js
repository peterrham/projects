
console.log("my_main.js");

window.onload = function() {console.log("onload called");};

console.log("after setting onload");

console.log("before: require()");
require(['local_javascript_utilities', 'jquery-1.11.0-pre', 'loglevel', "gmaps_calc_route"], 
 	function(lj, jquery, l, gmaps_calc_route)
{
   	l.setLevel("trace");
    l.setLevel("error");
    l.disableAll();
    l.enableAll();
    l.setLevel("debug");

    l.info(lj.currentTimeAsString()+":inside: require()");

    l.info("after setting the function");

    $(document).ready(function() {

	l.info("ready()");
	l.info("document ready called");

	gmaps_calc_route.initialize();

	$("#submit_button_name").click(function(){
	    gmaps_calc_route.calcRoute();
	});
    });

    l.info("after ready");
});

console.log("after: require()");





