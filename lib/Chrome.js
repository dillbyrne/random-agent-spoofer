const {Cc, Ci, Cr} = require("chrome");
var PrefServ = require("./PrefServ"),
    Ras = require("./Ras"),
    whiteListStateArray = new Array (5), //store the state of the header whitelist options
    Observer =
{
    observe: function(subject, topic, data)
    {



        // Observe requests 

        if (topic == "http-on-modify-request") {
            var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);

            //make sure the addon is enabled        
            if(PrefServ.getter("extensions.agentSpoof.enabled") == true){


                var url = httpChannel.URI.spec;

                //(Re)set whitelist values to false 
                for(i=0;i<whiteListStateArray.length;i++){
                    whiteListStateArray[i] = false;
                }

                //if the whitelist is not disabled
                if(PrefServ.getter("extensions.agentSpoof.whiteListDisabled") == false){

                    //send the whitelisted profiles headers to whitelisted sites
                    //check the list of urls only
                    if(listCheck(PrefServ.getter("extensions.agentSpoof.siteWhiteList").split(','),url) == true){

                        httpChannel.setRequestHeader("User-Agent", PrefServ.getter("extensions.agentSpoof.whiteListUserAgent") ,false);
                        httpChannel.setRequestHeader("Accept", PrefServ.getter("extensions.agentSpoof.whiteListAccept"),false);
                        httpChannel.setRequestHeader("Accept-Language", PrefServ.getter("extensions.agentSpoof.whiteListAcceptLanguage"),false);
                        httpChannel.setRequestHeader("Accept-Encoding", PrefServ.getter("extensions.agentSpoof.whiteListAcceptEncoding"),false);

                    }

                }else{
                    //use the headers specified in the spoofed profile

                    //send the accept language header ourselves to stop firefox from
                    //overwriting the q value
                    if(PrefServ.getter("extensions.agentSpoof.acceptLang") == true && PrefServ.getter("extensions.agentSpoof.uaChosen") != "default" ){
                        httpChannel.setRequestHeader("Accept-Language",PrefServ.getter("intl.accept_languages"),false);
                    }

                }
				
				//change on request
				if(PrefServ.getter("extensions.agentSpoof.timeInterval") == "request" && PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
					Ras.setupAndAssignProfile();
				}
				
                // Don't send HTTP Authorization header
                if(PrefServ.getter("extensions.agentSpoof.authorization") == true){
                    httpChannel.setRequestHeader("Authorization","",false);
                }

                // DNT header
                if (PrefServ.getter("extensions.agentSpoof.dnt") == "none"){
                    httpChannel.setRequestHeader("DNT","",false);
                }else{
                    httpChannel.setRequestHeader("DNT","1",false);
                }

                // Don't send Referer header
                if (PrefServ.getter("extensions.agentSpoof.referer") == "none" && whiteListStateArray[0] == false){
                    httpChannel.setRequestHeader("Referer","",false);
                }

				//set spoofed xff header ip				
                if(PrefServ.getter("extensions.agentSpoof.xff") == true && whiteListStateArray[1] == false){
				
					if(PrefServ.getter("extensions.agentSpoof.xffdd") == "random"){
						httpChannel.setRequestHeader("X-Forwarded-For", Ras.getRandomIP(),false);
					}else if(PrefServ.getter("extensions.agentSpoof.xffdd") == "custom" && PrefServ.getter("extensions.agentSpoof.xffip") != ""){
						httpChannel.setRequestHeader("X-Forwarded-For", PrefServ.getter("extensions.agentSpoof.xffip"),false);
					}
                }
                
				//set spoofed via header ip
				if(PrefServ.getter("extensions.agentSpoof.via") == true && whiteListStateArray[2] == false){

					if(PrefServ.getter("extensions.agentSpoof.viadd") == "random"){
						httpChannel.setRequestHeader("Via","1.1 " + Ras.getRandomIP(),false);
					}else if(PrefServ.getter("extensions.agentSpoof.viadd") == "custom" && PrefServ.getter("extensions.agentSpoof.viaip") != ""){
						httpChannel.setRequestHeader("Via","1.1 " + PrefServ.getter("extensions.agentSpoof.viaip"),false);
					}
                }
                
				//send spoofed if none match header
				if (PrefServ.getter("extensions.agentSpoof.ifnone") == true && whiteListStateArray[3] == false){
                    httpChannel.setRequestHeader("If-None-Match",(Math.random() *10).toString(36).substr(2, Math.random()*(10-5+1)+5), false);
                }
                

            }
        }
    }, 

    get observerService() {
        return Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
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

exports.getObserver = function(){
    return Observer;
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

//check for header related whitelist options
function checkWhiteListConfig(index){

    //get the whitelist entry
    var whiteListItem = Ras.getFullWhiteListEntry(index) ;

    //check if referer header has been whitelisted to allow it
    if(whiteListItem.referer === true)
        whiteListStateArray[0] = true;
    else
        whiteListStateArray[0] = false;

    //check if sending of the xff header has been whitelisted to disallow it
    if(whiteListItem.xff === true)
        whiteListStateArray[1] = true;
    else
        whiteListStateArray[1] = false;
    
    //check if sending of the via header has been whitelisted to disallow it
    if(whiteListItem.via === true)
        whiteListStateArray[2] = true;
    else
        whiteListStateArray[2] = false;

    //check if sending of the if-none-match header has been whitelisted to disallow it
    if(whiteListItem.ifnonematch === true)
        whiteListStateArray[3] = true;
    else
        whiteListStateArray[3] = false;

};