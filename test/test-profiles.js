var profData,
	Data = require('../lib/Data');

/*	Note: Tests are numbered to control the orser of execution
	Otherwise they execute in alphabetical order
	We always want to ensure the profiles are loaded first
*/


function loadProfiles(profiles){
	profData = Data.loadJSON(profiles);
}

function checkIfArrayIsUnique(arr) {
	var map = {}, i, size;

	for (i = 0, size = arr.length; i < size; i++){
		if (map[arr[i]]){
			return false;
		}

		map[arr[i]] = true;
	}

	return true;
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

	if (checkIfArrayIsUnique(pids) === true)
		assert.pass("only unique profile ids exist");
	else
		assert.fail("non unique profile ids exist");

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

//all profiles must have a  en-US language object for a fallback
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


	var values = ['0','24','32']; //suitable values used by profiles

	for (var i=0;i < profData.length; i++){

		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){

				if(profData[i].list[j].useragents[k].colordepth !== profData[i].list[j].useragents[k].pixeldepth)
					assert.fail("Color Depth and Pixel Depth do not match for "+profData[i].list[j].useragents[k].description);

				if (values.indexOf(profData[i].list[j].useragents[k].colordepth) === -1)
					assert.fail("Values are incorrect for "+profData[i].list[j].useragents[k].description);
			}

		}
	}
					assert.pass("Depth values in each profile are equal and have suitable values");
}
require("sdk/test").run(exports);
