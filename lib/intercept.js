(function(){

	const {changedFunctions} = require("./modifiedAPIs/canvas");
	const {screenHandler} = require("./modifiedAPIs/screen");
	const {whiteListHandler} = require("./modifiedAPIs/whitelist");

	var utils = require('./Utils'),
	undef;	

	exports.intercept = function intercept({subject: window},frameOptions){
	
		canvasHandler(window,frameOptions.canvas);

		
		// blank out product sub property
		utils.defineProp(window,"Navigator","productSub","");

		if(frameOptions.limitTab)
			utils.defineProp(window,"History","length","2");

		if(frameOptions.screenSize != "default")
			screenHandler(window);
		
		if (frameOptions.windowName)
			window.name = "";
		
		//TODO whitelist checking for script injection and exemptions
		
		// use the whitelist profile if site is in whitelist and
		// whitelist has not been disabled and
		// the current profile is not the default profile
		if(!frameOptions.whiteListDisabled &&
				frameOptions.profile != 'default')
			whiteListHandler(window);
		
		else // spoof vendor as normal
			utils.defineProp(window,"Navigator","vendor",frameOptions.vendor);
		
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
