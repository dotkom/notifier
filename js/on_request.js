// Recieve all requests from parts of the extension that cannot access
// localStorage or the rest of the codebase. Example: A content script.
function onRequest(request, sender, callback) {
  if (request.action == 'resetCounterWhenOnWebsite') {
    localStorage.unreadCount = 0;
    localStorage.mostRecentRead = localStorage.mostRecentUnread;
    chrome.browserAction.setBadgeText({text:''});
  }
  else if (request.action == 'getChosenDinner') {
    var chosenDinner = localStorage.chosenDinner;
    localStorage.removeItem("chosenDinner");
    callback(chosenDinner);
  }
  else if (request.action == 'getSmallOnlineLogo') {
    callback(chrome.extension.getURL('img/logo-48.png'));
  }
  else if (request.action =='getOptionsLink') {
    callback(chrome.extension.getURL('options.html'));
  }
  else if (request.action == 'showCantinaMenu') {
    callback(localStorage.showCantinaMenu);
  }
  else if (DEBUG) console.log('ERROR: unrecognized request');
}

// wire up the onRequest listener function
chrome.extension.onRequest.addListener(onRequest);