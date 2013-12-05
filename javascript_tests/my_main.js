
console.log("foo bar main.js");
console.log("inside #2 main.js");
window.onload = function() {console.log("onload called");};
console.log("after setting onload");

console.log("before: require()");
require(['jquery', 'loglevel', "gmaps_calc_route"], 
 	function(jquery, l, gmaps_calc_route)
{

    console.log("inside: require()");
    gmaps_calc_route.initialize();
    console.log("after initialize");

    l.setLevel("trace");
    l.setLevel("error");
    l.disableAll();
    l.enableAll();

    l.info("after setting the function");

    $(document).ready(function() {

	console.log("ready()");
	l.info("document ready called");

	gmaps_calc_route.initialize();

	$("#submit_button_name").click(function(){
	    gmaps_calc_route.calcRoute();
	});
    });

    console.log("after ready");
});

console.log("after: require()");





