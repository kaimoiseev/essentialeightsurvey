$(document).ready(function(){

	// array with section titles; the number of sections shown on the page depends on this array
	var surveyParts = ["Patch operating systems", "Patch applications",  "Multi-factor authentication", "Restrict administrative privileges", "Application control", "Restrict Microsoft Office macros", "User application hardening", "Regular backups"];
	var currentSurveyPart = 0;
	var currentDraggedImgLevelIndex = 99;
	var characterHoverIndex = 99;

	// positions for dragged image 
	var posXBeforeMove = 0;
	var posYBeforeMove = 0;
	var posXMoveOffset = 0;
	var posYMoveOffset = 0;

	// matrix for output into JSON file
	var securityLevels = [];
	for(var i=0; i<surveyParts.length; i++) {
	    securityLevels[i] = [];
		for(var j=0; j<5; j++) {
      	securityLevels[i][j] = 0;
		}
	}

	var draggableImgLinks = ["../images/cuirass-128x128.png", "../images/helmet-144x128.png", "../images/shield-128x128.png", "../images/na-128x128.png"];

	var currentPartLevels = [0,0,0,0,0];


	// placing the questions from json into the questions elements and then sizing the requirements 
	// table correctly -- need the resizing function for the page to be responsive to window size
	changeQuestions(0);

	requirementsResize();
	window.addEventListener("resize", requirementsResize);


	function requirementsResize(){
		var dragDropImgWidth = $(".dragdrop").css("width"); 
		var dragDropParentWidth = $("#dragdropfilters").css("width"); 
		var extraHelmetWidth = parseFloat(dragDropImgWidth.slice(0,-2)*1.125); 
		$("#requirementselement").css("width", dragDropParentWidth); 
		$(".requirementssquare").css("width", dragDropImgWidth); 

		for (var i=0; i<questions[currentSurveyPart].length;i++){
			var questionHeight = $("body").find(".question").eq(i).css("height");
			$("body").find(".requirementsline").eq(i).css("height", questionHeight);
			$("body").find(".requirementssquare").eq(i*4+1).css("width", extraHelmetWidth + "px");
		}
	}



	//function to set the text of questions elements to the corresponding value in the questionlist JSON
	// and to set the values for requirements to required or default style, according to the JSON doc 
	function changeQuestions(partIndex){

		$(".requirementsline").remove();
		$(".question").remove();
		$("h2").remove();
		var surveyPartTitle = "<h2>" + surveyParts[partIndex] + "</h2>";
		$(".description").append(surveyPartTitle);
		var numberOfQuestions = questions[partIndex].length;
		for (var i=0;i<numberOfQuestions;i++){
			var currentQuestion = "<p class='question text'>" + questions[partIndex][i].name + "</p>";
			var currentReqLine = "<div class='requirementsline'>"

			for (var j=0;j<3;j++){
				if (questions[partIndex][i].requirementsLayout[j]){
					var currentReqSquare = "<div class='requirementssquare required'></div>";
				} else {
					var currentReqSquare = "<div class='requirementssquare'></div>";
				}
				currentReqLine += currentReqSquare;
			}
			currentReqLine+="<div class='requirementssquare notapplicable'></div></div>"
			$("#questionselement").append(currentQuestion);
			$("#requirementselement").append(currentReqLine);

			requirementsResize();		
		}
	}


	// drag and drop functions for each column (4 total) to change the image and variable for each group 


	$(".dragdrop").on('mousedown touchstart', function(){		//create a dragged img
	
		// which level image is dragged
		currentDraggedImgLevelIndex = $(".dragdrop").index(this);
		
		//create dragged image element 
		var draggedImg = $("<img id='dragged' src='" + draggableImgLinks[currentDraggedImgLevelIndex] + "'>");
		
		//append dragged image element
		$("body").append(draggedImg);

		// position it in the same place as "parent" element
		var offsetChild = $(this).offset();
		var offsetOfScroll = $("#dragdropfilters").scrollTop();
		var startPosY = offsetChild.top - offsetOfScroll; // + offsetParent.top;
		var startPosX = offsetChild.left; // + offsetParent.left;

		positionDraggedImg(startPosX, startPosY);

		posXBeforeMove = event.clientX;
		posYBeforeMove = event.clientY;


		//make it actually draggable 
		document.onmouseup = stopDraggingImg;
		document.ontouchend = stopDraggingImg;
		document.onmousemove = dragImg;

	});

	function positionDraggedImg(startPosX, startPosY){
		$("#dragged").css("top", startPosY + "px");
		$("#dragged").css("left", startPosX + "px");
	}

	function dragImg(){
		// drag "dragged" img after client cursor

		posXMoveOffset = posXBeforeMove - event.clientX;
		posYMoveOffset = posYBeforeMove - event.clientY;
		posXBeforeMove = event.clientX;
		posYBeforeMove = event.clientY;
		var currentDraggedImgOffset = $("#dragged").offset();
		var offsetOfScroll = $("#dragdropfilters").scrollTop();
		console.log("scroll offset is " + offsetOfScroll);

		var posYAfterMove = currentDraggedImgOffset.top - offsetOfScroll - posYMoveOffset;
		var posXAfterMove = currentDraggedImgOffset.left - posXMoveOffset;

		$("#dragged").css("top", posYAfterMove + "px");
		$("#dragged").css("left", posXAfterMove + "px");

		console.log("x = " + posXAfterMove + ", y = " + posYAfterMove);
	}

	function stopDraggingImg(){
		document.onmouseup = null;
		document.onmousemove = null;
		$("#dragged").remove();
		// adds 1 to account for level 0 being default 
		var levelIndex = currentDraggedImgLevelIndex + 1;


		// changes the character image and value in the current part's array depending on the index 

		characterHoverIndex = getCurrentCharacterIndex(event.clientX, event.clientY);
		

		switch (characterHoverIndex) {
			case 0:
				$(".researchers").attr("src", links[0][levelIndex]);
				currentPartLevels[0]=levelIndex;
				break;
			case 1:
				$(".faculty").attr("src", links[1][levelIndex]);
				currentPartLevels[1]=levelIndex;
				break;
			case 2:
				$(".students").attr("src", links[2][levelIndex]);
				currentPartLevels[2]=levelIndex;
				break;
			case 3:
				$(".admin").attr("src", links[3][levelIndex]);
				currentPartLevels[3]=levelIndex;
				break;
			case 4:
				$(".thirdparty").attr("src", links[4][levelIndex]);
				currentPartLevels[4]=levelIndex;
				break;
			default: 
				break;			
		}

		currentDraggedImgLevelIndex = 99;
	}

	function getCurrentCharacterIndex(mouseX, mouseY){
		//checks if mouse coordinates are over any of the characters; returns the index of the character
		var elementsAtCoordinates = document.elementsFromPoint(mouseX, mouseY);
		var characterIndex = 99;
		var characterElements = $(".character");
		for (var i=0; i<characterElements.length; i++){
			checkingCharacter = characterElements[i];
			for (var currentElement of elementsAtCoordinates){
				if (checkingCharacter==currentElement){characterIndex = i;}
			}

		}
		return characterIndex;

	}

	$(".character").dblclick(function(){ 
		// this should revert image and level index to level 0
		var currentCharacterIndex = $(".character").index(this);
		$(this).attr("src", links[currentCharacterIndex][0]);
		currentPartLevels[currentCharacterIndex] = 0;
	});


	$("button").click(function(){
		// this should record the characters' values into a matrix, change section, 
		//change questions and requirements, set 0s to the character values and character images 
		if(currentSurveyPart<(surveyParts.length-1)){
			recordValues(currentSurveyPart);
			currentSurveyPart = currentSurveyPart + 1;
			changeQuestions(currentSurveyPart);
			for (var i=0; i<currentPartLevels.length; i++){
				currentPartLevels[i] = 0;
				$("body").find(".character").eq(i).attr("src", links[i][0]);
			}
		}
		if(currentSurveyPart==(surveyParts.length-1)){
//			document.getElementById("sectionbutton").innerText = "Donwload Data";
			$("button").text("Download data");
			currentSurveyPart++;
		} else if (currentSurveyPart==surveyParts.length){

			var endData = JSON.stringify(securityLevels);
			const endDataToTextFile = new Blob([endData], {type:"application/json"});
			const downloadLink = document.createElement("a");
			downloadLink.href = URL.createObjectURL(endDataToTextFile);
			downloadLink.download = "securityLevels.json";
			downloadLink.click();
		}
	});


	function recordValues(sectionNumber){
		for (var i=0; i<securityLevels[sectionNumber].length; i++){
			if(currentPartLevels[i]==4){
				securityLevels[sectionNumber][i] = 99;
			} else {
				securityLevels[sectionNumber][i] = currentPartLevels[i];
			}
		}
	}

	$(".popuponhover").hover(function(){
		// place pop-up on mouse position, index of the pop-up in its class should be the same as the index of the
		//popupOnHover element in said class 
		var popupIndex = $(".popupOnHover").index(this);
		$("body").find(".popup").eq(popupIndex).css({"visibility":"visible", "top": event.clientY, "left":event.clientX, "z-index":"100"});

	}, function(){
		var popupIndex = $(".popupOnHover").index(this);
		$("body").find(".popup").eq(popupIndex).css({"visibility":"hidden", "z-index":"10"});
		
	});

});