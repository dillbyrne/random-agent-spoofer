(function(){

	const {changedFunctions} = require("./modifiedAPIs/canvas");
	var screens = require("./modifiedAPIs/screen");
	var undef;	
	

	exports.intercept = function intercept({subject: window},frameOptions){
	
		canvasHandler(window,frameOptions.canvas);

		defineProp(window,"Navigator","vendor",frameOptions.vendor);
		
		//blank out product sub property
		defineProp(window,"Navigator","productSub","");


		if(frameOptions.limitTab == true)
			defineProp(window,"History","length","2");

		if(frameOptions.screenSize != "default")
			screenHandler(window);

	}
	
	function defineProp(window,obj,prop,val){
	
		Object.defineProperty(window.wrappedJSObject[obj].prototype,
			prop,
			{
				enumerable: true,
				configurable: false,
				value: val	
			});
	}
	
	function screenHandler(window){
		
		screen = screens.getScreenAttributes();
		defineProp(window,"Screen","width",screen.width);
		defineProp(window,"Screen","height",screen.height);
		defineProp(window,"Screen","availWidth",screen.width);
		defineProp(window,"Screen","availHeight",screen.height);
		defineProp(window,"Screen","colorDepth",screen.colordepth);
		defineProp(window,"Screen","pixelDepth",screen.pixeldepth);
	
		//TODO  implement window.innerheight etc	
	
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
