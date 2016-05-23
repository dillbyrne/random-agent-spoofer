var ActionButton = require('./ActionButton'),
	Data = require('./Data'),
	Chrome = require('./Chrome'),
	PrefServ = require('./PrefServ'),
	Timer = require('./Timer'),
	ContextMenu = require('./ContextMenu'),
	Notifications = require('./Notifications'),
	utils = require('./Utils'),
	profData = Data.loadJSON('json/useragents.json'), //profile list
	fullWhiteList, //stores the full json data for whitelisting functionality such as canvas
	currentRandomIndices = null; //current randomly selected browser profile
	deskIndex = getAttributeIndex(profData, 'desktop'), //desktop index in the json
	mobileIndex = getAttributeIndex(profData, 'mobile'), //mobile index in the json

exports.init = function() {

	ContextMenu.setPlatformItems(createPlatfromContextMenuItems());

	//set inital icons and labels
	ActionButton.toggleIconAndLabel();
	ContextMenu.setProfileIcons(PrefServ.getter('extensions.agentSpoof.uaChosen'));
	ContextMenu.setTimerIcons(PrefServ.getter('extensions.agentSpoof.timeInterval'));
	ContextMenu.showMenu( PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_context_menu'));
	ContextMenu.toggleWhiteListIconAndLabel();


	Chrome.init();
	Chrome.register();

	//set initial profile and timer options
	setupProfileAndTimer();

	//set whitlist
	fullWhiteList = JSON.parse(PrefServ.getter('extensions.agentSpoof.fullWhiteList'));
};

exports.getProfiles = function() {

	return profData;
};

exports.setAcceptHeader = function(header_pref, header_override, spoofHeader) {

	PrefServ.setter(header_pref, spoofHeader);

	if (PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default') {

		if (spoofHeader == true) {

			var indices= '';

			//check if a random option is currently chosen
			if (PrefServ.getter('extensions.agentSpoof.uaChosen').slice(0,6) == 'random') {

				//get the currently selected random indices.
				indices = currentRandomIndices.split(',');

			} else {

				//get the specific selected indices
				indices = PrefServ.getter('extensions.agentSpoof.uaChosen').split(',');
			}

		//get the value from the profile at the specified indices and set the value


		// handle accept language header
		if (header_override === "intl.accept_languages"){

			var choice = PrefServ.getter("extensions.agentSpoof.acceptLangChoice");
			var langs = profData[indices[0]].list[indices[1]].useragents[indices[2]]['accept_' + header_pref.slice(28).toLowerCase()];

			//fall back to en-US if the desired accept language header does not exist for the chosen profile
			if(langs[choice] !== undefined)
				PrefServ.setter(header_override, langs[choice]);
			else
				PrefServ.setter(header_override, langs["en-US"]);

		}else{ //other accept headers

			PrefServ.setter(
				header_override,
				profData[indices[0]].list[indices[1]].useragents[indices[2]]['accept_' + header_pref.slice(28).toLowerCase()]
			);

		}

	} else

		PrefServ.resetter(header_override);
	}
};

function startTimer() {

	//get the time based on the selected interval
	var time = getInterval(PrefServ.getter('extensions.agentSpoof.timeInterval'));
	//Set User Agent
	prepareAndSetAgentInfo();
	//start timer
	Timer.setTimedFunc(startTimer, time);
};

exports.profileAndTimerSetup = function() {

	setupProfileAndTimer();
};

//Generate a random but valid ip
//Returns an ip address
exports.getRandomIP = function() {

	//first block of the invalid ips
	//This will remove the invalid ranges and leave us with more than enough
	//ips for the purpose of spoofing the forward and via headers
	var invalidIPs = [
		0, 10, 100, 127, 169,
		172, 192, 198, 203, 224,
		225, 226, 227, 228, 229,
		230, 231, 232, 233, 234,
		235, 236, 237, 238, 239,
		240, 241, 242, 243, 244,
		245, 246, 247, 248, 249,
		250, 251, 252, 253, 254,
		255
	];

	var ip= '';

	for (var i = 0 ; i < 4 ; i++) {

		var temp ='';

		do {

			temp = utils.getRandomNum(255);

		} while (i == 0 && invalidIPs.indexOf(temp) != -1);

		if (i != 3) temp += '.';

		ip += temp;
	}

	return ip;
};

//Check if the selected profile is random or not
//Set a random one if it is
//Parse and set the specified one if not
function prepareAndSetAgentInfo() {

	var ttip; //temp tooltip
	var changed = false;
	var excludeCount = JSON.parse(PrefServ.getter('extensions.agentSpoof.exclusionCount'));
	var uaChosen = PrefServ.getter('extensions.agentSpoof.uaChosen');
	var exclude_list = PrefServ.getter('extensions.agentSpoof.excludeList').split(',');

	if (uaChosen == 'random') {

		//check that the user has not excluded all the profiles
		//if so show a notification
		if (excludeCount['other'].exclude_count + excludeCount['mobile'].exclude_count + excludeCount['desktop'].exclude_count
			< excludeCount['other'].total_count + excludeCount['mobile'].total_count + excludeCount['desktop'].total_count) {

			do {

				//get a random profile
				var listTypeRandNum = utils.getRandomNum(profData.length -1)
				var listRandNum = utils.getRandomNum(profData[listTypeRandNum].list.length -1);
				var profileRandNum = utils.getRandomNum(profData[listTypeRandNum].list[listRandNum].useragents.length -1);

			//check if the randomly chosen profile is in the exclude list
			} while (exclude_list.indexOf(profData[listTypeRandNum].list[listRandNum].useragents[profileRandNum].profileID) != -1);

			//setup the profile and set a localized tooltip and notification
			ttip = setProfile(
				listTypeRandNum,
				listRandNum,
				profileRandNum,
				true,
				'Profile Spoofing Enabled' + "\n"
					+ 'Select the default profile to disable' + "\n"
					+ 'Random' + ': ',
				'Browser Profile Changed' + "\n"
					+ 'Random' + ': '
			);

			changed = true;

		} else {

			Notifications.sendMsg(
				 'Unable to randomly change Profile' + "\n"
					+ 'All profiles have been excluded' + "\n"
					+ 'Current profile remains unchanged'
			);
		}

	} else if (uaChosen == 'random_desktop') {

		//check that the user has not excluded all the desktop profiles
		//if so show a notification
		if (excludeCount['desktop'].exclude_count < excludeCount['desktop'].total_count) {

			do {

				//get a random user agent from the desktop options only
				var listRandNum = utils.getRandomNum(profData[deskIndex].list.length -1);
				var profileRandNum = utils.getRandomNum(profData[deskIndex].list[listRandNum].useragents.length -1);

			//check if the randomly chosen profile is in the exclude list
			} while (exclude_list.indexOf(profData[deskIndex].list[listRandNum].useragents[profileRandNum].profileID) != -1);

			ttip = setProfile(
				deskIndex,
				listRandNum,
				profileRandNum,
				true,
				'Profile Spoofing Enabled' + "\n"
					+ 'Select the default profile to disable' + "\n"
					+ 'Random (Desktop)' + ': ',
				'Browser Profile Changed' + "\n"
					+ 'Random (Desktop)' + ': '
			);

			changed = true;

		} else {

			Notifications.sendMsg(
				 'Unable to randomly change Desktop Profile' + "\n"
					+ 'All Desktop Profiles have been excluded' + "\n"
					+ 'Current profile remains unchanged'
			);
		}

	} else if (uaChosen == 'random_mobile') {

		//check that the user has not excluded all the mobile profiles
		//if so show a notification
		if (excludeCount['mobile'].exclude_count < excludeCount['mobile'].total_count) {

			do {

				//get a random user agent from the mobile options only
				var listRandNum = utils.getRandomNum(profData[mobileIndex].list.length -1);
				var profileRandNum = utils.getRandomNum(profData[mobileIndex].list[listRandNum].useragents.length -1);


			//check if the randomly chosen profile is in the exclude list
			} while (exclude_list.indexOf(profData[mobileIndex].list[listRandNum].useragents[profileRandNum].profileID) != -1);

			ttip = setProfile(
				mobileIndex,
				listRandNum,
				profileRandNum,
				true,
				'Profile Spoofing Enabled' + "\n"
					+ 'Select the default profile to disable' + "\n"
					+ 'Random (Mobile)' + ': ',
				'Browser Profile Changed' + "\n"
					+ 'Random (Mobile)' + ': '
			);

			changed = true;

		} else {

			Notifications.sendMsg(
				 'Unable to randomly change Mobile Profile' + "\n"
					+ 'All Mobile Profiles have been excluded' + "\n"
					+ 'Current profile remains unchanged'
			);
		}

	} else if (uaChosen == 'default') {

		PrefServ.resetAgentInfo();

		//remove the saved current random indices
		currentRandomIndices = null;

		ttip = 'Profile Spoofing Disabled' + "\n"
			+ 'Select another profile to enable spoofing' + "\n"
			+ 'Real browser profile';

		//show notifications if selected
		Notifications.sendMsg(
			'Browser Profile Changed' + "\n"
				+ 'Real browser profile'
		);

		changed = true;

	//random platfrom specific options e.g random windows browsers
	} else if (uaChosen.slice(0,7) == 'random_') {

		//get the first 2 indices
		var indices = uaChosen.substring(7).split(',');

		//check all profiles have not being excluded for the current platform
		if (excludeCount[uaChosen].exclude_count < excludeCount[uaChosen].total_count) {

			do {

				//get a random profile until the profile id is not in the list of excluded profiles
				var profileRandNum = utils.getRandomNum(profData[indices[0]].list[indices[1]].useragents.length -1);

			} while (exclude_list.indexOf(profData[indices[0]].list[indices[1]].useragents[profileRandNum].profileID) != -1);

			ttip = setProfile(
				indices[0],
				indices[1],
				profileRandNum,
				true,
				'Profile Spoofing Enabled' + "\n"
					+ 'Select the default profile to disable' + "\n"
					+ 'Random' + ' '
					+ profData[indices[0]].list[indices[1]].description + ':\n',
				'Browser Profile Changed' + "\n"
					+ 'Random' + ' '
					+ profData[indices[0]].list[indices[1]].description + ':\n'
			);

			changed = true;

		} else {

			Notifications.sendMsg(
				'Unable to randomly change' + ' '
					+ profData[indices[0]].list[indices[1]].description + ' '
					+ 'Profile' + "\n"
					+ 'All' + ' '
					+ profData[indices[0]].list[indices[1]].description + ' '
					+ 'Profiles have been excluded' + "\n"
					+ 'Current profile remains unchanged'
			);
		}

	} else {

		//split the string to get the indices for setAgentInfo()
		var indices = PrefServ.getter('extensions.agentSpoof.uaChosen').split(',');

		ttip = setProfile(
			indices[0],
			indices[1],
			indices[2],
			false,
			'Profile Spoofing Enabled' + "\n"
				+ 'Select the default profile to disable' + "\n",
			'Browser Profile Changed' + "\n"
		);

		changed = true;
	}

	//Ensure tooltip of the last set profile stays in the event a user has excluded all / destop profiles
	if (changed == true) {

		ActionButton.setEnabledTooltip(ttip);
	}
};

function setProfile(sectionIndex, platformIndex, profileIndex, saveIndices, tooltip, notification) {

	//set the profile
	setAgentInfo(sectionIndex, platformIndex, profileIndex);

	//get profile description
	var description = profData[sectionIndex].list[platformIndex].useragents[profileIndex].description;

	//save the current random indices
	if (saveIndices === true)

		currentRandomIndices = sectionIndex + ',' + platformIndex + ',' + profileIndex;

	else
		currentRandomIndices = null;

	//create the tooltip
	var ttip = tooltip + description;

	//show notifications if selected
	Notifications.sendMsg(notification + description);

	return ttip;
};

//used for per request timer setting in Chrome.js
exports.setupAndAssignProfile = function() {

	prepareAndSetAgentInfo();
};

exports.onUnload = function(reason) {

	if (reason == 'disable' || reason == 'uninstall') {

		//restore any changes made by the addon
		PrefServ.resetPrefs();
		PrefServ.resetAgentInfo();
	}

	//clear the timer
	Timer.clearTimer();
	Chrome.unregister();
	Chrome.unloadFrameScript();
};

exports.onInstall = function() {
	// Set sensible defaults
	PrefServ.setter('layout.css.visited_links_enabled', false );
	PrefServ.setter('privacy.trackingprotection.enabled', true);

	//set geolocation provider to mozilla if it is not already set to mozilla or google,
	//this is needed so we can correctly set the correcponding UI dropdown with a known value

	if (PrefServ.getter('geo.wifi.uri') != 'https://www.googleapis.com/geolocation/v1/geolocate?key=%GOOGLE_API_KEY%' &&
			PrefServ.getter('geo.wifi.uri') != 'https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%')
		PrefServ.setter('geo.wifi.uri','https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%');	

		//set panel items as onInstall is called after the panel has been initialized
		//This used to not be required so it could be a bug introduced with or ff45
		(require('./Panel').getPanel()).port.emit('setCheckBox', 'css_visited_links', !PrefServ.getter('layout.css.visited_links_enabled'));
		(require('./Panel').getPanel()).port.emit('setCheckBox', 'tracking_protection', PrefServ.getter('privacy.trackingprotection.enabled'));
		(require('./Panel').getPanel()).port.emit('setSelectedIndexByValue', 'geodd', PrefServ.getter('geo.wifi.uri'));
};

//handle upgrades to new versions of the addon
//from 0.9.5.5 to 0.9.5.6 only
exports.onUpgrade = function() {

	//upgrade to the latest firefox if the previous default whilelist profile is in use
	if(PrefServ.getter("extensions.agentSpoof.whiteListUserAgent") === "Mozilla/5.0 (Windows NT 6.2; rv:43.0) Gecko/20100101 Firefox/43.0")
		PrefServ.setter("extensions.agentSpoof.whiteListUserAgent","Mozilla/5.0 (Windows NT 6.2; rv:45.0) Gecko/20100101 Firefox/45.0");


	//upgrade default whitelist if it is unchanged (youtube now uses html video and no longer needs the canvas to be whitelisted )¬
	if(PrefServ.getter('extensions.agentSpoof.fullWhiteList') === 
		'[{"url": "play.google.com"}, {"url": "s.ytimg.com", "options": ["canvas"]}, {"url": "youtube.com", "options": ["canvas"]}]'){

		PrefServ.setter('extensions.agentSpoof.fullWhiteList','[{"url": "addons.mozilla.org"}, {"url": "play.google.com"}, {"url": "youtube.com"}]');
		PrefServ.setter('extensions.agentSpoof.siteWhiteList','addons.mozilla.org,play.google.com,youtube.com');
		(require('./Panel').getPanel()).port.emit('setElementValue', 'useragent_input', PrefServ.getter('extensions.agentSpoof.whiteListUserAgent'));
	}

	//set geolocation provider to mozilla if it is not already set to mozilla or google,
	//this is needed so we can correctly set the correcponding UI dropdown with a known value

	if (PrefServ.getter('geo.wifi.uri') != 'https://www.googleapis.com/geolocation/v1/geolocate?key=%GOOGLE_API_KEY%' &&
			PrefServ.getter('geo.wifi.uri') != 'https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%')
		PrefServ.setter('geo.wifi.uri','https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%');

	//remove old prefs
	PrefServ.resetter('datareporting.healthreport.service.enabled');
	PrefServ.resetter('network.http.use-cache');
};

exports.setFullWhiteList = function(jsonData) {

	fullWhiteList = JSON.parse(jsonData);
};

exports.getFullWhiteListEntry = function(index) {

	return fullWhiteList[index];
};

exports.getDeskIndex = function() {

	return deskIndex;
}

exports.getMobileIndex = function() {

	return mobileIndex;
}

function setupProfileAndTimer() {

	//set the timer if the user has opted to use it and a random ua was chosen
	if ((
			PrefServ.getter('extensions.agentSpoof.timeInterval') != 'none'
			&& PrefServ.getter('extensions.agentSpoof.timeInterval') != 'request'
		)
		&& PrefServ.getter('extensions.agentSpoof.uaChosen').slice(0,6) == 'random') {

		startTimer();

	} else {

		prepareAndSetAgentInfo();
	}
};

function getInterval(interval) {

	if (interval == 'randomTime')

		return Math.floor((Math.random() * 60) + 1) * 60000;

	else
		return interval * 60000;
};

function getAttributeIndex(data, attrib) {

	for (var i = 0, len = data.length ; i < len ; i++) {

		if (data[i].type == attrib) {

			return i;
		}
	}

	return 0;
};

function setAgentInfo(listTypeIndex, listIndex, profileIndex) {

	for (var key in profData[listTypeIndex].list[listIndex].useragents[profileIndex]) {

		if (profData[listTypeIndex].list[listIndex].useragents[profileIndex].hasOwnProperty(key)) {

			var value = profData[listTypeIndex].list[listIndex].useragents[profileIndex][key];

			PrefServ.setProfilePrefs(key, value);
		}
	}
};

function createPlatfromContextMenuItems() {

	var items = new Array();

	for (var k = 0, len = profData.length ; k < len ; k++) {

		for (var i = 0, len2 = profData[k].list.length ; i < len2 ; i++) {

			items.push({
				image: Data.get('images/notselected.png'),
				label: 'Random' + ' ' + profData[k].list[i].description,
				data: 'random_' + k + ',' + i
			});
		}
	}

	return items;
};
