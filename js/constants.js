
var DEBUG = 0;

// General

var EXTENSION_NAME = 'Online Notifier';
var EXTENSION_NICK = 'Notifier';
var EXTENSION_WEBSITE = 'https://online.ntnu.no';
var CREATOR_NAME = 'dotKom'; // max 8 letters because of styling
var CREATOR_EMAIL = 'dotkom@online.ntnu.no';

// Keys, APIs & URLs

var OFFICE_LIGHTS_URL = 'http://draug.online.ntnu.no/lys.txt';
var CALENDAR_URL = 'https://online.ntnu.no/service_static/online_notifier';
var API_KEY = 'f5be90e5ec1d2d454ae9';
var API_ADDRESS = 'https://online.ntnu.no/api/' + API_KEY + '/news_image_by_id/';
var FEED_URL = 'https://online.ntnu.no/feeds/news/';
var BACKUP_IMAGE = 'https://online.ntnu.no/media/steria_logo_thumbnail.jpeg';
var HANGAREN_RSS = 'http://sit.no/rss.ap?thisId=36444&ma=on&ti=on&on=on&to=on&fr=on';
var HANGAREN_URL = 'http://sit.no/content/36444/Ukas-middagsmeny-pa-Hangaren';
var REALFAG_RSS = 'http://sit.no/rss.ap?thisId=36447&ma=on&ti=on&on=on&to=on&fr=on';
var REALFAG_URL = 'http://sit.no/content/36447/Ukas-middagsmeny-pa-Realfag';
var GOOGLE_ANALYTICS_TRACKING_CODE = 'UA-9905766-3';

// Timings, intervals & thresholds

var MAIN_LOOP_DEFAULT_TIMEOUT = 60000; // 60s
var MAIN_LOOP_QUICK_TIMEOUT = 3000; // 3s, fix it quickly when something has gone wrong
var AJAX_REQUEST_TIMEOUT = 12000; // 10s
var DESKTOP_NOTIFICATION_TIMEOUT = 5000; // 5s
var OPTIONS_NOTIFICATION_TIMEOUT = 800; // .8s
// refresh office status or feed every X minute
var REFRESH_OFFICE_STATUS_INTERVAL = 5; // recommended: 5
var REFRESH_NEWS_FEED_INTERVAL = 10; // recommended: 10
var REFRESH_CANTINA_MENU_INTERVAL = 10; // recommended: 10
// threshold for office status light level, above = lights off, below = lights on
var OFFICE_LIGHTS_BORDER_VALUE = 810; // 800 is great

// Messages

var OFFICE_DISCONNECTED = 'Kobler til...';
var OFFICE_ERROR = 'Noe gikk galt, prøver igjen...';
var OFFICE_OPEN = 'Velkommen til kontoret, det er gratis kaffe!';
var OFFICE_CLOSED = 'Kontoret er stengt';
var OFFICE_UNTITLED_MEETING = 'Møte på kontoret'; // titled meetings and waffles get names from calendar entries
var CANTINA_NOT_OPEN = 'Ingen publisert meny i dag';
var CANTINA_CONNECTION_ERROR = 'Frakoblet';
var CANTINA_MALFORMED_MENU = 'Galt format på meny';
var CANTINA_UNSUPPORTED = 'Denne kantinen støttes ikke';

// Images & icons

var LOGO = 'img/logo.png';
var ICON_DEFAULT = 'img/icon-default.png';
var ICON_DISCONNECTED = 'img/icon-disconnected.png';
var ICON_OPEN = 'img/icon-open.png';
var ICON_CLOSED = 'img/icon-closed.png';
var ICON_MEETING = 'img/icon-meeting.png';
var ICON_WAFFLE = 'img/icon-waffle.png';

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

