// Recieve all requests from parts of the extension that cannot access
// localStorage or the rest of the codebase. Example: A content script.
function onRequest(request, sender, callback) {
  if (request.action == 'resetCounterWhenOnWebsite') {
    localStorage.unreadCount = 0;
    localStorage.mostRecentRead = localStorage.mostRecentUnread;
    if (BROWSER == "Chrome")
      chrome.browserAction.setBadgeText({text:''});
    else if (BROWSER == "Opera")
      console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA onRequest");
  }
  else if (request.action == 'getChosenDinner') {
    var chosenDinner = localStorage.chosenDinner;
    localStorage.removeItem("chosenDinner");
    callback(chosenDinner);
  }
  else if (request.action == 'showCantina') {
    callback(localStorage.showCantina);
  }
  else if (request.action == 'dismissSitNotice') {
    localStorage.dismissedSitNotice = 'true';
    callback(true);
  }
  else if (request.action == 'dismissedSitNotice') {
    callback(localStorage.dismissedSitNotice);
  }
  else if (DEBUG) console.log('ERROR: unrecognized request');
}

// wire up the onRequest listener function
if (BROWSER == "Chrome")
  chrome.extension.onRequest.addListener(onRequest);
else if (BROWSER == "Opera")
  console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA onRequest");