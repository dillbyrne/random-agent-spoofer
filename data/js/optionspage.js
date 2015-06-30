document.body.addEventListener('change', function(e) {

	//get selected checkbox
	if (e.target.type == 'checkbox' && e.target.className != 'excludecb') {

		if (e.target.dataset.invertvalue == 'false')

			self.port.emit(
				'setPrefValue',
				e.target.dataset.prefname,
				e.target.checked
			);

		else if (e.target.dataset.invertvalue == 'true')

			self.port.emit(
				'setPrefValue',
				e.target.dataset.prefname,
				!(e.target.checked)
			);

		else if (e.target.dataset.ffheader)

			self.port.emit(
				'setAcceptHeader',
				e.target.dataset.raspref,
				e.target.dataset.ffheader,
				e.target.checked
			);

		else //call a specific function for this checkbox

			self.port.emit(
				e.target.id,
				e.target.dataset.prefname,
				e.target.checked
			);

	} else if (e.target.className == 'excludecb') {

		self.port.emit(
			'excludecb',
			e.target.id,
			e.target.value,
			e.target.checked
		);

	} else if (e.target.className == 'ipdropdown') { //show or hide the ip input boxes

		if (e.target[e.target.selectedIndex].value == 'custom') {

			document.getElementById(e.target.dataset.uipref).className = '';
			document.querySelector('#' + e.target.dataset.uipref + ' input').focus();

		} else {

			document.getElementById(e.target.dataset.uipref).className = 'hidden';
		}

		self.port.emit(
			'setPrefValue',
			e.target.dataset.prefname,
			e.target[e.target.selectedIndex].value
		);
	
	} else if (e.target.className == 'dd') {

		self.port.emit(
			'setPrefValue',
			e.target.dataset.prefname,
			e.target[e.target.selectedIndex].value
		);

	} else if (e.target.className == 'idd') {

		self.port.emit(
			'setPrefValue',
			e.target.dataset.prefname,
			parseInt(e.target[e.target.selectedIndex].value)
		);

	} else if (e.target.id == 'timerdd' || e.target.name == 'ua') {

		//get timer and selected ua option
		var timerdd = document.getElementById('timerdd');
		var uaList = document.getElementsByName('ua');
		var time = timerdd[timerdd.selectedIndex].value;

		//get selected profile
		var ua_choice = document.querySelector('input[name="ua"]:checked').value;
		self.port.emit('uachange', ua_choice,time);
	}

}, false);

document.body.addEventListener('keyup', function(e) {

	//set the input validation class
	if ((e.target.id).substr(3, 2) == 'ip') {

		var input = document.getElementById(e.target.id);
		var result = validateIP(input.value);

		if (result == false) {

			input.className = 'invalidInput';

		} else {

			input.className = 'validInput';

			self.port.emit(
				'setPrefValue',
				e.target.dataset.prefname,
				input.value
			);
		}

	} else if (e.target.id == 'site_whitelist') {

		var input = document.getElementById(e.target.id);

		var result = validateJSON(input.value);

		if (result == false) {

			input.className = 'invalidInput';

		} else {

			input.className = 'validInput';

			var data = JSON.parse(document.getElementById('site_whitelist').value);

			//sort the json data by url attribute
			data = sortWhiteListObjByURL(data);

			//copy the urls into another list for faster lookups
			var sitelist = new Array();

			for (var i = 0, len = data.length ; i < len ; i++) {

				sitelist.push(data[i].url);
			}

			//save the lists
			self.port.emit(
				'whitelist',
				'siteWhiteList',
				JSON.stringify(data),
				sitelist.toString()
			);
		}
	}

}, false);

//handle whitelist
document.body.addEventListener('click', function(e) {

	//whitelist profile save button
	if (e.target.id =='wlprofsavebtn') {

		self.port.emit(
			'setPrefValue',
			document.getElementById('useragent_input').dataset.prefname,
			document.getElementById('useragent_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('appcodename_input').dataset.prefname,
			document.getElementById('appcodename_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('appname_input').dataset.prefname,
			document.getElementById('appname_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('appversion_input').dataset.prefname,
			document.getElementById('appversion_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('vendor_input').dataset.prefname,
			document.getElementById('vendor_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('vendorsub_input').dataset.prefname,
			document.getElementById('vendorsub_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('platform_input').dataset.prefname,
			document.getElementById('platform_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('oscpu_input').dataset.prefname,
			document.getElementById('oscpu_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('acceptdefault_input').dataset.prefname,
			document.getElementById('acceptdefault_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('acceptencoding_input').dataset.prefname,
			document.getElementById('acceptencoding_input').value
		);
		self.port.emit(
			'setPrefValue',
			document.getElementById('acceptlanguage_input').dataset.prefname,
			document.getElementById('acceptlanguage_input').value
		);

	} else if (e.target.id == 'whitelist_rules_title') {

		document.getElementById('site_whitelist').focus();
	}

}, false);

document.body.addEventListener('focus', function(e) {

	//set the input validation class
	if ((e.target.id).substr(3, 2) == 'ip') {

		var input = document.getElementById(e.target.id);
		var result = validateIP(input.value);

		if (result == false)

			input.className = 'invalidInput';

		else
			input.className = 'validInput';

	} else if (e.target.id == 'site_whitelist') {

		var input = document.getElementById(e.target.id);

		var result = validateJSON(input.value);

		if (result == false)

			input.className = 'invalidInput';

		else
			input.className = 'validInput';
	}

}, true);

document.body.addEventListener('blur', function(e) {

	//remove the class for input validation
	if ((e.target.id).substr(3, 2) == 'ip') {

		document.getElementById(e.target.id).className = '';

	} else if (e.target.id == 'site_whitelist') {

		document.getElementById(e.target.id).className = '';
	}

}, true);

function validateIP(ipaddress) {

	if (ipaddress === null || ipaddress == '')

		return false;

	var ip_segments = ipaddress.split('.');

	//check for 4 segments split on '.'
	if (ip_segments.length != 4) {

		return false;

	} else {

		for (var i = 0 ; i < 4 ; i++) {

			//check if ip segment is a number and not a hex number or a space or an exponent
			if ((!isNaN(ip_segments[i]))
				&& ip_segments[i].indexOf('x') == -1
				&& ip_segments[i].length > 0
				&& ip_segments[i].length <= 3
				&& ip_segments[i].indexOf(' ') == -1
				&& ip_segments[i].indexOf('e') == -1) {

				//check the range of the segment is valid
				if (ip_segments[i] >= 0 && ip_segments[i] <= 255) {

					//check for 000 , 010 etc
					if ((ip_segments[i].substring(0,1) == '0' && ip_segments[i] != 0)
						|| ip_segments[i] == '00' || ip_segments[i] == '000')

						return false;

				} else {

					return false;
				}

			} else {

				return false;
			}
		}
	}

	return true;
}

function validateJSON(jsonStringData) {

	try {
		var data = JSON.parse(jsonStringData);

		if (data.length == 0)

			return false;

		//a url must be present for each entry
		for (i = 0, len = data.length ; i < len ; i++) {

			if (data[i].url == '' || data[i].url === undefined)

				return false;
		}

		return true;

	} catch(e) {

		return false;
	}
}

function sortWhiteListObjByURL(array) {

	var array = array.sort(function(a,b) {

		if (a.url == b.url)	return 0;
		if (a.url < b.url) return -1;
		if (a.url > b.url) return 1;
	});

	return array;
}
