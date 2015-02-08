var Panel = require("./Panel"),
ActionButton = require("./ActionButton"),
Ras = require("./Ras");

exports.main = function(options){

	//handle upgrades version number must increase to have an effect
	if (options.loadReason == "upgrade"){
		Ras.onUpgrade();		
	}

	Panel.init();
	ActionButton.init();
	Ras.init();
};

exports.onUnload = function (reason){
    Ras.onUnload(reason);
};