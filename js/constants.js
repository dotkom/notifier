var DEBUG = 1;

// General
var EXTENSION_NAME = 'Online Notifier';
var EXTENSION_NICK = 'Notifier';
var EXTENSION_WEBSITE = 'https://online.ntnu.no';
var CREATOR_NAME = 'dotKom'; // max 8 letters because of styling
var CREATOR_EMAIL = 'dotkom@online.ntnu.no';

// Online News API
var API_KEY = 'f5be90e5ec1d2d454ae9';
var API_ADDRESS = 'https://online.ntnu.no/api/' + API_KEY + '/news_image_by_id/';
var BACKUP_IMAGE = 'img/logo-sponsor-placeholder.png';

// AJAX and JSON timeout
var AJAX_TIMEOUT = 5000;

// Loops & intervals
var BACKGROUND_LOOP = 60000; // 60s
var BACKGROUND_LOOP_QUICK = 3000; // 3s, fix it quickly when something has gone wrong
var PAGE_LOOP = 20000; // every 20th second

// Update stuff at every X intervals
var UPDATE_OFFICE_INTERVAL = 1; // recommended: 1
var UPDATE_SERVANT_INTERVAL = 10; // recommended: 10
var UPDATE_MEETINGS_INTERVAL = 10; // recommended: 10
var UPDATE_COFFEE_INTERVAL = 10; // recommended: 1
var UPDATE_NEWS_INTERVAL = 30; // recommended: 30
var UPDATE_BUS_INTERVAL = 1; // recommended: 1
var UPDATE_CANTINAS_INTERVAL = 60; // recommended: 60
var UPDATE_HOURS_INTERVAL = 1; // recommended: 1

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
	console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA prod. detection");
}