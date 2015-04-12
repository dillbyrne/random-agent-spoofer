self.port.once('tab_listener',function(){
	//get all the tabs
	var tabs = document.getElementById("tabs").children;

	//add on click listener to each
	for (var i =0; i< tabs.length;i++){
		tabs[i].onclick = function(x,y) { return function() { changeTab(x,y); }; }(tabs[i].children[0],tabs);
	}
});



self.port.once('ua_list', function(data,localized_strings) {

    var uaList  = document.getElementById("ualist");

	for (var k = 0; k < data.length; k++) {

	    for (var i = 0; i < data[k].list.length; i++) {

			var section = document.createElement("h2");
			section.innerHTML = data[k].list[i].description;

			section.addEventListener("click", function() {

				this.classList.toggle("open");
			});

			var listItems = document.createElement("ul");

			var listRandom = document.createElement("li");
			listRandom.setAttribute("class","profileLine");

			var radio = document.createElement("input");
			radio.setAttribute("name","ua");
			radio.setAttribute("type","radio");
			radio.setAttribute("id","random_"+k+","+i);
			radio.setAttribute("value","random_"+k+","+i);

			var label = document.createElement("label");
			label.setAttribute("for","random_"+k+","+i);
			label.innerHTML = " "+localized_strings[1]+" "+  data[k].list[i].description;

			// excludeSpan.appendChild(document.createTextNode(localized_strings[0]));

			uaList.appendChild(section);
			uaList.appendChild(listItems);
			listItems.appendChild(listRandom);
			listRandom.appendChild(radio);
			listRandom.appendChild(label);

			for (var j=0; j< data[k].list[i].useragents.length; j++) {

				userAgent = document.createElement("li");

				var radio = document.createElement("input");
				radio.setAttribute("name","ua");
				radio.setAttribute("type","radio");
				radio.setAttribute("id",k+","+i+","+j);
				radio.setAttribute("value",k+","+i+","+j);

				var label = document.createElement("label");
				label.setAttribute("for",k+","+i+","+j);
				label.innerHTML = " "+data[k].list[i].useragents[j].description;

				var excludeBox = document.createElement("input");
				excludeBox.setAttribute("type","checkbox");
				excludeBox.setAttribute("class","excludecb");
				excludeBox.setAttribute("id",data[k].list[i].useragents[j].profileID);
				excludeBox.setAttribute("value",k+","+i+","+j);

				userAgent.appendChild(radio);
				userAgent.appendChild(label);
				userAgent.appendChild(excludeBox);

				listItems.appendChild(userAgent);
			}
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
		document.body.classList.add("spoof");
	}else{
		document.body.classList.remove("spoof");
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
