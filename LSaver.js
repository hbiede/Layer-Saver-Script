// ==UserScript==
// @name            WME Layer Saver
// @author          HBiede
// @namespace       hbiede.com
// @description     Save the state of different combinations of layer display settings
// @include         /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @require         https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @version         2019.05.27.001
// @grant           none
// @copyright       2019 HBiede
// ==/UserScript==

/* global W */
/* global WazeWrap */
/* global require */
/* global $ */
/* global _ */

var debug = false;
const updateDescription = "<h4 style='margin-bottom: 5px;'>Changes:</h4><ul><li>Fixed bug with switching groups</li></ul>";

// start
setTimeout(initLayerSaver, 1000);

// load all the settings groups
function loadLayerSaverSettings() {
    if (debug) console.log("Loaded Settings: [" + JSON.parse(localStorage.layerSaverSettings) + "]");
    const returnValue = JSON.parse(localStorage.layerSaverSettings);
    return (Array.isArray(returnValue) ? returnValue : [returnValue]);
}

// save all the settings groups
function saveLayerSaverSettings() {
    var arrayBuilder = [];
    const settings = document.getElementById("LSaverSelector").children;
    for (var i = 1; i < settings.length; i++) {
        arrayBuilder = arrayBuilder.concat([settings[i].textContent + "::" + settings[i].settingsString]);
    }
    arrayBuilder.sort();
    localStorage.layerSaverSettings = JSON.stringify(arrayBuilder);
}

// load the selected settings group
function loadLayerSettings() {
    if (document.getElementById("LSaverSelector").selectedIndex != 0) {
        const settingsString = document.getElementById("LSaverSelector").selectedOptions[0].settingsString;
        const toggles = document.getElementById('layer-switcher-group_display').parentNode.parentNode.parentNode.querySelectorAll('input');
        for (var i = 0; i < toggles.length; i++) {
            // if the input is in the group and not checked, or not in the group and checked, click the input
            console.log((toggles[i].id && settingsString.includes(toggles[i].id)) || (toggles[i].labels[0].textContent && settingsString.includes(toggles[i].labels[0].textContent)));
            console.log(toggles[i].checked);
            console.log((toggles[i].id && settingsString.includes(toggles[i].id)) || (toggles[i].labels[0].textContent && settingsString.includes(toggles[i].labels[0].textContent)) != toggles[i].checked);
            if (((toggles[i].id && settingsString.includes(toggles[i].id)) || (toggles[i].labels[0].textContent && settingsString.includes(toggles[i].labels[0].textContent))) != toggles[i].checked) {
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
        const name = document.getElementById("LSaverSelector").children[document.getElementById("LSaverSelector").selectedIndex].textContent;
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
    const toggles = document.getElementById('layer-switcher-group_display').parentNode.parentNode.parentNode.querySelectorAll('input');
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

// import a settings array in the from of a base64 encoded stringified version of the settings array
function importSettingsString() {
    const importedArray = JSON.parse(window.atob(prompt("Import settings text", "")));
    if (Array.isArray(importedArray)) {
        localStorage.layerSaverSettings = JSON.stringify(loadLayerSaverSettings().concat(importedArray));
        var selector = document.getElementById("LSaverSelector");
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
        selectorInit();
        alert("Loaded");
        return;
    }
    alert("Invalid Input String");
}

// export a settings array in the from of a base64 encoded stringified version of the settings array
function exportSettingsString() {
    const ta = document.createElement('textarea');
    ta.value = window.btoa(localStorage.layerSaverSettings);
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert("Copied all groups' settings text to clipboard");
}

// build the selector on the script tab
function selectorInit() {
    console.log("Loading Layer Settings");
    const layerSettings = loadLayerSaverSettings();
    var firstOption = document.createElement("option");
    firstOption.hidden = true;
    document.getElementById("LSaverSelector").appendChild(firstOption);

    // build the selector options
    if (layerSettings.length > 0) {
        for (var i = 0; i < layerSettings.length; i++) {
            const setting = layerSettings[i].split("::");
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
    document.getElementById("LSaverImportBtn").addEventListener("click", function() { importSettingsString(); });
    document.getElementById("LSaverExportBtn").addEventListener("click", function() { exportSettingsString(); });
    console.log("Layer Settings Loaded");
}

// Create the tab in the sidebar via WazeWrap
function createTab() {
    var tabDisplay = $("<div>", {id:"WMELayerSaver"});
    tabDisplay.html([
        "<h3><b>WME Layer Saver</b></h3>",
        `<p><i>${GM_info.script.version} by ${GM_info.script.author}</i></p>`,
        "<div id='LSaverSelectorDiv'><label>Groups</label><br><select id='LSaverSelector' style='width:90%; margin-bottom: 8px;'></select></div>",
        "<div id='LSaverInteractionDiv'></div>",
        "<button class='btn btn-primary' id='LSaverLoadBtn' title='Load' style='margin: 8px 8px auto auto;'>Load</button>",
        "<button class='btn btn-primary' id='LSaverDeleteBtn' title='Delete Selected' style='margin: 8px 8px auto auto;'>Delete Selected</button><br>",
        "<button class='btn btn-primary' id='LSaverSaveBtn' title='Save New Group' style='margin: 8px 8px auto auto;'>Save New Group</button><br>",
        "<button class='btn btn-primary' id='LSaverImportBtn' title='Import' style='margin: 8px 8px auto auto;'>Import</button>",
        "<button class='btn btn-primary' id='LSaverExportBtn' title='Export' style='margin: 8px 8px auto auto;'>Export</button>",
        "</div>"
    ].join(""));

    new WazeWrap.Interface.Tab("LSaver", tabDisplay.html(), selectorInit);
    if (debug) console.log(tabDisplay);
}

// main function
function initLayerSaver(attempts = 1) {
    if (tries > 1000) return;
    else if (!WazeWrap.Ready || typeof W === "undefined" || typeof W.map === "undefined" || typeof W.loginManager === "undefined" || !document.querySelector("#topbar-container > div > div > div.location-info-region > div") || !document.getElementById("layer-switcher-group_display")) {
        if (debug) console.log("retry");
        setTimeout(function() { initLayerSaver(tries++); }, 800);
        return;
    } else {
        console.log("Starting Layer Saver");
        if (localStorage.layerSaverSettings === undefined) {
            localStorage.layerSaverSettings = "[]";
        }
        createTab();
        WazeWrap.Interface.ShowScriptUpdate(GM_info.script.name, GM_info.script.version, updateDescription, "https://greasyfork.org/en/scripts/383384-wme-layer-saver", "https://www.waze.com/forum/viewtopic.php?f=819&t=283513");
    }
}
