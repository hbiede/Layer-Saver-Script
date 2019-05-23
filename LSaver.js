// ==UserScript==
// @name            WME Layer Saver
// @author          HBiede
// @namespace       hbiede.com
// @description     Save the state of different combinations of layer display settings
// @include         /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @require          https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @version         2019.05.22.001
// @grant           none
// @copyright       2019 HBiede
// ==/UserScript==

/* global W */
/* global WazeWrap */
/* global require */
/* global $ */
/* global _ */

setTimeout(initLayerSaver, 1000);
var debug = false;

function initLayerSaver() {
    if (!WazeWrap.Ready || typeof W === "undefined" || typeof W.map === "undefined" || typeof W.loginManager === "undefined" || !document.querySelector("#topbar-container > div > div > div.location-info-region > div") || !document.getElementById("layer-switcher-group_display")) {
        if (debug) console.log("retry");
        setTimeout(initLayerSaver, 800);
        return;
    } else {
        console.log("Starting Layer Saver");
        if (localStorage.layerSaverSettings === undefined) {
            localStorage.layerSaverSettings = "[]";
        }
        createTab();
    }
}

function createTab() {
    var tabDisplay = $("<div>", {id:"WMELayerSaver"});
    tabDisplay.html([
        "<h3><b>WME Layer Saver</b></h3>",
        `<p><i>${GM_info.script.version} by ${GM_info.script.author}</i></p>`,
        "<div id='LSaverSelectorDiv'><label>Groups</label><br><select id='LSaverSelector' style='width:90%; margin-bottom: 8px;'></select></div>",
        "<div id='LSaverInteractionDiv'></div>",
        "<button class='btn btn-primary' id='LSaverLoadBtn' title='Load' style='margin: 8px 8px auto auto;'>Load</button>",
        "<button class='btn btn-primary' id='LSaverDeleteBtn' title='Delete Selected' style='margin: 8px 8px auto auto;'>Delete Selected</button>",
        "<button class='btn btn-primary' id='LSaverSaveBtn' title='Save New Group' style='margin: 8px 8px auto auto;'>Save New Group</button>",
        "</div>"
    ].join(""));

    new WazeWrap.Interface.Tab("LSaver", tabDisplay.html(), selectorInit);
    if (debug) console.log(tabDisplay);
}

// load all the settings groups
function loadLayerSaverSettings() {
    if (debug) console.log("Loaded Settings: [" + JSON.parse(localStorage.layerSaverSettings) + "]");
    let returnValue = JSON.parse(localStorage.layerSaverSettings);
    return (Array.isArray(returnValue) ? returnValue : [returnValue]);
}

// save all the settings groups
function saveLayerSaverSettings() {
    var arrayBuilder = [];
    let settings = document.getElementById("LSaverSelector").children;
    for (var i = 1; i < settings.length; i++) {
        arrayBuilder = arrayBuilder.concat([settings[i].textContent + "::" + settings[i].settingsString]);
    }
    arrayBuilder.sort();
    localStorage.layerSaverSettings = JSON.stringify(arrayBuilder);
}

// load the selected settings group
function loadLayerSettings() {
    if (document.getElementById("LSaverSelector").selectedIndex != 0) {
        let settingsString = document.getElementById("LSaverSelector").selectedOptions[0].settingsString;
        let toggles = document.getElementById('layer-switcher-group_display').parentNode.parentNode.parentNode.querySelectorAll('input');
        for (var i = 0; i < toggles.length; i++) {
            // if the input is in the group and not checked, or not in the group and checked, click the input
            console.log((toggles[i].id && settingsString.includes(toggles[i].id)) || (toggles[i].labels[0].textContent && settingsString.includes(toggles[i].labels[0].textContent)));
            console.log(toggles[i].checked);
            console.log((toggles[i].id && settingsString.includes(toggles[i].id)) || (toggles[i].labels[0].textContent && settingsString.includes(toggles[i].labels[0].textContent)) != toggles[i].checked);
            if ((toggles[i].id && settingsString.includes(toggles[i].id)) || (toggles[i].labels[0].textContent && settingsString.includes(toggles[i].labels[0].textContent)) != toggles[i].checked) {
                if (debug) console.log(toggles[i].labels[0].textContent);
                toggles[i].click();
            }
        }
        console.log("Loaded Group: " + document.getElementById("LSaverSelector").selectedOptions[0].textContent);
    }
}

// delete the selected settings group
function deleteLayerSettings() {
    if (document.getElementById("LSaverSelector").selectedIndex != 0) {
        let name = document.getElementById("LSaverSelector").children[document.getElementById("LSaverSelector").selectedIndex].textContent;
        document.getElementById("LSaverSelector").children[document.getElementById("LSaverSelector").selectedIndex].remove();
        saveLayerSaverSettings();
        console.log("Deleted Group: " + name);
    }
}

// save the selected settings group
function saveLayerSettings() {
    var layerSettingSelector = document.createElement("option");
    layerSettingSelector.textContent = prompt("Name Your New Layer Settings Group", "");
    if (layerSettingSelector.textContent != null) {
        layerSettingSelector.settingsString = getCurrentLayerSettingsString();
        document.getElementById("LSaverSelector").appendChild(layerSettingSelector);
        saveLayerSaverSettings();
        console.log("Created Group: " + layerSettingSelector.textContent);
        return;
    }
    console.log("Save Aborted");
}

// turn the currently selected inputs into a usable string
function getCurrentLayerSettingsString() {
    let toggles = document.getElementById('layer-switcher-group_display').parentNode.parentNode.parentNode.querySelectorAll('input');
    var stringBuilder = "";
    for (var i = 0; i < toggles.length; i++) {
        if (toggles[i].checked) {
            stringBuilder += (toggles[i].id ?
                                toggles[i].id :
                                (toggles[i].labels[0].textContent ? toggles[i].labels[0].textContent : ""));
        }
    }
    if (debug) console.log(stringBuilder);
    return stringBuilder;
}

// build the selector on the script tab
function selectorInit() {
    console.log("Loading Layer Settings");
    let layerSettings = loadLayerSaverSettings();
    var firstOption = document.createElement("option");
    firstOption.style.diplay = "none";
    firstOption.selected = firstOption.disabled = firstOption.hidden = true;
    firstOption.value = "";
    document.getElementById("LSaverSelector").appendChild(firstOption);

    // build the selector options
    if (layerSettings.length > 0) {
        for (var i = 0; i < layerSettings.length; i++) {
            let setting = layerSettings[i].split("::");
            var layerSettingSelector = document.createElement("option");
            layerSettingSelector.textContent = layerSettingSelector.value = setting[0];
            layerSettingSelector.settingsString = (setting[1] ? setting[1] : "");
            document.getElementById("LSaverSelector").appendChild(layerSettingSelector);
        }
    }

    // add button listeners
    document.getElementById("LSaverLoadBtn").addEventListener("click", function() { loadLayerSettings(); });
    document.getElementById("LSaverDeleteBtn").addEventListener("click", function() { deleteLayerSettings(); });
    document.getElementById("LSaverSaveBtn").addEventListener("click", function() { saveLayerSettings(); });
    console.log("Layer Settings Loaded");
}