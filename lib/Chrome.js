const {Cc, Ci, Cr, Cu} = require('chrome');

var PrefServ = require('./PrefServ'),
	Ras = require('./Ras'),
	Panel = require('./Panel'),
	Timer = require('./Timer'),
	ContextMenu = require('./ContextMenu'),
	ActionButton = require('./ActionButton'),
	whiteListStateArray = new Array (5), //to store the state of the header whitelist options
	panel = null, //Panel.getPanel() will not work at this point
	Observer = {

		observe: function(subject, topic, data) {

			if (panel === null) {

				panel = Panel.getPanel();

				// Set Addon Version number
				Cu.import('resource://gre/modules/AddonManager.jsm');
				AddonManager.getAddonByID('jid1-AVgCeF1zoVzMjA@jetpack', function(addon) {

					panel.port.emit('setElementText', 'version', addon.version);
				});

				// set panel colors and timer visibility on startup
				var ua_choice = PrefServ.getter('extensions.agentSpoof.uaChosen');
				panel.port.emit('updatePanelItems', ua_choice);
			}

			// Observe Preferences

			if (data === 'extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_context_menu') {

				ContextMenu.showMenu(PrefServ.getter('extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_context_menu'));

			} else if (data === 'extensions.agentSpoof.timeInterval'
					|| data === 'extensions.agentSpoof.uaChosen') {

				//clear timer and set the profile and new timer value if any
				Timer.clearTimer();
				Ras.profileAndTimerSetup();

				var ua_choice = PrefServ.getter('extensions.agentSpoof.uaChosen');
				var timer_choice = PrefServ.getter('extensions.agentSpoof.timeInterval');

				//set timer and Profile choice UI elements
				panel.port.emit('setSelectedIndexByValue', 'timerdd', timer_choice);
				panel.port.emit('setCheckBox', ua_choice,true);
				panel.port.emit('updatePanelItems', ua_choice);
				ContextMenu.setProfileIcons(ua_choice);
				ContextMenu.setTimerIcons(timer_choice);
				ActionButton.toggleIconAndLabel();

			} else if (data === 'extensions.agentSpoof.acceptLangChoice'){

				// Change accept Language header for the currently selected profile

				Ras.setAcceptHeader(
					"extensions.agentSpoof.acceptLang",
					"intl.accept_languages",
					PrefServ.getter("extensions.agentSpoof.acceptLang")
				);
			
			}

			// Observe requests
			if (topic == 'http-on-modify-request') {

				var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
				var url = httpChannel.URI.spec;

				// (Re)set whitelist values to false
				for (var i = 0, len = whiteListStateArray.length ; i < len ; i++) {

					whiteListStateArray[i] = false;
				}

				// if the whitelist is not disabled and the default profile is not in use
				if (PrefServ.getter('extensions.agentSpoof.whiteListDisabled') == false
					&& PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default') {

					// send the whitelisted profiles headers to whitelisted sites
					// check the list of urls only
					if (listCheck(PrefServ.getter('extensions.agentSpoof.siteWhiteList').split(','), url) == true) {

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
					&& whiteListStateArray[4] == false) {

					httpChannel.setRequestHeader('Authorization', '', false);
				}

				// Don't send Referer header
				if (PrefServ.getter('extensions.agentSpoof.referer') == 'none'
					&& whiteListStateArray[0] == false) {

					httpChannel.setRequestHeader('Referer', '', false);
				}

				//set spoofed xff header ip
				if (PrefServ.getter('extensions.agentSpoof.xff') == true
					&& whiteListStateArray[1] == false) {

					if (PrefServ.getter('extensions.agentSpoof.xffdd') == 'random') {

						httpChannel.setRequestHeader('X-Forwarded-For', Ras.getRandomIP(), false);

					} else if (PrefServ.getter('extensions.agentSpoof.xffdd') == 'custom'
							&& PrefServ.getter('extensions.agentSpoof.xffip') != '') {

						httpChannel.setRequestHeader('X-Forwarded-For', PrefServ.getter('extensions.agentSpoof.xffip'), false);
					}
				}

				//set spoofed via header ip
				if (PrefServ.getter('extensions.agentSpoof.via') == true
					&& whiteListStateArray[2] == false) {

					if (PrefServ.getter('extensions.agentSpoof.viadd') == 'random') {

						httpChannel.setRequestHeader('Via','1.1 ' + Ras.getRandomIP(), false);

					} else if (PrefServ.getter('extensions.agentSpoof.viadd') == 'custom'
							&& PrefServ.getter('extensions.agentSpoof.viaip') != '') {

						httpChannel.setRequestHeader('Via', '1.1 ' + PrefServ.getter('extensions.agentSpoof.viaip'), false);
					}
				}

				//send spoofed if none match header
				if (PrefServ.getter('extensions.agentSpoof.ifnone') == true
					&& whiteListStateArray[3] == false) {

					httpChannel.setRequestHeader('If-None-Match', (Math.random() * 10).toString(36).substr(2, Math.random() * (10 - 5 + 1) + 5), false);
				}

			}
		},

		get observerService() {

			return Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
		},

		get preferencesService(){

			return Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
		},

		register: function() {

			this.observerService.addObserver(this, 'http-on-modify-request', false);
			this.preferencesService.getBranch('').addObserver('', this, false);
		},

		unregister: function() {

			this.observerService.removeObserver(this, 'http-on-modify-request');
			this.preferencesService.getBranch('').removeObserver('', this);
		}
	};

exports.getObserver = function() {

	return Observer;
};

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

//check for header related whitelist options
function checkWhiteListConfig(index) {

	//get the whitelist entry
	var whiteListItem = Ras.getFullWhiteListEntry(index);

	//check if options exist for the url
	if (whiteListItem.options) {

		//check if referer header has been whitelisted to allow it
		if (whiteListItem.options.indexOf('referer') > -1)

			whiteListStateArray[0] = true;

		//check if sending of the xff header has been whitelisted to disallow it
		if (whiteListItem.options.indexOf('xff') > -1)

			whiteListStateArray[1] = true;

		//check if sending of the via header has been whitelisted to disallow it
		if (whiteListItem.options.indexOf('via') > -1)

			whiteListStateArray[2] = true;

		//check if sending of the if-none-match header has been whitelisted to disallow it
		if (whiteListItem.options.indexOf('ifnonematch') > -1)

			whiteListStateArray[3] = true;

		//check if sending of the authorization header has been whitelisted to allow it
		if (whiteListItem.options.indexOf('authorization') > -1)

			whiteListStateArray[4] = true;
	}
};
