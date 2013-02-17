// Generated by CoffeeScript 1.4.0
(function() {
  var $, iteration, ls, mainLoop, updateCoffee, updateNews, updateOfficeAndMeetings;

  $ = jQuery;

  ls = localStorage;

  iteration = 0;

  if (BROWSER === "Opera") {
    window.addEventListener("load", function() {
      theButton;

      var ToolbarUIItemProperties, theButton;
      ToolbarUIItemProperties = {
        title: "Online Notifier",
        icon: "img/logo-18.png",
        popup: {
          href: "popup.html",
          width: 400,
          height: 500
        }
      };
      theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
      return opera.contexts.toolbar.addItem(theButton);
    }, false);
  }

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
        updateCoffee();
      }
      if (iteration % UPDATE_NEWS_INTERVAL === 0 && navigator.onLine) {
        updateNews();
      }
    }
    if (10000 < iteration) {
      iteration = 0;
    } else {
      iteration++;
    }
    if (DEBUG || !navigator.onLine || ls.currentStatus === 'error') {
      loopTimeout = BACKGROUND_LOOP_QUICK;
    } else {
      loopTimeout = BACKGROUND_LOOP;
    }
    return setTimeout((function() {
      return mainLoop();
    }), loopTimeout);
  };

  updateOfficeAndMeetings = function() {
    if (DEBUG) {
      console.log('updateOfficeAndMeetings');
    }
    return Office.get(function(status, title, message) {
      if (ls.currentStatus !== status || ls.currentStatusMessage !== message) {
        if (BROWSER === "Chrome") {
          chrome.browserAction.setIcon({
            path: 'img/icon-' + status + '.png'
          });
        } else if (BROWSER === "Opera") {
          console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        }
        ls.currentStatus = status;
        return Meetings.get(function(meetings) {
          var today;
          today = '### Nå\n' + title + ": " + message + "\n\n### Resten av dagen\n" + meetings;
          if (BROWSER === "Chrome") {
            chrome.browserAction.setTitle({
              title: today
            });
          } else if (BROWSER === "Opera") {
            console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
          }
          return ls.currentStatusMessage = message;
        });
      }
    });
  };

  updateCoffee = function() {
    if (DEBUG) {
      console.log('updateCoffee');
    }
    return Coffee.getPots(function(pots) {
      var storedPots;
      storedPots = Number(ls.coffeePots);
      if (storedPots < pots) {
        Coffee.showNotification(pots);
      }
      return ls.coffeePots = pots;
    });
  };

  updateNews = function() {
    if (DEBUG) {
      console.log('updateNews');
    }
    return fetchFeed(function() {
      var response;
      response = ls.lastResponseData;
      if (response !== null) {
        return unreadCount(response);
      } else {
        return console.log('ERROR: response was null');
      }
    });
  };

  $(function() {
    $.ajaxSetup({
      timeout: AJAX_TIMEOUT
    });
    if (DEBUG) {
      ls.clear();
    }
    ls.removeItem('currentStatus');
    ls.removeItem('currentStatusMessage');
    ls.removeItem('coffeePots');
    if (ls.everConnected === void 0) {
      if (ls.first_bus === void 0) {
        ls.showBus = 'true';
        ls.first_bus = 16011333;
        ls.first_bus_name = 'Gløshaugen Nord';
        ls.first_bus_direction = 'til byen';
        ls.first_bus_active_lines = JSON.stringify([5, 22]);
        ls.first_bus_inactive_lines = JSON.stringify([169]);
        ls.second_bus = 16010333;
        ls.second_bus_name = 'Gløshaugen Nord';
        ls.second_bus_direction = 'fra byen';
        ls.second_bus_active_lines = JSON.stringify([5, 22]);
        ls.second_bus_inactive_lines = JSON.stringify([169]);
      }
      if (ls.showOffice === void 0) {
        ls.showOffice = 'true';
      }
      if (ls.showCantina === void 0) {
        ls.showCantina = 'true';
        ls.left_cantina = 'hangaren';
        ls.right_cantina = 'realfag';
      }
      if (ls.coffeePots === void 0) {
        ls.coffeePots = 0;
      }
      if (ls.showNotifications === void 0) {
        ls.showNotifications = 'true';
      }
      if (ls.coffeeSubscription === void 0) {
        ls.coffeeSubscription = 'true';
      }
      if (ls.openChatter === void 0) {
        ls.openChatter = 'false';
      }
      if (ls.useInfoscreen === void 0) {
        ls.useInfoscreen = 'false';
      }
      if (!DEBUG) {
        if (BROWSER === "Chrome") {
          chrome.tabs.create({
            url: chrome.extension.getURL("options.html"),
            selected: true
          });
        } else if (BROWSER === "Opera") {
          console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        }
      }
    }
    if (ls.useInfoscreen === 'true') {
      if (BROWSER === "Chrome") {
        chrome.tabs.create({
          url: chrome.extension.getURL("infoscreen.html"),
          selected: true
        });
      } else if (BROWSER === "Opera") {
        console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      }
    }
    if (ls.openChatter === 'true') {
      if (BROWSER === "Chrome") {
        chrome.tabs.create({
          url: 'http://webchat.freenode.net/?channels=online',
          selected: false
        });
      } else if (BROWSER === "Opera") {
        console.log("OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      }
    }
    ls.everConnected = ls.wasConnected = 'false';
    setInterval((function() {
      return document.location.reload();
    }), 86400000);
    return mainLoop();
  });

}).call(this);
