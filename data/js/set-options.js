self.port.once('tab_listener',function(){
	//get all the tabs
	var tabs = document.getElementById("tabs").children;

	//add on click listener to each
	for (var i =0; i< tabs.length;i++){
		tabs[i].onclick = function(x,y) { return function() { changeTab(x,y); }; }(tabs[i].children[0],tabs);
	}	 
});



self.port.once('ua_list', function(data,localized_strings) {

	//create the list of browser profiles
    
    var ualist_div  = document.getElementById('ualist');  

    var random_other_div = document.getElementById("random_other_content");
    
    //outer list
    var listElement = document.createElement("ul");

	ualist_div.appendChild(listElement);

	for (var k = 0;k < data.length;k++){

	    for (var i = 0; i < data[k].list.length; i++){

			var listItem = document.createElement("li");
			listItem.setAttribute("id","listItem_"+k);

	     
			var p = document.createElement("p");
			p.setAttribute("class","listitem_p");
			var textSpan = document.createElement("span");
			var indicatorSpan = document.createElement("span");



			textSpan.appendChild(document.createTextNode(data[k].list[i].description));
			textSpan.setAttribute("class","parentli");
			indicatorSpan.appendChild(document.createTextNode("+"));
			indicatorSpan.setAttribute("class","indicatorSpan");
			indicatorSpan.setAttribute("id","li_text"+k+""+i);


			textSpan.appendChild(indicatorSpan);


			p.appendChild(textSpan);
			listItem.appendChild(p);

	      
			//inner List  
			var innerListElement = document.createElement("ul");
			innerListElement.setAttribute("class","innerlist");
			innerListElement.setAttribute("id","innerlist"+k+""+i);

			//Add Random option as first element of inner list
			var innerListItem = document.createElement("li");
			var container = document.createElement("div");
			container.setAttribute("class","profileLine");

			var radio = document.createElement("input");
			radio.setAttribute("name","ua");	
			radio.setAttribute("type","radio");	
			radio.setAttribute("id","random_"+k+","+i);	
			radio.setAttribute("value","random_"+k+","+i);

			var label = document.createElement("label");
			label.setAttribute("for","random_"+k+","+i);
			label.appendChild(document.createTextNode(" "+localized_strings[1]+" "+  data[k].list[i].description));
			
			var excludeSpan = document.createElement("span");
- 			excludeSpan.appendChild(document.createTextNode(localized_strings[0]));
			excludeSpan.setAttribute("class","excludeSpan");


			container.appendChild(radio);
			container.appendChild(label);
			container.appendChild(excludeSpan);

			innerListItem.appendChild(container);
			innerListElement.appendChild(innerListItem);

		
			//set the inline style to none 
			//this prevents the need for two clicks to open the list
			innerListElement.style.display = "none";


			//prevent clicks on child element triggering the showing/hiding of the
			//child list	
			innerListElement.onclick= function stopProp (event){
				event.stopPropagation();
			}	

			//show or hide inner list element when the list item it is appended to is clicked
			listItem.onclick = function(x) { return function() { toggleList(x); }; }(innerListElement.id);
	      
			for (var j=0; j< data[k].list[i].useragents.length; j++){
		
				innerListItem = document.createElement("li");
		
				//container for the line to fix float issue on win xp
				container = document.createElement("div");
				container.setAttribute("class","profileLine");

				//pass the item index for the parent and for child as the value and id
				radio = document.createElement("input");
				radio.setAttribute("name","ua");	
				radio.setAttribute("type","radio");	
				radio.setAttribute("id",k+","+i+","+j);	
				radio.setAttribute("value",k+","+i+","+j);
		
				label = document.createElement("label");
				label.setAttribute("for",k+","+i+","+j);
				label.appendChild(document.createTextNode(" "+data[k].list[i].useragents[j].description));

				//checkbox used to exclude a profile from random selection using the profile's id
				var chkbox = document.createElement("input");
				chkbox.setAttribute("type","checkbox");
				chkbox.setAttribute("class","excludecb");
				chkbox.setAttribute("id",data[k].list[i].useragents[j].profileID);
				chkbox.setAttribute("value",k+","+i+","+j);

				container.appendChild(radio);
				container.appendChild(label);
				container.appendChild(chkbox);

				innerListItem.appendChild(container);

				innerListElement.appendChild(innerListItem);


			}
	      
			listItem.appendChild(innerListElement);
			listElement.appendChild(listItem);
			
	    }
	}

});


self.port.on("setCheckBox",function(checkboxid,value){
	document.getElementById(checkboxid).checked = value;
});

self.port.on("setElementValue",function(elementid,value){
	document.getElementById(elementid).value = value;
});

self.port.on("setElementText",function(elementid,value){
	document.getElementById(elementid).textContent = value;
});

self.port.on("setIPDDValues",function(elementid,value){
	document.getElementById(elementid).value = value;

	//set custom ipcheck inputs to show if custom is selected
	if( document.getElementById(elementid.slice(0, -2)+'dd').value == "custom"){
		document.getElementById('custom'+elementid.slice(0, -2)).className="";
	}
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

self.port.on("setMultiCheckBox",function(checkBoxList){
	
	//set exclude the checkboxes states	
	if (checkBoxList.length > 0 ){

		var exclude_list = checkBoxList.split(',');
		console.log("exclude_list is "+exclude_list);
		for (var i=0; i< exclude_list.length;i++){

			document.getElementById(exclude_list[i]).checked = true;
		}
	}

});



self.port.on("updatePanelItems",function(ua_choice){

	setListItemColors(ua_choice);
	setTimerVisibility(ua_choice);
	setExcludeCheckboxVisibility(ua_choice);
	setExcludeSpanVisibility(ua_choice);
	setTabsColors(ua_choice);

});

//show or hide the timer if a random UA was chosen or not
function setTimerVisibility(ua_choice){

	if(ua_choice.substr(0,6) === "random"){
		document.getElementById("time_interval_display").className ="";
	}else{
		document.getElementById("time_interval_display").className ="hidden";
	}

};

//set the background color of the tabs
function setTabsColors(ua_choice){

	if(ua_choice != "default"){
		document.getElementById("tabs_container").className ="spoof";
	}else{
		document.getElementById("tabs_container").className ="";
	}

};

//set the color of list item containing the selected profile
function setListItemColors(ua_choice){

	//reset any list item header colors
	var lih = document.getElementsByClassName("listitem_p_spoof");
	for (var i=0; i<lih.length;i++){
		lih[i].className = "listitem_p";
	}
	
	//set the current profile's parent list item header colors
	//get the p element
	var x = (((document.getElementById(ua_choice).parentElement).parentElement).parentElement).parentElement.firstChild;

	if(x.className == "listitem_p")
		x.className = "listitem_p_spoof";
}

function setExcludeCheckboxVisibility(ua_choice){

	var excludes = document.getElementsByClassName("excludecb");

	if(ua_choice.substr(0,6) === "random"){
		for (var i = 0; i < excludes.length; i++) {
			excludes[i].style.display = "inline-block";
		};
	}else{
		for (var i = 0; i < excludes.length; i++) {
			excludes[i].style.display = "none";
		};
	}
}

function setExcludeSpanVisibility(ua_choice){

	var excludes = document.getElementsByClassName("excludeSpan");

	if(ua_choice.substr(0,6) === "random"){
		for (var i = 0; i < excludes.length; i++) {
			excludes[i].style.display = "block";
		};
	}else{
		for (var i = 0; i < excludes.length; i++) {
			excludes[i].style.display = "none";
		};
	}
}
