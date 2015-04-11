document.body.addEventListener("change", function(e) {

	//get selected checkbox
	if (e.target.type == "checkbox" && e.target.className != "excludecb"){

		if(e.target.dataset.invertvalue == "false")
			self.port.emit("setPrefValue",e.target.dataset.prefname,e.target.checked);

		else if(e.target.dataset.invertvalue == "true")
			self.port.emit("setPrefValue",e.target.dataset.prefname,!(e.target.checked));

		else if(e.target.dataset.ffheader) // is it an accept header ?
			self.port.emit("setAcceptHeader",e.target.dataset.raspref,e.target.dataset.ffheader,e.target.checked);

		else //call a specific function for this checkbox
			self.port.emit(e.target.id,e.target.checked);
	}
	else if(e.target.className == "excludecb"){
		self.port.emit("excludecb",e.target.id,e.target.value,e.target.checked);
	}
	else if(e.target.className == "ipdropdown"){ //show or hide the ip input boxes

		if (e.target[e.target.selectedIndex].value == "custom") {
			document.getElementById(e.target.dataset.uipref).className="";
			document.querySelectorAll("#" + e.target.dataset.uipref + " input")[0].focus();
		} else {
			document.getElementById(e.target.dataset.uipref).className="hidden";
		}

		self.port.emit("setPrefValue",e.target.dataset.prefname,e.target[e.target.selectedIndex].value);
	}
	else if(e.target.className == "dd"){
		self.port.emit("setPrefValue",e.target.dataset.prefname,e.target[e.target.selectedIndex].value);
	}
	else if (e.target.id == "timerdd" || e.target.name == "ua") {

		//get timer and selected ua option
		var timerdd = document.getElementById("timerdd");
		var uaList = document.getElementsByName("ua");
		var time = timerdd[timerdd.selectedIndex].value;

		//get selected profile
		var ua_choice = document.querySelector('input[name = "ua"]:checked').value;
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
			self.port.emit("setPrefValue",e.target.dataset.prefname,input.value);
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

		self.port.emit("setPrefValue",
			document.getElementById("useragent_input").dataset.prefname,
			document.getElementById("useragent_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("appcodename_input").dataset.prefname,
			document.getElementById("appcodename_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("appname_input").dataset.prefname,
			document.getElementById("appname_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("appversion_input").dataset.prefname,
			document.getElementById("appversion_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("vendor_input").dataset.prefname,
			document.getElementById("vendor_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("vendorsub_input").dataset.prefname,
			document.getElementById("vendorsub_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("platform_input").dataset.prefname,
			document.getElementById("platform_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("oscpu_input").dataset.prefname,
			document.getElementById("oscpu_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("acceptdefault_input").dataset.prefname,
			document.getElementById("acceptdefault_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("acceptencoding_input").dataset.prefname,
			document.getElementById("acceptencoding_input").value);
		self.port.emit("setPrefValue",
			document.getElementById("acceptlanguage_input").dataset.prefname,
			document.getElementById("acceptlanguage_input").value);

	}else if(e.target.id =="wl_prof_expand" || e.target.id == "whitelist_profile_title"
		|| e.target.id == "wl_prof_title_span"){

		if(document.getElementById("whitelist_profile").className == ""){
			document.getElementById("whitelist_profile").className = "hidden";
			document.getElementById("wl_prof_title_span").textContent = "+";

		}else{
			document.getElementById("whitelist_profile").className = "";
			document.getElementById("wl_prof_title_span").textContent = "–";
		}

	}else if(e.target.id =="wl_rules_expand" || e.target.id =="whitelist_rules_title"
		|| e.target.id == "wl_rules_title_span"){

		if(document.getElementById("site_whitelist").className == ""){
			document.getElementById("site_whitelist").className = "hidden";
			document.getElementById("wl_rules_title_span").textContent = "+";

		}else{
			document.getElementById("site_whitelist").className = "";
			document.getElementById("wl_rules_title_span").textContent = "–";
			document.getElementById("site_whitelist").focus();
		}


    }else if(e.target.id =="script_injection_expand" || e.target.id =="script_injection_title" 
    	|| e.target.id == "script_injection_title_span"){

    	if(document.getElementById("script_injection_content").className == ""){
    		document.getElementById("script_injection_content").className = "hidden";
    		document.getElementById("script_injection_title_span").textContent = "+";

    	}else{
    	  	document.getElementById("script_injection_content").className = "";
    	  	document.getElementById("script_injection_title_span").textContent = "–";
    	}

    }else if(e.target.id =="standard_extras_expand" || e.target.id =="standard_extras_title" 
    	|| e.target.id == "standard_extras_title_span"){

    	if(document.getElementById("standard_extras_content").className == ""){
    		document.getElementById("standard_extras_content").className = "hidden";
    		document.getElementById("standard_extras_title_span").textContent = "+";

    	}else{
    	  	document.getElementById("standard_extras_content").className = "";
    	  	document.getElementById("standard_extras_title_span").textContent = "–";
    	}

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
		innerlistElement.style.margin = ".5em 0";
		text.textContent = "–";
	}else{
		innerlistElement.style.display = "none";
		text.textContent = "+";
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

	if(ipaddress === null || ipaddress == "")
		return false;

	var ip_segments = ipaddress.split(".");

	//check for 4 segments split on "."
	if(ip_segments.length != 4){
		return false;
	}else{

		for (var i=0; i<4; i++){
			//check if ip segment is a number and not a hex number or a space or an exponent
			if( (!isNaN(ip_segments[i])) && ip_segments[i].indexOf('x') == -1 && ip_segments[i].length > 0
					&& ip_segments[i].length <= 3 && ip_segments[i].indexOf(' ') == -1 && ip_segments[i].indexOf('e') == -1 ){

				//check the range of the segment is valid
				if(ip_segments[i] >=0 && ip_segments[i] <= 255 ){

					//check for 000 , 010 etc
					if ((ip_segments[i].substring(0,1) == "0" && ip_segments[i] != 0) || ip_segments[i] == "00" || ip_segments[i] == "000")
						return false;
				}else{
					return false;
				}
			}else{
				return false;
			}
		}
	}
	return true;
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
