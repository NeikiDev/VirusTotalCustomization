// ==UserScript==
// @name         VirusTotal Custom Buttons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds 4 Buttons to VirusTotal
// @author       NeikiDev
// @match        https://www.virustotal.com/gui/file/*
// @icon         https://neiki.dev/assets/icon.png
// @updateURL    https://github.com/NeikiDev/VirusTotalCustomButtons/raw/main/src/scripts/custom-buttons.user.js
// @downloadURL  https://github.com/NeikiDev/VirusTotalCustomButtons/raw/main/src/scripts/custom-buttons.user.js
// ==/UserScript==

(function () {
   'use strict';
   setTimeout(() => { addButtons(); }, 3000)
   setInterval(() => {
      if (document.querySelector("file-view")
         && document.querySelector("file-view").shadowRoot.getElementById("report")
         && document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav") &&
         !document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav").innerHTML.includes("analyze.neiki.dev")
      ) {
         addButtons()
      }
   }, 3000)
   function addButtons() {
      const hashRegex = /([0-9a-f]{64})/i;
      let sha256Hash = hashRegex.exec(window.location.href);
      if (!sha256Hash || !sha256Hash[0]) return;
      sha256Hash = sha256Hash[0].toLowerCase();
      getOpenTipData(sha256Hash);
      if (document.querySelector("file-view") && document.querySelector("file-view").shadowRoot.getElementById("report") && document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav")) {
         const buttons_to_add = getButtons(sha256Hash)
         document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav").innerHTML += buttons_to_add
      }
   }
   function getButtons(sha256Hash) {
      return `
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://opentip.kaspersky.com/${sha256Hash}" target="_blank">
              <span>
                 <!---->Opentip<!---->
              </span>
           </a>
        </li>
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://analyze.neiki.dev/reports/${sha256Hash}" target="_blank">
              <span>
                 <!---->Neiki<!---->
              </span>
           </a>
        </li>
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://tria.ge/s?q=${sha256Hash}" target="_blank">
              <span>
                 <!---->Triage<!---->
              </span>
           </a>
        </li>
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://bazaar.abuse.ch/browse.php?search=${sha256Hash}" target="_blank">
              <span>
                 <!---->Bazaar<!---->
              </span>
           </a>
        </li>
        `
   }
   function setOpenTipDiv(report_data) {
      let color = "info"
      if (report_data.Zone === "Green") {
         color = "primary"
      } else if (report_data.Zone === "Yellow") {
         color = "warning"
      } else if (report_data.Zone === "Red") {
         color = "danger"
      } else if (report_data.Zone === "Grey") {
         color = "none"
      }
      const newDiv = document.createElement("div");
      newDiv.innerHTML = `
      <div class="popular-threat-name border border-top-0 mb-2 p-3 hstack gap-4 bg-body-secondary" style="margin-top: -5px;">
      <div class="col hstack gap-2">
         <span class="fw-bold">Kaspersky Opentip Analysis</span> 
         <a class="link-${color} hstack gap-1" href="https://opentip.kaspersky.com/${report_data.FileGeneralInfo.Sha256}">
            Full Report
         </a>
      </div>
      <div class="col hstack gap-2 text-truncate">
         <span class="fw-bold">Detection</span> 
         <div class="tags hstack gap-2">
            <a class="link-${color} hstack gap-1" href="https://opentip.kaspersky.com/${report_data.FileGeneralInfo.Sha256}">
               ${report_data.FileGeneralInfo.FileStatus}
            </a>
         </div>
      </div>
      <div class="col hstack gap-2 text-truncate">
         <span class="fw-bold">KSN Hits</span> 
         <div class="tags hstack gap-2">
            <!----> 
            <a class="badge rounded-pill bg-body-tertiary text-body" href="https://opentip.kaspersky.com/${report_data.FileGeneralInfo.Sha256}"> 
             ${report_data.FileGeneralInfo.HitsCount} 
            </a> <!----> 
         </div>
      </div>
   </div>`
      const containerDiv = document.querySelector("file-view").shadowRoot.getElementById("report").querySelector(".tab-slot");
      containerDiv.insertBefore(newDiv, containerDiv.firstChild)
   }
   function checkOpenTipKeyStatus() {
      const opentip_api_key = localStorage.getItem("opentip_api_key");
      if (!opentip_api_key) {
         const key = prompt("ENTER YOUR OPENTIP APIKEY\nNote: The key is stored locally in your Browser!")
         if (key) {
            localStorage.setItem("opentip_api_key", key)
            return true;
         } else return false;
      } else return true;
   }
   function getOpenTipData(sha256Hash) {
      if (!checkOpenTipKeyStatus()) {
         const resetKey = confirm("No or invalid Key found!\nDo you want to reset the local stored key?")
         if (resetKey) { localStorage.removeItem("opentip_api_key"); alert("Please reload the page, to enter a new key!") }
      } else {
         fetch(`https://proxy.pleasedontbearealdomain.com/https://opentip.kaspersky.com/api/v1/getresult/file?request=${sha256Hash}`, {
            method: "POST",
            headers: {
               "origin": "opentip.kaspersky.com",
               "x-request-with": "any",
               "x-api-key": "V7vq6qYgTCiTSxqFTjwtTw=="
            }
         }).then((res) => res.json().then((report_data) => {
            setOpenTipDiv(report_data)
         })).catch((error) => {
            console.log(error)
         })
      }
   }
})();