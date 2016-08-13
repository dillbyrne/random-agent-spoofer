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

function getTogglePrefs(){

	var prefs = [
		'extensions.agentSpoof.xff',
		'extensions.agentSpoof.via',
		'extensions.agentSpoof.ifnone',
		'extensions.agentSpoof.disableRef',
		'extensions.agentSpoof.authorization',
		'extensions.agentSpoof.scriptInjection',
		'browser.display.use_document_fonts',
		'dom.storage.enabled',
		'browser.cache.memory.enable',
		'browser.cache.disk.enable',
		'geo.enabled',
		'network.dns.disablePrefetch',
		'network.prefetch-next',
		'webgl.disabled',
		'media.peerconnection.enabled',
		'plugins.click_to_play',
		'places.history.enabled',
		'pdfjs.disabled',
		'browser.search.suggest.enabled',
		'dom.enable_performance',
		'dom.enable_resource_timing',
		'dom.battery.enabled',
		'dom.gamepad.enabled',
		'security.mixed_content.block_active_content',
		'security.mixed_content.block_display_content',
		'browser.send_pings',
		'beacon.enabled',
		'dom.event.clipboardevents.enabled',
		'dom.event.contextmenu.enabled',
		'privacy.trackingprotection.enabled',
		'layout.css.visited_links_enabled',
		'privacy.donottrackheader.enabled',
		'network.http.referer.XOriginPolicy',
		'network.http.referer.trimmingPolicy',
		'network.http.referer.spoofSource',
		'geo.wifi.uri',
		'browser.safebrowsing.enabled',
		'browser.safebrowsing.downloads.enabled',
		'browser.safebrowsing.malware.enabled',
		'datareporting.healthreport.uploadEnabled',
		'toolkit.telemetry.enabled',
		'network.cookie.cookieBehavior',
		'network.cookie.lifetimePolicy'
	];

	return prefs;
};


// disable RAS
exports.toggleOff = function() {

	var prefs = getTogglePrefs();

	//store pref state in temp var before resetting so we can restore it when the addon is reenabled
	for ( var i=0, l=prefs.length; i<l; i++ ){
		swapAndReset(prefs[i]+'_RAS_TEMP',prefs[i]);
	}

	PrefServ.set('extensions.agentSpoof.uaChosen_RAS_TEMP',PrefServ.get('extensions.agentSpoof.uaChosen'));
	PrefServ.set('extensions.agentSpoof.uaChosen','default');

};


// enable RAS
exports.toggleOn = function() {
		//'extensions.agentSpoof.uaChosen',
	var prefs = getTogglePrefs();

	//retrive pref state from temp var before resetting so we can restore it when the addon is reenabled
	for ( var i=0, l=prefs.length; i<l; i++ ){
		swapAndReset(prefs[i],prefs[i]+'_RAS_TEMP');
	}

	PrefServ.set('extensions.agentSpoof.uaChosen',PrefServ.get('extensions.agentSpoof.uaChosen_RAS_TEMP'));
	PrefServ.reset('extensions.agentSpoof.uaChosen_RAS_TEMP');
};

function swapAndReset(p1, p2){
	
	// handle cases where a preference has been
	// changed or removed

	try{
	
		PrefServ.set(p1,PrefServ.get(p2));
		PrefServ.reset(p2);
	
	}catch(e){
		console.error(e);
	}
}



//Reset any UA related attributes
exports.resetAgentInfo = function() {
	
	var prefs = [
		'general.useragent.override',
		'general.appname.override',
		'general.platform.override',
		'general.appversion.override',
		'general.useragent.vendorsub',
		'general.useragent.vendor',
		'general.oscpu.override',
		'general.buildID.override',
		'network.http.accept.default',
		'network.http.accept-encoding',
		'intl.accept_languages'
	];
	
	resetArray(prefs);
};

exports.createPrefs = function() {

	var prefs = [
		['extensions.agentSpoof.timeInterval','none'],
		['extensions.agentSpoof.uaChosen', 'random_desktop'],
		['extensions.agentSpoof.scriptInjection', true],
		['extensions.agentSpoof.xff', false],
		['extensions.agentSpoof.via', false],
		['extensions.agentSpoof.ifnone', false],
		['extensions.agentSpoof.acceptDefault', true],
		['extensions.agentSpoof.acceptEncoding', true],
		['extensions.agentSpoof.acceptLang', true],
		['extensions.agentSpoof.acceptLangChoice','en-US'],
		['extensions.agentSpoof.xffdd', 'random'],
		['extensions.agentSpoof.viadd', 'random'],
		['extensions.agentSpoof.xffip', '1.1.1.1'],
		['extensions.agentSpoof.viaip', '1.1.1.1'],
		['extensions.agentSpoof.tzOffset', 'default'],
		['extensions.agentSpoof.screenSize', 'default'],
		['extensions.agentSpoof.excludeList', ''],
		['extensions.agentSpoof.exclusionCount',
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
		],
		['extensions.agentSpoof.disableRef', false],
		['extensions.agentSpoof.limitTab', false],
		['extensions.agentSpoof.authorization', false],
		['extensions.agentSpoof.windowName', false],
		['extensions.agentSpoof.canvas', false],
		['extensions.agentSpoof.blockPlugins', false],
		['extensions.agentSpoof.fullWhiteList',
			'[{"url": "addons.mozilla.org"}, {"url": "play.google.com"}, {"url": "youtube.com"}]'],
		['extensions.agentSpoof.whiteListUserAgent','Mozilla/5.0 (Windows NT 6.2; rv:45.0) Gecko/20100101 Firefox/45.0'],
		['extensions.agentSpoof.whiteListAppCodeName', 'Mozilla'],
		['extensions.agentSpoof.whiteListAppName', 'Netscape'],
		['extensions.agentSpoof.whiteListAppVersion', '5.0 (Windows)'],
		['extensions.agentSpoof.whiteListPlatform', 'Win32'],
		['extensions.agentSpoof.whiteListVendor', ''],
		['extensions.agentSpoof.whiteListVendorSub', ''],
		['extensions.agentSpoof.whiteListOsCpu', 'Windows NT 6.2; Win32'],
		['extensions.agentSpoof.whiteListAccept','text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
		['extensions.agentSpoof.whiteListAcceptEncoding', 'gzip, deflate'],
		['extensions.agentSpoof.whiteListAcceptLanguage', 'en-US,en;q=0.5'],
		['extensions.agentSpoof.whiteListDisabled', true],
		['extensions.agentSpoof.pixeldepth', 24],
		['extensions.agentSpoof.colordepth', 24],
		['extensions.agentSpoof.screens', '']
	];

	for ( var i=0, l=prefs.length; i<l; i++ ){

		if (!(PrefServ.has(prefs[i][0])))
			PrefServ.set.apply(this,prefs[i]);
	}


};

exports.resetPrefs = function() {
	
	var prefs = [
		'extensions.agentSpoof.timeInterval',
		'extensions.agentSpoof.uaChosen',
		'extensions.agentSpoof.acceptDefault',
		'extensions.agentSpoof.acceptEncoding',
		'extensions.agentSpoof.acceptLang',
		'extensions.agentSpoof.xffdd',
		'extensions.agentSpoof.viadd',
		'extensions.agentSpoof.xffip',
		'extensions.agentSpoof.viaip',
		'extensions.agentSpoof.tzOffset',
		'extensions.agentSpoof.screenSize',
		'extensions.agentSpoof.excludeList',
		'extensions.agentSpoof.exclusionCount',
		'extensions.agentSpoof.limitTab',
		'extensions.agentSpoof.windowName',
		'extensions.agentSpoof.canvas',
		'extensions.agentSpoof.blockPlugins',
		'extensions.agentSpoof.fullWhiteList',
		'extensions.agentSpoof.whiteListUserAgent',
		'extensions.agentSpoof.whiteListAppCodeName',
		'extensions.agentSpoof.whiteListAppName',
		'extensions.agentSpoof.whiteListPlatform',
		'extensions.agentSpoof.whiteListAppVersion',
		'extensions.agentSpoof.whiteListVendor',
		'extensions.agentSpoof.whiteListVendorSub',
		'extensions.agentSpoof.whiteListOsCpu',
		'extensions.agentSpoof.whiteListAccept',
		'extensions.agentSpoof.whiteListAcceptLanguage',
		'extensions.agentSpoof.whiteListAcceptEncoding',
		'extensions.agentSpoof.whiteListDisabled',
		'extensions.agentSpoof.pixeldepth',
		'extensions.agentSpoof.colordepth',
		'extensions.agentSpoof.screens',
		'extensions.agentSpoof.acceptLangChoice',

	];
	
	resetArray(prefs.concat(getTogglePrefs()));
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

function resetArray(prefs){

	for ( var i=0, l=prefs.length; i<l; i++ ){
		PrefServ.reset(prefs[i]);
	}
};
