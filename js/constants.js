
var DEBUG = 0;

var EXTENSION_NAME = 'Online Notifier';
var EXTENSION_WEBSITE = 'https://online.ntnu.no';
var CREATOR_NAME = 'dotKom'; // max 8 letters because of styling
var CREATOR_EMAIL = 'dotkom@online.ntnu.no';
var FEED_URL = 'https://online.ntnu.no/feeds/news/';
var OFFICE_LIGHTS_URL = 'http://draug.online.ntnu.no/lys.txt';
var CALENDAR_URL = 'https://online.ntnu.no/service_static/online_notifier';
var GOOGLE_ANALYTICS_TRACKING_CODE = 'UA-9905766-3';

// how long the desktop notification is visible
var DESKTOP_NOTIFICATION_TIMEOUT = 5000; // 5.000 ms

// how long the notification box on the options page is visible
var OPTIONS_NOTIFICATION_TIMEOUT = 800; // 800 ms

// refresh office status or feed every X minute
var REFRESH_OFFICE_INTERVAL = 5; // recommended: 5
var REFRESH_FEED_INTERVAL = 10; // recommended: 10

// threshold for office status light level, above = lights off, below = lights on
var OFFICE_LIGHTS_BORDER_VALUE = 800; // 800 is great

// messages

var OPTIONS_OFFICE = 'Show office status: Open, closed, meeting, free waffles';
var OPTIONS_NOTIFICATIONS = 'Show desktop notifications when news are published / updated';

var DISCONNECTED = 'Connecting...';
var CONNECTION_ERROR = 'Something went wrong, retrying...';
var OFFICE_OPEN = 'Welcome to the office, free coffee! :)';
var OFFICE_CLOSED = 'The office is closed';
var OFFICE_UNTITLED_MEETING = 'Meeting at the office'; // titled meetings and waffles get names from their respective calendar entries

var EMAIL_SUBJECT = 'I wantz to tell u guise sumthing! :3'; // no ampersands!
var EMAIL_BODY = '( praise is dearly recieved :: bugs must be described well :: wishes for new features are welcome )'; // no ampersands!

// images and icons

var ICON_DEFAULT = 'img/icon-default.png';
var ICON_DISCONNECTED = 'img/icon-disconnected.png';
var ICON_OPEN = 'img/icon-open.png';
var ICON_CLOSED = 'img/icon-closed.png';
var ICON_MEETING = 'img/icon-meeting.png';
var ICON_WAFFLE = 'img/icon-waffle.png';

var IMAGE_OPEN = 'img/office-open.png';
var IMAGE_CLOSED = 'img/office-closed.png';
var IMAGE_MEETING = 'img/office-meeting.png';
var IMAGE_WAFFLE = 'img/office-waffle.png';

// os detection

var OPERATING_SYSTEM = "Unknown";
if (navigator.appVersion.indexOf("Win")!=-1) os="Windows";
if (navigator.appVersion.indexOf("Mac")!=-1) os="Mac";
if (navigator.appVersion.indexOf("X11")!=-1) os="UNIX";
if (navigator.appVersion.indexOf("Linux")!=-1) os="Linux";





// ======== don't touch ========
// idiot checks and calculations
// ======== don't touch ========

if (CREATOR_NAME.length > 8)
	warn('CREATOR_NAME contains more than 8 letters, - shorten it or lose style!');

if (OPTIONS_NOTIFICATION_TIMEOUT < 200) {
	OPTIONS_NOTIFICATION_TIMEOUT = 200;
	warn('OPTIONS_NOTIFICATION_TIMEOUT is very low (too fast)!');
}

if (DESKTOP_NOTIFICATION_TIMEOUT < 1000) {
	DESKTOP_NOTIFICATION_TIMEOUT = 1000;
	warn('DESKTOP_NOTIFICATION_TIMEOUT is very low (too fast)');
}

if (EMAIL_SUBJECT.indexOf("&") != -1)
	warn('EMAIL_SUBJECT cannot contain ampersands, - fix it you numbnut!');
else if (EMAIL_BODY.indexOf("&") != -1)
	warn('EMAIL_BODY cannot contain ampersands, - fix it you numbnut!');
else
	var EMAIL = 'mailto:'+CREATOR_EMAIL+'?subject='+EMAIL_SUBJECT+'&body='+EMAIL_BODY;;

function warn(msg) {
	alert('js/constants.js\n'+ msg);
}






