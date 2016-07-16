var PrefServ = require('../PrefServ'),
utils = require('../Utils');

function getScreenAttributes () {

	var pixeldepth = PrefServ.getter('extensions.agentSpoof.pixeldepth');
	var colordepth = PrefServ.getter('extensions.agentSpoof.colordepth');
	var sizes;

		// Pick one of the predefined generic sizes at random.

	if (PrefServ.getter('extensions.agentSpoof.screenSize') == 'random') {

		sizes = getScreens()[utils.getRandomNum(getScreens().length)].split('x');


		// Pick a random screen size from the list defined for the current profile
		// These are taken from the real devices

	} else if (PrefServ.getter('extensions.agentSpoof.screenSize') == 'profile') {

		var screens;

		// The default browsing profile does not have screens defined 
		// so we will use the random options for it's available screens
		// if the user has chosen the profile screen option
		// pixel and color depth are 24 for the default 

		if (PrefServ.getter('extensions.agentSpoof.uaChosen') === 'default') {
	
			screens = getScreens();	
			pixelDepth = 24;
			colorDepth = 24;
		
		}else{ //all other profiles have screens defined
		
			screens = PrefServ.getter('extensions.agentSpoof.screens').split(',');
		}

		sizes = screens[utils.getRandomNum(screens.length)].split('x');


	} else { // Apply a specifically chosen screen size

		sizes = (PrefServ.getter('extensions.agentSpoof.screenSize').split('x'));
	}

		return { "width": parseInt(sizes[0]), 
				 "height": parseInt(sizes[1]),
				 "pixeldepth": parseInt(pixeldepth), 
				 "colordepth": parseInt(colordepth) 
				};

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

exports.screenHandler = function(window){
		
	//don't spoof if using the profile's default screen size
	if(PrefServ.getter('extensions.agentSpoof.screenSize') != 'default'){
		
		var screen = getScreenAttributes();
		utils.defineProp(window,"Screen","width",screen.width);
		utils.defineProp(window,"Screen","height",screen.height);
		utils.defineProp(window,"Screen","availWidth",screen.width);
		utils.defineProp(window,"Screen","availHeight",screen.height);
		utils.defineProp(window,"Screen","top",0);
		utils.defineProp(window,"Screen","left",0);
		utils.defineProp(window,"Screen","availTop",0);
		utils.defineProp(window,"Screen","availLeft",0);
		utils.defineProp(window,"Screen","colorDepth",screen.colordepth);
		utils.defineProp(window,"Screen","pixelDepth",screen.pixeldepth);
	
		//TODO  implement window.innerheight etc		
	}
}

