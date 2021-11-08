const user_var = ["step", "speed_1", "speed_2"];
const user_var_default_val = [0.1, 1, 16]

function saveOptions(e) {
	e.preventDefault();

  for(let i = 0; i < user_var.length; i++){
    if(!isFloat(document.querySelector("#" + user_var[i]).value) || document.querySelector("#" + user_var[i]).value < 0.05){
      // some people want to watch the world burn
      alert('Dont mess with the page, please.');
      return;
    }
  }
	chrome.storage.sync.set({
		step: document.querySelector("#step").value,
		speed_1: document.querySelector("#speed_1").value,
		speed_2: document.querySelector("#speed_2").value
	});
}

function isFloat(obj){
	return !isNaN(parseFloat(obj));
}
function restoreOptions() {

  function setCurrentChoice_step(result) {
    document.querySelector("#step").value = result.step || "0.1";
  }
  
  function setCurrentChoice_speed_1(result) {
    document.querySelector("#speed_1").value = result.speed_1 || "1";
  }
  
  function setCurrentChoice_speed_2(result) {
    document.querySelector("#speed_2").value = result.speed_2 || "16";
  }


  chrome.storage.sync.get("step",setCurrentChoice_step);
  chrome.storage.sync.get("speed_1",setCurrentChoice_speed_1);
  chrome.storage.sync.get("speed_2",setCurrentChoice_speed_2);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
