var Defaults = {

  load: function() {
  
    var ls = localStorage;

    // Clear previous thoughts
    if (DEBUG) ls.clear();
    ls.removeItem('currentStatus');
    ls.removeItem('currentStatusMessage');
    
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

    // If any of these properties are undefined we'll reset all of them
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
    
    if (ls.showOffice == undefined)
      ls.showOffice = 'true';
    
    if (ls.showCantina == undefined)
      ls.showCantina = 'true';
    if (ls.leftCantina == undefined)
      ls.leftCantina = 'hangaren';
    if (ls.rightCantina == undefined)
      ls.rightCantina = 'realfag';
    
    if (ls.openChatter == undefined)
      ls.openChatter = 'false';
    
    if (ls.showNotifications == undefined)
      ls.showNotifications = 'true';
    
    if (ls.coffeeSubscription == undefined)
      ls.coffeeSubscription = 'true';
    if (ls.coffeePots == undefined)
      ls.coffeePots = 0;
    
    if (ls.useInfoscreen == undefined)
      ls.useInfoscreen = 'false';
    
    if (ls.everOpenedOptions == undefined)
      ls.everOpenedOptions = 'false';
  },
}

// Defaults self-loading
Defaults.load();
