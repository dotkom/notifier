
// This is a content script.

// That means the script is called when any page is loaded. This script does
// not have access to the rest of the extension's stuff, like localStorage.
// Therefore the script needs to send requests about variables in storage
// to the extension.

var host = window.location.host;

if (host == 'online.ntnu.no') {
	chrome.extension.sendRequest({'action' : 'resetCounterWhenOnWebsite'});
}

if (host == 'sit.no') {
	
	// If we're at a dinner info page
	if (document.URL.indexOf('pa-Hangaren') != -1 || document.URL.indexOf('pa-Realfag') != -1) {
		
		// Add a notification in the source about edited code
		$('html').prepend('<!--\nOnline Notifier:\nThis source code has been edited by Online Notifier.\nTodays dinner menus have been highlighted as well as the dinner you\nclicked to get here if you used Online Notifiers dinner links.\n-->');
		
		// Find out which day it is
		var today = new Date().getDay() - 1;
		if (today == -1) today = 6;
		
		// Highlight day
		$('#menytable tbody:first tr[valign=top]').eq(today).children(':first').attr("style","background-color:#988d14;color:white;font-weight:bold;");
		
		// Highlight chosen dinner (chosen from the popup)
		chrome.extension.sendRequest({'action' : 'getChosenDinner'}, function(response) {
			if (response != null) {
				$('#menytable tbody:first tr[valign=top]').eq(today).children(':last').find('tbody').children().eq(response).children().attr("style","font-weight:bold;");
				window.scrollTo(0,(230 + 50 * today));
			}
		});
	}
}







