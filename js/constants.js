
var DEBUG = 1;

var EXTENSION_NAME = 'Online Notifier';
var EXTENSION_WEBSITE = 'https://online.ntnu.no';
var CREATOR_NAME = 'dotKom'; // max 8 letters because of styling
var CREATOR_EMAIL = 'dotkom@online.ntnu.no';

var FEED_URL = 'https://online.ntnu.no/feeds/news/';
var API_KEY = 'f5be90e5ec1d2d454ae9';
var API_ADDRESS = 'https://online.ntnu.no/api/' + API_KEY + '/news_image_by_id/';
var BACKUP_IMAGE = 'https://online.ntnu.no/media/steria_logo_thumbnail.jpeg';
var HANGAREN_DINNER_URL = 'http://sit.no/rss.ap?thisId=36444&ma=on&ti=on&on=on&to=on&fr=on';
var REALFAG_DINNER_URL = 'http://sit.no/rss.ap?thisId=36447&ma=on&ti=on&on=on&to=on&fr=on';
var OFFICE_LIGHTS_URL = 'http://draug.online.ntnu.no/lys.txt';
var CALENDAR_URL = 'https://online.ntnu.no/service_static/online_notifier';
var GOOGLE_ANALYTICS_TRACKING_CODE = 'UA-9905766-3';

// how long to wait for AJAX or JSON requests
var REQUEST_TIMEOUT = 10000; // 10.000 ms

// how long the desktop notification is visible
var DESKTOP_NOTIFICATION_TIMEOUT = 5000; // 5.000 ms

// how long the notification box on the options page is visible
var OPTIONS_NOTIFICATION_TIMEOUT = 800; // 800 ms

// refresh office status or feed every X minute
var REFRESH_OFFICE_INTERVAL = 5; // recommended: 5
var REFRESH_FEED_INTERVAL = 10; // recommended: 10
var REFRESH_DINNER_INTERVAL = 10; // recommended: 10

// threshold for office status light level, above = lights off, below = lights on
var OFFICE_LIGHTS_BORDER_VALUE = 810; // 800 is great

// messages, links

var OPTIONS_OFFICE = 'Vis kontorets status: Åpent, stengt, møte, gratis vafler';
var OPTIONS_NOTIFICATIONS = 'Vis varsling på skrivebordet når nyheter publiseres / oppdateres';
var OPTIONS_DINNER = 'Vis dagens middagsmeny fra Hangaren og Realfag';
var OPTIONS_GITHUB = 'http://github.com/dotkom/online-notifier/';

var POPUP_OPTIONS_BUTTON = 'Innstillinger';
var POPUP_IRC_BUTTON = 'Bli med i Onlines chattekanal';
var POPUP_IRC_LINK = 'http://webchat.freenode.net?channels=online';
var POPUP_FEEDBACK_BUTTON = 'Send tilbakemelding';
var POPUP_FEEDBACK_EMAIL_SUBJECT = 'Online Notifier'; // no ampersands!
var POPUP_FEEDBACK_EMAIL_BODY = '( ros tas godt imot :: bugs må beskrives godt :: ønsker etter nye funksjoner tas gjere imot )'; // no ampersands!
var POPUP_MAKE_EXTENSION_BUTTON = 'Lag din egen Chrome-utvidelse';
var POPUP_MAKE_EXTENSION_LINK = 'http://lifehacker.com/5857721/how-to-build-a-chrome-extension';

var OFFICE_DISCONNECTED = 'Kobler til...';
var OFFICE_ERROR = 'Noe gikk galt, prøver igjen...';
var OFFICE_OPEN = 'Velkommen til kontoret, det er gratis kaffe!';
var OFFICE_CLOSED = 'Kontoret er stengt';
var OFFICE_UNTITLED_MEETING = 'Møte på kontoret'; // titled meetings and waffles get names from calendar entries

var CANTINA_NOT_OPEN = 'Ingen publisert meny i dag';
var CANTINA_CONNECTION_ERROR = 'Frakoblet';
var CANTINA_MALFORMED_MENU = 'Galt format på meny';
var CANTINA_UNSUPPORTED = 'Denne kantinen støttes ikke';


// images and icons

var LOGO = 'img/logo-normal.png';

var ICON_DEFAULT = 'img/icon-default.png';
var ICON_DISCONNECTED = 'img/icon-disconnected.png';
var ICON_OPEN = 'img/icon-open.png';
var ICON_CLOSED = 'img/icon-closed.png';
var ICON_MEETING = 'img/icon-meeting.png';
var ICON_WAFFLE = 'img/icon-waffle.png';

// os detection

var OPERATING_SYSTEM = "Unknown";
if (navigator.appVersion.indexOf("Win")!=-1) OPERATING_SYSTEM="Windows";
if (navigator.appVersion.indexOf("X11")!=-1) OPERATING_SYSTEM="UNIX";
if (navigator.appVersion.indexOf("Linux")!=-1) OPERATING_SYSTEM="Linux";
if (navigator.appVersion.indexOf("Mac")!=-1)
	OPERATING_SYSTEM = (navigator.appVersion.indexOf("10_7") != -1 ? "Mac" : "Old Mac");





// ======== don't touch ========
// idiot checks and calculations
// ======== don't touch ========

if (CREATOR_NAME.length > 8)
	warn('CREATOR_NAME contains more than 8 letters, - shorten it or lose style!');

if (POPUP_FEEDBACK_EMAIL_SUBJECT.indexOf("&") != -1)
	warn('EMAIL_SUBJECT cannot contain ampersands, - fix it you numbnut!');
else if (POPUP_FEEDBACK_EMAIL_BODY.indexOf("&") != -1)
	warn('EMAIL_BODY cannot contain ampersands, - fix it you numbnut!');
else
	var POPUP_FEEDBACK_EMAIL = 'mailto:'+CREATOR_EMAIL+'?subject='+POPUP_FEEDBACK_EMAIL_SUBJECT+'&body='+POPUP_FEEDBACK_EMAIL_BODY;

function warn(msg) {
	alert('js/constants.js\n'+ msg);
}






