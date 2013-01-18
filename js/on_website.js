
// This is a content script.

// That means the script is called when any page is loaded. This script does
// not have access to the rest of the extension's stuff, like localStorage.
// Therefore the script needs to send requests about variables in storage
// to the extension.

// It is important to just use regular javascript here, at most some jQuery.
// Remember that the environment you are in here is NOT the extension, it
// might be an old, insecure website. Except, of course, we are visiting the
// Online website which is secured by our most paranoid guy, Rockj ;)

var host = window.location.host;

if (host == 'online.ntnu.no') {
	$('#install_notifier').hide();
	chrome.extension.sendRequest({'action' : 'resetCounterWhenOnWebsite'});
}
