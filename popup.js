document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const toggle = document.getElementById("toggle");

  const { enabled } = await chrome.storage.local.get("enabled");
  updateUI(enabled !== false);

  toggle.onclick = async () => {
    const newState = status.innerText === "Enabled" ? false : true;
    await chrome.storage.local.set({ enabled: newState });
    updateUI(newState);
  };

  function updateUI(state) {
    status.innerText = state ? "Enabled" : "Disabled";
    if(state){
   
         toggle.style.borderColor = "#ffff00";
    }else{
      toggle.style.borderColor = "#ffffff9d"; 
    }
toggle.innerHTML = state
  ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="30" height="30">
       <path fill="#ffff00" stroke-width="30" d="M288 0c0-17.7-14.3-32-32-32S224-17.7 224 0l0 256c0 17.7 14.3 32 32 32s32-14.3 32-32L288 0zM146.3 98.4c14.5-10.1 18-30.1 7.9-44.6s-30.1-18-44.6-7.9C43.4 92.1 0 169 0 256 0 397.4 114.6 512 256 512S512 397.4 512 256c0-87-43.4-163.9-109.7-210.1-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6c49.8 34.8 82.3 92.4 82.3 157.6 0 106-86 192-192 192S64 362 64 256c0-65.2 32.5-122.9 82.3-157.6z"/>
     </svg>`
  : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="30" height="30">
       <path fill="#ffffff9d" stroke-width="3" d="M288 0c0-17.7-14.3-32-32-32S224-17.7 224 0l0 256c0 17.7 14.3 32 32 32s32-14.3 32-32L288 0zM146.3 98.4c14.5-10.1 18-30.1 7.9-44.6s-30.1-18-44.6-7.9C43.4 92.1 0 169 0 256 0 397.4 114.6 512 256 512S512 397.4 512 256c0-87-43.4-163.9-109.7-210.1-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6c49.8 34.8 82.3 92.4 82.3 157.6 0 106-86 192-192 192S64 362 64 256c0-65.2 32.5-122.9 82.3-157.6z"/>
     </svg>`;

  }
});