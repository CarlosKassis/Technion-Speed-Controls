const user_var = ["step", "speed_1", "speed_2"];
const user_var_default_val = [0.1, 1, 16]
const min_legal_video_duration = 10 // some videos shorter than this value get detected, discard them.

var videoList; 			// videos holder
var playbackRate = 1;		// global playback rate
var playBackRateDecimals = 1 	// for displaying playback speed

var step = 0.1;		// amount of speed change
var speed_1 = 1;	// user set speed 1
var speed_2 = 16;	// user set speed 2

// easier to develop for Chromium and Firefox
var storage;
if(navigator.userAgent.indexOf("Firefox") != -1)
	storage = browser.storage.local;
else {
	storage = chrome.storage.sync;
}

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

// not the prettiest of js
function loadUserSettings(){
	storage.get('step', onGot);
	storage.get('speed_1', onGot);
	storage.get('speed_2', onGot);
}
loadUserSettings();

// wait for video elements to load
setTimeout(function() {   
	videoList = document.getElementsByTagName("video");	

	for (i = 0; i < videoList.length; i++) {
		
		if(videoList[i].duration <= min_legal_video_duration)
			continue;
		
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

function videoActualRemainingTime(video){
	return (video.duration-video.currentTime)/video.playbackRate;
}


// loops for a couple of frames each second, updating the remaining-time elements
function superFastLoop() {  

	if(videoList != null && videoList.length >= 1){
		
		// set to maximum reasonable value (what is even reasonable?)
		var remainingTime = 1000000000
		var minPlaybackRate = 16;
		
		for (i = 0; i < videoList.length; i++){
			if(videoList[i].duration <= min_legal_video_duration)
				continue;
			
			remainingTime = Math.min(remainingTime, videoActualRemainingTime(videoList[i]));
			minPlaybackRate = Math.min(minPlaybackRate, videoList[i].playbackRate);
		}
		var timeDisplay;
		if(isNaN(remainingTime) == false){
			var hours = Math.floor(remainingTime / 3600);
			remainingTime -= hours * 3600;
			var minutes = Math.floor(remainingTime / 60);
			remainingTime -= minutes * 60;
			var seconds = Math.floor(remainingTime) % 60;
			
			timeDisplay = hours.toString().padStart(2, '0') + ":" 
				+ minutes.toString().padStart(2, '0')+ ":" 
				+ seconds.toString().padStart(2, '0')
				+ " x" + minPlaybackRate.toFixed(playBackRateDecimals); 
		} else {
			timeDisplay = "Pending...";
		}
		
		for (i = 0; i < videoList.length; i++){
			if(document.getElementById("remaining-time"+i)){
				document.getElementById("remaining-time"+i).textContent = timeDisplay;
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
