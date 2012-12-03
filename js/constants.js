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
var BACKUP_IMAGE = 'https://online.ntnu.no/media/steria_logo_thumbnail.jpeg';

// Loops & intervals

var BACKGROUND_LOOP = 60000; // 60s
var BACKGROUND_LOOP_QUICK = 3000; // 3s, fix it quickly when something has gone wrong
var PAGE_LOOP = 20000; // every 20th second

// update stuff at every X intervals.
var UPDATE_OFFICE_INTERVAL = 1; // recommended: 1
var UPDATE_NEWS_INTERVAL = 30; // recommended: 30
var UPDATE_BUS_INTERVAL = 1; // recommended: 1
var UPDATE_CANTINAS_INTERVAL = 60; // recommended: 60

// OS detection

var OPERATING_SYSTEM = "Unknown";
if (navigator.appVersion.indexOf("Win")!=-1) OPERATING_SYSTEM="Windows";
if (navigator.appVersion.indexOf("Linux")!=-1) OPERATING_SYSTEM="Linux";
if (navigator.appVersion.indexOf("X11")!=-1) OPERATING_SYSTEM="UNIX";
if (navigator.appVersion.indexOf("Mac")!=-1) {
	OPERATING_SYSTEM = "Old Mac";
	if (navigator.appVersion.indexOf("10_7") != -1 || navigator.appVersion.indexOf("10_8") != -1) {
		OPERATING_SYSTEM = "Mac";
	}
}

