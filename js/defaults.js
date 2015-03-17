"use strict";

var Defaults = {

  _autoLoad_: function() {
  
    var ls = localStorage;

    // Clear previous thoughts
    if (DEBUG) ls.clear();

    // Clear errors from previous versions: undefined objects that
    // may have been saved to localStorage, it did happen once.
    // Thanks to Kristoffer Iversen for finding it.
    for (var i in ls) {
      // It's all strings, but in case browsers allow other
      // datatypes in the future, we'll check for string
      if (typeof ls[i] === 'string') {
        if (ls[i] === 'undefined') {
          // Remove the "undefined"-string
          ls.removeItem(i);
        }
      }
    }
    
    // Set default choices if undefined, in the same order as on the options page

    ls.extensionName = 'Online Notifier';
    // These two names will be shown in a loop, both can be max 8 letters because of styling
    ls.extensionOwner = 'Online';
    ls.extensionCreator = 'appKom';

    // Note install time for future reference
    if (ls.installTime === undefined)
      ls.installTime = new Date().getTime();

    // Primary affiliation
    if (ls.affiliationUnreadCount1 === undefined)
      ls.affiliationUnreadCount1 = 0;
    if (ls.affiliationNewsList1 === undefined)
      ls.affiliationNewsList1 = JSON.stringify([]);
    if (ls.affiliationViewedList1 === undefined)
      ls.affiliationViewedList1 = JSON.stringify([]);
    
    if (ls.affiliationPalette === undefined)
      ls.affiliationPalette = 'online';
    if (ls.storedImages === undefined)
      ls.storedImages = JSON.stringify({});

    // Secondary affiliation
    if (ls.affiliationUnreadCount2 === undefined)
      ls.affiliationUnreadCount2 = 0;
    if (ls.affiliationNewsList2 === undefined)
      ls.affiliationNewsList2 = JSON.stringify([]);
    if (ls.affiliationViewedList2 === undefined)
      ls.affiliationViewedList2 = JSON.stringify([]);

    if (ls.showBus === undefined)
      ls.showBus = 'true';
    
    // Bus - If any of these properties are undefined we'll reset all of them
    var firstBusProps = [
      ls.firstBus,
      ls.firstBusName,
      ls.firstBusDirection,
      ls.firstBusActiveLines,
      ls.firstBusInactiveLines,
    ]
    var secondBusProps = [
      ls.secondBus,
      ls.secondBusName,
      ls.secondBusDirection,
      ls.secondBusActiveLines,
      ls.secondBusInactiveLines,
    ]
    var firstBusOk = true;
    var secondBusOk = true;
    for (var prop in firstBusProps) {
      if (firstBusProps[prop] === undefined) {
        firstBusOk = false;
      }
    }
    for (var prop in secondBusProps) {
      if (secondBusProps[prop] === undefined) {
        secondBusOk = false;
      }
    }
    if (!firstBusOk) {
      ls.firstBus = 16011333;
      ls.firstBusName = 'Gløshaugen Nord';
      ls.firstBusDirection = 'til byen';
      ls.firstBusActiveLines = JSON.stringify([5, 22]);
      ls.firstBusInactiveLines = JSON.stringify([169]);
    }
    if (!secondBusOk) {
      ls.secondBus = 16010333;
      ls.secondBusName = 'Gløshaugen Nord';
      ls.secondBusDirection = 'fra byen';
      ls.secondBusActiveLines = JSON.stringify([5, 22]);
      ls.secondBusInactiveLines = JSON.stringify([169]);
    }
    
    // Office
    if (ls.showStatus === undefined)
      ls.showStatus = 'true';
    if (ls.activelySetOffice === undefined) {
      ls.activelySetOffice = 'true';
      ls.showStatus = 'true';
    }
    
    // Notifications
    if (ls.showNotifications === undefined)
      ls.showNotifications = 'true';
    
    // Subscription
    if (ls.coffeeSubscription === undefined)
      ls.coffeeSubscription = 'true';
    if (ls.coffeePots === undefined)
      ls.coffeePots = 0;
    if (ls.coffeeMemeTime === undefined)
      ls.coffeeMemeTime = 0;
    if (ls.activelySetCoffee === undefined) {
      ls.activelySetCoffee = 'true';
      ls.coffeeSubscription = 'true';
    }
    
    // Bigscreen
    if (ls.useBigscreen === undefined)
      ls.useBigscreen = 'false';
    if (ls.whichScreen === undefined)
      ls.whichScreen = 'notifier';
    
    // General
    if (ls.everOpenedOptions === undefined)
      ls.everOpenedOptions = 'false';
  }(),

  // Whenever we need to remove an existing affiliation,
  // this little heartsaver comes to our rescue. Just go
  // ahead and uncomment that affiliation in Affiliation.js !
  resetAffiliationsIfNotExist: function(key1, key2, affiliationKeys) {

    var ls = localStorage;

    var gotoOptions = function(key) {
      if (confirm('Online Notifier beklager:\n\n"'+key+'" er borte fra Notifier :(\n\nTrolig fordi foreningens nettside ikke finnes lenger.\n\nDu kan trykke OK for å åpne Notifiers innstillinger.')) {
        Browser.openTab('options.html');
      }
    }
    if (affiliationKeys.indexOf(key1) === -1) {
      ls.affiliationKey1 = 'online';
      gotoOptions(key1);
    }
    if (affiliationKeys.indexOf(key2) === -1) {
      ls.affiliationKey2 = 'dusken';
      gotoOptions(key2);
    }
  },

  // There is currently no way of knowing whether HardwareFeatures have been
  // installed recently or not, - if they exist. Therefore we will assume the
  // user starts out with the features turned on.
  // Then, the features will be turned off if:
  // a) the user has explicitly turned them off, or
  // b) hardwarefeatures are not available (this function called from background process)
  setHardwareFeatures: function(isAvailable) {
    
    var ls = localStorage;

    if (isAvailable) {
      // office
      if (ls.activelySetOffice == 'false')
        ls.showStatus = 'false';
      else
        ls.showStatus = 'true';
      // coffee
      if (ls.activelySetCoffee == 'false')
        ls.coffeeSubscription = 'false';
      else
        ls.coffeeSubscription = 'true';
    }
    else if (!isAvailable) {
      ls.showStatus = 'false';
      ls.coffeeSubscription = 'false';
    }
  },
}
