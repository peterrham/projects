
console.log("foo bar main.js");
console.log("inside #2 main.js");
window.onload = function() {console.log("onload called");};

requirejs.config({
//    enforceDefine: true,
    paths: {
//	google_maps: "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"
    },
    shim: {
	'moment': {
	    deps: [],
	    exports: 'Moment'
	},
	'google_maps': {
	    deps: [],
	    exports: 'Google_maps'
	}
    }
});

// require(["async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"], function(){});

require(["google_maps", "gmaps_calc_route"], 
 	function(google_maps, gmaps_calc_route)
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






