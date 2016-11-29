'use strict';

document.addEventListener('change', (e) => {
  // get selected checkbox
  if (e.target.type === 'checkbox' && e.target.className !== 'excludecb') {
    if (e.target.dataset.invertvalue === 'false') {
      browser.preferences.set(e.target.dataset.prefname, e.target.checked);
    } else if (e.target.dataset.invertvalue === 'true') {
      browser.preferences.set(e.target.dataset.prefname, !e.target.checked);
    } else if (e.target.dataset.ffheader) {
      /*
      self.port.emit(
          'setAcceptHeader',
          e.target.dataset.raspref,
          e.target.dataset.ffheader,
          e.target.checked
      );
      */

    } else {
      // call a specific function for this checkbox
      /*
      self.port.emit(
          e.target.id,
          e.target.dataset.prefname,
          e.target.checked
      );
      */
    }
  } else if (e.target.className === 'excludecb') {
    /*
    self.port.emit(
        'excludecb',
        e.target.id,
        e.target.value,
        e.target.checked
    );
    */
  } else if (e.target.className === 'ipdropdown') { // show or hide the ip input boxes
    if (e.target[e.target.selectedIndex].value === 'custom') {
      document.getElementById(e.target.dataset.uipref).className = '';
      document.querySelector(`#${e.target.dataset.uipref} input`).focus();
    } else {
      document.getElementById(e.target.dataset.uipref).className = 'hidden';
    }
    browser.preferences.set(e.target.dataset.prefname, e.target[e.target.selectedIndex].value);
  } else if (e.target.className === 'dd') {
    browser.preferences.set(e.target.dataset.prefname, e.target[e.target.selectedIndex].value);
  } else if (e.target.className === 'idd') {
    browser.preferences.set(e.target.dataset.prefname,
        parseInt(e.target[e.target.selectedIndex].value, 10));
  } else if (e.target.id === 'timerdd' || e.target.name === 'ua') {
    // get timer and selected ua option
    const timerdd = document.getElementById('timerdd');
    const uaList = document.getElementsByName('ua');
    const time = timerdd[timerdd.selectedIndex].value;

    // get selected profile
    const uaChoice = document.querySelector('input[name="ua"]:checked').value;
    // self.port.emit('uachange', uaChoice, time);
  }
}, false);

document.addEventListener('keyup', (e) => {
  // set the input validation class
  if ((e.target.id).substr(3, 2) === 'ip') {
    const input = document.getElementById(e.target.id);
    const result = validateIP(input.value);

    if (result === false) {
      input.className = 'invalidInput';
    } else {
      input.className = 'validInput';
      browser.preferences.set(e.target.dataset.prefname, input.value);
    }
  } else if (e.target.id === 'site_whitelist') {
    const input = document.getElementById(e.target.id);
    const result = validateJSON(input.value);

    if (result === false) {
      input.className = 'invalidInput';
    } else {
      input.className = 'validInput';

      let data = JSON.parse(document.getElementById('site_whitelist').value);

      // sort the json data by url attribute
      data = sortWhiteListObjByURL(data);

      // save the lists
      /*
      self.port.emit(
          'whitelist',
          JSON.stringify(data)
      );
      */
    }
  }
}, false);

// handle whitelist
document.addEventListener('click', (e) => {
  // whitelist profile save button
  if (e.target.id === 'wlprofsavebtn') {
    const prefs = [
      'useragent_input',
      'appcodename_input',
      'appname_input',
      'appversion_input',
      'vendor_input',
      'vendorsub_input',
      'platform_input',
      'oscpu_input',
      'acceptdefault_input',
      'acceptencoding_input',
      'acceptlanguage_input',
    ];

    for (let i = 0, l = prefs.length; i < l; i += 1) {
      browser.preferences.set(document.getElementById(prefs[i]).dataset.prefname,
        document.getElementById(prefs[i]).value);
    }
  } else if (e.target.id === 'whitelist_rules_title') {
    document.getElementById('site_whitelist').focus();
  }
}, false);

document.addEventListener('focus', (e) => {
  if (e.target.id !== null) {
    // set the input validation class
    if ((e.target.id).substr(3, 2) === 'ip') {
      const input = document.getElementById(e.target.id);
      const result = validateIP(input.value);

      if (result === false) {
        input.className = 'invalidInput';
      } else {
        input.className = 'validInput';
      }
    } else if (e.target.id === 'site_whitelist') {
      const input = document.getElementById(e.target.id);

      const result = validateJSON(input.value);

      if (result === false) {
        input.className = 'invalidInput';
      } else {
        input.className = 'validInput';
      }
    }
  }
}, true);

document.addEventListener('blur', (e) => {
  if (e.target.id !== null) {
    // remove the class for input validation
    if ((e.target.id).substr(3, 2) === 'ip') {
      document.getElementById(e.target.id).className = '';
    } else if (e.target.id === 'site_whitelist') {
      document.getElementById(e.target.id).className = '';
    }
  }
}, true);

function validateIP(ipAddress) {
  if (ipAddress === null || ipAddress === '') {
    return false;
  }

  const ipSegments = ipAddress.split('.');

  // check for 4 segments split on '.'
  if (ipSegments.length !== 4) {
    return false;
  }

  for (let i = 0; i < 4; i += 1) {
    // check if ip segment is a number and not a hex number or a space or an exponent
    if ((!isNaN(ipSegments[i])) &&
      ipSegments[i].indexOf('x') === -1 &&
      ipSegments[i].length > 0 &&
      ipSegments[i].length <= 3 &&
      ipSegments[i].indexOf(' ') === -1 &&
      ipSegments[i].indexOf('e') === -1) {
      // check the range of the segment is valid
      if (ipSegments[i] >= 0 && ipSegments[i] <= 255) {
        // check for 000 , 010 etc
        if ((ipSegments[i].substring(0, 1) === '0' && ipSegments[i] !== 0) ||
          ipSegments[i] === '00' || ipSegments[i] === '000') {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}

function validateJSON(jsonStringData) {
  try {
    const data = JSON.parse(jsonStringData);

    if (data.length === 0) {
      return false;
    }
    // a url must be present for each entry
    for (let i = 0, len = data.length; i < len; i += 1) {
      if (data[i].url === '' || data[i].url === undefined) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

function sortWhiteListObjByURL(array) {
  const result = array.sort((a, b) => {
    if (a.url === b.url) return 0;
    if (a.url < b.url) return -1;
    if (a.url > b.url) return 1;
  });

  return result;
}
