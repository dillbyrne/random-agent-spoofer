var Panel = require('sdk/panel'),
	Data = require('./Data'),
	Ras = require('./Ras'),
	PrefServ = require('./PrefServ'),
	panel;


exports.init = function() {

	panel = Panel.Panel({
		width:420,
		height:480,
		contentURL: Data.get('html/options-panel.html'),
		contentStyleFile: Data.get('css/style.css'),
		contentScriptFile: [
			Data.get('js/set-options.js'),
			Data.get('js/optionspage.js')
		]
	});

	panel.on('show', function() {

		//Only update what we need on show
		var prefs = [
			[ 'setElementValue', 'xffip', PrefServ.getter('extensions.agentSpoof.xffip')],
			[ 'setElementValue', 'viaip', PrefServ.getter('extensions.agentSpoof.viaip')],
			[ 'setElementValue', 'site_whitelist', PrefServ.getter('extensions.agentSpoof.fullWhiteList')]
		];

		setPrefArrays(prefs);
	});

	//initialize prefs before panel so we can preload panel before the user clicks it
	
	PrefServ.createPrefs();

	setupPanel();


	panel.port.on('whitelist', function(list, fullWhiteList, siteWhiteList) {

		//array of urls for faster lookups
		PrefServ.setter('extensions.agentSpoof.siteWhiteList', siteWhiteList);

		// full whitelist object containing per site configs
		PrefServ.setter('extensions.agentSpoof.fullWhiteList', fullWhiteList);

		//put fullwhitelist in memory to save time when checking for whitelist lookups
		Ras.setFullWhiteList(PrefServ.getter('extensions.agentSpoof.fullWhiteList'));
	});

	//get the profile ids to be excluded from the random selection
	panel.port.on('excludecb', function(profileid, profileindices, checked) {

		//use indices to check if it is a desktop profile or not and platform family
		var indices = profileindices.split(',');

		//create profile exclusion counter object
		var prof = JSON.parse(PrefServ.getter('extensions.agentSpoof.exclusionCount'));

		//check if the profile is to be added or removed
		//act accordingly

		if (checked == true) {
			//add profileid to the exclude list
			var exclude_list = [];
			var list = PrefServ.getter('extensions.agentSpoof.excludeList');

			if (list.length == 0) {

				exclude_list.push(profileid);

			} else {

				exclude_list = list.split(',');
				exclude_list.push(profileid);
			}

			PrefServ.setter('extensions.agentSpoof.excludeList', exclude_list.toString());

			//increase count of excluded profiles

			if (indices[0] == Ras.getDeskIndex()) {

				//a desktop profile
				prof['desktop'].exclude_count++;

			} else if (indices[0] == Ras.getMobileIndex()) {

				// a mobile profile
				prof['mobile'].exclude_count++;

			} else {

				//other profile (console)
				prof['other'].exclude_count++;
			}

			//increase specific profile count
			prof['random_' + indices[0] + ',' + indices[1]].exclude_count++;

		} else {

			//remove profileid from the exclude list
			var exclude_list = PrefServ.getter('extensions.agentSpoof.excludeList').split(',');
			var index = exclude_list.indexOf(profileid);

			if (index > -1) {

				exclude_list.splice(index, 1);
			}

			PrefServ.setter('extensions.agentSpoof.excludeList', exclude_list.toString());

			//decrease count of excluded profiles

			if (indices[0] == Ras.getDeskIndex()) {

				//a desktop profile
				prof['desktop'].exclude_count--;

			} else if (indices[0] == Ras.getMobileIndex()) {

				// a mobile profile
				prof['mobile'].exclude_count--;

			} else {

				//other profile (console)
				prof['other'].exclude_count--;
			}

			//decrease specific profile count.
			prof['random_' + indices[0] + ',' + indices[1]].exclude_count--;
		}

		//save the updated exclusion count
		PrefServ.setter('extensions.agentSpoof.exclusionCount', JSON.stringify(prof));
	});

	//store a preferences value
	panel.port.on('setPrefValue', function(pref, value) {

		PrefServ.setter(pref, value);
	});

	//store the accept header prefs
	panel.port.on('setAcceptHeader', function(raspref, ffpref, value) {

		Ras.setAcceptHeader(raspref, ffpref, value);
	});

	// get and set the user's font preference
	panel.port.on('fonts', function(pref, value) {

		PrefServ.setter(pref, (value === true ? 0 : 1));
	});

	//set enumberable plugin names preference
	panel.port.on('plugin_names', function(pref, value) {

		PrefServ.setter(pref, (value === true ? '' : '*'));
	});

	//get the user's timer and profile choice
	panel.port.on('uachange', function(ua_choice, interval) {

		PrefServ.setter('extensions.agentSpoof.timeInterval', interval);
		PrefServ.setter('extensions.agentSpoof.uaChosen', ua_choice);
	});

};

exports.getPanel = function() {

	return panel;
};

function setupPanel() {
	
	var prefs = [
		[ 'setElementText', 'version',  require('../package.json').version ],
		[ 'ua_list', Ras.getProfiles() ],
		[ 'nav_listener'],
		[ 'setCheckBox', PrefServ.getter('extensions.agentSpoof.uaChosen'),true],		
		[ 'setCheckBox', 'fonts', (PrefServ.getter('browser.display.use_document_fonts') === 0 ? true : false) ],
		[ 'setCheckBox', 'dom', !(PrefServ.getter('dom.storage.enabled')) ],
		[ 'setCheckBox', 'tab_history', (PrefServ.getter('extensions.agentSpoof.limitTab')) ],
		[ 'setCheckBox', 'cache_memory', !(PrefServ.getter('browser.cache.memory.enable')) ],
		[ 'setCheckBox', 'cache_disk', !(PrefServ.getter('browser.cache.disk.enable')) ],
		[ 'setCheckBox', 'cache_network', !(PrefServ.getter('network.http.use-cache')) ],
		[ 'setCheckBox', 'geo', (PrefServ.getter('geo.enabled')) ],
		[ 'setCheckBox', 'dns', PrefServ.getter('network.dns.disablePrefetch') ],
		[ 'setCheckBox', 'link', !(PrefServ.getter('network.prefetch-next')) ],
		[ 'setCheckBox', 'dnt', PrefServ.getter('privacy.donottrackheader.enabled') ],
		[ 'setCheckBox', 'xff', PrefServ.getter('extensions.agentSpoof.xff') ],
		[ 'setCheckBox', 'via', PrefServ.getter('extensions.agentSpoof.via') ],
		[ 'setCheckBox', 'ifnone', PrefServ.getter('extensions.agentSpoof.ifnone') ],
		[ 'setCheckBox', 'acceptd', PrefServ.getter('extensions.agentSpoof.acceptDefault') ],
		[ 'setCheckBox', 'accepte', PrefServ.getter('extensions.agentSpoof.acceptEncoding') ],
		[ 'setCheckBox', 'acceptl', PrefServ.getter('extensions.agentSpoof.acceptLang') ],
		[ 'setCheckBox', 'webgl', PrefServ.getter('webgl.disabled') ],
		[ 'setCheckBox', 'winname', PrefServ.getter('extensions.agentSpoof.windowName') ],
		[ 'setCheckBox', 'canvas', PrefServ.getter('extensions.agentSpoof.canvas') ],
		[ 'setCheckBox', 'webrtc', !(PrefServ.getter('media.peerconnection.enabled')) ],
		[ 'setCheckBox', 'auth', PrefServ.getter('extensions.agentSpoof.authorization') ],
		[ 'setCheckBox', 'browsing_downloads', !(PrefServ.getter('places.history.enabled')) ],
		[ 'setCheckBox', 'whitelist_enabled', !(PrefServ.getter('extensions.agentSpoof.whiteListDisabled')) ],
		[ 'setCheckBox', 'pdfjs', PrefServ.getter('pdfjs.disabled') ],
		[ 'setCheckBox', 'search_suggest', !(PrefServ.getter('browser.search.suggest.enabled')) ],
		[ 'setCheckBox', 'dom_performance', !(PrefServ.getter('dom.enable_performance')) ],
		[ 'setCheckBox', 'dom_resource_timing', !(PrefServ.getter('dom.enable_resource_timing')) ],
		[ 'setCheckBox', 'dom_battery', !(PrefServ.getter('dom.battery.enabled')) ],
		[ 'setCheckBox', 'dom_gamepad', !(PrefServ.getter('dom.gamepad.enabled')) ],
		[ 'setCheckBox', 'clicktoplay', (PrefServ.getter('plugins.click_to_play')) ],
		[ 'setCheckBox', 'mixed_content_active', (PrefServ.getter('security.mixed_content.block_active_content')) ],
		[ 'setCheckBox', 'mixed_content_display', (PrefServ.getter('security.mixed_content.block_display_content')) ],
		[ 'setCheckBox', 'scriptinjection', PrefServ.getter('extensions.agentSpoof.scriptInjection') ],
		[ 'setCheckBox', 'browser_pings', !(PrefServ.getter('browser.send_pings')) ],
		[ 'setCheckBox', 'web_beacons', !(PrefServ.getter('beacon.enabled')) ],
		[ 'setCheckBox', 'clipboard_events', !(PrefServ.getter('dom.event.clipboardevents.enabled')) ],
		[ 'setCheckBox', 'context_menu_events', !(PrefServ.getter('dom.event.contextmenu.enabled')) ],
		[ 'setCheckBox', 'tracking_protection', (PrefServ.getter('privacy.trackingprotection.enabled')) ],
		[ 'setCheckBox', 'plugin_names', (PrefServ.getter('plugins.enumerable_names') === '' ? true : false) ],
		[ 'setCheckBox', 'css_visited_links', !(PrefServ.getter('layout.css.visited_links_enabled')) ],
		[ 'setCheckBox', 'ref', (PrefServ.getter('extensions.agentSpoof.disableRef')) ],
		[ 'setCheckBox', 'refss', (PrefServ.getter('network.http.referer.spoofSource')) ],
		[ 'setCheckBox', 'safe_browsing', !(PrefServ.getter('browser.safebrowsing.enabled')) ],
		[ 'setCheckBox', 'safe_browsing_downloads', !(PrefServ.getter('browser.safebrowsing.downloads.enabled')) ],
		[ 'setCheckBox', 'safe_browsing_malware', !(PrefServ.getter('browser.safebrowsing.malware.enabled')) ],
		[ 'setCheckBox', 'health_report_service', !(PrefServ.getter('datareporting.healthreport.service.enabled')) ],
		[ 'setCheckBox', 'health_report_uploads', !(PrefServ.getter('datareporting.healthreport.uploadEnabled')) ],
		[ 'setCheckBox', 'telemetry', !(PrefServ.getter('toolkit.telemetry.enabled')) ],
		[ 'setSelectedIndexByValue', 'timerdd', PrefServ.getter('extensions.agentSpoof.timeInterval') ],
		[ 'setSelectedIndexByValue', 'xffdd', PrefServ.getter('extensions.agentSpoof.xffdd') ],
		[ 'setSelectedIndexByValue', 'viadd', PrefServ.getter('extensions.agentSpoof.viadd') ],
		[ 'setSelectedIndexByValue', 'tzdd', PrefServ.getter('extensions.agentSpoof.tzdd') ],
		[ 'setSelectedIndexByValue', 'refxopdd', PrefServ.getter('network.http.referer.XOriginPolicy').toString() ],
		[ 'setSelectedIndexByValue', 'reftpdd', PrefServ.getter('network.http.referer.trimmingPolicy').toString() ],
		[ 'setSelectedIndexByValue', 'screendd', PrefServ.getter('extensions.agentSpoof.screenSize') ],
		[ 'setSelectedIndexByValue', 'tzdd', PrefServ.getter('extensions.agentSpoof.tzOffset') ],
		[ 'setSelectedIndexByValue', 'langdd', PrefServ.getter('extensions.agentSpoof.acceptLangChoice') ],
		[ 'setSelectedIndexByValue', 'geodd', PrefServ.getter('geo.wifi.uri') ],
		[ 'setElementValue', 'useragent_input', PrefServ.getter('extensions.agentSpoof.whiteListUserAgent') ],
		[ 'setElementValue', 'appcodename_input', PrefServ.getter('extensions.agentSpoof.whiteListAppCodeName') ],
		[ 'setElementValue', 'appname_input', PrefServ.getter('extensions.agentSpoof.whiteListAppName') ],
		[ 'setElementValue', 'appversion_input', PrefServ.getter('extensions.agentSpoof.whiteListAppVersion') ],
		[ 'setElementValue', 'vendor_input', PrefServ.getter('extensions.agentSpoof.whiteListVendor') ],
		[ 'setElementValue', 'vendorsub_input', PrefServ.getter('extensions.agentSpoof.whiteListVendorSub') ],
		[ 'setElementValue', 'platform_input', PrefServ.getter('extensions.agentSpoof.whiteListPlatform') ],
		[ 'setElementValue', 'oscpu_input', PrefServ.getter('extensions.agentSpoof.whiteListOsCpu') ],
		[ 'setElementValue', 'acceptdefault_input', PrefServ.getter('extensions.agentSpoof.whiteListAccept') ],
		[ 'setElementValue', 'acceptencoding_input', PrefServ.getter('extensions.agentSpoof.whiteListAcceptEncoding') ],
		[ 'setElementValue', 'acceptlanguage_input', PrefServ.getter('extensions.agentSpoof.whiteListAcceptLanguage') ],
		[ 'setMultiCheckBox', PrefServ.getter('extensions.agentSpoof.excludeList') ],
		[ 'setIPDDValues', 'xffip', PrefServ.getter('extensions.agentSpoof.xffip') ],
		[ 'setIPDDValues', 'viaip', PrefServ.getter('extensions.agentSpoof.viaip') ],
		[ 'setElementValue', 'site_whitelist', PrefServ.getter('extensions.agentSpoof.fullWhiteList') ]
	];
	
	setPrefArrays(prefs);
};

function setPrefArrays(prefs){

	for(var i=0, l=prefs.length; i < l; i++){
		panel.port.emit.apply(this,prefs[i]);
	}
};
