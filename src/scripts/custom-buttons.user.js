// ==UserScript==
// @name         VirusTotal Custom Buttons
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds 4 Buttons to VirusTotal
// @author       NeikiDev
// @match        https://www.virustotal.com/gui/file/*
// @icon         https://neiki.dev/assets/icon.png
// @updateURL    https://github.com/NeikiDev/VirusTotalCustomButtons/raw/main/src/scripts/custom-buttons.user.js
// @downloadURL  https://github.com/NeikiDev/VirusTotalCustomButtons/raw/main/src/scripts/custom-buttons.user.js
// ==/UserScript==
(function () {
    'use strict';
    const hashRegex = /([0-9a-f]{64})/i;
    let sha245Hash = hashRegex.exec(window.location.href);
    const intervalId = setInterval(() => {
        if (!sha245Hash || !sha245Hash[0]) return;
        sha245Hash = sha245Hash[0].toLowerCase();
        const buttons_to_add = `
    <li class="nav-item" role="presentation">
       <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
          href="https://opentip.kaspersky.com/${sha245Hash}" target="_blank">
          <span>
             <!---->Opentip<!---->
          </span>
       </a>
    </li>
    <li class="nav-item" role="presentation">
       <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
          href="https://analyze.neiki.dev/reports/${sha245Hash}" target="_blank">
          <span>
             <!---->Neiki<!---->
          </span>
       </a>
    </li>
    <li class="nav-item" role="presentation">
       <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
          href="https://tria.ge/s?q=${sha245Hash}" target="_blank">
          <span>
             <!---->Triage<!---->
          </span>
       </a>
    </li>
    <li class="nav-item" role="presentation">
       <a data-bs-toggle="tab" role="tab" no-history="" class="nav-link p-3 px-4  hstack gap-2" aria-selected="false" data-route="community"
          href="https://bazaar.abuse.ch/browse.php?search=${sha245Hash}" target="_blank">
          <span>
             <!---->Bazaar<!---->
          </span>
       </a>
    </li>
    `
        if (document.querySelector("file-view") && document.querySelector("file-view").shadowRoot.getElementById("report") && document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav")) {
            clearInterval(intervalId)
            document.querySelector("file-view").shadowRoot.getElementById("report").shadowRoot.querySelector(".nav").innerHTML += buttons_to_add
        }
    }, 3000)
})();