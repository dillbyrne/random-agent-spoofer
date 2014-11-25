require("./Panel").init();
require("./Widget").init();
var Ras = require("./Ras");
Ras.init();

exports.onUnload = function (reason){
    Ras.onUnload(reason);
};

exports.main = function(options){
	console.log(options.loadReason);

	//TODO
	//handle updates to profiles so remove old excluded ids
	//if (options.loadReason == "upgrade"){
	//}
};