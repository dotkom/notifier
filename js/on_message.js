// Recieve all requests from parts of the extension that cannot access
// localStorage or the rest of the codebase. Example: A content script.
function onMessage(request, sender, callback) {
  if (request == 'resetCounterWhenOnWebsite' || request.action == 'resetCounterWhenOnWebsite') {
    if (DEBUG) console.log('onRequest: resetCounterWhenOnWebsite');
    localStorage.unreadCount = 0;
    localStorage.viewedNewsList = localStorage.newsList;
    Browser.setBadgeText('');
  }
  else if (request.action == 'getClickedCantina') {
    if (DEBUG) console.log('onRequest: getClickedCantina');
    var clickedCantina = localStorage.clickedCantina;
    if (typeof clickedCantina != 'undefined') {
      localStorage.removeItem('clickedCantina');
      callback(clickedCantina);
    }
  }
  // else if (request.action == 'showCantina') {
  //   callback(localStorage.showCantina);
  // }
  // else if (request.action == 'dismissSitNotice') {
  //   localStorage.dismissedSitNotice = 'true';
  //   callback(true);
  // }
  // else if (request.action == 'dismissedSitNotice') {
  //   callback(localStorage.dismissedSitNotice);
  // }
  else if (DEBUG) console.log('ERROR: unrecognized request');
}

// wire up the message listener function
if (BROWSER == "Chrome")
  if (typeof chrome.extension.onMessage != 'undefined')
    chrome.extension.onMessage.addListener(onMessage);
  else if (DEBUG) console.log('ERROR: old version of chrom(e|ium), messaging API not supported');
else if (BROWSER == "Opera")
  opera.extension.onmessage = function(event) {
    // event.data contains the message
    onMessage({'action': event.data});
  };
