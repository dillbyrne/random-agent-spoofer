var Notifications = require("sdk/notifications"),
	Data = require("./Data"),
	PrefServ = require("./PrefServ");

exports.sendMsg = function(msg){

	//show notifications if selected
    if (PrefServ.getter("extensions.agentSpoof.notify") == true ){
		Notifications.notify({
			text: msg,
			iconURL: Data.get("images/icon.png")
		});
	}
};