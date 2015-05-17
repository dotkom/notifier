"use strict";

// RENAMING LOCALSTORAGE VARS
// conforming to new convention in Notiwire
// REMOVE AFTER JUNE 2015

if (localStorage.showOffice)
	localStorage.showStatus = localStorage.showOffice;

// RENAMING LOCALSTORAGE VARS
// deprecating ancient naming scheme
// REMOVE AFTER AUGUST 2015

if (localStorage.affiliationFeedItems1) {
	localStorage.affiliationNews1 = localStorage.affiliationFeedItems1;
	localStorage.removeItem('affiliationFeedItems1');
}
if (localStorage.affiliationFeedItems2) {
	localStorage.affiliationNews2 = localStorage.affiliationFeedItems2;
	localStorage.removeItem('affiliationFeedItems2');
}

// REMOVING OLD LOCALSTORAGE VAR
// REMOVE AFTER AUGUST 2015
localStorage.removeItem('colorTimeout');
