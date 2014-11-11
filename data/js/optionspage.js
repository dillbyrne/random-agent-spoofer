document.body.addEventListener("change", function(e) {
 
	//get selected checkbox
	if (e.target.type == "checkbox" && e.target.className != "excludecb"){
		self.port.emit(e.target.id+"cb",document.getElementById(e.target.id).checked);
	} 
	else if(e.target.className == "excludecb"){
		self.port.emit("excludecb",e.target.id,e.target.value,document.getElementById(e.target.id).checked);
	}
	else if(e.target.className == "ipdropdown"){
		
		//get the spoofed ip choice
		var ipchoice = e.target[e.target.selectedIndex].value;
		var ipentry = document.getElementById("custom"+(e.target.id).substr(0,3));
		
		//if custom show user the entry box
		if (ipchoice == "custom"){
			ipentry.className="";
		}else{
			ipentry.className="hidden";
		}

		self.port.emit("ipdd",e.target.id,ipchoice);
	} 
	else if(e.target.id == "tzdd"){ //timezone
		self.port.emit("tzdd",e.target[e.target.selectedIndex].value);
	}
	else if(e.target.id == "screendd"){ //screen size
		self.port.emit("screendd",e.target[e.target.selectedIndex].value);
	}
	else if(e.target.id == "refdd"){ //referer
		self.port.emit("refdd",e.target[e.target.selectedIndex].value);
	}
	else if(e.target.id == "dntdd"){ //DNT
		self.port.emit("dntdd",e.target[e.target.selectedIndex].value);
	}
	else if (e.target.id == "timerdd" || e.target.name == "ua") {
    
		//get timer and selected ua option
		var timerdd = document.getElementById("timerdd");
		var uaList = document.getElementsByName("ua");
    
		var time = timerdd[timerdd.selectedIndex].value;

		//get selected UA
		var ua_choice;
		for(var i = 0; i < uaList.length; i++){
			if(uaList[i].checked){
				ua_choice = uaList[i].value;
			}
		}
     
		self.port.emit("uachange",ua_choice,time);
  
	}	


},false);


document.body.addEventListener("keyup", function(e) {
 
	//set the input validation class
	if ((e.target.id).substr(3,2) == "ip"){
		var input =  document.getElementById(e.target.id);
		var result = validateIP(input.value);

		if (result == false){
			input.className = "invalidInput";
		}else{
			input.className = "validInput";
			self.port.emit("validcustomip",e.target.id,input.value);
		}
			
	}else 	if (e.target.id == "site_whitelist"){
		var input =  document.getElementById(e.target.id);

		var result = validateJSON(input.value);

		if (result == false){
			input.className = "invalidInput";
		}else{
			input.className = "validInput";

			var data = JSON.parse(document.getElementById("site_whitelist").value);

		    //sort the json data by url attribute
		    data = sortWhiteListObjByURL(data);

		    //copy the urls into another list for faster lookups
		    var sitelist = new Array();

		    for(var i=0; i<data.length; i++){
		        sitelist.push(data[i].url);
		    }

		    //save the lists
		    self.port.emit("whitelist","siteWhiteList",JSON.stringify(data),sitelist.toString());

		}
			
	}    


},false);


//handle whitelist
document.body.addEventListener("click",function(e) {
	
	//whitelist profile save button
    if(e.target.id =="wlprofsavebtn"){
		wl_profile = new Array();

    	wl_profile.push(document.getElementById("useragent_input").value);
    	wl_profile.push(document.getElementById("appcodename_input").value);
    	wl_profile.push(document.getElementById("appname_input").value);
    	wl_profile.push(document.getElementById("appversion_input").value);
    	wl_profile.push(document.getElementById("vendor_input").value);
    	wl_profile.push(document.getElementById("vendorsub_input").value);
    	wl_profile.push(document.getElementById("platform_input").value);
    	wl_profile.push(document.getElementById("oscpu_input").value);
    	wl_profile.push(document.getElementById("acceptdefault_input").value);
    	wl_profile.push(document.getElementById("acceptencoding_input").value);
    	wl_profile.push(document.getElementById("acceptlanguage_input").value);

    	self.port.emit("wl_prof",wl_profile);

    
    }else if(e.target.id =="whitelist_profile_title"){
    	
    	if(document.getElementById("whitelist_profile").className == ""){
    		document.getElementById("whitelist_profile").className = "hidden";
    		document.getElementById("wl_prof_title_span").textContent = "+";

    	}else{
    		document.getElementById("whitelist_profile").className = "";
    		document.getElementById("wl_prof_title_span").textContent = "-";
    	}
    }else if(e.target.id == "wlhelpbtn"){
    	self.port.emit("wlhelp");
    }

},false);



document.body.addEventListener("focus", function(e) {
 
	//set the input validation class
	if ((e.target.id).substr(3,2) == "ip"){
		var input =  document.getElementById(e.target.id);
		var result = validateIP(input.value);

		if (result == false)
			input.className = "invalidInput";
		else
			input.className = "validInput";
			
	}else if(e.target.id == "site_whitelist"){

		var input =  document.getElementById(e.target.id);

		var result = validateJSON(input.value);

		if (result == false)
			input.className = "invalidInput";
		else
			input.className = "validInput";
	}


},true);


document.body.addEventListener("blur", function(e) {
 
	//remove the class for input validation
	if ((e.target.id).substr(3,2) == "ip"){
		document.getElementById(e.target.id).className = "";
	}else if(e.target.id == "site_whitelist"){
		document.getElementById(e.target.id).className = "";
	}  

},true);


function toggleList(innerListElementId) {
  
	var innerlistElement = document.getElementById(innerListElementId);
	  
	//get the span of the parent li 
	//it's index is the same as it's child list, so we can get it from that
	var text = document.getElementById("li_text"+ innerListElementId.replace( /^\D+/g, '')); 
	var excludeText = document.getElementById("li_exclude_text"+ innerListElementId.replace( /^\D+/g, '')); 

	//toggle the child list and parents assiociated indicator
	if (innerlistElement.style.display == "none"){
		innerlistElement.style.display = "block";
		text.textContent = " -";
		excludeText.className = "excludeSpan";
	}else{
		innerlistElement.style.display = "none";
		text.textContent = " +";
		excludeText.className ="hidden";
	}
}

function changeTab(selected_tab,tabs){

	for (var i =0; i< tabs.length;i++){
		if (tabs[i].children[0].id == selected_tab.id){
      
			var selected = document.getElementById(selected_tab.id+"_content");
			selected.className = "tabContent";
			selected_tab.className = "selected";

		}else{
			var non_selected = document.getElementById(tabs[i].children[0].id+"_content");
			non_selected.className = "hidden";
			tabs[i].children[0].className = "nonselected"; 
		}
         
	}


}

function validateIP(ipaddress){
	
	try	{
		var ip_segments;
		var valid_segments = 0;

		if(ipaddress === null || ipaddress == ""){
			throw("blankIPException");
		}

		ip_segments = ipaddress.split(".");
		
		//check for 4 segments split on "."
		if(ip_segments.length != 4){
			throw("IpSegmentLengthException");
		}else{
			
			for (var i=0; i<4; i++){
				//check if ip segment is a number and not a hex number or a
				//space or an exponent
				if( (!isNaN(ip_segments[i])) && ip_segments[i].indexOf('x') == -1 && ip_segments[i].length > 0
						&& ip_segments[i].length <= 3 && ip_segments[i].indexOf(' ') == -1 && ip_segments[i].indexOf('e') == -1 ){
					
					//check the range of the segment is valid
					if(ip_segments[i] >=0 && ip_segments[i] <= 255 ){
						
						//check for 000 , 010 etc
						if ((ip_segments[i].substring(0,1) == "0" && ip_segments[i] != 0) || ip_segments[i] == "00" || ip_segments[i] == "000")
							throw("InvalidNumberIpSegmentException");

						valid_segments++;
					}else{
						throw("NumberOutOfRangeIpSegmentException");
					}
				}
				else{
					throw ("NonNumericIpSegmentException");
				}		
			}
		}
		
		if (valid_segments == 4){
			return true;
		}
	}
	catch(e){
		return false;
	}

}

function validateJSON(jsonStringData){
	try{
		var data = JSON.parse(jsonStringData);
		
		if (data.length == 0)
			return false;

		//a url must be present for each entry
		for(var i =0; i< data.length;i++){
			if (data[i].url == "" || data[i].url === undefined)
				return false;
		}
		
		return true;

	}catch(e){
		return false;
	}
}

function sortWhiteListObjByURL(array){

	var array = array.sort(function(a,b){

		if(a.url == b.url)
		    return 0;
		if(a.url < b.url)
		    return -1;
		if(a.url > b.url)
		    return 1;
		});

	return array;
}