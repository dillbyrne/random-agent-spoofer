const { Ci, Cc } = require('chrome');
const { PrefsTarget } = require("sdk/preferences/event-target");

var PrefServ = require('./PrefServ'),
	Ras = require('./Ras'),
	Panel = require('./Panel'),
	Timer = require('./Timer'),
	ContextMenu = require('./ContextMenu'),
	ActionButton = require('./ActionButton'),
	utils = require('./Utils'),
	wlHeaderStates = {  //store the state of the current site's whitelist header options
		'authorization': false,
		'via': false,
		'xff': false,
		'ifnonematch': false,
		'referer': false
	},
	panel = null, //Panel.getPanel() will not work at this point
	events = require("sdk/system/events"),
	target = PrefsTarget({ branchName: ""}),
	globalMM = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager),
	frameURL = require("./Data").get("js/frame.js?" + Math.random());

exports.init = function(){

	globalMM.loadFrameScript(frameURL, true);
	addMessageListeners(globalMM);

	if (panel === null) {

		panel = Panel.getPanel();

		// set panel colors and timer visibility on startup
		var ua_choice = PrefServ.getter('extensions.agentSpoof.uaChosen');
		panel.port.emit('updatePanelItems', 
				ua_choice,
				PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled'));
	}

}

//params for the frame script to pass to intercept.js
function addMessageListeners(mm){
	mm.addMessageListener("RAS-frameOptions", function (message) {

		var params = {};
		
		params.canvas =  PrefServ.getter('extensions.agentSpoof.canvas');
		params.vendor =  PrefServ.getter('general.useragent.vendor');
		params.limitTab = PrefServ.getter('extensions.agentSpoof.limitTab');
		params.plugins = PrefServ.getter('extensions.agentSpoof.blockPlugins');
		params.winName = PrefServ.getter('extensions.agentSpoof.windowName');
		params.webSocket = PrefServ.getter('extensions.agentSpoof.webSocket');
		params.audioContext = PrefServ.getter('extensions.agentSpoof.audioContext');

		
		return params;
	});
	
	mm.addMessageListener("RAS-scriptInjection", function (message) {
		return PrefServ.getter('extensions.agentSpoof.scriptInjection');
	});
}

function preferenceHandler(prefName){

	if (prefName === 'extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled') {
			
		if(PrefServ.getter(prefName) === true){
			PrefServ.toggleOn();
		} else {
			PrefServ.toggleOff();
		}
		
		ContextMenu.toggleIconAndLabel();
		ActionButton.toggleIconAndLabel();

		// set panel colors and timer visibility on startup
		var ua_choice = PrefServ.getter('extensions.agentSpoof.uaChosen');
		panel.port.emit('updatePanelItems', 
				ua_choice,
				PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled'));

		//disable UI elements when the addon is disabled
		panel.port.emit('toggleState', !PrefServ.getter(prefName));
		
	} else if (prefName === 'extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_context_menu') {

		ContextMenu.showMenu(PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_context_menu'));
	
	} else if (prefName === 'extensions.agentSpoof.whiteListDisabled'){
		
		if (PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled')){

		 ContextMenu.toggleWhiteListIconAndLabel();
		 panel.port.emit('setCheckBox', 'whitelist_enabled', !(PrefServ.getter('extensions.agentSpoof.whiteListDisabled')));
		}

	} else if (prefName === 'extensions.agentSpoof.timeInterval'
			|| prefName === 'extensions.agentSpoof.uaChosen') {

		//clear timer and set the profile and new timer value if any
		Timer.clearTimer();
		Ras.profileAndTimerSetup();

		var ua_choice = PrefServ.getter('extensions.agentSpoof.uaChosen');
		var timer_choice = PrefServ.getter('extensions.agentSpoof.timeInterval');

		//set timer and Profile choice UI elements
		panel.port.emit('setSelectedIndexByValue', 'timerdd', timer_choice);
		panel.port.emit('setCheckBox', ua_choice,true);
		panel.port.emit('updatePanelItems', 
				ua_choice,
				PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled'));
		ContextMenu.setProfileIcons(ua_choice);
		ContextMenu.setTimerIcons(timer_choice);
		ActionButton.toggleIconAndLabel();
		ContextMenu.toggleIconAndLabel();

	} else if (prefName === 'extensions.agentSpoof.acceptLangChoice'){

		// Change accept Language header for the currently selected profile

		Ras.setAcceptHeader(
			"extensions.agentSpoof.acceptLang",
			"intl.accept_languages",
			PrefServ.getter("extensions.agentSpoof.acceptLang")
		);
	
	}
}


function requestHandler(event){

	//only run if enabled
	if (PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.enabled') === true) {


		var httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);
		var url = httpChannel.URI.spec;

		// if the whitelist is not disabled and the default profile is not in use
		if (PrefServ.getter('extensions.agentSpoof.whiteListDisabled') == false
			&& PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default') {

			// send the whitelisted profiles headers to whitelisted sites
			// check the list of urls only
			if (utils.listCheck(url,wlHeaderStates) == true) {

				httpChannel.setRequestHeader('User-Agent', PrefServ.getter('extensions.agentSpoof.whiteListUserAgent') , false);
				httpChannel.setRequestHeader('Accept', PrefServ.getter('extensions.agentSpoof.whiteListAccept'), false);
				httpChannel.setRequestHeader('Accept-Language', PrefServ.getter('extensions.agentSpoof.whiteListAcceptLanguage'), false);
				httpChannel.setRequestHeader('Accept-Encoding', PrefServ.getter('extensions.agentSpoof.whiteListAcceptEncoding'), false);
			}

		} else {
			// use the headers specified in the spoofed profile

			// send the accept language header ourselves to stop firefox from
			// overwriting the q value
			if (PrefServ.getter('extensions.agentSpoof.acceptLang') == true
				&& PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default') {

				httpChannel.setRequestHeader('Accept-Language', PrefServ.getter('intl.accept_languages'), false);
			}
		}

		//change on request
		if (PrefServ.getter('extensions.agentSpoof.timeInterval') == 'request'
			&& PrefServ.getter('extensions.agentSpoof.uaChosen').slice(0, 6) == 'random') {

			Ras.setupAndAssignProfile();
		}

		// Don't send HTTP Authorization header unless it is disabled or whitelisted
		if (PrefServ.getter('extensions.agentSpoof.authorization') == true
			&& wlHeaderStates.authorization == false) {

			httpChannel.setRequestHeader('Authorization', '', false);
		}

		// Don't send Referer header
		if (PrefServ.getter('extensions.agentSpoof.disableRef') == true
			&& wlHeaderStates.referer == false) {

			httpChannel.setRequestHeader('Referer', '', false);
		}

		//set spoofed xff header ip
		if (PrefServ.getter('extensions.agentSpoof.xff') == true
			&& wlHeaderStates.xff == false) {

			if (PrefServ.getter('extensions.agentSpoof.xffdd') == 'random') {

				httpChannel.setRequestHeader('X-Forwarded-For', Ras.getRandomIP(), false);

			} else if (PrefServ.getter('extensions.agentSpoof.xffdd') == 'custom'
					&& PrefServ.getter('extensions.agentSpoof.xffip') != '') {

				httpChannel.setRequestHeader('X-Forwarded-For', PrefServ.getter('extensions.agentSpoof.xffip'), false);
			}
		}

		//set spoofed via header ip
		if (PrefServ.getter('extensions.agentSpoof.via') == true
			&& wlHeaderStates.via == false) {

			if (PrefServ.getter('extensions.agentSpoof.viadd') == 'random') {

				httpChannel.setRequestHeader('Via','1.1 ' + Ras.getRandomIP(), false);

			} else if (PrefServ.getter('extensions.agentSpoof.viadd') == 'custom'
					&& PrefServ.getter('extensions.agentSpoof.viaip') != '') {

				httpChannel.setRequestHeader('Via', '1.1 ' + PrefServ.getter('extensions.agentSpoof.viaip'), false);
			}
		}

		//send spoofed if none match header
		if (PrefServ.getter('extensions.agentSpoof.ifnone') == true
			&& wlHeaderStates.ifnonematch == false) {

			httpChannel.setRequestHeader('If-None-Match', (Math.random() * 10).toString(36).substr(2, Math.random() * (10 - 5 + 1) + 5), false);
		}
	}

}

exports.register = function() {

	events.on("http-on-modify-request", requestHandler);
	target.on("", preferenceHandler);
}

exports.unregister = function() {

	events.off("http-on-modify-request",requestHandler);
	target.off("",preferenceHandler);
}

exports.unloadFrameScript = function() {
	
	globalMM.removeDelayedFrameScript(frameURL);
	globalMM.broadcastAsyncMessage("RAS-unload");	
}

