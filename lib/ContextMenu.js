var cm = require('sdk/context-menu');
	PrefServ = require('./PrefServ'),
	Data = require('./Data'),
	Ras = require('./Ras'),
	Tab = require('./Tabs'),
	parentMenu = null,
	menuItems = null,
	platformItems = null,
	timerItems = null,
	emailItems = null;


var toggle = cm.Item({
    image: Data.get('images/spoof.png'),
    label: 'Disable RAS',
    data: 'toggle'
});

var whitelist = cm.Item({
    image: Data.get('images/whitelist_disabled.png'),
    label: 'Enable Whitelist',
    data: 'whitelist'
});

var def = cm.Item({
	label: 'Real Profile',
	image: Data.get('images/selected.png'),
	data: 'default'
});

var rand = cm.Item({
	label: 'Random',
	image: Data.get('images/notselected.png'),
	data: 'random'
});

var rand_desk = cm.Item({
	label: 'Random (Desktop)',
	image: Data.get('images/notselected.png'),
	data: 'random_desktop'
});

var rand_mob = cm.Item({
	label: 'Random (Mobile)',
	image: Data.get('images/notselected.png'),
	data: 'random_mobile'
});

var rand_plat = cm.Menu({
	label: 'Random Platform',
	image: Data.get('images/icon.png'),
	items: []
});

var timer = cm.Menu({
	label: 'Change Periodically:',
	image: Data.get('images/timer.png'),
	items: [
		cm.Item({ image: Data.get('images/selected.png'), label: 'No', data: 'none' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every request', data: 'request' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Random', data: 'randomTime' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every minute', data: '1' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every 5 mins', data: '5' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every 10 mins', data: '10' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every 20 mins', data: '20' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every 30 mins', data: '30' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every 40 mins', data: '40' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every 50 mins', data: '50' }),
		cm.Item({ image: Data.get('images/notselected.png'), label: 'Every hour', data: '60' })
	]
});

var email = cm.Menu({
	label: 'Temporary Email',
	image: Data.get('images/email.png'),
	context: cm.SelectorContext('input'),
	items: [
		cm.Item({ image: Data.get('images/email_item.png'), label: 'Anonbox', data: 'mail_anonbox' }),
		cm.Item({ image: Data.get('images/email_item.png'), label: 'Kozmail', data: 'mail_kozmail' }),
		cm.Item({ image: Data.get('images/email_item.png'), label: 'MailCatch', data: 'mail_mailcatch' }),
		cm.Item({ image: Data.get('images/email_item.png'), label: 'Yopmail', data: 'mail_yopmail' }),
		cm.Item({ image: Data.get('images/email_item.png'), label: 'Mailinator', data: 'mail_mailinator' }),
		cm.Item({ image: Data.get('images/email_item.png'), label: 'Dispostable', data: 'mail_dispostable' })
	]
});

var Menu = cm.Menu({
	label: 'Random Agent Spoofer',
	image: Data.get('images/icon.png'),
	contentScriptFile: Data.get('js/itemSelection.js'),
	items: [
		toggle,cm.Separator(),def, rand, rand_desk, rand_mob, rand_plat, 
		cm.Separator(), timer, cm.Separator(), whitelist, cm.Separator(), email
	],
	onMessage: function (data) {

		if (data[0] === 'default' || data[0] === 'random' || data[0].slice(0, 7) === 'random_') {
			
			if(PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled') === true)
				PrefServ.setter('extensions.agentSpoof.uaChosen', data[0]);

		} else if (data[0].slice(0, 5) === 'mail_') {

				//open temporary mailbox
				Tab.openURL(data[1]);
		} else if (data[0] === 'toggle') {
			
			//toggle addon state
			PrefServ.setter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled',(!PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled')));

		} else if (data[0] === 'whitelist') {
			
			//toggle whitelist state
			PrefServ.setter('extensions.agentSpoof.whiteListDisabled',(!PrefServ.getter('extensions.agentSpoof.whiteListDisabled')));

		} else {

			//set time
			if(PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled') === true)
				PrefServ.setter('extensions.agentSpoof.timeInterval', data[0]);
		}
	}
});

exports.setProfileIcons = function(profile) {

	var items = rand_plat.items;
	items.push(def,rand,rand_desk,rand_mob);

	for (var i = 0, len = items.length ; i < len ; i++) {

		if (items[i].data === profile)

			items[i].image = Data.get('images/selected.png');

		else
			items[i].image = Data.get('images/notselected.png');
	}
};

exports.setTimerIcons = function(interval) {

	for (var i = 0, len = timer.items.length ; i < len; i++) {

		if (timer.items[i].data === interval)

			timer.items[i].image = Data.get('images/selected.png');

		else
			timer.items[i].image = Data.get('images/notselected.png');
	}
};

exports.toggleIconAndLabel = function() {

	if(PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled')){

		if(PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default'){

			toggle.image = Data.get("images/spoof.png");

		} else {

			toggle.image = Data.get("images/real.png");
		}


		toggle.label = "Disable RAS";

    } else {

		toggle.image = Data.get("images/disabled.png");
		toggle.label = "Enable RAS";
   }
};

exports.toggleWhiteListIconAndLabel = function() {

	if(PrefServ.getter('extensions.agentSpoof.whiteListDisabled')){

		whitelist.image = Data.get("images/whitelist_disabled.png");
		whitelist.label = "Enable Whitelist";

	} else {

		whitelist.image = Data.get("images/whitelist_enabled.png");
		whitelist.label = "Disable Whitelist";
	}

};

exports.setPlatformItems = function(items) {

	for (var i = 0, len = items.length ; i < len ; i++) {

		rand_plat.addItem(cm.Item(items[i]));
	}
};

exports.showMenu = function(isShown) {

	if (isShown === false) {
		//remove RAS menu

		//backup menuitems and get parent reference menu
		parentMenu = Menu.parentMenu;
		menuItems = Menu.items;
		platformItems = rand_plat.items;
		timerItems = timer.items;
		emailItems = email.items;

		parentMenu.removeItem(Menu);

	} else if (isShown === true && menuItems !== null) {
		//add RAS menu

		//restore menu and items
		parentMenu.addItem(Menu);
		Menu.items = menuItems;
		rand_plat.items = platformItems;
		timer.items = timerItems;
		email.items = emailItems;
		email.context = cm.SelectorContext('input');

		//set values to null
		menuItems = null;
		platformItems = null;
		timerItems = null;
		emailItems = null;
	}
}

