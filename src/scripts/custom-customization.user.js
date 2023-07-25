// ==UserScript==
// @name         VirusTotal Custom Buttons
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  adds custom buttons and also (optional) loading opentip data report 
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
      if (!localStorage.getItem("opentip-data")) {
         addOpenTipStartDiv(sha256Hash);
      }
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
              href="https://analyze.neiki.dev/generate?hash=${sha256Hash}" target="_blank">
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
   function getSettingsCode() {
      return 'const e=prompt("ENTER YOUR OPENTIP APIKEY\\nNote: The key is stored (cookie) locally in your Browser!");e?(document.cookie=`opentip_api_key=${encodeURIComponent(e)};path=/`,alert("Done, please reload your browser!")):alert("Failed, please try again!");'
   }
   function addOpenTipStartDiv(sha256Hash) {
      const newDiv = document.createElement("div");
      newDiv.innerHTML = `
      <div class="popular-threat-name border border-top-0 mb-2 p-3 hstack gap-4 bg-body-secondary" style="margin-top: -5px;">
      <div class="col hstack gap-2">
         <span class="fw-bold">Kaspersky Opentip Analysis</span> 
         <div class="badge rounded-pill bg-body-tertiary text-body">
         <span id="start_opentip" class="fw-bold">Click to start!</span> 
      </div>
      </div>
      <div class="badge rounded-pill bg-body-tertiary text-body">
         <span onclick='${getSettingsCode()}' class="fw-bold">change apikey</span> 
      </div>
   </div>`
      const containerDiv = document.querySelector("file-view").shadowRoot.getElementById("report").querySelector(".tab-slot");
      containerDiv.insertBefore(newDiv, containerDiv.firstChild)
      document.querySelector("file-view").shadowRoot.getElementById("report").querySelector(".tab-slot").querySelector("#start_opentip").addEventListener("click", e => {
         getOpenTipData(sha256Hash)
      })
   }
   function addOpenTipDivLoader(sha256Hash) {
      const newDiv = document.createElement("div");
      newDiv.innerHTML = `
      <div class="popular-threat-name border border-top-0 mb-2 p-3 hstack gap-4 bg-body-secondary" style="margin-top: -5px;">
      <div class="col hstack gap-2">
         <span class="fw-bold">Kaspersky Opentip Analysis</span> 
         <a class="link-info hstack gap-1" href="https://opentip.kaspersky.com/${sha256Hash}">
            Fetching Data... 
         </a>
      </div>
      <div class="col hstack gap-2 text-truncate">
         <span class="fw-bold">Detection</span> 
         <div class="tags hstack gap-2">
            <a class="link-none hstack gap-1" href="https://opentip.kaspersky.com/${sha256Hash}">
               -
            </a>
         </div>
      </div>
      <div class="badge rounded-pill bg-body-tertiary text-body">
         <span onclick='${getSettingsCode()}' class="fw-bold">change apikey</span> 
      </div>
   </div>`
      const containerDiv = document.querySelector("file-view").shadowRoot.getElementById("report").querySelector(".tab-slot");
      containerDiv.removeChild(containerDiv.firstChild)
      containerDiv.insertBefore(newDiv, containerDiv.firstChild)
   }
   function addOpenTipDivError(error_message) {
      const error = error_message ?? "Error in the console";
      const newDiv = document.createElement("div");
      newDiv.innerHTML = `
      <div class="popular-threat-name border border-top-0 mb-2 p-3 hstack gap-4 bg-body-secondary" style="margin-top: -5px;">
      <div class="col hstack gap-2">
         <span class="fw-bold">Failed to get Opentip Data!</span>
      </div>
      <div class="col hstack gap-2 text-truncate">
         <span class="fw-bold">${error}</span>
      </div>
      <div class="badge rounded-pill bg-body-tertiary text-body">
         <span onclick='${getSettingsCode()}' class="fw-bold">change apikey</span> 
      </div>
   </div>`
      const containerDiv = document.querySelector("file-view").shadowRoot.getElementById("report").querySelector(".tab-slot");
      containerDiv.removeChild(containerDiv.firstChild)
      containerDiv.insertBefore(newDiv, containerDiv.firstChild)
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
      <div class="badge rounded-pill bg-body-tertiary text-body">
         <span onclick='${getSettingsCode()}' class="fw-bold">change apikey</span> 
      </div>
   </div>`
      const containerDiv = document.querySelector("file-view").shadowRoot.getElementById("report").querySelector(".tab-slot");
      containerDiv.removeChild(containerDiv.firstChild)
      containerDiv.insertBefore(newDiv, containerDiv.firstChild)
   }
   function getCookieValue(cookieName) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
         const [name, value] = cookie.trim().split('=');
         if (name === cookieName) {
            return decodeURIComponent(value);
         }
      }
      return null;
   }
   function getOpenTipData(sha256Hash) {
      if (!getCookieValue("opentip_api_key")) {
         addOpenTipDivError("Missing APIKEY!");
         console.log("Please use the settings button to add or change your key!")
      } else {
         if (localStorage.getItem("opentip-data")) return;
         localStorage.setItem("opentip-data", "already-fetched")
         addOpenTipDivLoader()
         fetch(`https://proxy.pleasedontbearealdomain.com/https://opentip.kaspersky.com/api/v1/search/hash?request=${sha256Hash}`, {
            method: "POST",
            headers: {
               "origin": "opentip.kaspersky.com",
               "x-request-with": "any",
               "x-api-key": getCookieValue("opentip_api_key")
            }
         }).then((res) => {
            if (res.status !== 200) {
               addOpenTipDivError(`Error! response code: ${res.status}`)
               console.log(res.status)
               console.log(res.statusText)
               console.log('https://opentip.kaspersky.com/Help/Doc_data/GetFileReport.htm#:~:text=web%20interface.-,Responses,-200%20OK')
            } else {
               res.json().then((report_data) => {
                  try {
                     setOpenTipDiv(report_data)
                  } catch (error) {
                     addOpenTipDivError()
                     console.log(error)
                  }
               })
            }
         }).catch((error) => {
            addOpenTipDivError()
            console.log(error)
            console.log('https://opentip.kaspersky.com/Help/Doc_data/GetFileReport.htm#:~:text=web%20interface.-,Responses,-200%20OK')
         })
      }
   }
})();