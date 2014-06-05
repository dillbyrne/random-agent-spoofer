var PageMod = require("sdk/page-mod"),
	PrefServ = require("./PrefServ"),
	Data = require("./Data");




exports.init = function(){

	PageMod.PageMod({
    	include: "*",
     	contentScriptFile: Data.get("js/inject.js"),
     	contentScriptWhen: "start",
  		onAttach: function(worker) {

  			if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
    			worker.port.emit("inject",getIntParams(),getStrParams());
    		}
    	}	
	});

};


function getStrParams(){
       var sParams = new Array();

       sParams[0] = PrefServ.getter("general.useragent.vendor");

    return sParams;
}


function getIntParams(){
   var params = new Array();
    
    params[0] = getTimeZoneOffset();


    var screens = getAndSetScreenSize();

    params[1] = screens[0]; // screen.width
    params[2] = screens[1]; // screen.height
    params[3] = screens[0]; // screen.availWidth
    params[4] = screens[1]; // screen.availHeight
    params[5] = screens[0]; // window.innerWidth
    params[6] = screens[1]; // window.innerHeight
    params[7] = screens[0]; // window.outerWidth
    params[8] = screens[1]; // window.outerHeight
    //params[9] = 24; // screen.colorDepth

    return params;
};



function getAndSetScreenSize(){
    
    if (PrefServ.getter("extensions.agentSpoof.screenSize") == "default"){

        return [null,null];

    }else if(PrefServ.getter("extensions.agentSpoof.screenSize") == "random"){
        

        // https://en.wikipedia.org/wiki/Display_resolution#Computer_monitors
        var screensizes = ["800x600","1024x600","1024x768","1152x864","1280x720","1280x768","1280x800",
        "1280x960","1280x1024","1360x768","1366x768","1440x900","1400x1050","1600x900","1600x1200",
        "1680x1050","1920x1080","1920x1200","2048x1152","2560x1440","2560x1600"];
        
        var rand_size = screensizes[Math.floor(Math.random()*screensizes.length)];
        var sizes = rand_size.split('x');

        return [parseInt(sizes[0]),parseInt(sizes[1])];

    }else{

            var sizes = (PrefServ.getter("extensions.agentSpoof.screenSize").split('x'));
            return [parseInt(sizes[0]),parseInt(sizes[1])];
    }

}

function getTimeZoneOffset(){

    if(PrefServ.getter("extensions.agentSpoof.tzOffset") != "none"){

        if(PrefServ.getter("extensions.agentSpoof.tzOffset") == "random"){
            //set a random offset

            // https://en.wikipedia.org/wiki/Time_zone#List_of_UTC_offsets
            var offsets =  [14,13,12.75,12,11.5,11,10.5,
                            10,9.5,9,8.75,8,7,6.5,6,5.75,
                            5.5,5,4.5,4,3.5,3,2,1,0,-1,-2,
                            -3.5,-4,-4.5,-5,-6,-7,-8,-9,
                            -9.5,-10,-11,-12]

            var rand_offset = offsets[Math.floor(Math.random()*offsets.length)];
            return rand_offset * 60;
        }
        else if(PrefServ.getter("extensions.agentSpoof.tzOffset") == "default"){
            var d = new Date();
            return d.getTimezoneOffset();
        }
        else{
            
            var offset = parseInt(PrefServ.getter("extensions.agentSpoof.tzOffset"));
            return offset * 60;
        }

   }

};
