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

