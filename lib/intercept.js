
(function(){

	const {changedFunctions} = require("./modifiedAPIs/canvas");

	var apiNames = Object.keys(changedFunctions);
	var undef;	
	
	exports.intercept = function intercept({subject: window},frameOptions){
	
		
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

						if(frameOptions.canvas == false)
							return original;
					//	else if (canvasState == true)
					//		return changedFunction.fake ;
						else //block the canvas
							return undef;
					}
				});

		});
		
	}

}());
