(function(){

	const {changedFunctions} = require("./modifiedAPIs/canvas");
	const {screenHandler} = require("./modifiedAPIs/screen");
	const {whiteListHandler} = require("./modifiedAPIs/whitelist");

	var utils = require('./Utils'),
		undef,
		wlInjectStates = { 
			'canvas': false,
			'plugins': false,
			'hideCores': false,
			'screen': false,
			'winName': false,
			'limitTab': false,
			'date':false 
		};

	exports.intercept = function intercept({subject: window},frameOptions){
		
		var url = window.document.location.href;
	
		//check if url is in whitelist and 
		//which script Injection options are to be whitelisted
		
		// use the whitelist profile if site is in whitelist and
		// whitelist is enabled and
		// the default profile is not selected

		if( utils.listCheck(url, wlInjectStates) == true)
			whiteListHandler(window);
		
		else{
			// url is not whitelisted and profile is not default 
			// so we spoof vendor as usual
			utils.defineProp(window,"Navigator","vendor",frameOptions.vendor);
		}
	

		if(wlInjectStates.canvas == false)
			canvasHandler(window,frameOptions.canvas);
		
		// blank out product sub property
		utils.defineProp(window,"Navigator","productSub","");
		
		if(frameOptions.hideCores && wlInjectStates.hideCores == false)
			utils.defineProp(window,"Navigator","hardwareConcurrency","");
		
		if(frameOptions.plugins && wlInjectStates.plugins == false)
			utils.defineProp(window,"Navigator","plugins","");
			
		if(frameOptions.limitTab && wlInjectStates.limitTab == false)
			utils.defineProp(window,"History","length","2");

		if(wlInjectStates.screen == false)
			screenHandler(window);
		
		if (frameOptions.winName && wlInjectStates.winName == false)
			window.name = "";
		
	}
	
	

	function canvasHandler(window,state){
		
		var apiNames = Object.keys(changedFunctions);
	
		apiNames.forEach (function(name){
			var changedFunction = changedFunctions[name];
			var original = window.wrappedJSObject[changedFunction.object].prototype[name];

			
			Object.defineProperty(
				window.wrappedJSObject[changedFunction.object].prototype,
				name,
				{
					enumerable: true,
					configureable: false,
					get: function(){
						if (!window.location.href){
							return undef;
						}

						if(state == false)
							return original;
					//	else if (state == true)
					//		return changedFunction.fake ;
						else //block the canvas
							return undef;
					}
				});

		});
	
	}

}());
