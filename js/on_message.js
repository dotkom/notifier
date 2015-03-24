"use strict";

// Recieve all requests from parts of the extension that cannot access
// localStorage or the rest of the codebase. Example: A content script.

// onMessage for single messages
function onMessage(request, sender, callback) {
  // No longer in use
  console.lolg('ERROR: unrecognized request:', request);
};

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
  else console.lolg('WARNING: something tried to connect on port', port.name);
};

// wire up the message- and connect-listener functions
if (Browser.name == 'Chrome' || Browser.name == 'Opera') {
  if (typeof chrome.extension.onMessage != 'undefined') {
    chrome.extension.onMessage.addListener(onMessage);
    chrome.runtime.onConnect.addListener(onConnect);
  }
  else console.lolg('ERROR: old version of (chrom(e|ium)|opera), messaging API not supported');
};
