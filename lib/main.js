var Panel = require("./Panel"),
ActionButton = require("./ActionButton"),
Ras = require("./Ras");

exports.main = function(options){

	//set bf cache to disabled on first install or addon enable
	// it offers more protection if the injection script options are used, see issue #121
	if (options.loadReason == "install" || options.loadReason == "enable" ){
		Ras.onInstall();
	}

	//handle upgrades version number must increase to have an effect
	else if (options.loadReason == "upgrade"){
		Ras.onUpgrade();		
	}

	Panel.init();
	ActionButton.init();
	Ras.init();
};

exports.onUnload = function (reason){
    Ras.onUnload(reason);
};