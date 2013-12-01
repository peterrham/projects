
console.log("inside req_config_shim.js");

requirejs.config({
    shim: {
	'browser_global_script': {
	    deps: [],
	    exports: 'Browser_global_script'
	}
    }
});

/*
require(['shim_reference_module'], function(shim_reference_module) {
    console.log("from req_config_shim.js: global_variable = " + global_variable);
});
*/

console.log("from req_config_shim.js #1: typeof global_variable = " + (typeof global_variable));

require(['browser_global_script'], function(browser_global_script) {
    console.log("from req_config_shim.js: global_variable = " + global_variable);
});
