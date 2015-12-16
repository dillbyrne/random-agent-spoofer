var PageMod = require('sdk/page-mod'),
	PrefServ = require('./PrefServ'),
	Ras = require('./Ras'),
	Data = require('./Data'),
	whiteListStateArray = new Array (5), //store the state of the whitelist state and js whitelist options
	dateInfo;

exports.init = function() {

	PageMod.PageMod({
		include: '*',
		contentScriptFile: Data.get('js/inject.js'),
		contentScriptWhen: 'start',
		attachTo: ['top', 'frame'],

		onAttach: function(worker) {

			// inject if script injection has been enabled and the addon is enabled
			if (PrefServ.getter('extensions.agentSpoof.scriptInjection') === true
				&& PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled') === true) {

				//(Re)set whitelist values to false
				for (var i = 0, len = whiteListStateArray.length ; i < len ; i++) {

					whiteListStateArray[i] = false;
				}

				if (PrefServ.getter('extensions.agentSpoof.whiteListDisabled') == false) {

					//check if the current url is in the whitelist
					whiteListStateArray[0] = listCheck(PrefServ.getter('extensions.agentSpoof.siteWhiteList').split(','), worker.tab.url);
				}

				dateInfo = getDateInfo(); //generate fake date info

				var scriptParams = JSON.stringify(mergeObjects(getIntParams(),getStrParams(),getBoolParams()));

				worker.port.emit('inject', scriptParams);
			}
		}
	});
};

function mergeObjects() {

	var ret = {};
	var len = arguments.length;
	
	for (var i=0; i<len; i++) {
		for (p in arguments[i]) {
			if (arguments[i].hasOwnProperty(p)) {
				ret[p] = arguments[i][p];
			}
		}
	}
	
	return ret;
}


//check if a url is in the list
function listCheck(list, url) {

	for (var i = 0, len = list.length ; i < len ; i++) {

		if (url.indexOf(list[i]) > -1) {

			//check the config for the url now confirmed to be in the list
			checkWhiteListConfig(i);
			return true;
		}
	}

	return false;
};

function checkWhiteListConfig(index) {

	//get the whitelist entry
	var whiteListItem = Ras.getFullWhiteListEntry(index);

	//check if options exist for the url
	if (whiteListItem.options) {

		if (whiteListItem.options.indexOf('canvas') > -1)

			whiteListStateArray[1] = true;

		if (whiteListItem.options.indexOf('windowName') > -1)

			whiteListStateArray[2] = true;

		if (whiteListItem.options.indexOf('screen') > -1)

			whiteListStateArray[3] = true;

		if (whiteListItem.options.indexOf('date') > -1)

			whiteListStateArray[4] = true;
	}
};

function getBoolParams() {

	var bParams = {};

	bParams.applyWhiteList = whiteListStateArray[0];

	//check if the canvas has been set to be whitelisted
	if (whiteListStateArray[1] === true)

		bParams.canvas = false ;

	else
		bParams.canvas = PrefServ.getter('extensions.agentSpoof.canvas');
	
	//check if window.name has been set to be whitelisted
	if (whiteListStateArray[2] === true)

		bParams.windowName = false ;

	else
		bParams.windowName = PrefServ.getter('extensions.agentSpoof.windowName') ;

	//check if screen and window spoofing have been set to whitelisted
	if (whiteListStateArray[3] === true)

		bParams.screen = false ;

	else
		bParams.screen = true ;

	//check if date spoofing has been set to be whitelisted or if the default timezone was selected
	if (whiteListStateArray[4] === true || PrefServ.getter('extensions.agentSpoof.tzOffset') == 'default')

		bParams.date = false ;

	else
		bParams.date = true ;

	bParams.limitTab = PrefServ.getter('extensions.agentSpoof.limitTab');
	
	if (PrefServ.getter('extensions.agentSpoof.uaChosen') === 'default')
		
		bParams.realProfile = true ;
	
	else 
		bParams.realProfile = false ;
	
	return bParams;
}

function getStrParams() {

	var sParams = {};

	// Vendor override value sent with non whitelisted profiles
	sParams.vendor = PrefServ.getter('general.useragent.vendor');

	// Whitelist profile values
	// Whitelist headers need to be sent along with this
	// Whitelist headers are sent in Chrome.js

	sParams.wlUserAgent = PrefServ.getter('extensions.agentSpoof.whiteListUserAgent');
	sParams.wlAppCodeName = PrefServ.getter('extensions.agentSpoof.whiteListAppCodeName');
	sParams.wlAppName = PrefServ.getter('extensions.agentSpoof.whiteListAppName');
	sParams.wlAppVersion = PrefServ.getter('extensions.agentSpoof.whiteListAppVersion');
	sParams.wlVendor = PrefServ.getter('extensions.agentSpoof.whiteListVendor');
	sParams.wlVendorSub = PrefServ.getter('extensions.agentSpoof.whiteListVendorSub');
	sParams.wlPlatform = PrefServ.getter('extensions.agentSpoof.whiteListPlatform');
	sParams.wlOsCpu = PrefServ.getter('extensions.agentSpoof.whiteListOsCpu');

	//spoofed date strings
	sParams.dateStr = dateInfo[0].dateStrings[0]; 
	sParams.localeStr = dateInfo[0].dateStrings[1];
	sParams.localeDateStr = dateInfo[0].dateStrings[2];
	sParams.timeStr = dateInfo[0].dateStrings[3];
	sParams.localeTimeStr = dateInfo[0].dateStrings[4];

	return sParams;
}

function getIntParams() {

	var params = {};
	params.tzoffset = dateInfo[0].tzoffset;

	var screens = getScreenAttributes();

	params.screenWidth = screens[0];
	params.screenHeight = screens[1];
	params.screenAvailWidth = screens[0];
	params.screenAvailHeight = screens[1];
	params.windowInnerWidth = screens[0];
	params.windowInnerHeight = screens[1];
	params.windowOuterWidth = screens[0];
	params.windowOuterHeight = screens[1];
	
	//set pixel and color depth to 24 for default profile as it is a desktop profile
	if (PrefServ.getter('extensions.agentSpoof.uaChosen') === 'default') {
		params.pixelDepth = 24;
		params.colorDepth = 24;
	
	} else { //all other profiles will use the values defined in the profile
		params.pixelDepth = screens[2];
		params.colorDepth = screens[3];
	}

	return params;
};

function getScreenAttributes() {

	var pixeldepth = PrefServ.getter('extensions.agentSpoof.pixeldepth');
	var colordepth = PrefServ.getter('extensions.agentSpoof.colordepth');

	// Use the default screen size
	if (PrefServ.getter('extensions.agentSpoof.screenSize') == 'default') {

		return [null, null, null, null];

		// Pick one of the predefined generic sizes at random.

	} else if (PrefServ.getter('extensions.agentSpoof.screenSize') == 'random') {

		var sizes = getScreens()[getRandomNum(getScreens().length)].split('x');

		return [parseInt(sizes[0]), parseInt(sizes[1]), pixeldepth, colordepth];

		// Pick a random screen size from the list defined for the current profile
		// These are taken from the real devices

	} else if (PrefServ.getter('extensions.agentSpoof.screenSize') == 'profile') {

		var screens;

		//default profile does not have screens defined so we will use the random options here
		if (PrefServ.getter('extensions.agentSpoof.uaChosen') === 'default') {
	
			screens = getScreens();	
		
		}else{ //all other profiles have screens defined
		
			screens = PrefServ.getter('extensions.agentSpoof.screens').split(',');
		}

		var sizes = screens[getRandomNum(screens.length)].split('x');

		return [parseInt(sizes[0]), parseInt(sizes[1]), pixeldepth, colordepth];

	} else { // Apply a specifically chosen screen size

		var sizes = (PrefServ.getter('extensions.agentSpoof.screenSize').split('x'));
		return [parseInt(sizes[0]), parseInt(sizes[1]), pixeldepth, colordepth];
	}

}

function getScreens(){

	// https://en.wikipedia.org/wiki/Display_resolution#Computer_monitors
	return [
		'800x600', '1024x600', '1024x768', '1152x864', '1280x720',
		'1280x768', '1280x800', '1280x960', '1280x1024', '1360x768',
		'1366x768', '1440x900', '1400x1050', '1600x900', '1600x1200',
		'1680x1050', '1920x1080', '1920x1200', '2048x1152', '2560x1440',
		'2560x1600'
	];

}

//get a random number from 0 - maximum
function getRandomNum(maximum) {

	return Math.floor(Math.random() * maximum);
};

function getTimeZoneOffset() {

	//a random offset was chosen
	if (PrefServ.getter('extensions.agentSpoof.tzOffset') == 'random') {
		// https://en.wikipedia.org/wiki/Time_zone#List_of_UTC_offsets
		var offsets = [
			-14, -13, -12.75, -12, -11.5,
			-11, -10.5, -10, -9.5, -9,
			-8.75, -8, -7, -6.5, -6,
			-5.75, -5.5, -5, -4.5, -4,
			-3.5, -3, -2, -1, 0,
			1, 2, 3.5, 4, 4.5,
			5, 6, 7, 8, 9,
			9.5, 10, 11, 12
		];

		var rand_offset = offsets[getRandomNum(offsets.length)];
		return rand_offset * 60;

	} else { //a specific timezone was chosen

		var offset = parseFloat(PrefServ.getter('extensions.agentSpoof.tzOffset'));
		return offset * 60;
	}
};

function pad(num) {

	norm = Math.abs(Math.floor(num));
	return (norm < 10 ? '0' : '') + norm;
};

function getDateInfo() {

	//if default timezone, there is no point in spoofing values as they will be skipped so we return
	if (PrefServ.getter('extensions.agentSpoof.tzOffset') == 'default') {

		return [{'tzoffset': null, 'dateStrings': ['', '', '', '', '']}];
	}

	//TimeZone
	var tzoffset = getTimeZoneOffset();

	//Date
	var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	//time zone abbreviations which match to utc offsets in getTimeZoneOffset()
	//https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations
	var tzAbbrev = [{
		'-840': ['(LINT)'],
		'-780': ['(NZDT)', '(PHOT)', '(TKT)', '(TOT)'],
		'-765': ['(CHAST)'],
		'-720': ['(FJT)', '(GILT)', '(MAGT)', '(MHT)', '(NZST)', '(PETT)', '(TVT)', '(WAKT)'],
		'-690': ['(NFT)'],
		'-660': ['(AEDT)', '(KOST)', '(LHST)', '(MIST)', '(NCT)', '(PONT)', '(SAKT)', '(SBT)', '(VUT)'],
		'-630': ['(ACDT)', '(CST)', '(LHST)'],
		'-600': ['(AEST)', '(ChST)', '(CHUT)', '(DDUT)', '(EST)', '(PGT)', '(VLAT)', '(YAKT)'],
		'-570': ['(ACST)', '(CST)'],
		'-540': ['(AWDT)', '(EIT)', '(IRKT)', '(JST)', '(KST)', '(TLT)'],
		'-525': ['(CWST)'],
		'-480': ['(ACT)', '(AWST)', '(BDT)', '(CHOT)', '(CIT)', '(CT)', '(HKT)', '(MST)', '(MYT)', '(PST)', '(SGT)', '(SST)', '(ULAT)', '(WST)'],
		'-420': ['(CXT)', '(DAVT)', '(HOVT)', '(ICT)', '(KRAT)', '(OMST)', '(THA)', '(WIT)'],
		'-390': ['(CCT)', '(MMT)', '(MST)'],
		'-360': ['(BIOT)', '(BST)', '(BTT)', '(KGT)', '(VOST)', '(YEKT)'],
		'-345': ['(NPT)'],
		'-330': ['(IST)', '(SLST)'],
		'-300': ['(AMST)', '(HMT)', '(MAWT)', '(MVT)', '(ORAT)', '(PKT)', '(TFT)', '(TJT)', '(TMT)', '(UZT)'],
		'-270': ['(AFT)', '(IRDT)'],
		'-240': ['(AMT)', '(AZT)', '(GET)', '(GST)', '(MSK)', '(MUT)', '(RET)', '(SAMT)', '(VOLT)'],
		'-210': ['(IRST)'],
		'-180': ['(AST)', '(EAT)', '(EEDT)', '(EEST)', '(FET)', '(IDT)', '(IOT)', '(SYOT)'],
		'-120': ['(CAT)', '(CEDT)', '(CEST)', '(EET)', '(HAEC)', '(IST)', '(MEST)', '(SAST)', '(WAST)'],
		'-60': ['(BST)', '(CET)', '(DFT)', '(IST)', '(MET)', '(WAT)', '(WEDT)', '(WEST)'],
		'0': ['(GMT)', '(UCT)', '(UTC)', '(WET)', '(Z)'],
		'60': ['(AZOST)', '(CVT)', '(EGT)'],
		'120': ['(FNT)', '(GST)', '(PMDT)', '(UYST)'],
		'180': ['(ADT)', '(AMST)', '(ART)', '(BRT)', '(CLST)', '(FKST)', '(GFT)', '(PMST)', '(PYST)', '(ROTT)', '(SRT)', '(UYT)'],
		'210': ['(NST)', '(NT)'],
		'240': ['(AMT)', '(AST)', '(BOT)', '(CDT)', '(CLT)', '(COST)', '(ECT)', '(EDT)', '(FKT)', '(GYT)', '(PYT)'],
		'270': ['(VET)'],
		'300': ['(CDT)', '(COT)', '(CST)', '(EASST)', '(ECT)', '(EST)', '(PET)'],
		'360': ['(CST)', '(EAST)', '(GALT)', '(MDT)'],
		'420': ['(MST)', '(PDT)'],
		'480': ['(AKDT)', '(CIST)', '(PST)'],
		'540': ['(AKST)', '(GAMT)', '(GIT)', '(HADT)'],
		'570': ['(MART)', '(MIT)'],
		'600': ['(CKT)', '(HAST)', '(HST)', '(TAHT)'],
		'660': ['(NUT)', '(SST)'],
		'720': ['(BIT)']
	}];

	// get localized date object
	var now = new Date();
	var dif = tzoffset <= 0 ? '+' : '-';

	//create spoofed date object with offsets to calculate the correct date & time.
	var sdate = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getUTCHours() + (parseInt((tzoffset * -1) / 60)),
		now.getUTCMinutes() + (tzoffset % 60),
		now.getSeconds()
	);

	var padHoursOffset = pad(sdate.getHours());
	var padMinsOffset = pad(sdate.getMinutes());
	var padSecsOffset = pad(sdate.getSeconds());

	//Date.toString() override
	var dateString = months[sdate.getMonth()] + ' ';
		dateString += days[sdate.getDay()]+ ' ';
		dateString += sdate.getDate() + ' ';
		dateString += sdate.getFullYear() + ' ';
		dateString += padHoursOffset + ':';
		dateString += padMinsOffset + ':';
		dateString += padSecsOffset + ' GMT';
		dateString += dif + pad(parseInt(tzoffset/60) );
		dateString += pad( tzoffset % 60) + ' ';
		dateString += tzAbbrev[0][tzoffset.toString()][getRandomNum(tzAbbrev[0][tzoffset.toString()].length)];

	var localeString = sdate.toLocaleString('en-US');
	var localeDateString = sdate.toLocaleDateString('en-US');

	var timeString = sdate.toString().slice(16);
	var localeTimeString = timeString.slice(0, 8);

	var dateStrings = [dateString, localeString, localeDateString, timeString, localeTimeString];

	return [{'tzoffset': tzoffset, 'dateStrings': dateStrings}];
};
