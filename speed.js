const user_var = ["step", "speed_1", "speed_2"];
const user_var_default_val = [0.1, 1, 16]

var videoList; 			// videos holder
var playbackRate = 1;	// global playback rate
var playBackRateDecimals = 1 // for displaying playback speed

var step = 0.1;		// amount of speed change
var speed_1 = 1;	// user set speed 1
var speed_2 = 16;	// user set speed 2

function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
	if (item.speed_1) {
		speed_1 = parseFloat(item.speed_1);
	}
	
	if (item.speed_2) {
		speed_2 = parseFloat(item.speed_2);
	}
	if (item.step) {
		step = parseFloat(item.step);
	playBackRateDecimals = Math.min(step.countDecimals(),2)
	}
}

function loadUserSettings(){
	chrome.storage.sync.get('step', onGot);
	chrome.storage.sync.get('speed_1', onGot);
	chrome.storage.sync.get('speed_2', onGot);
}
loadUserSettings();

// wait for video elements to load
setTimeout(function() {   
	videoList = document.getElementsByTagName("video");	

	for (i = 0; i < videoList.length; i++) {
		var tag = document.createElement("div");
		tag.style = 'z-index: 9999999;position:relative;display:inline-block;height:50px;background-color:black;'
					+	'opacity:0.6;border-radius: 10px;left:43%;top: 10px;';
		
		var text = document.createElement("p");
		text.style = 'margin-left:20px;margin-right:20px;margin-top:10px;color:white;font-weight:bold;font-size:26px;line-height: normal;';
		text.id = "remaining-time" + i;
		
		tag.appendChild(text);
		
		// Make the DIV element draggable:
		dragElement(tag);
		
		videoList[i].parentElement.prepend(tag);
	}
}, 1500);

// listen for keys
document.addEventListener('keydown', keyDown);

function keyDown(e) {
	if(e.code == "NumpadAdd" || e.code == "Equal")
	{	
		changeAllVideosSpeed(playbackRate + step);
	}
	else if(e.code == "NumpadSubtract" || e.code == "Minus")
	{
		changeAllVideosSpeed(playbackRate - step);
	}
	else if(e.code == "NumpadMultiply")
	{
		changeAllVideosSpeed(speed_1);
	}
	else if(e.code == "NumpadDivide"){
		changeAllVideosSpeed(speed_2);
	}
}

// maximum browser support speed = 16
// minimum reasonable speed = 1 (who would want to watch in slow motion?)
const min_speed = 1;
const max_speed = 16;
function changeAllVideosSpeed(newRate){
	if(videoList == null)
		return;
	
	playbackRate = newRate;
	if(playbackRate < min_speed)
		playbackRate = min_speed;
	else if(playbackRate > max_speed)
		playbackRate = max_speed;
	
	for (i = 0; i < videoList.length; i++) {
		videoList[i].playbackRate = playbackRate;
	}
}

Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}

// loops for a couple of frames each second, updating the remaining-time elements
function superFastLoop() {  
	if(videoList != null){
		for (i = 0; i < videoList.length; i++){
			var remainingTime = (videoList[i].duration-videoList[i].currentTime)/(videoList[i].playbackRate);
			if(isNaN(remainingTime) == false){
				var hours = Math.floor(remainingTime / 3600);
				remainingTime -= hours * 3600;
				var minutes = Math.floor(remainingTime / 60);
				remainingTime -= minutes * 60;
				var seconds = Math.floor(remainingTime) % 60;
				
				document.getElementById("remaining-time"+i).textContent = hours.toString().padStart(2, '0') + ":" 
					+ minutes.toString().padStart(2, '0')+ ":" 
					+ seconds.toString().padStart(2, '0')
					+ " x" + videoList[i].playbackRate.toFixed(playBackRateDecimals); 
			} else {
				document.getElementById("remaining-time"+i).textContent = "Pending...";
			}
		}
	}
	
	setTimeout(function() {   
		superFastLoop();		
	}, 16);
}
superFastLoop();	

// enables element dragging ability
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
