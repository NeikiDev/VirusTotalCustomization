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
    setTimeout(() => { addButtons() }, 3000)
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
})();