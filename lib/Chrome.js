const {Cc, Ci} = require("chrome");
var PrefServ = require("./PrefServ"),
    Ras = require("./Ras"),
    Observer =
{
    observe: function(subject, topic, data)
    {


        if (subject instanceof Ci.nsIDOMWindow && topic == "content-document-global-created") {
           
            //Only spoof time zone if the addon is enabled        
            if(PrefServ.getter("extensions.agentSpoof.enabled") == true){

               //override timezone offset
                 subject.wrappedJSObject.Date.prototype.getTimezoneOffset = function(){

                    if(PrefServ.getter("extensions.agentSpoof.tzOffset") != "none"){

                        if(PrefServ.getter("extensions.agentSpoof.tzOffset") == "random"){
                            //set a random offset
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
            }

        }



        if (topic == "http-on-modify-request") {
        var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      
            //make sure the addon is enabled        
            if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
				
				//change on request
				if(PrefServ.getter("extensions.agentSpoof.timeInterval") == "request" && PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
					Ras.setupAndAssignProfile();
				}
				
				//set spoofed xff header ip				
                if(PrefServ.getter("extensions.agentSpoof.xff") == true){
				
					if(PrefServ.getter("extensions.agentSpoof.xffdd") == "random"){
						httpChannel.setRequestHeader("X-Forwarded-For", Ras.getRandomIP(),false);
					}else if(PrefServ.getter("extensions.agentSpoof.xffdd") == "custom" && PrefServ.getter("extensions.agentSpoof.xffip") != ""){
						httpChannel.setRequestHeader("X-Forwarded-For", PrefServ.getter("extensions.agentSpoof.xffip"),false);
					}
                }
                
				//set spoofed via header ip
				if(PrefServ.getter("extensions.agentSpoof.via") == true){

					if(PrefServ.getter("extensions.agentSpoof.viadd") == "random"){
						httpChannel.setRequestHeader("Via","1.1 " + Ras.getRandomIP(),false);
					}else if(PrefServ.getter("extensions.agentSpoof.viadd") == "custom" && PrefServ.getter("extensions.agentSpoof.viaip") != ""){
						httpChannel.setRequestHeader("Via","1.1 " + PrefServ.getter("extensions.agentSpoof.viaip"),false);
					}
                }
                
				//send spoofed if none match header
				if (PrefServ.getter("extensions.agentSpoof.ifnone") == true ){
                    httpChannel.setRequestHeader("If-None-Match",(Math.random() *10).toString(36).substr(2, Math.random()*(10-5+1)+5), false);
                }
                
				//send the accept language header ourselves to stop firefox from
                //overwriting the q value
                if(PrefServ.getter("extensions.agentSpoof.acceptLang") == true && PrefServ.getter("extensions.agentSpoof.uaChosen") != "default" ){
                    httpChannel.setRequestHeader("Accept-Language",PrefServ.getter("intl.accept_languages"),false);
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
        this.observerService.addObserver(this, "content-document-global-created", false);

    },    

    unregister: function()
    {
        this.observerService.removeObserver(this, "http-on-modify-request");
        this.observerService.removeObserver(this, "content-document-global-created");

    }
};

exports.getObserver = function(){
    return Observer;
};