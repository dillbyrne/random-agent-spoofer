var ui = require('sdk/ui'),
	Data = require('./Data'),
	PrefServ = require('./PrefServ'),
	Panel = require('./Panel'),
	labels = [
		'Profile Spoofing Enabled' + "\n" + 'Select the default profile to disable',
		'Profile Spoofing Disabled' + "\n" + 'Select another profile to enable spoofing'
	],
	button,
	panel = null; //Panel.getPanel() will not work at this point

exports.init = function() {

	button = ui.ActionButton({

		id: 'random-agent-spoofer',
		label:'Random Agent Spoofer',
		icon:{
			'16': Data.get('images/on.png'),
			'32': Data.get('images/on32.png'),
			'64': Data.get('images/on64.png')
		},
		onClick: function(state) {

			if (panel === null) panel = Panel.getPanel();

			panel.show({
				position: button
			});
		}
	});
};

exports.toggleIconAndLabel = function() {

	if (PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default') {

		button.icon = Data.get('images/on.png');
		button.label = labels[0];

	} else {

		button.icon = Data.get('images/off.png');
		button.label = labels[1];
	}
};

exports.setEnabledTooltip = function(text) {

	labels[0] = text;
	button.label = labels[0];
};
