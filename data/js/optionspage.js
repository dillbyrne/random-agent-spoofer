document.body.addEventListener("change", function(e) {
 
	//get selected checkbox
	if (e.target.type == "checkbox"){
		self.port.emit(e.target.id+"cb",document.getElementById(e.target.id).checked);
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
		//console.log(input.value);
		var result = validateIP(input.value);

		if (result == false){
			input.className = "invalidInput";
		}else{
			input.className = "validInput";
			self.port.emit("validcustomip",e.target.id,input.value);
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
			
	}  


},true);


document.body.addEventListener("blur", function(e) {
 
	//remove the class for input validation
	if ((e.target.id).substr(3,2) == "ip"){
		document.getElementById(e.target.id).className = "";
	}  

},true);


function toggleList(innerListElementId) {
  
	var innerlistElement = document.getElementById(innerListElementId);
	  
	//get the span of the parent li 
	//it's index is the same as it's child list, so we can get it from that
	var text = document.getElementById("li_text"+ innerListElementId.replace( /^\D+/g, '')); 

	//toggle the child list and parents assiociated indicator
	if (innerlistElement.style.display == "none"){
		innerlistElement.style.display = "block";
		text.innerHTML = " -";
	}else{
		innerlistElement.style.display = "none";
		text.innerHTML = " +";
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
