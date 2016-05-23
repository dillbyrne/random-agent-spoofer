exports.defineProp = function(window, obj, prop, val) {
	
		Object.defineProperty(window.wrappedJSObject[obj].prototype,
			prop,
			{
				enumerable: true,
				configurable: false,
				value: val	
			});
};

//get a random number from 0 - maximum
exports.getRandomNum = function (maximum) {
	return Math.round(Math.random() * maximum)
};
