require("sdk/test").run(exports);

var profData,
	Data = require('../lib/Data');

/*	
	Note: Tests are numbered to control the order of execution to ensure 
	the profiles are loaded first. Otherwise they seem to execute in 
	alphabetical rather than the order in which they are defined.
*/


function loadProfiles(profiles){
	profData = Data.loadJSON(profiles);
}

function checkIfArrayIsUnique(arr) {
	var map = {}, i, size;

	for (var i = 0, size = arr.length; i < size; i++){
		if (map[arr[i]]){
			return false;
		}

		map[arr[i]] = true;
	}

	return true;
}

function getNonUniqueElements(arr){

	var non_unique = arr.filter(function(elem, index, self) {
		return index != self.indexOf(elem);
	});

	return non_unique;
}


function checkArrayForSubStrings(assert,i,j,k,str,strArr){

	for (var i=0; i<strArr.length; i++){

		if (str.indexOf(strArr[i]) === -1)
			assert.fail(strArr[i] + " is not a sub string of "+ str +" for "+profData[i].list[j].useragents[k].description);
	}
}


function matchProperty(assert,i,j,k,property,value){

	if (profData[i].list[j].useragents[k][property] !== value )
		assert.fail(property+" value does not match profile for "+profData[i].list[j].useragents[k].description);
}

function matchSubProperty(assert,i,j,k,property,subProperty,value){

	if (profData[i].list[j].useragents[k][property][subProperty] !== value )
		assert.fail(property + " : "+subProperty+" value does not match profile for "+profData[i].list[j].useragents[k].description);
}

function propertySubString(assert,i,j,k,p1,p2){

	if (profData[i].list[j].useragents[k][p1].indexOf(profData[i].list[j].useragents[k][p2]) === -1)
		assert.fail(p2 + " is not a sub string of "+ p1 +" for "+profData[i].list[j].useragents[k].description);

}

function compareTwoProperties(assert,i,j,k,p1,p2){

	if (profData[i].list[j].useragents[k][p1] !== profData[i].list[j].useragents[k][p2])
		assert.fail(p1 + " value does not match "+ p2 +" value for "+profData[i].list[j].useragents[k].description);
}




exports["test 0: profile file parsing"] = function(assert){

	try{
		loadProfiles('../data/json/useragents.json');
		assert.pass("profile parsing passed");
	}catch(e){
		assert.fail("profile parsing failed");
	}
}

exports["test 1: unique profile ids"] = function(assert){

	var pids = new Array();

	for (var i=0;i < profData.length; i++){

		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){

				pids.push(profData[i].list[j].useragents[k].profileID);
			}

		}
	}

	if (getNonUniqueElements(pids).length == 0)
		assert.pass("only unique profile ids exist");
	else
		assert.fail("non unique profile ids exist : "+getNonUniqueElements(pids));

}

exports["test 2: screen values"] = function(assert){

	for (var i=0;i < profData.length; i++){

		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){

				var screens = (profData[i].list[j].useragents[k].screens).split(',');

				for (var s=0; s < screens.length; s++){

					var sizes =  screens[s].split('x');

					if (sizes.length > 2)
						assert.fail("too many size paramaters at "+profData[i].list[j].useragents[k].description);

					if (sizes.length < 2)
						assert.fail("too few size paramaters at "+profData[i].list[j].useragents[k].description);

					if ((sizes[0].match(/^[0-9]+$/) != null) === false)
						assert.fail("value "+sizes[0]+" at "+profData[i].list[j].useragents[k].description);

					if ((sizes[1].match(/^[0-9]+$/) != null) === false)
						assert.fail("value "+sizes[1]+" at "+profData[i].list[j].useragents[k].description);

				}
			}

		}
	}

	assert.pass("no bad screen values found");

}

//all profiles must have a  en-US language object as a fallback
exports["test 3: fallback en-US language"] = function(assert){

	for (var i=0;i < profData.length; i++){

		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){

				if(profData[i].list[j].useragents[k].accept_lang['en-US'] === undefined )
					assert.fail("en-US does not exist for "+profData[i].list[j].useragents[k].description);
			}

		}
	}

	assert.pass("en-US exists for all profiles");
}

exports["test 4: colorDepth and pixelDepth"] = function(assert){


	var values = ['24','32']; //suitable values used by profiles

	for (var i=0;i < profData.length; i++){

		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){

				compareTwoProperties(assert,i,j,k,"colordepth","pixeldepth");

				if (profData[i].list[j].useragents[k].description.indexOf("Steam Browser") > -1){
					matchProperty(assert,i,j,k,"colordepth","0");

				}else if (values.indexOf(profData[i].list[j].useragents[k].colordepth) === -1 )
					assert.fail("Depth values are incorrect for "+profData[i].list[j].useragents[k].description);

			}

		}
	}

	assert.pass("Depth values in each profile are equal and have suitable values");
}

exports["test 5: chrome browsers"] = function(assert){

	//TODO platforms,Some Android browsers

	function checkLangs(i,j,k){

		
		matchSubProperty(assert,i,j,k,"accept_lang","en-US","en-US,en;q=0.8");
	}

	for (var i=0;i < profData.length; i++){

		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){


				if((profData[i].list[j].useragents[k].description).indexOf("Chrom") > -1){


					var uaString = profData[i].list[j].useragents[k].useragent;

					//check for chrome on iOS
					if((profData[i].list[j].useragents[k].description).indexOf("iOS") > -1){

						matchProperty(assert,i,j,k,"vendor","Apple Computer, Inc.");
						matchProperty(assert,i,j,k,"accept_encoding","gzip,deflate");
						matchProperty(assert,i,j,k,"accept_default","text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,image/webp");
						checkLangs(i,j,k);


						var strArr = ["Mozilla/5.0 (iPhone; CPU iPhone OS","like Mac OS X) AppleWebKit/","(KHTML, like Gecko) CriOS/","Mobile/","Safari/"];

						checkArrayForSubStrings(assert,i,j,k,uaString,strArr);


					//Non iOS versions of Chrome
					}else {

						matchProperty(assert,i,j,k,"vendor","Google Inc.");

						//Misc Android profiles that deviate from the standard chrome profiles
						if((profData[i].list[j].useragents[k].description).indexOf("Android") > -1){

							//TODO


						}else{ // All other versions Desktop and Android


							matchProperty(assert,i,j,k,"accept_encoding","gzip,deflate,sdch");
							matchProperty(assert,i,j,k,"accept_default","text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
							checkLangs(i,j,k);

							var strArr = ["Mozilla/5.0 (",") AppleWebKit/", "Safari/","(KHTML, like Gecko)", "Chrome/"];

							checkArrayForSubStrings(assert,i,j,k,uaString,strArr);

							if(profData[i].list[j].useragents[k].description.indexOf("Chromium") > -1 &&
								profData[i].list[j].useragents[k].description.indexOf("BSD") === -1){

								if(uaString.indexOf("Chromium/") === -1)
									assert.fail("User agent string does not match Chrome for "+profData[i].list[j].useragents[k].description);
							}


						}
					}

						propertySubString(assert,i,j,k,"useragent","appversion");
						matchProperty(assert,i,j,k,"vendorsub","");
						matchProperty(assert,i,j,k,"appname","Netscape");
						matchProperty(assert,i,j,k,"buildID","");
						matchProperty(assert,i,j,k,"oscpu","");

				}
			}
		}
	}

	assert.pass("Chrome browser values are correct");
}


exports["test 6: firefox browsers"] = function(assert){

	//TODO useragent

	
	function checkLangs(i,j,k){
	
		matchSubProperty(assert,i,j,k,"accept_lang" ,"da-DK", "da,en-US;q=0.7,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"de-DE", "de,en-US;q=0.7,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"en-US", "en-US,en;q=0.5");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"es-ES", "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"fr-FR", "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"it-IT", "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"ja", "ja,en-US;q=0.7,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"ko-KR", "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"pt-PT", "pt-PT,pt;q=0.8,en;q=0.5,en-US;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"ru-RU", "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"sv-SE", "sv-SE,sv;q=0.8,en-US;q=0.5,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"sq-AL", "sq,sq-AL;q=0.8,en-us;q=0.5,en;q=0.3");
		matchSubProperty(assert,i,j,k,"accept_lang" ,"zh-CN", "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3");
	
	}
	
	function commonUnixTests(i,j,k,platforms){

		if (platforms.indexOf(profData[i].list[j].useragents[k].platform) === -1)
			assert.fail("Platform value does not match for "+profData[i].list[j].useragents[k].description);

		propertySubString(assert,i,j,k,"useragent","oscpu");
		matchProperty(assert,i,j,k,"appversion","5.0 (X11)");
		compareTwoProperties(assert,i,j,k,"platform","oscpu");

	}


	var browsers = ['Firefox','Iceweasel','SeaMonkey','Palemoon'];

	for (var i=0;i < profData.length; i++){

		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){

				for (var b=0; b<browsers.length; b++){

					var uaString = profData[i].list[j].useragents[k].useragent;
					
					if (profData[i].list[j].useragents[k].description.indexOf(browsers[b]) > -1 ){

						matchProperty(assert,i,j,k,"vendorsub","");
						matchProperty(assert,i,j,k,"appname","Netscape");
						matchProperty(assert,i,j,k,"buildID","");

						//platform specific firefox checks
						if (profData[i].list[j].description == "Windows Browsers"){


							if(profData[i].list[j].useragents[k].description.indexOf('Palemoon') > -1){

								matchProperty(assert,i,j,k,"platform","Win64");
								propertySubString(assert,i,j,k,"useragent","appversion");

							}else{

								matchProperty(assert,i,j,k,"platform","Win32");
								matchProperty(assert,i,j,k,"appversion",'5.0 (Windows)');
							}

						}else if (profData[i].list[j].description == "Mac Browsers"){

							matchProperty(assert,i,j,k,"platform",'MacIntel');
							propertySubString(assert,i,j,k,"useragent","oscpu");
							matchProperty(assert,i,j,k,"appversion",'5.0 (Macintosh)');


						}else if (profData[i].list[j].description == "Linux Browsers"){

							var platforms = ['Linux x86_64','Linux i686'];
							commonUnixTests(i,j,k,platforms);

						}else if (profData[i].list[j].description == "Unix Browsers"){

							var platforms = [
								'OpenBSD amd64','FreeBSD amd64','FreeBSD i386',
								'OpenBSD i386','NetBSD i386','NetBSD amd64'];

							commonUnixTests(i,j,k,platforms);


						}else if (profData[i].list[j].description == "Android Browsers"){

							var platforms = ['Linux armv7l','Linux i686'];

							if (platforms.indexOf(profData[i].list[j].useragents[k].platform) === -1)
								assert.fail("Platform value does not match "+browsers[b]+" for "+profData[i].list[j].useragents[k].description);

								compareTwoProperties(assert,i,j,k,"platform","oscpu");
								matchProperty(assert,i,j,k,"appversion","5.0 (Android)");

						}else if (profData[i].list[j].description == "Firefox OS Browsers"){

								matchProperty(assert,i,j,k,"platform","");
								matchProperty(assert,i,j,k,"appversion","5.0 ()");
								compareTwoProperties(assert,i,j,k,"platform","oscpu");
						}

						//Language tests


						checkLangs(i,j,k);
						
						var strArr = ["Mozilla/5.0 (","rv:","Gecko/","Firefox/"];
						checkArrayForSubStrings(assert,i,j,k,uaString,strArr);
					}

				}
			}

		}
	}

	assert.pass("Firefox browser values are correct");
}

