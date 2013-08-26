// Generated by CoffeeScript 1.4.0
(function() {
  var $, iteration, loadAffiliationIcon, ls, mainLoop, saveAndCountNews, updateAffiliationNews, updateCoffeeSubscription, updateOfficeAndMeetings, updateUnreadCount;

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
      if (iteration % UPDATE_NEWS_INTERVAL === 0 && ls.showAffiliation1 === 'true' && navigator.onLine) {
        updateAffiliationNews('1');
      }
      if (iteration % UPDATE_NEWS_INTERVAL === 0 && ls.showAffiliation2 === 'true' && navigator.onLine) {
        updateAffiliationNews('2');
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
      var errorIcon, statusIcon;
      if (force || ls.currentStatus !== status || ls.currentStatusMessage !== message) {
        statusIcon = Affiliation.org[ls.affiliationKey1].statusIcons[status];
        if (statusIcon !== void 0) {
          Browser.setIcon(statusIcon);
        } else {
          errorIcon = Affiliation.org[ls.affiliationKey1].icon;
          Browser.setIcon(errorIcon);
        }
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

  updateAffiliationNews = function(number) {
    var affiliation, affiliationKey, newsLimit;
    if (DEBUG) {
      console.log('updateAffiliationNews' + number);
    }
    affiliationKey = ls['affiliationKey' + number];
    affiliation = Affiliation.org[affiliationKey];
    if (affiliation === void 0) {
      if (DEBUG) {
        return console.log('ERROR: chosen affiliation', ls['affiliationKey' + number], 'is not known');
      }
    } else {
      newsLimit = 10;
      return News.get(affiliation, newsLimit, function(items) {
        if (typeof items === 'string') {
          if (DEBUG) {
            return console.log('ERROR:', items);
          }
        } else if (items.length === 0) {
          return updateUnreadCount(0, 0);
        } else {
          saveAndCountNews(items, number);
          return updateUnreadCount();
        }
      });
    }
  };

  saveAndCountNews = function(items, number) {
    var feedItems, lastNotified, list, newsList, unreadCount;
    feedItems = 'affiliationFeedItems' + number;
    newsList = 'affiliationNewsList' + number;
    unreadCount = 'affiliationUnreadCount' + number;
    lastNotified = 'affiliationLastNotified' + number;
    ls[feedItems] = JSON.stringify(items);
    list = JSON.parse(ls[newsList]);
    ls[unreadCount] = News.countNewsAndNotify(items, list, lastNotified);
    return ls[newsList] = News.refreshNewsList(items);
  };

  updateUnreadCount = function(count1, count2) {
    var unreadCount;
    unreadCount = (Number(ls.affiliationUnreadCount1)) + (Number(ls.affiliationUnreadCount2));
    return Browser.setBadgeText(String(unreadCount));
  };

  loadAffiliationIcon = function() {
    var icon, key, name;
    key = ls.affiliationKey1;
    icon = Affiliation.org[key].icon;
    Browser.setIcon(icon);
    name = Affiliation.org[key].name;
    return Browser.setTitle(name + ' Notifier');
  };

  $(function() {
    $.ajaxSetup(AJAX_SETUP);
    if (ls.everOpenedOptions === 'false' && !DEBUG) {
      Browser.openTab('options.html');
      if (!DEBUG) {
        _gaq.push(['_trackEvent', 'background', 'loadOptions (fresh install)']);
      }
    }
    if (ls.useInfoscreen === 'true') {
      Browser.openTab('infoscreen.html');
      if (!DEBUG) {
        _gaq.push(['_trackEvent', 'background', 'loadInfoscreen']);
      }
    }
    if (ls.openChatter === 'true') {
      Browser.openBackgroundTab('http://webchat.freenode.net/?channels=online');
      if (!DEBUG) {
        _gaq.push(['_trackEvent', 'background', 'loadChatter']);
      }
    }
    loadAffiliationIcon();
    Browser.registerNotificationListeners();
    window.updateOfficeAndMeetings = updateOfficeAndMeetings;
    window.updateCoffeeSubscription = updateCoffeeSubscription;
    window.updateAffiliationNews = updateAffiliationNews;
    window.loadAffiliationIcon = loadAffiliationIcon;
    return mainLoop();
  });

}).call(this);
