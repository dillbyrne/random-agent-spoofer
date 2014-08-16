var PageMod = require("sdk/page-mod"),
	PrefServ = require("./PrefServ"),
	Data = require("./Data"),
    whiteListState = false,
    whiteListCanvas = false,
    whiteListWindowName = false,
    fullWhiteList; //stores the full json data for whitelisting fucntionality such as canvas




exports.init = function(){

	PageMod.PageMod({
    	include: "*",
     	contentScriptFile: Data.get("js/inject.js"),
     	contentScriptWhen: "start",
        attachTo: ["top", "frame"],

  		onAttach: function(worker) {

            whiteListCanvas = false;
            whiteListWindowName = false;
            whiteListState = false;

            if(PrefServ.getter("extensions.agentSpoof.whiteListDisabled") == false){
                //check if the current url is in the whitelist
                whiteListState = listCheck(PrefServ.getter("extensions.agentSpoof.siteWhiteList").split(','),worker.tab.url);
            }
 
  			if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
    			worker.port.emit("inject",getIntParams(),getStrParams(),getBoolParams());
    		}
    	}	
	});

    //put fullwhitelist in memory to save time when checking for whitelist lookups
    setFullWhiteList(PrefServ.getter("extensions.agentSpoof.fullWhiteList"));

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
    
    if(fullWhiteList.whitelist[index].canvas === true)
        whiteListCanvas = true;
    else
        whiteListCanvas = false;

    if(fullWhiteList.whitelist[index].windowName === true)
        whiteListWindowName = true;
    else
        whiteListWindowName = false;

    console.log("WLU is  "+fullWhiteList.whitelist[index].url);
    console.log("WLC is  "+fullWhiteList.whitelist[index].windowName);
    
};



/*
function listCheck(list, url) {
    var exp = new RegExp('(' + list.join('|').replace(/(\/|\.|\-)/g, '\\$1') + ')');

    if (exp.test(url)) return true;
    else return false;
}
*/

function getBoolParams(){
    
    var bParams = new Array();


    //check if window.name has been whitelisted
    if (whiteListWindowName === true)
        bParams[0] = false ;
    else
        bParams[0] = PrefServ.getter("extensions.agentSpoof.windowName");


    //check if the canvas has been whitelisted
    if (whiteListCanvas === true)
        bParams[1] = false ;
    else
        bParams[1] = PrefServ.getter("extensions.agentSpoof.canvas");


    bParams[2] = whiteListState;

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

function setFullWhiteList (jsonData){
    fullWhiteList = JSON.parse(jsonData);
}

exports.setFullWhiteListProfile = function(jsonData){
    setFullWhiteList(jsonData)
}

