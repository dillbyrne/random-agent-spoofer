self.port.once('tab_listener',function(){
	//get all the tabs
	var tabs = document.getElementById("tabs").children;

	//add on click listener to each
	for (var i =0; i< tabs.length;i++){
		tabs[i].onclick = function(x,y) { return function() { changeTab(x,y); }; }(tabs[i].children[0],tabs);
	}	 
});



self.port.once('ua_list', function(data) {

	//profile count, used for random profile exclusions
	var total_random_other_count = 0;
	var total_random_desktop_count = 0;

   
	//create the list of browser profiles
    
    var ualist_div  = document.getElementById('ualist');  
    
    //outer list
    var listElement = document.createElement("ul");

	ualist_div.appendChild(listElement);

    for (var i = 0; i < data.uadata.length; i++){

		var listItem = document.createElement("li");
     
		var b = document.createElement("b");
		var textSpan = document.createElement("span");
		var indicatorSpan = document.createElement("span");
		var excludeSpan = document.createElement("span");

		textSpan.appendChild(document.createTextNode(data.uadata[i].description));
		textSpan.setAttribute("class","parentli");
		indicatorSpan.appendChild(document.createTextNode(" +"));
		indicatorSpan.setAttribute("id","li_text"+i);

		excludeSpan.appendChild(document.createTextNode("Exclude"));
		excludeSpan.setAttribute("id","li_exclude_text"+i);
		excludeSpan.setAttribute("class","hidden");
      
		textSpan.appendChild(indicatorSpan);
		textSpan.appendChild(excludeSpan);

		b.appendChild(textSpan);
		listItem.appendChild(b);

      
		//inner List  
		var innerListElement = document.createElement("ul");
		innerListElement.setAttribute("class","innerlist");
		innerListElement.setAttribute("id","innerlist"+i);
	
		//set the inline style to none 
		//this prevents the need for two clicks to open the list
		innerListElement.style.display = "none";

		//show or hide inner list element when the list item it is appended to is clicked
		listItem.onclick = function(x) { return function() { toggleList(x); }; }(innerListElement.id);
      
		for (var j=0; j< data.uadata[i].useragents.length; j++){
	
			var innerListItem = document.createElement("li");
	
			//pass the item index for the parent and for child as the value and id
			var radio = document.createElement("input");
			radio.setAttribute("name","ua");	
			radio.setAttribute("type","radio");	
			radio.setAttribute("id",i+","+j);	
			radio.setAttribute("value",i+","+j);
	
			var label = document.createElement("label");
			label.setAttribute("for",i+","+j);
			label.appendChild(document.createTextNode(data.uadata[i].useragents[j].description));

			//checkbox used to exclude a profile from random selection using the profile's id
			var chkbox = document.createElement("input");
			chkbox.setAttribute("type","checkbox");
			chkbox.setAttribute("class","excludecb");
			chkbox.setAttribute("id",data.uadata[i].useragents[j].profileID);
			chkbox.setAttribute("value",i+","+j);

			innerListItem.appendChild(radio);
			innerListItem.appendChild(label);
			innerListItem.appendChild(chkbox);

			//prevent clicks on child element triggering the showing/hiding of the
			//child list	
			innerListElement.onclick= function stopProp (event){
				event.stopPropagation();
			}	

			innerListElement.appendChild(innerListItem);

			if(i < 4){

				total_random_desktop_count++;
			}
			else{
				total_random_other_count++;
			}
		}
      
		listItem.appendChild(innerListElement);
		listElement.appendChild(listItem);


    }
		
	self.port.emit("randomcount",total_random_desktop_count, total_random_desktop_count + total_random_other_count);

});




//whitelist or blacklist
self.port.on("setSiteList",function(listid,listItems){
	document.getElementById(listid).value = listItems;
});

self.port.on("setCheckBox",function(checkboxid,value){
	document.getElementById(checkboxid).checked = value;
});

self.port.on("setElementValue",function(elementid,value){
	document.getElementById(elementid).value = value;

	//set custom ipcheckboxes to show if custom is selected
	if(value == "custom")
		document.getElementById('custom'+elementid).className="";
});

self.port.on("setTextInputValue",function(elementid,value){
	document.getElementById(elementid).value = value;
});

self.port.on("setSelectedIndexByValue",function(dropdown,indexvalue){

	var dd = document.getElementById(dropdown);

	for (var i = 0; i < dd.options.length; i++) {
	
		if (dd.options[i].value === indexvalue) {
			dd.selectedIndex = i;
			break;
		}
	}

});

self.port.on("setMultiCheckBox",function(checkBoxArray){

	//set exclude the checkboxes states
	if (checkBoxArray.length > 0){

		var exclude_list = checkBoxArray.split(',');

		for (var i=0; i< exclude_list.length;i++){

			document.getElementById(exclude_list[i]).checked = true;
		}
	}

});