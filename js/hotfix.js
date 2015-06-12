"use strict";

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

// REMOVING INFOSCREEN LOCALSTORAGE VARS
// REMOVE AFTER SEPTEMBER 2015
if (localStorage.useBigscreen === 'true') {
	if (confirm("Fra appkom@online.ntnu.no :\n\nOnline Notifier sin infoskjerm-funksjon er nå skilt ut til en egen Chrome extension som heter Online Notiwall.\n\nÅpne https://chrome.google.com/webstore ?")) {
		var url = 'https://chrome.google.com/webstore/detail/online-notiwall/ockmkaidddgbbababholkkhlmppnacjm';
		chrome.tabs.create({url: url, selected: true});
	}
}
localStorage.removeItem('useBigscreen');
localStorage.removeItem('whichScreen');

// RENAMING LOCALSTORAGE VARS
// deprecating old naming scheme
// REMOVE AFTER SEPTEMBER 2015

localStorage.removeItem('showOffice');
