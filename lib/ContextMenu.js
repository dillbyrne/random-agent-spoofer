var cm = require("sdk/context-menu");
	PrefServ = require("./PrefServ"),
	Data = require("./Data"),
	Ras = require("./Ras"),
	Tab = require("./Tabs"),
	localization = require("./Localization"),
	parentMenu = null,
	menuItems = null,
	platformItems = null,
	timerItems = null,
	emailItems = null;

var def = cm.Item({
	label: localization.getString("real_id"),
	image: Data.get("images/selected.png"),
	data: "default"
});

var rand = cm.Item({
	label: localization.getString("random_id"),
	image: Data.get("images/notselected.png"),
	data: "random"
});

var rand_desk = cm.Item({
	label: localization.getString("random_desktop_id"),
	image: Data.get("images/notselected.png"),
	data: "random_desktop"
});

var rand_mob = cm.Item({
	label: localization.getString("random_mobile_id"),
	image: Data.get("images/notselected.png"),
	data: "random_mobile"
});

var rand_plat = cm.Menu({
	label: localization.getString("random_platform_id"),
	image: Data.get("images/icon.png"),
	items: []
});

var timer = cm.Menu({
	label: localization.getString("change_on_timer_id"),
	image: Data.get("images/timer.png"),
	items: [
		cm.Item({ image: Data.get("images/selected.png"), label: localization.getString("no_timer_id"), data: "none" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("per_request_id"), data: "request" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("random_id"), data: "randomTime" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("1_min_id"), data: "1" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("5_mins_id"), data: "5" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("10_mins_id"), data: "10" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("20_mins_id"), data: "20" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("30_mins_id"), data: "30" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("40_mins_id"), data: "40" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("50_mins_id"), data: "50" }),
		cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("60_mins_id"), data: "60" })
	]
});

var email = cm.Menu({
	label: localization.getString("temp_email_id"),
	image: Data.get("images/email.png"),
	context: cm.SelectorContext("input"),
	items: [
		cm.Item({ image: Data.get("images/email_item.png"), label: "Anonbox", data: "mail_anonbox" }),
		cm.Item({ image: Data.get("images/email_item.png"), label: "Kozmail", data: "mail_kozmail" }),
		cm.Item({ image: Data.get("images/email_item.png"), label: "MailCatch", data: "mail_mailcatch" }),
		cm.Item({ image: Data.get("images/email_item.png"), label: "Yopmail", data: "mail_yopmail" }),
		cm.Item({ image: Data.get("images/email_item.png"), label: "Mailinator", data: "mail_mailinator" }),
		cm.Item({ image: Data.get("images/email_item.png"), label: "Dispostable", data: "mail_dispostable" })
	]
});

var Menu = cm.Menu({
	label: "Random Agent Spoofer",
	image: Data.get("images/icon.png"),
	contentScriptFile: Data.get("js/itemSelection.js"),
	items: [def,rand,rand_desk,rand_mob,rand_plat,cm.Separator(),timer,cm.Separator(),email],
	onMessage:function (data){

		if (data[0] === "default" || data[0] === "random" || data[0].slice(0,7) === "random_"){
			PrefServ.setter("extensions.agentSpoof.uaChosen",data[0]);
		}else if(data[0].slice(0,5) === "mail_"){
				//open temporary mailbox
				Tab.openURL(data[1]);
		}else{ //set time
			PrefServ.setter("extensions.agentSpoof.timeInterval",data[0]);
		}
	}
});

exports.setProfileIcons = function(profile){

	var items = rand_plat.items;
	items.push(def,rand,rand_desk,rand_mob);

	for (var i = 0, len = items.length ; i < len ; i++) {
		if(items[i].data === profile)
			items[i].image = Data.get("images/selected.png");
		else
			items[i].image = Data.get("images/notselected.png");
	}
};

exports.setTimerIcons = function(interval){

	for (var i = 0, len = timer.items.length ; i < len; i++) {
		if(timer.items[i].data === interval)
			timer.items[i].image = Data.get("images/selected.png");
		else
			timer.items[i].image = Data.get("images/notselected.png");
	}
};

exports.setPlatformItems = function(items){

	for (var i = 0, len = items.length ; i < len ; i++) {
		rand_plat.addItem(cm.Item(items[i]));
	}
};

exports.showMenu = function(isShown){
	if (isShown === false){
		//remove RAS menu

		//backup menuitems and get parent reference menu
		parentMenu = Menu.parentMenu;
		menuItems = Menu.items;
		platformItems = rand_plat.items;
		timerItems = timer.items;
		emailItems = email.items;

		parentMenu.removeItem(Menu);

	}
	else if (isShown === true && menuItems !== null){
		//add RAS menu

		//restore menu and items
		parentMenu.addItem(Menu);
		Menu.items = menuItems;
		rand_plat.items = platformItems;
		timer.items = timerItems;
		email.items = emailItems;
		email.context = cm.SelectorContext("input");

		//set values to null
		menuItems = null;
		platformItems = null;
		timerItems = null;
		emailItems = null;
	}
}
