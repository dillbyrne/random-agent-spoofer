require('./Panel').init();

var ui = require('sdk/ui'),
	Data = require('./Data'),
	PrefServ = require('./PrefServ'),
	labels = [
		'Profile Spoofing Enabled' + "\n" + 'Select the default profile to disable',
		'Profile Spoofing Disabled' + "\n" + 'Select another profile to enable spoofing',
		'RAS Disabled' + "\n" + 'Enable RAS using the context menu or in about:addons'
	],
	button,
	panel = require('./Panel').getPanel();

exports.init = function() {

	button = ui.ActionButton({

		id: 'random-agent-spoofer',
		label:'Random Agent Spoofer',
		icon:{
			'16': Data.get('images/spoof.png'),
			'32': Data.get('images/spoof32.png'),
			'64': Data.get('images/spoof64.png')
		},
		onClick: function(state) {

			panel.show({
				position: button
			});
		}
	});
};

exports.toggleIconAndLabel = function() {


	if(PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled')){

		if(PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default'){

			button.icon = Data.get("images/spoof.png");
			button.label = labels[0];

		} else {

			button.icon = Data.get('images/real.png');
			button.label = labels[1];
		}


    } else {

		button.icon = Data.get("images/disabled.png");
		button.label = labels[2];
   }
};


exports.setEnabledTooltip = function(text) {

	labels[0] = text;
	button.label = labels[0];
};
