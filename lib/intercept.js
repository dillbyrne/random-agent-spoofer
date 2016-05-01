(function(){

	const {changedFunctions} = require("./modifiedAPIs/canvas");

	var undef;	
	
	exports.intercept = function intercept({subject: window},frameOptions){
	
		canvasHandler(window,frameOptions.canvas);
		defineStringProperty(window,"Navigator","vendor",frameOptions.vendor);
		
		if(frameOptions.limitTab == true)
			defineStringProperty(window,"History","length","2");


	}
	
	function defineStringProperty(window,obj,prop,val){
	
		Object.defineProperty(window.wrappedJSObject[obj].prototype,
			prop,
			{
				enumerable: true,
				configurable: false,
				value: val	
			});
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
