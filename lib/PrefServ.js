var PrefServ = require('sdk/preferences/service');

exports.getter = function(preference) {

	return PrefServ.get(preference);
};

exports.setter = function(preference, value) {

	PrefServ.set(preference, value);
};

exports.resetter = function(preference) {

	PrefServ.reset(preference);
};

//Reset any UA related attributes
exports.resetAgentInfo = function() {

	PrefServ.reset('general.useragent.override');
	PrefServ.reset('general.appname.override');
	PrefServ.reset('general.platform.override');
	PrefServ.reset('general.appversion.override');
	PrefServ.reset('general.useragent.vendorsub');
	PrefServ.reset('general.useragent.vendor');
	PrefServ.reset('general.oscpu.override');
	PrefServ.reset('general.buildID.override');
	PrefServ.reset('network.http.accept.default');
	PrefServ.reset('network.http.accept-encoding');
	PrefServ.reset('intl.accept_languages');
};

exports.createPrefs = function() {

	//create prefs if they are not set
	if (!(PrefServ.has('extensions.agentSpoof.timeInterval')))

		PrefServ.set('extensions.agentSpoof.timeInterval', 'none');

	if (!(PrefServ.has('extensions.agentSpoof.uaChosen')))

		PrefServ.set('extensions.agentSpoof.uaChosen', 'random_desktop');

	if (!(PrefServ.has('extensions.agentSpoof.scriptInjection')))

		PrefServ.set('extensions.agentSpoof.scriptInjection', true);

	if (!(PrefServ.has('extensions.agentSpoof.xff')))

		PrefServ.set('extensions.agentSpoof.xff', false);

	if (!(PrefServ.has('extensions.agentSpoof.via')))

		PrefServ.set('extensions.agentSpoof.via', false);

	if (!(PrefServ.has('extensions.agentSpoof.ifnone')))

		PrefServ.set('extensions.agentSpoof.ifnone', false);

	if (!(PrefServ.has('extensions.agentSpoof.acceptDefault')))

		//enabled by default
		PrefServ.set('extensions.agentSpoof.acceptDefault', true);

	if (!(PrefServ.has('extensions.agentSpoof.acceptEncoding')))

		//enabled by default
		PrefServ.set('extensions.agentSpoof.acceptEncoding', true);

	if (!(PrefServ.has('extensions.agentSpoof.acceptLang')))

		//enabled by default
		PrefServ.set('extensions.agentSpoof.acceptLang', true);

	if(!(PrefServ.has('extensions.agentSpoof.acceptLangChoice')))

		PrefServ.set('extensions.agentSpoof.acceptLangChoice','en-US');

	if (!(PrefServ.has('extensions.agentSpoof.xffdd')))

		PrefServ.set('extensions.agentSpoof.xffdd', 'random');

	if (!(PrefServ.has('extensions.agentSpoof.viadd')))

		PrefServ.set('extensions.agentSpoof.viadd', 'random');

	if (!(PrefServ.has('extensions.agentSpoof.xffip')))

		PrefServ.set('extensions.agentSpoof.xffip', '1.1.1.1');

	if (!(PrefServ.has('extensions.agentSpoof.viaip')))

		PrefServ.set('extensions.agentSpoof.viaip', '1.1.1.1');

	if (!(PrefServ.has('extensions.agentSpoof.tzOffset')))

		PrefServ.set('extensions.agentSpoof.tzOffset', 'default');

	if (!(PrefServ.has('extensions.agentSpoof.screenSize')))

		PrefServ.set('extensions.agentSpoof.screenSize', 'default');

	if (!(PrefServ.has('extensions.agentSpoof.excludeList')))

		//exclude from random selection by default
		PrefServ.set('extensions.agentSpoof.excludeList', '');

	//total number of profiles and number of currently excluded
	// profiles per section and per platform

	if (!(PrefServ.has('extensions.agentSpoof.exclusionCount'))) {

		PrefServ.set('extensions.agentSpoof.exclusionCount',
			JSON.stringify({
				'desktop': {'total_count': 223, 'exclude_count': 0},
				'mobile': {'total_count': 80, 'exclude_count': 0},
				'other': {'total_count': 19, 'exclude_count': 0},
				'random_0,0': {'total_count': 85, 'exclude_count': 0},
				'random_0,1': {'total_count': 47, 'exclude_count': 0},
				'random_0,2': {'total_count': 62, 'exclude_count': 0},
				'random_0,3': {'total_count': 29, 'exclude_count': 0},
				'random_1,0': {'total_count': 25, 'exclude_count': 0},
				'random_1,1': {'total_count': 12, 'exclude_count': 0},
				'random_1,2': {'total_count': 24, 'exclude_count': 0},
				'random_1,3': {'total_count': 19, 'exclude_count': 0},
				'random_2,0': {'total_count': 19, 'exclude_count': 0}
			})
		);
	}

	if (!(PrefServ.has('extensions.agentSpoof.referer')))

		//set referer pref
		PrefServ.set('extensions.agentSpoof.referer', 'default');

	if (!(PrefServ.has('extensions.agentSpoof.limitTab')))

		//set limitTab pref
		PrefServ.set('extensions.agentSpoof.limitTab', false);

	if (!(PrefServ.has('extensions.agentSpoof.authorization')))

		//authorization header enabled by default
		PrefServ.set('extensions.agentSpoof.authorization', false);

	if (!(PrefServ.has('extensions.agentSpoof.windowName')))

		// Window.name protection , false by default
		PrefServ.set('extensions.agentSpoof.windowName', false);

	if (!(PrefServ.has('extensions.agentSpoof.canvas')))

		// Disable canvas support , false by default
		PrefServ.set('extensions.agentSpoof.canvas', false);

	if (!(PrefServ.has('extensions.agentSpoof.fullWhiteList')))

		PrefServ.set(
			'extensions.agentSpoof.fullWhiteList',
			'[{"url": "play.google.com"}, {"url": "s.ytimg.com", "options": ["canvas"]}, {"url": "youtube.com", "options": ["canvas"]}]'
		);

	if (!(PrefServ.has('extensions.agentSpoof.siteWhiteList')))

		// site whitelist for url only lookups
		PrefServ.set(
			'extensions.agentSpoof.siteWhiteList',
			'play.google.com,s.ytimg.com,youtube.com'
		);

	if (!(PrefServ.has('extensions.agentSpoof.whiteListUserAgent')))

		PrefServ.set(
			'extensions.agentSpoof.whiteListUserAgent',
			'Mozilla/5.0 (Windows NT 6.2; rv:37.0) Gecko/20100101 Firefox/37.0'
		);

	if (!(PrefServ.has('extensions.agentSpoof.whiteListAppCodeName')))

		PrefServ.set('extensions.agentSpoof.whiteListAppCodeName', 'Mozilla');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListAppName')))

		PrefServ.set('extensions.agentSpoof.whiteListAppName', 'Netscape');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListAppVersion')))

		PrefServ.set('extensions.agentSpoof.whiteListAppVersion', '5.0 (Windows)');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListPlatform')))

		PrefServ.set('extensions.agentSpoof.whiteListPlatform', 'Win32');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListVendor')))

		PrefServ.set('extensions.agentSpoof.whiteListVendor', '');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListVendorSub')))

		PrefServ.set('extensions.agentSpoof.whiteListVendorSub', '');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListOsCpu')))

		PrefServ.set('extensions.agentSpoof.whiteListOsCpu', 'Windows NT 6.2; Win32');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListAccept')))

		PrefServ.set(
			'extensions.agentSpoof.whiteListAccept',
			'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
		);

	if (!(PrefServ.has('extensions.agentSpoof.whiteListAcceptEncoding')))

		PrefServ.set('extensions.agentSpoof.whiteListAcceptEncoding', 'gzip, deflate');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListAcceptLanguage')))

		PrefServ.set('extensions.agentSpoof.whiteListAcceptLanguage', 'en-US,en;q=0.5');

	if (!(PrefServ.has('extensions.agentSpoof.whiteListDisabled')))

		//disable the whitelist unless the user chooses to use it
		PrefServ.set('extensions.agentSpoof.whiteListDisabled', true);

	if (!(PrefServ.has('extensions.agentSpoof.pixeldepth')))

		PrefServ.set('extensions.agentSpoof.pixeldepth', 24);

	if (!(PrefServ.has('extensions.agentSpoof.colordepth')))

		PrefServ.set('extensions.agentSpoof.colordepth', 24);

	if (!(PrefServ.has('extensions.agentSpoof.screens')))

		//store the current profile's list of possible screen sizes
		PrefServ.set('extensions.agentSpoof.screens', '');
};

exports.resetPrefs = function() {

	PrefServ.reset('extensions.agentSpoof.timeInterval');
	PrefServ.reset('extensions.agentSpoof.uaChosen');
	PrefServ.reset('extensions.agentSpoof.xff');
	PrefServ.reset('extensions.agentSpoof.via');
	PrefServ.reset('extensions.agentSpoof.ifnone');
	PrefServ.reset('extensions.agentSpoof.acceptDefault');
	PrefServ.reset('extensions.agentSpoof.acceptEncoding');
	PrefServ.reset('extensions.agentSpoof.acceptLang');
	PrefServ.reset('extensions.agentSpoof.xffdd');
	PrefServ.reset('extensions.agentSpoof.viadd');
	PrefServ.reset('extensions.agentSpoof.xffip');
	PrefServ.reset('extensions.agentSpoof.viaip');
	PrefServ.reset('extensions.agentSpoof.tzOffset');
	PrefServ.reset('extensions.agentSpoof.screenSize');
	PrefServ.reset('extensions.agentSpoof.excludeList');
	PrefServ.reset('extensions.agentSpoof.exclusionCount');
	PrefServ.reset('extensions.agentSpoof.referer');
	PrefServ.reset('extensions.agentSpoof.limitTab')
	PrefServ.reset('extensions.agentSpoof.dnt');
	PrefServ.reset('extensions.agentSpoof.authorization');
	PrefServ.reset('extensions.agentSpoof.windowName');
	PrefServ.reset('extensions.agentSpoof.canvas');
	PrefServ.reset('extensions.agentSpoof.fullWhiteList');
	PrefServ.reset('extensions.agentSpoof.siteWhiteList');
	PrefServ.reset('extensions.agentSpoof.whiteListUserAgent');
	PrefServ.reset('extensions.agentSpoof.whiteListAppCodeName');
	PrefServ.reset('extensions.agentSpoof.whiteListAppName');
	PrefServ.reset('extensions.agentSpoof.whiteListPlatform');
	PrefServ.reset('extensions.agentSpoof.whiteListAppVersion');
	PrefServ.reset('extensions.agentSpoof.whiteListVendor');
	PrefServ.reset('extensions.agentSpoof.whiteListVendorSub');
	PrefServ.reset('extensions.agentSpoof.whiteListOsCpu');
	PrefServ.reset('extensions.agentSpoof.whiteListAccept');
	PrefServ.reset('extensions.agentSpoof.whiteListAcceptLanguage');
	PrefServ.reset('extensions.agentSpoof.whiteListAcceptEncoding');
	PrefServ.reset('extensions.agentSpoof.whiteListDisabled');
	PrefServ.reset('extensions.agentSpoof.pixeldepth');
	PrefServ.reset('extensions.agentSpoof.colordepth');
	PrefServ.reset('extensions.agentSpoof.screens');
	PrefServ.reset('extensions.agentSpoof.scriptInjection');
	PrefServ.reset('extensions.agentSpoof.acceptLangChoice');

	//restore built in prefs to defaults
	PrefServ.reset('browser.display.use_document_fonts');
	PrefServ.reset('dom.storage.enabled');
	PrefServ.reset('browser.cache.memory.enable');
	PrefServ.reset('browser.cache.disk.enable');
	PrefServ.reset('network.http.use-cache'); //restore the bfcache
	PrefServ.reset('geo.enabled');
	PrefServ.reset('network.dns.disablePrefetch');
	PrefServ.reset('network.prefetch-next');
	PrefServ.reset('webgl.disabled');
	PrefServ.reset('media.peerconnection.enabled');
	PrefServ.reset('plugins.click_to_play');
	PrefServ.reset('places.history.enabled');
	PrefServ.reset('pdfjs.disabled');
	PrefServ.reset('browser.search.suggest.enabled');
	PrefServ.reset('dom.enable_performance');
	PrefServ.reset('dom.enable_resource_timing');
	PrefServ.reset('dom.battery.enabled');
	PrefServ.reset('dom.gamepad.enabled');
	PrefServ.reset('security.mixed_content.block_active_content');
	PrefServ.reset('security.mixed_content.block_display_content');
	PrefServ.reset('browser.send_pings');
	PrefServ.reset('dom.event.clipboardevents.enabled');
	PrefServ.reset('dom.event.contextmenu.enabled');
	PrefServ.reset('privacy.trackingprotection.enabled');
	PrefServ.reset('layout.css.visited_links_enabled');
	PrefServ.reset('plugins.enumerable_names');
	PrefServ.reset('privacy.donottrackheader.enabled');
};

exports.setProfilePrefs = function(key, value) {

	//set the spoofed profile attributes
	if (key == 'appname')

		PrefServ.set('general.appname.override', value);

	else if (key == 'platform')

		PrefServ.set('general.platform.override', value);

	else if (key == 'appversion')

		PrefServ.set('general.appversion.override', value);

	else if (key == 'vendor')

		PrefServ.set('general.useragent.vendor', value);

	else if (key == 'vendorsub')

		PrefServ.set('general.useragent.vendorsub', value);

	else if (key == 'oscpu')

		PrefServ.set('general.oscpu.override', value);

	else if (key == 'buildID')

		PrefServ.set('general.buildID.override', value);

	else if (key == 'useragent')

		PrefServ.set('general.useragent.override', value);

	else if (key == 'accept_default' && PrefServ.get('extensions.agentSpoof.acceptDefault') == true)

		PrefServ.set('network.http.accept.default', value);

	else if (key == 'accept_encoding' && PrefServ.get('extensions.agentSpoof.acceptEncoding') == true)

		PrefServ.set('network.http.accept-encoding', value);

	else if (key == 'accept_lang' && PrefServ.get('extensions.agentSpoof.acceptLang') == true){

		var choice = PrefServ.get("extensions.agentSpoof.acceptLangChoice");

		//fall back to en-US if the desired accept language header does not exist for the chosen profile
		if(value[choice] !== undefined)
			PrefServ.set('intl.accept_languages', value[choice]);
		else	
			PrefServ.set('intl.accept_languages', value["en-US"]);

	}else if (key == 'pixeldepth')

		PrefServ.set('extensions.agentSpoof.pixeldepth', value);

	else if (key == 'colordepth')

		PrefServ.set('extensions.agentSpoof.colordepth', value);

	else if (key == 'screens')

		PrefServ.set('extensions.agentSpoof.screens',value);
};
