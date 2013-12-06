
// Script acts as a test runner for other javascript tests just need
// to change one line in this file to run a different test

// 		     ../../projects/extracts/log4javascript-1.4.6/log4javascript_uncompressed.js

	if (true) {

	    requirejs.config({
		paths: {
		    log4javascript: '/github/projects/extracts/log4javascript-1.4.6/log4javascript_uncompressed',
		},
		shim: {
		    'log4javascript': {
			exports: 'log4javascript',
			init: function() {
			    log4javascript.setDocumentReady();
			}
		    }
		}
	    });

	    require(['log4javascript'],
 		    function(l)
		    {
			// I cannot get the filename and line number
			// and especially a link to it from the
			// console.log function in google chrome, so I
			// will stick with loglevel for now

			if (false) {
			console.log("inside require();");
			//Initialize logger
			var logger = log4javascript.getDefaultLogger();
			logger.setLevel(log4javascript.Level.INFO);         

			logger.info('Test test');
			}

			var logger2 = new log4javascript.getLogger("JSLOG");
			var appender = new log4javascript.BrowserConsoleAppender(logger, false);
			    var popUpLayout = new log4javascript.PatternLayout("%d{HH:mm:ss} %rms %-5p - %m%n");

			appender.setLayout(popUpLayout);
			logger2.addAppender(appender);

			logger2.setLevel(log4javascript.Level.INFO); 
			for (var i = 0; i < 100; i++) {

			logger2.info("log4javascript test");
			    }
		    });
	} else {
	    require(['loglevel'], 
 		    function(l)
		    {
			l.enableAll();

			l.info("require_test_main.js: enter");
		    });
	}
