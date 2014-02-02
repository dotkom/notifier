var Defaults = {

  _autoLoad_: function() {
  
    var ls = localStorage;

    // Clear previous thoughts
    if (DEBUG) ls.clear();
    ls.removeItem('officeStatus');
    ls.removeItem('officeStatusMessage');
    
    // Set default choices if undefined, in the same order as on the options page

    if (ls.extensionName == undefined)
      ls.extensionName = 'Online Notifier';
    if (ls.extensionCreator == undefined)
      ls.extensionCreator = 'dotKom'; // Max 8 letters because of styling

    // Primary affiliation
    if (ls.showAffiliation1 == undefined)
      ls.showAffiliation1 = 'true';
    if (ls.affiliationKey1 == undefined)
      ls.affiliationKey1 = 'online';
    if (ls.affiliationUnreadCount1 == undefined)
      ls.affiliationUnreadCount1 = 0;
    if (ls.affiliationNewsList1 == undefined)
      ls.affiliationNewsList1 = JSON.stringify([]);
    if (ls.affiliationViewedList1 == undefined)
      ls.affiliationViewedList1 = JSON.stringify([]);
    
    if (ls.affiliationPalette == undefined)
      ls.affiliationPalette = 'online';

    // Secondary affiliation
    if (ls.showAffiliation2 == undefined)
      ls.showAffiliation2 = 'true';
    if (ls.affiliationKey2 == undefined)
      ls.affiliationKey2 = 'dusken';
    if (ls.affiliationUnreadCount2 == undefined)
      ls.affiliationUnreadCount2 = 0;
    if (ls.affiliationNewsList2 == undefined)
      ls.affiliationNewsList2 = JSON.stringify([]);
    if (ls.affiliationViewedList2 == undefined)
      ls.affiliationViewedList2 = JSON.stringify([]);

    if (ls.showBus == undefined)
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
    for (prop in firstBusProps) {
      if (typeof firstBusProps[prop] == 'undefined') {
        firstBusOk = false;
      }
    }
    for (prop in secondBusProps) {
      if (typeof secondBusProps[prop] == 'undefined') {
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
    if (ls.showOffice == undefined)
      ls.showOffice = 'true';
    if (ls.activelySetOffice == undefined) {
      ls.activelySetOffice = 'true';
      ls.showOffice = 'true';
    }
    
    // Cantina
    if (ls.showCantina == undefined)
      ls.showCantina = 'true';
    if (ls.leftCantina == undefined)
      ls.leftCantina = 'hangaren';
    if (ls.rightCantina == undefined)
      ls.rightCantina = 'realfag';
    
    // Chatter
    // if (ls.openChatter == undefined) // Chatter is disabled
      ls.openChatter = 'false';
    
    // Notifications
    if (ls.showNotifications == undefined)
      ls.showNotifications = 'true';
    
    // Subscription
    if (ls.coffeeSubscription == undefined)
      ls.coffeeSubscription = 'true';
    if (ls.coffeePots == undefined)
      ls.coffeePots = 0;
    if (ls.activelySetCoffee == undefined) {
      ls.activelySetCoffee = 'true';
      ls.coffeeSubscription = 'true';
    }
    
    // Infoscreen
    if (ls.useInfoscreen == undefined)
      ls.useInfoscreen = 'false';
    
    // General
    if (ls.everOpenedOptions == undefined)
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
        ls.showOffice = 'false';
      else
        ls.showOffice = 'true';
      // coffee
      if (ls.activelySetCoffee == 'false')
        ls.coffeeSubscription = 'false';
      else
        ls.coffeeSubscription = 'true';
    }
    else if (!isAvailable) {
      ls.showOffice = 'false';
      ls.coffeeSubscription = 'false';
    }
  },
}
