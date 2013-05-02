// Generated by CoffeeScript 1.4.0
(function() {
  var $, iteration, loadAffiliationIcon, ls, mainLoop, updateAffiliationNews, updateAffiliationNews2, updateCoffeeSubscription, updateOfficeAndMeetings;

  $ = jQuery;

  ls = localStorage;

  iteration = 0;

  mainLoop = function() {
    var loopTimeout;
    if (DEBUG) {
      console.log("\n#" + iteration);
    }
    if (ls.useInfoscreen !== 'true') {
      if (iteration % UPDATE_OFFICE_INTERVAL === 0 && ls.showOffice === 'true') {
        updateOfficeAndMeetings();
      }
      if (iteration % UPDATE_COFFEE_INTERVAL === 0 && ls.coffeeSubscription === 'true') {
        updateCoffeeSubscription();
      }
      if (iteration % UPDATE_NEWS_INTERVAL === 0 && ls.showAffiliation === 'true' && navigator.onLine) {
        updateAffiliationNews();
      }
      if (iteration % UPDATE_NEWS_INTERVAL === 0 && ls.showAffiliation2 === 'true' && navigator.onLine) {
        updateAffiliationNews2();
      }
    }
    if (10000 < iteration) {
      iteration = 0;
    } else {
      iteration++;
    }
    if (DEBUG || !navigator.onLine) {
      loopTimeout = BACKGROUND_LOOP_OFFLINE;
    } else {
      loopTimeout = BACKGROUND_LOOP;
    }
    return setTimeout((function() {
      return mainLoop();
    }), loopTimeout);
  };

  updateOfficeAndMeetings = function(force) {
    if (DEBUG) {
      console.log('updateOfficeAndMeetings');
    }
    return Office.get(function(status, title, message) {
      if (force || ls.currentStatus !== status || ls.currentStatusMessage !== message) {
        Browser.setIcon('img/icon-' + status + '.png');
        ls.currentStatus = status;
        return Meetings.get(function(meetings) {
          var today;
          today = '### Nå\n' + title + ": " + message + "\n### Resten av dagen\n" + meetings;
          Browser.setTitle(today);
          return ls.currentStatusMessage = message;
        });
      }
    });
  };

  updateCoffeeSubscription = function() {
    if (DEBUG) {
      console.log('updateCoffeeSubscription');
    }
    return Coffee.get(false, function(pots, age) {
      var storedPots;
      if (!isNaN(pots && !isNaN(age))) {
        storedPots = Number(ls.coffeePots);
        if (storedPots < pots) {
          if (ls.currentStatus !== 'meeting') {
            if (age < 10) {
              Coffee.showNotification(pots, age);
            }
          }
        }
        return ls.coffeePots = pots;
      }
    });
  };

  updateAffiliationNews = function() {
    var affiliation, affiliationKey, newsLimit;
    if (DEBUG) {
      console.log('updateAffiliationNews');
    }
    affiliationKey = ls.affiliationKey;
    affiliation = Affiliation.org[affiliationKey];
    if (affiliation === void 0) {
      if (DEBUG) {
        return console.log('ERROR: chosen affiliation', affiliationKey, 'is not known');
      }
    } else {
      newsLimit = 10;
      return News.get(affiliation, newsLimit, function(items) {
        var newsList, unreadCount;
        if (typeof items === 'string') {
          if (DEBUG) {
            return console.log('ERROR:', items);
          }
        } else {
          ls.affiliationFeedItems = JSON.stringify(items);
          newsList = JSON.parse(ls.affiliationNewsList);
          ls.affiliationUnreadCount = News.countNewsAndNotify(items, newsList, 'affiliationLastNotified');
          unreadCount = (Number(ls.affiliationUnreadCount2)) + (Number(ls.affiliationUnreadCount));
          Browser.setBadgeText(String(unreadCount));
          return ls.affiliationNewsList = News.refreshNewsList(items);
        }
      });
    }
  };

  updateAffiliationNews2 = function() {
    var affiliation, affiliationKey2, newsLimit;
    if (DEBUG) {
      console.log('updateAffiliationNews2');
    }
    affiliationKey2 = ls.affiliationKey2;
    affiliation = Affiliation.org[affiliationKey2];
    if (affiliation === void 0) {
      if (DEBUG) {
        return console.log('ERROR: chosen affiliation', affiliationKey2, 'is not known');
      }
    } else {
      newsLimit = 10;
      return News.get(affiliation, newsLimit, function(items) {
        var newsList, unreadCount;
        if (typeof items === 'string') {
          if (DEBUG) {
            return console.log('ERROR:', items);
          }
        } else {
          ls.affiliationFeedItems2 = JSON.stringify(items);
          newsList = JSON.parse(ls.affiliationNewsList2);
          ls.affiliationUnreadCount2 = News.countNewsAndNotify(items, newsList, 'affiliationLastNotified2');
          unreadCount = (Number(ls.affiliationUnreadCount2)) + (Number(ls.affiliationUnreadCount));
          Browser.setBadgeText(String(unreadCount));
          return ls.affiliationNewsList2 = News.refreshNewsList(items);
        }
      });
    }
  };

  loadAffiliationIcon = function() {
    var icon, key, name;
    key = ls.affiliationKey;
    icon = Affiliation.org[key].icon;
    Browser.setIcon(icon);
    name = Affiliation.org[key].name;
    return Browser.setTitle(name + ' Notifier');
  };

  $(function() {
    var firstBusOk, firstBusProps, prop, secondBusOk, secondBusProps, _i, _j, _len, _len1;
    $.ajaxSetup(AJAX_SETUP);
    if (DEBUG) {
      ls.clear();
    }
    ls.removeItem('currentStatus');
    ls.removeItem('currentStatusMessage');
    if (ls.extensionName === void 0) {
      ls.extensionName = 'Online Notifier';
    }
    if (ls.extensionCreator === void 0) {
      ls.extensionCreator = 'dotKom';
    }
    if (ls.showAffiliation === void 0) {
      ls.showAffiliation = 'true';
    }
    if (ls.affiliationKey === void 0) {
      ls.affiliationKey = 'online';
    }
    if (ls.affiliationPalette === void 0) {
      ls.affiliationPalette = 'online';
    }
    if (ls.affiliationUnreadCount === void 0) {
      ls.affiliationUnreadCount = 0;
    }
    if (ls.affiliationNewsList === void 0) {
      ls.affiliationNewsList = JSON.stringify([]);
    }
    if (ls.affiliationViewedList === void 0) {
      ls.affiliationViewedList = JSON.stringify([]);
    }
    if (ls.showAffiliation2 === void 0) {
      ls.showAffiliation2 = 'true';
    }
    if (ls.affiliationKey2 === void 0) {
      ls.affiliationKey2 = 'universitetsavisa';
    }
    if (ls.affiliationUnreadCount2 === void 0) {
      ls.affiliationUnreadCount2 = 0;
    }
    if (ls.affiliationNewsList2 === void 0) {
      ls.affiliationNewsList2 = JSON.stringify([]);
    }
    if (ls.affiliationViewedList2 === void 0) {
      ls.affiliationViewedList2 = JSON.stringify([]);
    }
    if (ls.showBus === void 0) {
      ls.showBus = 'true';
    }
    firstBusProps = [ls.firstBus, ls.firstBusName, ls.firstBusDirection, ls.firstBusActiveLines, ls.firstBusInactiveLines];
    secondBusProps = [ls.secondBus, ls.secondBusName, ls.secondBusDirection, ls.secondBusActiveLines, ls.secondBusInactiveLines];
    firstBusOk = true;
    secondBusOk = true;
    for (_i = 0, _len = firstBusProps.length; _i < _len; _i++) {
      prop = firstBusProps[_i];
      if (prop === void 0) {
        firstBusOk = false;
      }
    }
    for (_j = 0, _len1 = secondBusProps.length; _j < _len1; _j++) {
      prop = secondBusProps[_j];
      if (prop === void 0) {
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
    if (ls.showOffice === void 0) {
      ls.showOffice = 'true';
    }
    if (ls.showCantina === void 0) {
      ls.showCantina = 'true';
    }
    if (ls.left_cantina === void 0) {
      ls.left_cantina = 'hangaren';
    }
    if (ls.right_cantina === void 0) {
      ls.right_cantina = 'realfag';
    }
    if (ls.openChatter === void 0) {
      ls.openChatter = 'false';
    }
    if (ls.showNotifications === void 0) {
      ls.showNotifications = 'true';
    }
    if (ls.coffeeSubscription === void 0) {
      ls.coffeeSubscription = 'true';
    }
    if (ls.coffeePots === void 0) {
      ls.coffeePots = 0;
    }
    if (ls.useInfoscreen === void 0) {
      ls.useInfoscreen = 'false';
    }
    if (ls.everConnected === void 0 && !DEBUG) {
      Browser.openTab('options.html');
    }
    if (ls.useInfoscreen === 'true') {
      Browser.openTab('infoscreen.html');
    }
    if (ls.openChatter === 'true') {
      Browser.openBackgroundTab('http://webchat.freenode.net/?channels=online');
    }
    ls.everConnected = ls.wasConnected = 'false';
    loadAffiliationIcon();
    setInterval((function() {
      return document.location.reload();
    }), 86400000);
    window.updateOfficeAndMeetings = updateOfficeAndMeetings;
    window.updateCoffeeSubscription = updateCoffeeSubscription;
    window.updateAffiliationNews = updateAffiliationNews;
    window.updateAffiliationNews2 = updateAffiliationNews2;
    window.loadAffiliationIcon = loadAffiliationIcon;
    return mainLoop();
  });

}).call(this);
