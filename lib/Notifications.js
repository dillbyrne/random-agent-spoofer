var Notifications = require('sdk/notifications'),
	Data = require('./Data'),
	PrefServ = require('./PrefServ');

exports.sendMsg = function(msg) {

	//show notifications if selected
	if (PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_notifications') == true) {

		Notifications.notify({
			title: 'Random Agent Spoofer',
			text: msg
			// iconURL: Data.get('images/icon.png') //Causes some notifications not to show in firefox 36.
			// Disabled until I can find a fix
		});
	}
};
