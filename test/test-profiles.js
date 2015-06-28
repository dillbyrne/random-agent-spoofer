var profData,
	Data = require('../lib/Data');


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


exports["test profile file parsing"] = function(assert){

	try{
		loadProfiles('../data/json/useragents.json');
		assert.pass("profile parsing passed");
	}catch(e){
		assert.fail("profile parsing failed");
	}
}

exports["test unique profile ids"] = function(assert){

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


exports["test screen values"] = function(assert){

	for (var i=0;i < profData.length; i++){
		
		for (var j=0; j < profData[i].list.length; j++){

			for (var k=0; k < profData[i].list[j].useragents.length; k++){

				var screens = (profData[i].list[j].useragents[k].screens).split(',');
				
				for (var s=0; s < screens.length; s++){
					var sizes =  screens[s].split('x');

					if (sizes.length > 2)
						assert.fail("too many size paramaters at "+i+","+j+","+k);

					if (sizes.length < 2)
						assert.fail("too few size paramaters at "+i+","+j+","+k);
					
					if ((sizes[0].match(/^[0-9]+$/) != null) === false) 
						assert.fail("value "+sizes[0]+" at "+i+","+j+","+k);

					if ((sizes[1].match(/^[0-9]+$/) != null) === false) 
						assert.fail("value "+sizes[1]+" at "+i+","+j+","+k);
					
				}
			}

		}
	}
	
		assert.pass("no bad screen values found");

}

require("sdk/test").run(exports);
