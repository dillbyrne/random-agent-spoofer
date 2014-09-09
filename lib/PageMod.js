var PageMod = require("sdk/page-mod"),
	PrefServ = require("./PrefServ"),
    Ras = require("./Ras"),
	Data = require("./Data"),
    whiteListStateArray = new Array (5); //store the state of the whitelist state and js whitelist options

exports.init = function(){

	PageMod.PageMod({
    	include: "*",
     	contentScriptFile: Data.get("js/inject.js"),
     	contentScriptWhen: "start",
        attachTo: ["top", "frame"],

  		onAttach: function(worker) {

            //(Re)set whitelist values to false 
            for(i=0;i<whiteListStateArray.length;i++){
                whiteListStateArray[i] = false;
            }

            if(PrefServ.getter("extensions.agentSpoof.whiteListDisabled") == false){
                //check if the current url is in the whitelist
                whiteListStateArray[0] = listCheck(PrefServ.getter("extensions.agentSpoof.siteWhiteList").split(','),worker.tab.url);
            }
 
  			if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
    			worker.port.emit("inject",getIntParams(),getStrParams(),getBoolParams());
    		}
    	}	
	});

};


//check if  a url is in the list
function listCheck(list,url){ 
       
    for (var i=0; i<list.length; i++){
        if (url.indexOf(list[i]) > -1){
            
            //check the config for the url now confirmed to be in the list
            checkWhiteListConfig(i);
            return true;
        }
        
    }

    return false;
};

function checkWhiteListConfig(index){

    //get the whitelist entry
    var whiteListItem = Ras.getFullWhiteListEntry(index) ;
    
    if(whiteListItem.canvas === true)
        whiteListStateArray[1] = true;
    else
        whiteListStateArray[1] = false;

    if(whiteListItem.windowName === true)
        whiteListStateArray[2] = true;
    else
        whiteListStateArray[2] = false;

    if(whiteListItem.screen === true)
        whiteListStateArray[3] = true;
    else
        whiteListStateArray[3] = false;
    
    if(whiteListItem.date === true)
        whiteListStateArray[4] = true;
    else
        whiteListStateArray[4] = false;

};

function getBoolParams(){
    
    var bParams = new Array();

    bParams[0] = whiteListStateArray[0];

    //check if the canvas has been whitelisted
    if (whiteListStateArray[1] === true)
        bParams[1] = false ;
    else
        bParams[1] = PrefServ.getter("extensions.agentSpoof.canvas");


    //check if window.name has been whitelisted
    if (whiteListStateArray[2] === true)
        bParams[2] = false ;
    else
        bParams[2] = PrefServ.getter("extensions.agentSpoof.windowName");

    //check if screen and window spoofing have been whitelisted
    if (whiteListStateArray[3] === true)
        bParams[3] = false ;
    else
        bParams[3] = true;

    //check if date spoofing has been whitelisted
    if (whiteListStateArray[4] === true)
        bParams[4] = false ;
    else
        bParams[4] = true;

    return bParams;
}


function getStrParams(){
    
    var sParams = new Array();

    // Vendor override value sent with non whitelisted profiles
    sParams[0] = PrefServ.getter("general.useragent.vendor");
    
    // Whitelist profile values
    // Whitelist headers need to be sent along with this
    // Whitelist headers are sent in Chrome.js

    sParams[1] = PrefServ.getter("extensions.agentSpoof.whiteListUserAgent");
    sParams[2] = PrefServ.getter("extensions.agentSpoof.whiteListAppCodeName");
    sParams[3] = PrefServ.getter("extensions.agentSpoof.whiteListAppName");
    sParams[4] = PrefServ.getter("extensions.agentSpoof.whiteListAppVersion");
    sParams[5] = PrefServ.getter("extensions.agentSpoof.whiteListVendor");
    sParams[6] = PrefServ.getter("extensions.agentSpoof.whiteListVendorSub");
    sParams[7] = PrefServ.getter("extensions.agentSpoof.whiteListPlatform");
    sParams[8] = PrefServ.getter("extensions.agentSpoof.whiteListOsCpu");

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
        
        }else if(PrefServ.getter("extensions.agentSpoof.tzOffset") == "default"){
        
            var d = new Date();
            return d.getTimezoneOffset();
        
        }else{
            
            var offset = parseInt(PrefServ.getter("extensions.agentSpoof.tzOffset"));
            return offset * 60;
        }

   }

};
