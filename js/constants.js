var DEBUG = 1;

// General
var EXTENSION_NAME = 'Online Notifier';
var EXTENSION_NICK = 'Notifier';
var EXTENSION_WEBSITE = 'https://online.ntnu.no';
var CREATOR_NAME = 'Online'; // max 8 letters because of styling
var CREATOR_EMAIL = 'dotkom@online.ntnu.no';

// AJAX and JSON timeout
var AJAX_TIMEOUT = 7500;

// Loops & intervals
var BACKGROUND_LOOP = 60000; // 60s
var BACKGROUND_LOOP_OFFLINE = 3000; // 3s, respond quickly when we get back online
var PAGE_LOOP = 10000; // every 10th second

// Update stuff at every X intervals
var UPDATE_OFFICE_INTERVAL = 1; // recommended: 1
var UPDATE_SERVANT_INTERVAL = 10; // recommended: 10
var UPDATE_MEETINGS_INTERVAL = 10; // recommended: 10
var UPDATE_COFFEE_INTERVAL = 1; // recommended: 1
var UPDATE_HOURS_INTERVAL = 60; // recommended: 60
var UPDATE_CANTINAS_INTERVAL = 60; // recommended: 60
var UPDATE_BUS_INTERVAL = 1; // recommended: 1
var UPDATE_NEWS_INTERVAL = 30; // recommended: 30

// OS detection
var OPERATING_SYSTEM = "Unknown";
if (navigator.appVersion.indexOf("Win")!==-1) OPERATING_SYSTEM="Windows";
else if (navigator.appVersion.indexOf("Linux")!==-1) OPERATING_SYSTEM="Linux";
else if (navigator.appVersion.indexOf("X11")!==-1) OPERATING_SYSTEM="UNIX";
else if (navigator.appVersion.indexOf("Mac")!==-1) {
	OPERATING_SYSTEM = "Old Mac";
	if (navigator.appVersion.indexOf("10_7")!==-1||navigator.appVersion.indexOf("10_8")!==-1) {
		OPERATING_SYSTEM = "Mac";
	}
}
else {
	console.log("ERROR: Potentially unsupported operating system");
}

// Browser detection
var BROWSER = "Unknown";
if (typeof chrome != "undefined")
	BROWSER = "Chrome";
else if (typeof opera != "undefined")
	BROWSER = "Opera";
else {
	console.log("ERROR: Potentially unsupported browser");
}

// Production detection
if (BROWSER == "Chrome") {
	if (chrome.i18n.getMessage('@@extension_id') === "hfgffimlnajpbenfpaofmmffcdmgkllf") {
		DEBUG = 0;
	}
}
else if (BROWSER == "Opera") {
	// TODO: Implement this
}
