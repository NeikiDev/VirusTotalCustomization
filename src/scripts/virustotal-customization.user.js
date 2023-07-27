// ==UserScript==
// @name         VirusTotal customization
// @namespace    http://tampermonkey.net/
// @version      2.3.2
// @description  VirusTotal customization plugin - buttons and more
// @author       NeikiDev
// @match        https://www.virustotal.com/gui/file/*
// @match        https://www.virustotal.com/gui/url/*
// @icon         https://neiki.dev/assets/icon.png
// @updateURL    https://github.com/NeikiDev/VirusTotalCustomization/raw/main/src/scripts/virustotal-customization.user.js
// @downloadURL  https://github.com/NeikiDev/VirusTotalCustomization/raw/main/src/scripts/virustotal-customization.user.js
// ==/UserScript==

(function () {
   setTimeout(() => {
      const whitelisted_types = ["url", "file"]
      const websiteType = window.location.href.split("/")[4];
      if (!websiteType || !whitelisted_types.includes(websiteType)) return;
      loadSettingsTab(websiteType);
      loadCollectionTab(websiteType);
      load_extracted_engine_detections(websiteType);
      addButtons(websiteType);
   }, 3000)
   setInterval(() => {
      if (document.querySelector("file-view")
         && document.querySelector("file-view").shadowRoot.getElementById("report")
         && document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav") &&
         !document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav").innerHTML.includes("analyze.neiki.dev")
      ) {
         const whitelisted_types = ["url", "file"]
         const websiteType = window.location.href.split("/")[4];
         if (!websiteType || !whitelisted_types.includes(websiteType)) return;
         addButtons(websiteType)
      }
   }, 3000)
   function addButtons(type) {
      if (type === "file") {
         const hashRegex = /([0-9a-f]{64})/i;
         let sha256Hash = hashRegex.exec(window.location.href);
         if (!sha256Hash || !sha256Hash[0]) return;
         sha256Hash = sha256Hash[0].toLowerCase();
         if (!localStorage.getItem("opentip-data")) {
            addOpenTipStartDiv(sha256Hash);
         }
         if (document.querySelector("file-view") && document.querySelector("file-view").shadowRoot.getElementById("report") && document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav")) {
            const buttons_to_add = getButtons(sha256Hash, "file")
            document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav").innerHTML += buttons_to_add
         }
      } else if (type === "url") {
         const url = document.querySelector("url-view")
            .shadowRoot.getElementById("report")
            .querySelector("vt-ui-url-card")
            .shadowRoot.querySelector(".url-id").innerHTML.split("-->")[1]
         if (!url) return alert("NO URL");
         if (document.querySelector("url-view") && document.querySelector("url-view").shadowRoot.getElementById("report") && document.querySelector("url-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav")) {
            const buttons_to_add = getButtons(url, "url")
            document.querySelector("url-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav").innerHTML += buttons_to_add
         }
      }
   }
   function getButtons(sha256Hash, type) {
      if (type === "file") {
         const bazaar_search_term = `sha256:${sha256Hash}`
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
              href="https://bazaar.abuse.ch/browse.php?search=${encodeURIComponent(bazaar_search_term)}" target="_blank">
              <span>
                 <!---->Bazaar<!---->
              </span>
           </a>
        </li>
        `
      } else if (type === "url") {
         const urlObject = new URL(sha256Hash);
         const extracted_domain = urlObject.hostname
         return `
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://opentip.kaspersky.com/${encodeURIComponent(sha256Hash)}" target="_blank">
              <span>
                 <!---->Opentip<!---->
              </span>
           </a>
        </li>
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://sitereport.netcraft.com/?url=${sha256Hash}" target="_blank">
              <span>
                 <!---->NetCraft<!---->
              </span>
           </a>
        </li>
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://www.urlvoid.com/scan/${extracted_domain}/" target="_blank">
              <span>
                 <!---->UrlVoid<!---->
              </span>
           </a>
        </li>
        <li class="nav-item" role="presentation">
           <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
              href="https://sitecheck.sucuri.net/results/${sha256Hash}" target="_blank">
              <span>
                 <!---->Sitecheck<!---->
              </span>
           </a>
        </li>
        `
      }
   }
   function load_extracted_engine_detections(website_type) {
      const extracted_detections = extract_engine_detection(website_type)
      let extracted_html = "";
      extracted_detections.forEach((div_to_place) => {
         extracted_html +=
            `
         <div class="detection hstack">
         ${div_to_place.innerHTML}
         </div>
         `;
      })
      const newDiv = document.createElement("vt-ui-expandable");
      newDiv.setAttribute("class", "no-ident-expandable")
      newDiv.setAttribute("expanded", "")
      newDiv.innerHTML += `
      <span slot="header" class="hstack w-100">
      <div class="fw-bold fs-6 hstack gap-2">
         Quick view - Security vendors' analysis
      </div>
   </span>
   <span slot="content">
      <div id="detections" class="sub-section" wide-layout="">
         ${extracted_html}
      </div>
   </span>
   `

      if (website_type === "url") {
         const containerDiv = document.querySelector(`url-view`)
            .shadowRoot.getElementById("report")
            .querySelector(".tab-slot").querySelector("vt-ui-detections-list")
            .shadowRoot
         containerDiv.insertBefore(newDiv, containerDiv.firstChild)
      } else if (website_type === "file") {
         const containerDiv = document.querySelector(`file-view`)
            .shadowRoot.getElementById("report")
            .querySelector(".tab-slot").querySelector("#detectionsList").shadowRoot
         containerDiv.insertBefore(newDiv, containerDiv.firstChild)
      }
   }
   function extract_engine_detection(website_type) {
      const extract_engines = [];
      if (website_type === "url") {
         const detections_found = document.querySelector(`url-view`)
            .shadowRoot.getElementById("report")
            .querySelector(".tab-slot").querySelector("vt-ui-detections-list")
            .shadowRoot.querySelector("#detections")
            .querySelectorAll(".detection.hstack")
         const whitelisted_engines = ["Kaspersky", "BitDefender", "OpenPhish", "Netcraft", "Phishtank", "Google Safebrowsing", "URLhaus", "Sucuri SiteCheck"];
         detections_found.forEach((detectionDiv) => {
            const engine_name = detectionDiv.querySelector(".engine-name").innerHTML.trim().split("-->").pop();;
            if (whitelisted_engines.includes(engine_name)) {
               extract_engines.push(detectionDiv)
            }
         })
      } else if (website_type === "file") {
         const detections_found = document.querySelector(`file-view`)
            .shadowRoot.getElementById("report")
            .querySelector(".tab-slot").querySelector("#detectionsList")
            .shadowRoot.querySelector("#detections")
            .querySelectorAll(".detection.hstack")
         const whitelisted_engines = ["Kaspersky", "BitDefender", "Sophos", "ESET-NOD32", "Microsoft", "F-Secure"];
         detections_found.forEach((detectionDiv) => {
            const engine_name = detectionDiv.querySelector(".engine-name").innerHTML.trim().split("-->").pop();
            if (whitelisted_engines.includes(engine_name)) {
               extract_engines.push(detectionDiv)
            }
         })
      }
      return extract_engines;
   }
   function loadCollectionTab(websiteType) {
      if (websiteType === "file") {
         document.querySelector(`file-view`)
            .shadowRoot.getElementById("report")
            .querySelector(`vt-ui-file-card`)
            .shadowRoot.querySelector(".hstack.gap-2.fw-bold")
            .innerHTML +=
            `<vt-ui-menu id="main" class="position-relative">
         <slot name="trigger" slot="trigger">
           <button type="button" class="btn btn-link p-0 dropdown-toggle fw-semibold" aria-disabled="false"> Collection Utils </button>
         </slot>
         <vt-ui-submenu class="dropdown-menu end-0 show" name="tools" id="submenu" role="menu">
           <a onclick='${getCode_virustotaladdcollection()}' class="hstack gap-2 dropdown-item" data-submenu-close-on-click="">
            Add to Collection
           </a>
           <a onclick='${getCode_virustotalremovecollection()}' class="hstack gap-2 dropdown-item" data-submenu-close-on-click="">
            Remove from Collection
           </a>
           <a onclick='${getVirustotalChangeAPIKEYCode()}' class="hstack gap-2 dropdown-item" data-submenu-close-on-click="">
            Change Virustotal APIKEY
           </a>
         </vt-ui-submenu>
       </vt-ui-menu>
       `
      } else if (websiteType === "url") {
         document.querySelector(`url-view`)
            .shadowRoot.getElementById("report")
            .querySelector(`vt-ui-url-card`)
            .shadowRoot.querySelector(".hstack.gap-2.fw-bold")
            .innerHTML +=
            `<vt-ui-menu id="main" class="position-relative">
         <slot name="trigger" slot="trigger">
           <button type="button" class="btn btn-link p-0 dropdown-toggle fw-semibold" aria-disabled="false"> Collection Utils </button>
         </slot>
         <vt-ui-submenu class="dropdown-menu end-0 show" name="tools" id="submenu" role="menu">
           <a onclick='${getCode_virustotaladdcollection_url()}' class="hstack gap-2 dropdown-item" data-submenu-close-on-click="">
            Add to Collection
           </a>
           <a onclick='${getCode_virustotalremovecollection_url()}' class="hstack gap-2 dropdown-item" data-submenu-close-on-click="">
            Remove from Collection
           </a>
           <a onclick='${getVirustotalChangeAPIKEYCode()}' class="hstack gap-2 dropdown-item" data-submenu-close-on-click="">
            Change Virustotal APIKEY
           </a>
         </vt-ui-submenu>
       </vt-ui-menu>
       `
      }
   }
   function getCode_virustotaladdcollection_url() {
      return 'if(getCookieValue("virustotal_api_key")){let e=prompt("Enter ollection ID");e?fetch(`https://www.virustotal.com/api/v3/collections/${e}/urls`,{method:"POST",headers:{"x-apikey":getCookieValue("virustotal_api_key")},body:JSON.stringify({data:[{type:"url",id:getSha256Hash()},]})}).then(e=>{200!==e.status?(alert(`Failed, please try again, error code: ${e.status}`),console.log(e.status),console.log(e.statusText)):alert("Added Url!")}).catch(e=>{console.log(e),alert("Error, failed to add url!")}):alert("Failed, please try again!")}else alert("No Virustotal apikey found, please use the option to add it!");function getSha256Hash(){let e=/([0-9a-f]{64})/i.exec(window.location.href);return e&&e[0]?e[0].toLowerCase():null}function getCookieValue(e){let t=document.cookie.split(";");for(let a of t){let[o,i]=a.trim().split("=");if(o===e)return decodeURIComponent(i)}return null}'
   }
   function getCode_virustotalremovecollection_url() {
      return 'if(getCookieValue("virustotal_api_key")){let e=prompt("Enter ollection ID");e?fetch(`https://www.virustotal.com/api/v3/collections/${e}/urls`,{method:"DELETE",headers:{"x-apikey":getCookieValue("virustotal_api_key"),"Content-Type":"application/json",accept:"application/json"},body:JSON.stringify({data:[{type:"url",id:getSha256Hash()},]})}).then(e=>{200!==e.status?(alert(`Failed, please try again, error code: ${e.status}`),console.log(e.status),console.log(e.statusText)):alert("Deleted Url!")}).catch(e=>{console.log(e),alert("Error, failed to delete!")}):alert("Failed, please try again!")}else alert("No Virustotal apikey found, please use the option to add it!");function getSha256Hash(){let e=/([0-9a-f]{64})/i.exec(window.location.href);return e&&e[0]?e[0].toLowerCase():null}function getCookieValue(e){let t=document.cookie.split(";");for(let o of t){let[a,i]=o.trim().split("=");if(a===e)return decodeURIComponent(i)}return null}'
   }
   function getCode_virustotaladdcollection() {
      return 'if(getCookieValue("virustotal_api_key")){let e=prompt("Enter ollection ID");e?fetch(`https://www.virustotal.com/api/v3/collections/${e}/files`,{method:"POST",headers:{"x-apikey":getCookieValue("virustotal_api_key")},body:JSON.stringify({data:[{type:"file",id:getSha256Hash()},]})}).then(e=>{200!==e.status?(alert(`Failed, please try again, error code: ${e.status}`),console.log(e.status),console.log(e.statusText)):alert("Added File!")}).catch(e=>{console.log(e),alert("Error, failed to add file!")}):alert("Failed, please try again!")}else alert("No Virustotal apikey found, please use the option to add it!");function getSha256Hash(){let e=/([0-9a-f]{64})/i.exec(window.location.href);return e&&e[0]?e[0].toLowerCase():null}function getCookieValue(e){let t=document.cookie.split(";");for(let a of t){let[o,i]=a.trim().split("=");if(o===e)return decodeURIComponent(i)}return null}'
   }
   function getCode_virustotalremovecollection() {
      return 'if(getCookieValue("virustotal_api_key")){let e=prompt("Enter ollection ID");e?fetch(`https://www.virustotal.com/api/v3/collections/${e}/files`,{method:"DELETE",headers:{"x-apikey":getCookieValue("virustotal_api_key"),"Content-Type":"application/json",accept:"application/json"},body:JSON.stringify({data:[{type:"file",id:getSha256Hash()},]})}).then(e=>{200!==e.status?(alert(`Failed, please try again, error code: ${e.status}`),console.log(e.status),console.log(e.statusText)):alert("Deleted File!")}).catch(e=>{console.log(e),alert("Error, failed to delete!")}):alert("Failed, please try again!")}else alert("No Virustotal apikey found, please use the option to add it!");function getSha256Hash(){let e=/([0-9a-f]{64})/i.exec(window.location.href);return e&&e[0]?e[0].toLowerCase():null}function getCookieValue(e){let t=document.cookie.split(";");for(let o of t){let[a,i]=o.trim().split("=");if(a===e)return decodeURIComponent(i)}return null}'
   }
   function loadSettingsTab(website_type) {
      document.querySelector(`${website_type}-view`)
         .shadowRoot.getElementById("report")
         .querySelector(`vt-ui-${website_type}-card`)
         .shadowRoot.querySelector(".hstack.gap-2.fw-bold")
         .innerHTML +=
         `<vt-ui-menu id="main" class="position-relative">
         <slot name="trigger" slot="trigger">
           <button type="button" class="btn btn-link p-0 dropdown-toggle fw-semibold" aria-disabled="false"> Plugin Settings </button>
         </slot>
         <vt-ui-submenu class="dropdown-menu end-0 show" name="tools" id="submenu" role="menu">
         <a href="https://github.com/NeikiDev/VirusTotalCustomization" class="hstack gap-2 dropdown-item" role="button" data-submenu-close-on-click="">
            VirusTotal Customization Plugin
           </a>
           <a href="https://github.com/NeikiDev/VirusTotalCustomization/raw/main/src/scripts/virustotal-customization.user.js" class="hstack gap-2 dropdown-item" role="button" data-submenu-close-on-click="">
             Check for updates
           </a>
           <a onclick="javascript:alert('Soon!')" class="hstack gap-2 dropdown-item" data-submenu-close-on-click="">
            Change Settings
           </a>
         </vt-ui-submenu>
       </vt-ui-menu>
       `
   }
   function getVirustotalChangeAPIKEYCode() {
      return 'const e=prompt("ENTER YOUR VIRUSTOTAL APIKEY\\nNote: The key is stored (cookie) locally in your Browser!");e?(document.cookie=`virustotal_api_key=${encodeURIComponent(e)};path=/`,alert("Done, please reload your browser!")):alert("Failed, please try again!");'
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
            method: "GET",
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