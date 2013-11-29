
console.log("foo bar main.js");
console.log("inside #2 main.js");

require(["util", "module2"], function(util, module2) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".
    
    console.log("shirt is " + util.color);

    console.log("team is " + module2.team);


});
