
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

// how long the desktop notification is visible
var DESKTOP_NOTIFICATION_TIMEOUT = 5000; // 5.000 ms

// how long the notification box on the options page is visible
var OPTIONS_NOTIFICATION_TIMEOUT = 800; // 800 ms

// refresh office status or feed every X minute
var REFRESH_OFFICE_INTERVAL = 5; // recommended: 5
var REFRESH_FEED_INTERVAL = 10; // recommended: 10
var REFRESH_DINNER_INTERVAL = 10; // recommended: 10

// threshold for office status light level, above = lights off, below = lights on
var OFFICE_LIGHTS_BORDER_VALUE = 800; // 800 is great

// messages, links

var OPTIONS_OFFICE = 'Vis kontorets status: Åpent, stengt, møte, gratis vafler';//;'Show office status: Open, closed, meeting, free waffles';
var OPTIONS_NOTIFICATIONS = 'Vis varsling på skrivebordet når nyheter publiseres / oppdateres';//'Show desktop notifications when news are published / updated';
var OPTIONS_DINNER = 'Vis dagens middagsmeny fra Hangaren og Realfag';//'Show today\'s dinner menu from Hangaren and Realfag';

var DISCONNECTED = 'Kobler til...';//'Connecting...';
var CONNECTION_ERROR = 'Noe gikk galt, prøver igjen...';//'Something went wrong, retrying...';
var OFFICE_OPEN = 'Velkommen til kontoret, det er gratis kaffe!';//'Welcome to the office, free coffee! :)';
var OFFICE_CLOSED = 'Kontoret er stengt';//'The office is closed';
var OFFICE_UNTITLED_MEETING = 'Møte på kontoret';//'Meeting at the office'; // titled meetings and waffles get names from their respective calendar entries

var POPUP_OPTIONS_BUTTON = 'Innstillinger';//'Go to options';
var POPUP_FEEDBACK_BUTTON = 'Send tilbakemelding';//'Send feedback';
var POPUP_MAKE_EXTENSION_BUTTON = 'Lag din egen Chrome-utvidelse';//'Make your own extension';
var POPUP_MAKE_EXTENSION_LINK = 'http://lifehacker.com/5857721/how-to-build-a-chrome-extension';

var CANTINA_DINNER_NOT_OPEN = 'Kantinene er stengt i dag';//'The cantinas are closed today';
var CANTINA_DINNER_ERROR = 'Klarte ikke å hente middagsmeny, prøv igjen senere';//'Unable to get cantina dinners, come back later';

var EMAIL_SUBJECT = 'Online Notifier';//'I wantz to tell u guise sumthing! :3'; // no ampersands!
var EMAIL_BODY = '( ros tas godt imot :: bugs må beskrives godt :: ønsker etter nye funksjoner tas gjere imot )';
//'( praise is dearly recieved :: bugs must be described well :: wishes for new features are welcome )'; // no ampersands!
var GITHUB = 'http://github.com/dotkom/online-notifier/';

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

if (EMAIL_SUBJECT.indexOf("&") != -1)
	warn('EMAIL_SUBJECT cannot contain ampersands, - fix it you numbnut!');
else if (EMAIL_BODY.indexOf("&") != -1)
	warn('EMAIL_BODY cannot contain ampersands, - fix it you numbnut!');
else
	var EMAIL = 'mailto:'+CREATOR_EMAIL+'?subject='+EMAIL_SUBJECT+'&body='+EMAIL_BODY;;

function warn(msg) {
	alert('js/constants.js\n'+ msg);
}






