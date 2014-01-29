var widgets = require("sdk/widget");
var data = require("sdk/self").data;
var pref_serv = require("sdk/preferences/service");
var ff_timer = require("sdk/timers");
var notifications = require("sdk/notifications");
//User agent, platform and other assiociated data
var ua_list = JSON.parse(data.load("json/useragents.json"));

//addon specific preferences
var agent_spoof_pref = "extensions.agentSpoof.enabled";
var timer_interval_pref = "extensions.agentSpoof.timeInterval";
var ua_choice_pref = "extensions.agentSpoof.uaChosen";
var notify_pref = "extensions.agentSpoof.notify";
var cache_pref = "extensions.agentSpoof.cache";
var dom_pref = "extensions.agentSpoof.dom";
var tab_history_pref = "extensions.agentSpoof.tabHistory";
var fonts_pref = "extensions.agentSpoof.fonts"
var geo_pref = "extenstions.agentSpoof.geo";
var xff_pref = "extensions.agentSpoof.xff";
var via_pref = "extensions.agentSpoof.via";
var if_none_pref = "extensions.agentSpoof.ifnone";
var if_modified_pref = "extensions.agentSpoof.ifmodified";
var dns_pref = "extensions.agentSpoof.dns";
var link_pref= "extensions.agentSpoof.link";
var accept_default_pref ="extensions.agentSpoof.acceptDefault";
var accept_encoding_pref = "extensions.agentSpoof.acceptEncoding";
var accept_lang_pref = "extensions.agentSpoof.acceptLang";


//Browser profile preferences
var ua_override = "general.useragent.override";
var platform_override = "general.platform.override";
var appname_override = "general.appname.override";
var appversion_override = "general.appversion.override";
var ua_vendor = "general.useragent.vendor";
var ua_vendorsub = "general.useragent.vendorsub";
var buildID_override = "general.buildID.override";
var oscpu_override = "general.oscpu.override";
var accept_default_override ="network.http.accept.default";
var accept_encoding_override = "network.http.accept-encoding";
var accept_lang_override = "intl.accept_languages";

//extra privacy enhancing preferences
var use_document_fonts_pref = "browser.display.use_document_fonts";
var session_history_max_pref = "browser.sessionhistory.max_entries";
var local_dom_storage_pref = "dom.storage.enabled";
var cache_memory_pref = "browser.cache.memory.enable";
var cache_disk_pref = "browser.cache.disk.enable";
var geo_wifi_pref = "geo.wifi.uri";
var geo_enabled_pref = "geo.enabled";
var dns_prefetch_pref = "network.dns.disablePrefetch";
var link_prefetch_pref = "network.prefetch-next";

//has the useragent list been loaded 
var loaded = false;

//current randomly selected browser profile.
var cur_rand = null;

//keep track of timer
var timer_id;

var tooltips = new Array();
tooltips[0] = "Spoofing enabled\nRight click to disable";
tooltips[1] = "Spoofing disabled\nRight click to enable";

var icons = new Array();
icons[0] = "images/on.png";
icons[1] = "images/off.png";



const {Cc, Ci} = require("chrome");

var httpRequestObserver =
{
  observe: function(subject, topic, data)
  {
    if (topic == "http-on-modify-request") {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      
      //make sure the addon is enabled	    
      if(pref_serv.get(agent_spoof_pref) == true){
	
	if(pref_serv.get(xff_pref) == true){
	  httpChannel.setRequestHeader("X-Forwarded-For", getRandomIP(),false);
	}
	if(pref_serv.get(via_pref) == true){
	  httpChannel.setRequestHeader("Via","1.1 " +getRandomIP(),false);
	}	
	if (pref_serv.get(if_none_pref) == true ){
	  httpChannel.setRequestHeader("If-None-Match",(Math.random() *10).toString(36).substr(2, Math.random()*(10-5+1)+5), false);
	}
      }
    }
  },    

  get observerService() {
    return Cc["@mozilla.org/observer-service;1"]
		     .getService(Ci.nsIObserverService);
  },                     

  register: function()
  {
    this.observerService.addObserver(this, "http-on-modify-request", false);
  },    

  unregister: function()
  {
    this.observerService.removeObserver(this, "http-on-modify-request");
  }
};


//create a panel to display the options to the user
var options_panel = require("sdk/panel").Panel({
  width:450,
  height:350,
  contentURL: data.url("html/options-panel.html"),
  contentStyleFile: data.url("css/style.css"),
  contentScriptFile: [
    data.url("js/set-options.js"),
    data.url("js/optionspage.js")
    ]
});


//restore chosen options whent the panel is shown
options_panel.on("show",function(){
    
  //only pass the UA list once
  if (!loaded){
    loaded = true;
    //build the UA list
    options_panel.port.emit("ua_list",ua_list);

    //add listeners to tabs
    options_panel.port.emit("tab_listener");
  }

  var options = new Array();
  options[0] =	pref_serv.get(timer_interval_pref);
  options[1] =	pref_serv.get(ua_choice_pref);
  options[2] =	pref_serv.get(notify_pref);
  options[3] =	pref_serv.get(fonts_pref);
  options[4] =	pref_serv.get(dom_pref);
  options[5] =	pref_serv.get(tab_history_pref);
  options[6] =	pref_serv.get(cache_pref);
  options[7] =	pref_serv.get(geo_pref);
  options[8] =	pref_serv.get(xff_pref);
  options[9] =	pref_serv.get(via_pref);
  options[10] = pref_serv.get(if_none_pref);
  options[11] = pref_serv.get(dns_pref);
  options[12] = pref_serv.get(link_pref);
  options[13] = pref_serv.get(accept_default_pref);  
  options[14] = pref_serv.get(accept_encoding_pref);  
  options[15] = pref_serv.get(accept_lang_pref);  
  options_panel.port.emit("restore-options",options);

});

//set the users default (document) accept header preference
options_panel.port.on("acceptdcb",function(value){

  pref_serv.set(accept_default_pref,value);
  
  if(pref_serv.get(agent_spoof_pref) == true){
  
    if(value == true){
      
      var indices="";

      //check if a random option is currently chosen
      if(pref_serv.get(ua_choice_pref).slice(0,6) == "random"){
	//get the currently selected random indices.
	indices = cur_rand.split(",");
      }else{
	//get the specific selected indices
	indices = pref_serv.get(ua_choice_pref).split(",");
      }

	//get the value from the profile at the specified indices
	var acceptDefault  = ua_list.uadata[indices[0]].useragents[indices[1]]["accept_default"];
	
	//set the value
	pref_serv.set(accept_default_override,acceptDefault);	
    }
    else
      pref_serv.reset(accept_default_override);
  }

});


//set the users encoding accept header preference
options_panel.port.on("acceptecb",function(value){

  pref_serv.set(accept_encoding_pref,value);
  
  if(pref_serv.get(agent_spoof_pref) == true){
  
    if(value == true){
      
      var indices="";

      //check if a random option is currently chosen
      if(pref_serv.get(ua_choice_pref).slice(0,6) == "random"){
	//get the currently selected random indices.
	indices = cur_rand.split(",");
      }else{
	//get the specific selected indices
	indices = pref_serv.get(ua_choice_pref).split(",");
      }

	//get the value from the profile at the specified indices
	var acceptEncoding  = ua_list.uadata[indices[0]].useragents[indices[1]]["accept_encoding"];
	
	//set the value
	pref_serv.set(accept_encoding_override,acceptEncoding);	
    }
    else
      pref_serv.reset(accept_encoding_override);
  }

});


//set the users language accept header preference
options_panel.port.on("acceptlcb",function(value){

  pref_serv.set(accept_lang_pref,value);
  
  if(pref_serv.get(agent_spoof_pref) == true){
  
    if(value == true){
      
      var indices="";

      //check if a random option is currently chosen
      if(pref_serv.get(ua_choice_pref).slice(0,6) == "random"){
	//get the currently selected random indices.
	indices = cur_rand.split(",");
      }else{
	//get the specific selected indices
	indices = pref_serv.get(ua_choice_pref).split(",");
      }

	//get the value from the profile at the specified indices
	var acceptLang  = ua_list.uadata[indices[0]].useragents[indices[1]]["accept_lang"];
	
	//set the value
	pref_serv.set(accept_lang_override,acceptLang);	
    }
    else
      pref_serv.reset(accept_lang_override);
  }

});

//set the users dns prefetch preference
options_panel.port.on("dnscb",function(value){
  pref_serv.set(dns_pref,value);

  if(pref_serv.get(agent_spoof_pref) == true){
    if(value == true)
      pref_serv.set(dns_prefetch_pref,value);
    else
      pref_serv.reset(dns_prefetch_pref);
  }
});

//set the users link prefetch preference
options_panel.port.on("linkcb",function(value){
  pref_serv.set(link_pref,value);

  if(pref_serv.get(agent_spoof_pref) == true){
    if (value == true)
      pref_serv.set(link_prefetch_pref,!(value));
    else
      pref_serv.reset(link_prefetch_pref);
  }
});

//set the users notification preference
options_panel.port.on("notifycb",function(value){
  pref_serv.set(notify_pref,value);
});


//set the users xff header preference
options_panel.port.on("xffcb",function(value){
  pref_serv.set(xff_pref,value);
});


//set the users via header preference
options_panel.port.on("viacb",function(value){
  pref_serv.set(via_pref,value);
});

//set the users if-none-modified header preference
options_panel.port.on("ifnonecb",function(value){
  pref_serv.set(if_none_pref,value);
});

//set the users geo location preference
options_panel.port.on("geocb",function(value){
  pref_serv.set(geo_pref,value);
    
  if(pref_serv.get(agent_spoof_pref) == true){
    if (value == true){
      pref_serv.set(geo_enabled_pref,!(value));
      pref_serv.set(geo_wifi_pref,"");
    }
    else{
      pref_serv.reset(geo_enabled_pref);
      pref_serv.reset(geo_wifi_pref);
    }
  }
});

//set the users local dom storage preference
options_panel.port.on("domcb",function(value){
  pref_serv.set(dom_pref,value);
    
  if(pref_serv.get(agent_spoof_pref) == true){
    if (value == true)
      pref_serv.set(local_dom_storage_pref,!(value));
    else
      pref_serv.reset(local_dom_storage_pref);
  }
});

//set the users cache preference
options_panel.port.on("cachecb",function(value){
  pref_serv.set(cache_pref,value);
  
  if(pref_serv.get(agent_spoof_pref) == true){

    if (value == true){
      pref_serv.set(cache_memory_pref, !(value));
      pref_serv.set(cache_disk_pref, !(value));
    }else{
      pref_serv.reset(cache_memory_pref);
      pref_serv.reset(cache_disk_pref);
    }

  }
});


// get and set the user's font preference
options_panel.port.on("fontscb",function(value){
    pref_serv.set(fonts_pref,value);
    
  if(pref_serv.get(agent_spoof_pref) == true){
    if (value == true)
      pref_serv.set(use_document_fonts_pref,0);
    else
      pref_serv.reset(use_document_fonts_pref);
  }
});

// get and set the user's session history max preference
options_panel.port.on("historycb",function(value){
    
  pref_serv.set(tab_history_pref,value);
  
  if(pref_serv.get(agent_spoof_pref) == true){
    if (value == true)
      pref_serv.set(session_history_max_pref,2);
    else
      pref_serv.reset(session_history_max_pref);
  }

});

//get the user's timer and ua choice 
options_panel.port.on("uachange",function(ua_choice,interval){
  
  //save the options
  pref_serv.set(timer_interval_pref,interval);
  pref_serv.set(ua_choice_pref,ua_choice);
  
    //check if the user has the addon enabled
    //if so have the changes made take effect immediately
    if(pref_serv.get(agent_spoof_pref) == true){
      
      //clear timer 
      ff_timer.clearTimeout(timer_id);
    
      //set the timer if it the user has opted to use it and a random ua was chosen
      if(pref_serv.get(timer_interval_pref) != "none" && ( pref_serv.get(ua_choice_pref) == "random" || pref_serv.get(ua_choice_pref) == "random_desktop")){
	startTimer();
      }else{
	prepareAndSetAgentInfo(); 
      }
    }

});



var widget = widgets.Widget({
  id: "agent-spoof",
  label:"User Agent Spoofer",
  panel: options_panel,
  contentURL: data.url('images/off.png'),
  contentScriptFile: data.url("js/click-listener.js")
});



//toggle user agent spoofing by right clicking
widget.port.on("right-click", toggleAddonState);


function toggleAddonState(){

  //check if the addon is enabled
  if(pref_serv.get(agent_spoof_pref) == true){
      
    //set the addon as disabled
    pref_serv.set(agent_spoof_pref,false);

    //reset user agent
    resetAgentInfo();
    //reset Extras
    resetExtras();
    //clear the timer
    ff_timer.clearTimeout(timer_id);
    //console.log("timer cleared");
  }
  else{

    //set the addon as enabled
    pref_serv.set(agent_spoof_pref,true);
    
    //set Extras#
    setExtras(); 
    //clear the timer 
    ff_timer.clearTimeout(timer_id);

    //set the timer if it the user has opted to use it and a random ua was chosen
    if(pref_serv.get(timer_interval_pref) != "none" && ( pref_serv.get(ua_choice_pref) == "random" || pref_serv.get(ua_choice_pref) == "random_desktop")){
      startTimer();
    }else{
      prepareAndSetAgentInfo(); 
    }
  }
  
  toggleIconAndLabel();
  
}

function getInterval(interval){
  
  if (interval == "random")
    return getRandInterval();
  else
    return interval * 60000;
}


function getRandInterval(){
  return Math.floor((Math.random()*60)+1) * 60000;
}

function startTimer(){
  
    //get the time based on the selected interval
    time = getInterval(pref_serv.get(timer_interval_pref));
    
    //Set User Agent
    prepareAndSetAgentInfo();
    
    //start timer
    timer_id = ff_timer.setTimeout(startTimer,time);
  
}


function setAgentInfo(uadataIndex,useragentsIndex){

  for (var key in ua_list.uadata[uadataIndex].useragents[useragentsIndex]) {
    if (ua_list.uadata[uadataIndex].useragents[useragentsIndex].hasOwnProperty(key)) {
      var value = ua_list.uadata[uadataIndex].useragents[useragentsIndex][key];
      
      //set the corresponding attributes
      if(key == "appname")
	pref_serv.set(appname_override,value);
      else if(key == "platform")
	pref_serv.set(platform_override,value);
      else if(key == "appversion")
	pref_serv.set(appversion_override,value);
      else if(key == "vendor")
	pref_serv.set(ua_vendor,value);
      else if(key == "vendorsub")
	pref_serv.set(ua_vendorsub,value);
      else if(key == "oscpu")
	pref_serv.set(oscpu_override,value);
      else if(key == "buildID")
	pref_serv.set(buildID_override,value);
      else if(key == "useragent")
	pref_serv.set(ua_override,value);
      else if(key == "accept_default" && pref_serv.get(accept_default_pref) == true)
	pref_serv.set(accept_default_override,value);
      else if(key == "accept_encoding" && pref_serv.get(accept_encoding_pref) == true)
	pref_serv.set(accept_encoding_override,value);
      else if(key == "accept_lang" && pref_serv.get(accept_lang_pref) == true)
	pref_serv.set(accept_lang_override,value);
    }

  }
}

function setExtras(){

  if (pref_serv.get(dom_pref) == true){
      pref_serv.set(local_dom_storage_pref,false);
  }
  if (pref_serv.get(geo_pref) == true){
      pref_serv.set(geo_enabled_pref,false);
      pref_serv.set(geo_wifi_pref,"");
  }
  if (pref_serv.get(cache_pref) == true){
      pref_serv.set(cache_memory_pref, false);
      pref_serv.set(cache_disk_pref, false);
  }
  if (pref_serv.get(tab_history_pref) == true){
      pref_serv.set(session_history_max_pref,2);
  }
  if (pref_serv.get(fonts_pref) == true){
      pref_serv.set(use_document_fonts_pref,0);
  }
  if (pref_serv.get(dns_pref) == true){
      pref_serv.set(dns_prefetch_pref,true);
  }
  if (pref_serv.get(link_pref) == true){
      pref_serv.set(link_prefetch_pref,false);
  }



}

function resetExtras(){

  pref_serv.reset(local_dom_storage_pref);
  pref_serv.reset(cache_memory_pref);
  pref_serv.reset(cache_disk_pref);
  pref_serv.reset(session_history_max_pref);
  pref_serv.reset(use_document_fonts_pref);
  pref_serv.reset(geo_enabled_pref);
  pref_serv.reset(geo_wifi_pref);
  pref_serv.reset(dns_prefetch_pref);
  pref_serv.reset(link_prefetch_pref);
}

//Reset any UA related attributes
function resetAgentInfo(){

  pref_serv.reset(appname_override);
  pref_serv.reset(platform_override);
  pref_serv.reset(appversion_override);
  pref_serv.reset(ua_vendorsub);
  pref_serv.reset(ua_vendor);
  pref_serv.reset(ua_override);
  pref_serv.reset(oscpu_override);
  pref_serv.reset(buildID_override);
  pref_serv.reset(accept_default_override);
  pref_serv.reset(accept_encoding_override);
  pref_serv.reset(accept_lang_override);

}


//Generate a random but valid ip
//Returns an ip address
function getRandomIP(){
  
  //first block of the invalid ips 
  //This will remove the invalid ranges and leave us with more than enough
  //ips for the purpose of spoofing the forward and via headers
  invalidIPs = [0,10,100,127,169,172,192,198,203,224,225,226,227,228,229,230,
	      231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,
	      247,248,249,250,251,252,253,254,255];
  
  var ip ="";
  for (var i =0; i<4; i++){
    var temp =""; 
    do{
      temp = getRandomNum(255);
    }while(i == 0 && invalidIPs.indexOf(temp) != -1);
    
    if(i != 3)
	temp+=".";
    ip+=temp;
  }

  return ip;
}

//Check if the selected UA is random or not
//Set a random one if it is
//Parse and set the specified one if not
function prepareAndSetAgentInfo(){

  if(pref_serv.get(ua_choice_pref) == "random"){

    //get a random user agent
    var uaDataRandNum = getRandomNum(ua_list.uadata.length -1);
    var userAgentRandNum = getRandomNum(ua_list.uadata[uaDataRandNum].useragents.length -1);
   
    //set the random user agent
    setAgentInfo(uaDataRandNum,userAgentRandNum);
    
    //save the current random indices
    cur_rand = uaDataRandNum+","+userAgentRandNum;

    //set the tooltip
    var uainfo = ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].description;

    tooltips[0] = "Spoofing enabled\nRight click to disable\nRandom: "+ uainfo; 

    //show notifications if selected
    if (pref_serv.get(notify_pref) == true ){
	notifications.notify({
	  text: "Browser Profile Changed\nRandom: " + uainfo,
	  iconURL: data.url("images/icon.png")
	});
    }

  }
  else if(pref_serv.get(ua_choice_pref) == "random_desktop"){

    //get a random user agent from the desktop options only
    var uaDataRandNum = getRandomNum(3);
    var userAgentRandNum = getRandomNum(ua_list.uadata[uaDataRandNum].useragents.length -1);
   
    //set the random user agent
    setAgentInfo(uaDataRandNum,userAgentRandNum);

    //set the tooltip
    var uainfo = ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].description;

    //save the current random indices
    cur_rand = uaDataRandNum+","+userAgentRandNum;

    tooltips[0] = "Spoofing enabled\nRight click to disable\nRandom (Desktop): "+ uainfo; 

    //show notifications if selected
    if (pref_serv.get(notify_pref) == true ){
	notifications.notify({
	  text: "Browser Profile Changed\nRandom (Desktop): " + uainfo,
	  iconURL: data.url("images/icon.png")
	});
    }

  }
  else{
    
    //split the string to get the indices for setAgentInfo()
    var indices = pref_serv.get(ua_choice_pref).split(",");
    
    //set the user agent
    setAgentInfo(indices[0],indices[1]);

    //set the tooltip
    var uainfo = ua_list.uadata[indices[0]].useragents[indices[1]].description;
    
    //remove the saved current random indices
    if (cur_rand != null)
      cur_rand = null;

    tooltips[0] = "Spoofing enabled\nRight click to disable\n"+ uainfo; 

    //show notifications if selected
    if (pref_serv.get(notify_pref) == true ){
	notifications.notify({
	  text: "Browser Profile Changed\n" + uainfo,
	  iconURL: data.url("images/icon.png")
	});
    }
  }
      

      widget.tooltip = tooltips[0];
}


//get a random number from 0 - maximum 
function getRandomNum(maximum){

  return Math.round(Math.random()*maximum) 
}


function toggleIconAndLabel(){
  if(pref_serv.get(agent_spoof_pref) == true){
    widget.contentURL = data.url(icons[0]);
    widget.tooltip = tooltips[0];
  }
  else{
    widget.contentURL = data.url(icons[1]);
    widget.tooltip = tooltips[1];
  }
}

exports.onUnload = function(reason){
  

  if(reason == "disable" || reason == "uninstall"){
    //restore any changes made by the addon
    
    resetAgentInfo();
    pref_serv.reset(agent_spoof_pref);
    pref_serv.reset(timer_interval_pref); 
    pref_serv.reset(ua_choice_pref);
    pref_serv.reset(notify_pref);
    pref_serv.reset(fonts_pref);
    pref_serv.reset(tab_history_pref);
    pref_serv.reset(dom_pref);
    pref_serv.reset(cache_pref);
    pref_serv.reset(geo_pref);
    pref_serv.reset(xff_pref);
    pref_serv.reset(via_pref);
    pref_serv.reset(if_none_pref);
    pref_serv.reset(dns_pref);
    pref_serv.reset(link_pref);
    pref_serv.reset(accept_default_pref);
    pref_serv.reset(accept_encoding_pref);
    pref_serv.reset(accept_lang_pref);

    resetExtras(); 
  }

    //clear the timer
    ff_timer.clearTimeout(timer_id);
    httpRequestObserver.unregister();

}


//set up preferences to reflect the user's selected settings
function initialSetup(){
  
  //create prefs if they are not set
  if (!(pref_serv.has(agent_spoof_pref))) {
    pref_serv.set(timer_interval_pref, "none");
    pref_serv.set(agent_spoof_pref, false);
    pref_serv.set(ua_choice_pref, "random");
    pref_serv.set(notify_pref, true);
    pref_serv.set(dom_pref, false);
    pref_serv.set(cache_pref, false);
    pref_serv.set(tab_history_pref, false);
    pref_serv.set(fonts_pref, false);
    pref_serv.set(geo_pref, false);
    pref_serv.set(xff_pref, false);
    pref_serv.set(via_pref, false);
    pref_serv.set(if_none_pref,false);
    pref_serv.set(dns_pref,false);
    pref_serv.set(link_pref,false);
    pref_serv.set(accept_default_pref,true);
    pref_serv.set(accept_encoding_pref,true);
    pref_serv.set(accept_lang_pref,false);
  }

  //set inital icon and label
  toggleIconAndLabel();
  httpRequestObserver.register();

  //set initial user agent if the user had the addon enabled on shutdown
  if (pref_serv.get(agent_spoof_pref) == true){
    
    //set the timer if it the user has opted to use it and a random ua was chosen
    if(pref_serv.get(timer_interval_pref) != "none" && ( pref_serv.get(ua_choice_pref) == "random" || pref_serv.get(ua_choice_pref) == "random_desktop" )) {
      startTimer();
    }else{
      prepareAndSetAgentInfo(); 
    }
  }

}


initialSetup();
