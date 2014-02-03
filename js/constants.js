var DEBUG = 1;

// AJAX setup
var AJAX_SETUP = {
	timeout: 9000,
	cache: false, // this little sentence killed a lot of little bugs that was actually one big bug
}

// Logging setup
console.lolg = function() {
	// Console logging that only happens in debug mode
	// The name "lolg" is a tribute to Lorents Odin Lervik Gravås
	if (DEBUG) {
		console.log.apply(console, arguments);
	}
};

// Loops & intervals
var BACKGROUND_LOOP = 30000; // 30s
var BACKGROUND_LOOP_OFFLINE = 3000; // 3s, respond quickly when we get back online
var PAGE_LOOP = 10000; // 10s

// Update stuff at every X intervals
var UPDATE_OFFICE_INTERVAL = 1; // recommended: 1
var UPDATE_SERVANT_INTERVAL = 20; // recommended: 20
var UPDATE_MEETINGS_INTERVAL = 20; // recommended: 20
var UPDATE_COFFEE_INTERVAL = 1; // recommended: 1
var UPDATE_HOURS_INTERVAL = 60; // recommended: 60
var UPDATE_CANTINAS_INTERVAL = 60; // recommended: 60
var UPDATE_BUS_INTERVAL = 2; // recommended: 1
var UPDATE_NEWS_INTERVAL = 20; // recommended: 20

// Meme detection
var urlExists = function(url) {
	try {
	    var http = new XMLHttpRequest();
	    http.open('HEAD', url, false);
	    http.send();
	    return http.status!=404;
	}
	catch (e) {
		return false;
	}
	finally {
		// do nothing
	}
}
var MEME_AMOUNT = 0;
var __counter__ = 1;
while (urlExists('meme/'+__counter__+'.jpg')) {
	MEME_AMOUNT++;
	__counter__++;
}

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
	console.log('WARNING: Potentially unsupported operating system');
}

// Browser detection
var BROWSER = "Unknown";
if (navigator.userAgent.indexOf('Chrome') !== -1 && navigator.userAgent.indexOf('OPR') == -1)
	BROWSER = "Chrome";
else if (navigator.userAgent.indexOf('OPR') !== -1)
	BROWSER = "Opera";
else
	console.log('WARNING: Potentially unsupported browser');

// Production detection
if (BROWSER == 'Chrome')
	if (chrome.runtime.id === 'hfgffimlnajpbenfpaofmmffcdmgkllf')
		DEBUG = 0;
else if (BROWSER == 'Opera')
	if (chrome.runtime.id === 'npnpbddfcaibgnegafofkmffmbmflelj')
		DEBUG = 0;
