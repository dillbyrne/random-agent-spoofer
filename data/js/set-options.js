self.port.once('nav_listener', function() {

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
});

self.port.once('ua_list', function(data) {

	var profileList = document.getElementById('ualist');

	for (var k = 0, len = data.length ; k < len ; k++) {

		for (var i = 0, len2 = data[k].list.length ; i < len2 ; i++) {

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

			for (var j = 0, len3 = data[k].list[i].useragents.length ; j < len3 ; j++) {

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
});

self.port.on('setCheckBox', function(checkboxid, value) {

	document.getElementById(checkboxid).checked = value;
});

self.port.on('setElementValue', function(elementid, value) {

	document.getElementById(elementid).value = value;
});

self.port.on('setElementText', function(elementid, value) {

	document.getElementById(elementid).textContent = value;
});

self.port.on('setIPDDValues', function(elementid, value) {

	document.getElementById(elementid).value = value;

	//set custom ipcheck inputs to show if custom is selected
	if (document.getElementById(elementid.slice(0, -2) + 'dd').value == 'custom') {

		document.getElementById('custom'+elementid.slice(0, -2)).className='';
	}
});

self.port.on('setSelectedIndexByValue', function(dropdown, indexvalue) {

	var dd = document.getElementById(dropdown);

	for (var i = 0, len = dd.options.length ; i < len ; i++) {

		if (dd.options[i].value === indexvalue) {

			dd.selectedIndex = i;
			break;
		}
	}
});

self.port.on('setMultiCheckBox', function(checkBoxList) {

	//set exclude the checkboxes states
	if (checkBoxList.length > 0) {

		var exclude_list = checkBoxList.split(',');

		for (var i = 0, len = exclude_list.length ; i < len ; i++) {

			document.getElementById(exclude_list[i]).checked = true;
		}
	}
});

self.port.on('updatePanelItems', function(ua_choice) {

	toggleSectionHeaderColor(ua_choice);
	toggleRandomOptions(ua_choice);
	toggleTabsColor(ua_choice);
});

function toggleTabsColor(ua_choice) {

	if (ua_choice != 'default')

		document.body.classList.add('spoof');

	else

		document.body.classList.remove('spoof');
};

function toggleSectionHeaderColor(ua_choice) {

	var sectionHeaders = document.querySelectorAll('#ualist h3');

	[].forEach.call(sectionHeaders, function(header) {

		header.classList.remove('active');
	});

	var uaList = document.getElementById('ualist');
	var currentElement = document.getElementById(ua_choice);

	if (uaList.contains(currentElement))

		currentElement.parentNode.parentNode.previousSibling.classList.add('active');
}

function toggleRandomOptions(ua_choice) {

	if (ua_choice.substr(0,6) == 'random')

		document.body.classList.add('random');

	else

		document.body.classList.remove('random');
}

var triggers = document.querySelectorAll('.trigger');

[].forEach.call(triggers, function(trigger) {

	trigger.addEventListener('click', function() {

		this.classList.toggle('open');
	});
});
