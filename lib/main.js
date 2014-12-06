require("./Panel").init();
require("./ActionButton").init();
var Ras = require("./Ras");
Ras.init();

exports.onUnload = function (reason){
    Ras.onUnload(reason);
};

exports.main = function(options){

	//handle upgrades version number must increse to have an effect
	if (options.loadReason == "upgrade"){
		Ras.onUpgrade();		
	}
};

