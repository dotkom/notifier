
// This is a content script.

// That means the script is called when any page is loaded. This script does
// not have access to the rest of the extension's stuff, like localStorage.
// Therefore the script needs to send requests about variables in storage
// to the extension.

var host = window.location.host;

if (host == 'online.ntnu.no') {
	chrome.extension.sendRequest({'action' : 'resetCounterWhenOnWebsite'});
}

// Messing with the Onlinesite
/*
function onlinesite() {
	var bodyStyle = "background:url('https://online.ntnu.no/splash/graphics/splash.jpg') no-repeat fixed center center;";
	$('body').attr('style', bodyStyle);
	var menuBacklineStyle = "-webkit-box-shadow: 0px 0px 20px #bbb;";
	$('#hmbg').attr('style', menuBacklineStyle);
	var menuFrontlineStyle = "-webkit-box-shadow: 0px 0px 20px #1d487c;";
	$('#hm').attr('style', menuFrontlineStyle);
	$("link[rel=stylesheet]").attr({href : "http://informatikk.org/online.css"});
	
	$('div#hogre').append( $('div.hboks').filter(':first') );
	$('div#hogre').append( $('div.events') );
	$('div#venstre').prepend( $('div#hogre').children().eq(0) );
	$('div#hogre').children().eq(1).detach();
}
*/






