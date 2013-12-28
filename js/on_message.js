// Recieve all requests from parts of the extension that cannot access
// localStorage or the rest of the codebase. Example: A content script.

// onMessage for single messages
function onMessage(request, sender, callback) {
  // which cantina did the user just click in the popup?
  // the content script wants to switch to that specific cantina
  if (request.action == 'getClickedCantina') {
    console.lolg('onMessage: getClickedCantina');
    var clickedCantina = localStorage.clickedCantina;
    if (typeof clickedCantina != 'undefined') {
      localStorage.removeItem('clickedCantina');
      callback(clickedCantina);
    }
  }
  // which cantina did the user just click in the popup?
  // the content script wants to switch to that specific cantina
  if (request.action == 'getClickedHours') {
    console.lolg('onMessage: getClickedHours');
    var clickedHours = localStorage.clickedHours;
    if (typeof clickedHours != 'undefined') {
      localStorage.removeItem('clickedHours');
      callback(clickedHours);
    }
  }
  else console.lolg('ERROR: unrecognized request');
}

// onConnect for conversations
function onConnect(port) {
  // affiliationCounter is a conversation regarding resetting of the badge counter
  // when a user visits the site of one of his/her affiliations
  if (port.name == "affiliationCounter") {
    port.onMessage.addListener(function(message) {
      console.lolg('onConnect: affiliationCounter');
      // first contact
      if (message.getAffiliationWeb == '1' || message.getAffiliationWeb == '2') {
        var number = message.getAffiliationWeb;
        var affiliation = localStorage['affiliationKey' + number];
        var web = Affiliation.org[affiliation].web;
        port.postMessage({affiliationWeb: number + '@' + web});
      }
      // second contact
      else if (typeof message.resetAffiliationCounter != 'undefined') {
        var number = message.resetAffiliationCounter;
        console.lolg('onMessage: resetAffiliationCounter for #' + number);
        Browser.getBadgeText( function(badgeText) {
          var badgeText = Number(badgeText);
          if (!isNaN(badgeText)) {
            var affiliationUnreadCount = localStorage['affiliationUnreadCount' + number];
            var unreadCount = Number(affiliationUnreadCount);
            var result = badgeText - unreadCount;
            localStorage['affiliationUnreadCount' + number] = 0;
            localStorage['affiliationViewedList' + number] = localStorage['affiliationNewsList' + number];
            Browser.setBadgeText(result);
          }
        });
      }
    });
  }
  else if (port.name == "chatter") {
    port.onMessage.addListener(function(question) {
      // has irc?
      if (question.hasIrc) {
        var host = question.hasIrc;
        var irc = Affiliation.org[localStorage.affiliationKey1].irc;
        var hasIrc = host.indexOf(irc.server) !== -1 && host.indexOf(irc.channel) !== -1;
        console.lolg('onConnect: chatter: hasIrc:', hasIrc);
        port.postMessage({hasIrc: hasIrc});
      }
      // deliver blob
      if (question.getBlob) {
        var affiliation = Affiliation.org[localStorage.affiliationKey1];
        // Blob together all the info
        var blob = {};
        blob.name = affiliation.name;
        blob.web = affiliation.web;
        // Get proper URLs for internal resources
        blob.icon = Browser.getUrl(affiliation.icon);
        blob.logo = Browser.getUrl(affiliation.logo);
        blob.placeholder = Browser.getUrl(affiliation.placeholder);
        // String the blob up
        console.lolg('onConnect: chatter: blob:', blob);
        blob = JSON.stringify(blob);
        // Pass it to asker
        port.postMessage({blob: blob});
      }
    });
  }
  else console.lolg('WARNING: something tried to connect on port', port.name);
}

// wire up the message- and connect-listener functions
if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
  if (typeof chrome.extension.onMessage != 'undefined') {
    chrome.extension.onMessage.addListener(onMessage);
    chrome.runtime.onConnect.addListener(onConnect);
  }
  else console.lolg('ERROR: old version of (chrom(e|ium)|opera), messaging API not supported');
}
