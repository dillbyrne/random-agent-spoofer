const {Cc, Ci} = require("chrome");
var PrefServ = require("./PrefServ"),
    Ras = require("./Ras"),
    httpRequestObserver =
{
    observe: function(subject, topic, data)
    {
        if (topic == "http-on-modify-request") {
        var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      
            //make sure the addon is enabled        
            if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
        
                if(PrefServ.getter("extensions.agentSpoof.xff") == true){
                    httpChannel.setRequestHeader("X-Forwarded-For", Ras.getRandomIP(),false);
                }
                if(PrefServ.getter("extensions.agentSpoof.via") == true){
                    httpChannel.setRequestHeader("Via","1.1 " + Ras.getRandomIP(),false);
                }
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
    },    

    unregister: function()
    {
        this.observerService.removeObserver(this, "http-on-modify-request");
    }
};

exports.getHttpRequestObserver = function(){
    return httpRequestObserver;
};