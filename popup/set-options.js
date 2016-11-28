"use strict";

// Navigation in tab in the browser action
{
    var nav = document.getElementById('nav').children;

    [].forEach.call(nav, function(navEl) {

        navEl.addEventListener('click', function() {

            [].forEach.call(nav, function(navEl) {

                navEl.classList.remove('selected');
            });

            this.classList.add('selected');

            var tabs = document.querySelectorAll('body > div');

            [].forEach.call(tabs, function(tab) {

                tab.classList.add('hidden');
            });

            document.getElementById(this.id + '_tab').classList.remove('hidden');
        });
    });
}

// Load the useragents and set the useragent options
{
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("POST", '../data/json/useragents.json', true);

    xhr.onreadystatechange = function() { //Call a function when the state changes.
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {

            const data = JSON.parse(xhr.responseText);
            var profileList = document.getElementById('ualist');

            for (var k = 0, len = data.length; k < len; k++) {
                for (var i = 0, len2 = data[k].list.length; i < len2; i++) {
                    // section header

                    var sectionHeader = document.createElement('h3');
                    sectionHeader.classList.add('trigger');
                    sectionHeader.textContent = data[k].list[i].description;

                    sectionHeader.addEventListener('click', function() {

                        this.classList.toggle('open');
                    });

                    profileList.appendChild(sectionHeader);

                    // user agent list

                    var uaList = document.createElement('ul');
                    uaList.classList.add('expandable');

                    profileList.appendChild(uaList);

                    // random element

                    var randomEl = document.createElement('li');

                    uaList.appendChild(randomEl);

                    // random element components

                    var radio = document.createElement('input');
                    radio.setAttribute('name', 'ua');
                    radio.setAttribute('type', 'radio');
                    radio.setAttribute('id', 'random_' + k + ',' + i);
                    radio.setAttribute('value', 'random_' + k + ',' + i);

                    randomEl.appendChild(radio);

                    var label = document.createElement('label');
                    label.setAttribute('for', 'random_' + k + ',' + i);
                    label.textContent = ' ' + 'Random' + ' ' + data[k].list[i].description;

                    randomEl.appendChild(label);

                    var excludeHeader = document.createElement('span');
                    excludeHeader.textContent = 'Exclude';

                    randomEl.appendChild(excludeHeader);

                    for (var j = 0, len3 = data[k].list[i].useragents.length; j < len3; j++) {

                        // regular element

                        var regularEl = document.createElement('li');

                        uaList.appendChild(regularEl);

                        // regular element components

                        var radio = document.createElement('input');

                        radio.setAttribute('name', 'ua');
                        radio.setAttribute('type', 'radio');
                        radio.setAttribute('id', k + ',' + i + ',' + j);
                        radio.setAttribute('value', k + ',' + i + ',' + j);

                        regularEl.appendChild(radio);

                        var label = document.createElement('label');

                        label.setAttribute('for', k + ',' + i + ',' + j);
                        label.textContent = ' ' + data[k].list[i].useragents[j].description;

                        regularEl.appendChild(label);

                        var excludeBox = document.createElement('input');
                        excludeBox.setAttribute('type', 'checkbox');
                        excludeBox.setAttribute('class', 'excludecb');
                        excludeBox.setAttribute('id', data[k].list[i].useragents[j].profileID);
                        excludeBox.setAttribute('value', k + ',' + i + ',' + j);

                        regularEl.appendChild(excludeBox);
                    }
                }
            }
        }
    }
    xhr.send();
}


// Set the state of the checkbox
{
    const uaChosen = browser.storage.local.get('uaChosen');
    const fonts = browser.preferences.get('browser.display.use_document_fonts', '');

    const checkbox_list = [
		['dom', browser.preferences.get('dom.storage.enabled', ''), true],
        ['cache_memory', browser.preferences.get('browser.cache.memory.enable', ''), true],
		['cache_disk', browser.preferences.get('browser.cache.disk.enable', ''), true],
        ['link', browser.preferences.get('network.prefetch-next', ''), true],
        ['webrtc', browser.preferences.get('media.peerconnection.enabled', ''), true],
        ['browsing_downloads', browser.preferences.get('places.history.enabled', ''), true],
		['whitelist_enabled', browser.storage.local.get('whiteListDisabled'), true],
        ['search_suggest', browser.preferences.get('browser.search.suggest.enabled', ''), true],
		['dom_performance', browser.preferences.get('dom.enable_performance', ''), true],
		['dom_resource_timing', browser.preferences.get('dom.enable_resource_timing', ''), true],
		['dom_user_timing', browser.preferences.get('dom.enable_user_timing', ''), true],
		['dom_battery', browser.preferences.get('dom.battery.enabled', ''), true],
		['dom_gamepad', browser.preferences.get('dom.gamepad.enabled', ''), true],
        ['browser_pings', browser.preferences.get('browser.send_pings', ''), true],
		['web_beacons', browser.preferences.get('beacon.enabled', ''), true],
		['clipboard_events', browser.preferences.get('dom.event.clipboardevents.enabled', ''), true],
		['context_menu_events', browser.preferences.get('dom.event.contextmenu.enabled', ''), true],
        ['css_visited_links', browser.preferences.get('layout.css.visited_links_enabled', ''), true],
        ['safe_browsing', browser.preferences.get('browser.safebrowsing.enabled', ''), true],
		['safe_browsing_downloads', browser.preferences.get('browser.safebrowsing.downloads.enabled', ''), true],
		['safe_browsing_malware', browser.preferences.get('browser.safebrowsing.malware.enabled', ''), true],
		['health_report_uploads', browser.preferences.get('datareporting.healthreport.uploadEnabled', ''), true],
		['telemetry', browser.preferences.get('toolkit.telemetry.enabled', ''), true],
        ['tab_history', browser.storage.local.get('limitTab'), false],
		['block_plugins', browser.storage.local.get('blockPlugins'), false],
		['geo', browser.preferences.get('geo.enabled', ''), false],
		['dns', browser.preferences.get('network.dns.disablePrefetch', ''), false],
		['dnt', browser.preferences.get('privacy.donottrackheader.enabled', ''), false],
		['xff', browser.storage.local.get('xff'), false],
		['via', browser.storage.local.get('via'), false],
		['ifnone', browser.storage.local.get('ifnone'), false],
		['acceptd', browser.storage.local.get('acceptDefault'), false],
		['accepte', browser.storage.local.get('acceptEncoding'), false],
		['acceptl', browser.storage.local.get('acceptLang'), false],
		['webgl', browser.preferences.get('webgl.disabled', ''), false],
		['winname', browser.storage.local.get('windowName'), false],
		['canvas', browser.storage.local.get('canvas'), false],
		['auth', browser.storage.local.get('authorization'), false],
		['pdfjs', browser.preferences.get('pdfjs.disabled', ''), false],
		['clicktoplay', browser.preferences.get('plugins.click_to_play', ''), false],
		['mixed_content_active', browser.preferences.get('security.mixed_content.block_active_content', ''), false],
		['mixed_content_display', browser.preferences.get('security.mixed_content.block_display_content', ''), false],
		['scriptinjection', browser.storage.local.get('scriptInjection'), false],
		['tracking_protection', browser.preferences.get('privacy.trackingprotection.enabled', ''), false],
		['ref', browser.storage.local.get('disableRef'), false],
		['refss', browser.preferences.get('network.http.referer.spoofSource', ''), false],
		['show_notifications', browser.preferences.get('extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_notifications', ''), false],
		['show_context_menu', browser.preferences.get('extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_context_menu', ''), false]
    ];

    uaChosen.then(result => {
        if (typeof result === 'string') {
            document.getElementById(result).checked = true;
        }
    });

    fonts.then(result => {
        document.getElementById('fonts').checked = (result === 0 ? true : false);
    });

	checkbox_list.forEach( checkbox => {
        const id = checkbox[0],
              valuePromise = checkbox[1],
              needInvert = checkbox[2];
        valuePromise.then(value => {
	           document.getElementById(id).checked = (needInvert ? !value : value);
        });
	});
}


// Set the selection
{
    const elem = [
        ['useragent_input', browser.storage.local.get('whiteListUserAgent')],
        ['appcodename_input', browser.storage.local.get('whiteListAppCodeName')],
        ['appname_input', browser.storage.local.get('whiteListAppName')],
        ['appversion_input', browser.storage.local.get('whiteListAppVersion')],
        ['vendor_input', browser.storage.local.get('whiteListVendor')],
        ['vendorsub_input', browser.storage.local.get('whiteListVendorSub')],
        ['platform_input', browser.storage.local.get('whiteListPlatform')],
        ['oscpu_input', browser.storage.local.get('whiteListOsCpu')],
        ['acceptdefault_input', browser.storage.local.get('whiteListAccept')],
        ['acceptencoding_input', browser.storage.local.get('whiteListAcceptEncoding')],
        ['acceptlanguage_input', browser.storage.local.get('whiteListAcceptLanguage')],
		['site_whitelist', browser.storage.local.get('fullWhiteList')]
    ];

    elem.forEach( e => {
        e[1].then(value => {
               document.getElementById(e[0]).value = value;
        });
    });
}


// Set the version of the extension
{
    document.getElementById('version').textContent = browser.runtime.getManifest().version;
}


// Set the IP dd values
{
    const ipdd = [
        ['xffip', browser.storage.local.get('extensions.agentSpoof.xffip')],
        ['viaip', browser.storage.local.get('extensions.agentSpoof.viaip')]
    ]

    ipdd.forEach(result => {
        const elementid = result[0],
              value = result[1];

        document.getElementById(elementid).value = value;

    	//set custom ipcheck inputs to show if custom is selected
    	if (document.getElementById(elementid.slice(0, -2) + 'dd').value == 'custom') {
    		document.getElementById('custom'+elementid.slice(0, -2)).className='';
    	}
    });
}


//setSelectedIndexByValue
{
    const selected = [
        ['timerdd', browser.storage.local.get('timeInterval'), false],
		['xffdd', browser.storage.local.get('xffdd'), false],
		['viadd', browser.storage.local.get('viadd'), false],
		['refxopdd', browser.preferences.get('network.http.referer.XOriginPolicy', ''), true],
		['reftpdd', browser.preferences.get('network.http.referer.trimmingPolicy', ''), true],
		['screendd', browser.storage.local.get('screenSize'), false],
		//['tzdd', browser.storage.local.get('tzOffset'), false], temporarily disabled, fix needed
		['langdd', browser.storage.local.get('acceptLangChoice'), false],
		['geodd', browser.preferences.get('geo.wifi.uri', ''), false],
		['cookiedd', browser.preferences.get('network.cookie.cookieBehavior', ''), true],
		['cookielifedd', browser.preferences.get('network.cookie.lifetimePolicy', ''), true ]
    ];

    selected.forEach(result => {
        const dropdown = result[0],
              toString = result[2];
        var indexvalue;

        if (toString) {
            indexvalue = result[1].toString();
        } else {
            indexvalue = result[1];
        }

    	var dd = document.getElementById(dropdown);

    	for (var i = 0, len = dd.options.length ; i < len ; i++) {
    		if (dd.options[i].value === indexvalue) {
    			dd.selectedIndex = i;
    			break;
    		}
    	}
    });
}


// setMultiCheckBox
{
    browser.storage.local.get('excludeList').then(checkBoxList => {
    	//set exclude the checkboxes states
    	if (checkBoxList.length > 0) {

    		var exclude_list = checkBoxList.split(',');

    		for (var i = 0, len = exclude_list.length ; i < len ; i++) {

    			document.getElementById(exclude_list[i]).checked = true;
    		}
    	}
    });
};


// updatePanelItems
{
    browser.storage.local.get('uaChosen').then(ua_choice => {
        // const state

        if (typeof ua_choice === 'string') {
        	toggleSectionHeaderColor(ua_choice);
        	toggleRandomOptions(ua_choice);
        	toggleTabsColor(ua_choice); //toggleTabsColor(ua_choice,state);
        }
    });
};


// toggleState
{
    const state = false;
	changeElementsState('input',state);
	changeElementsState('select',state);
	changeElementsState('textarea',state);
	changeElementsState('button',state);
}


function changeElementsState(tagName, state) {

    var elems = document.getElementsByTagName(tagName);
    var len = elems.length;

    for (var i = 0; i < len; i++) {
        elems[i].disabled = state;
    }
}

function toggleTabsColor(ua_choice) {
    document.getElementById("default_label").classList.remove('disabledLabel');

    if (ua_choice !== 'default') {
        document.body.classList.remove('disabled');
        document.body.classList.add('spoof');
    } else {
        document.body.classList.remove('spoof');
        document.body.classList.remove('disabled');
    }
};

function toggleSectionHeaderColor(ua_choice) {
    var sectionHeaders = document.querySelectorAll('#ualist h3');

    [].forEach.call(sectionHeaders, function(header) {
        header.classList.remove('active');
    });

    var uaList = document.getElementById('ualist');
    var currentElement = document.getElementById(ua_choice);

    if (uaList.contains(currentElement)) {
        currentElement.parentNode.parentNode.previousSibling.classList.add('active');
    }
}

function toggleRandomOptions(ua_choice) {
    if (ua_choice.substr(0, 6) == 'random') {
        document.body.classList.add('random');
    } else {
        document.body.classList.remove('random');
    }
}

var triggers = document.querySelectorAll('.trigger');

[].forEach.call(triggers, function(trigger) {
    trigger.addEventListener('click', function() {
        this.classList.toggle('open');
    });
});
