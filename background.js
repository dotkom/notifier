"use strict";

var ls = localStorage;
var iteration = 0;
var intervalId = null;

var mainLoop = function(force) {
  console.lolg("\n#" + iteration);

  if (ls.showCantina === 'true')
    if (force || iteration % UPDATE_CANTINAS_INTERVAL === 0)
      updateCantinas();
  if (ls.showAffiliation1 === 'true')
    if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
      updateAffiliationNews('1');
  if (ls.showAffiliation2 === 'true')
    if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
      updateAffiliationNews('2');
  // Only if hardware and not infoscreen
  if (ls.useBigscreen !== 'true') {
    if (Affiliation.org[ls.affiliationKey1].hw) {
      if (force || iteration % UPDATE_COFFEE_INTERVAL === 0) {
        updateAffiliation();
      }
      // if (ls.showOffice === 'true')
      //   if (force || iteration % UPDATE_OFFICE_INTERVAL === 0)
      //     updateOfficeAndMeetings();
      // if (ls.coffeeSubscription === 'true')
      //   if (force || iteration % UPDATE_COFFEE_INTERVAL === 0)
      //     updateCoffeeSubscription();
    }
  }

  // No reason to count to infinity
  if (10000 < iteration)
    iteration = 0;
  else
    iteration++;
}

var updateAffiliation = function(callback) {
  console.lolg('updateAffiliation');
  // Fetch
  Affiliation.get(ls.affiliationKey1, function() {
    // Run relevant background updates
    if (ls.useBigscreen !== 'true') {
      if (Affiliation.org[ls.affiliationKey1].hw) {
        updateOfficeAndMeetings();
        updateCoffeeSubscription();
      }
    }
    // Callback
    if (typeof callback === 'function') callback();
  });
};

/*
[ ] Meeting og servant returnerer alle events for den gjeldende dagen
[ ] Men hvis en event pågår får man i tillegg litt ekstra info
[ ] Da vil message og free/responsible bli satt
[ ] Gjorde om prettier til message
[ ] Light er siste 24 timer || null (ikke noe i dag)
[ ] Coffee er siste 24 timer || null (ikke noe i dag)
*/

var updateOfficeAndMeetings = function(force, callback) {
  console.lolg('updateOfficeAndMeetings');
  
  // Get
  var meetingData = JSON.parse(ls.meetingData);
  var statusData = JSON.parse(ls.statusData);
  
  // Presume the worst
  var status = 'error';
  var title = Office.statuses['error'].title;
  var message = Office.statuses['error'].title;
  var meetings = 'En feil oppstod.';

  try {
    // Extract relevant objects

    // Extract meeting data
    if (meetingData.error) {
      meetings = meeting.error;
    }
    else {
      status = meetingData.free ? 'open' : 'meeting';
      message = meetingData.message;
      if (meetingData.meetings) {
        meetings = '';
        for (var i in meetingData.meetings) {
          meetings += meetingData.meetings[i].message + (i !== "0" ? '\n' : '');
        }
      }
    }

    // Extract status data
    if (statusData.error) {
      message = statusData.error;
    }
    else {
      if (status === 'error' || status === 'open') {
        status = (statusData.status ? 'open' : 'closed');
      } // else leave status unchanged, it's a meeting
      if (meetingData.error) {
        // Set a message manually
        message = Office.statuses[status].message;
      }
    }
  }
  catch (e) {
    console.error(e);
  }

  // console.lolg('well, we got:\nstatus:',status,'\nmessage',message,'\nmeetings',meetings);

  //
  // Run the old script, expects [status, message, meetings]
  //

  if (force || ls.officeStatus !== status || ls.officeStatusMessage !== message) {
    // Save them
    ls.officeStatus = status;
    ls.officeStatusMessage = message;
    // Food status
    if (Object.keys(Office.foods).indexOf(status) > -1) {
      title = Office.foods[status].title;
      Browser.setIcon(Office.foods[status].icon);
    }
    // Regular status
    else {
      // Set title
      title = Office.statuses[status].title;
      // Set icon
      var errorIcon = Affiliation.org[ls.affiliationKey1].icon;
      var statusIcon = Affiliation.org[ls.affiliationKey1].hw.statusIcons[status];
      if (status === 'error' || typeof(statusIcon) === 'undefined') {
        Browser.setIcon(errorIcon);
      }
      else {
        Browser.setIcon(statusIcon);
      }
    }
    // Check for Affiliation specific status message
    try {
      var msgs = Affiliation.org[ls.affiliationKey1].hw.statusMessages;
      var message = msgs[status];
    }
    catch (e) {
      // Just trying
    }
    // Extension title (hovering mouse over icon shows the title text)
    var today = '### Nå\n' + title + ": " + message + "\n### Resten av dagen\n" + meetings;
    Browser.setTitle(today);
  }
  if (typeof callback === 'function') callback();
}

// var updateOfficeAndMeetings = function(force, callback) {
//   console.lolg('updateOfficeAndMeetings');
//   Office.get(function(status, message) {
//     var title = '';
//     if (force || ls.officeStatus !== status || ls.officeStatusMessage !== message) {
//       // Save them
//       ls.officeStatus = status;
//       ls.officeStatusMessage = message;
//       // Food status
//       if (Object.keys(Office.foods).indexOf(status) > -1) {
//         title = Office.foods[status].title;
//         Browser.setIcon(Office.foods[status].icon);
//       }
//       // Regular status
//       else {
//         // Set title
//         title = Office.statuses[status].title;
//         // Set icon
//         var errorIcon = Affiliation.org[ls.affiliationKey1].icon;
//         var statusIcon = Affiliation.org[ls.affiliationKey1].hw.statusIcons[status];
//         if (status === 'error' || typeof(statusIcon) === 'undefined') {
//           Browser.setIcon(errorIcon);
//         }
//         else {
//           Browser.setIcon(statusIcon);
//         }
//       }
//       // Check for Affiliation specific status message
//       try {
//         var msgs = Affiliation.org[ls.affiliationKey1].hw.statusMessages;
//         var message = msgs[status];
//       }
//       catch (e) {
//         // at least we tried
//       }
//       // Extension title (hovering mouse over icon shows the title text)
//       Meetings.get(function(meetings) {
//         var today = '### Nå\n' + title + ": " + message + "\n### Resten av dagen\n" + meetings;
//         Browser.setTitle(today);
//         if (typeof callback === 'function') callback();
//       });
//     }
//     else {
//       if (typeof callback === 'function') callback();
//     }
//   });
// }

var updateCoffeeSubscription = function(callback) {
  console.lolg('updateCoffeeSubscription');
  // Get
  var coffeeData = JSON.parse(ls.coffeeData);
  // Hope for the best
  try {
    var date = coffeeData.date;
    var pots = coffeeData.pots;

    // No coffee yields pots=0 and date=null
    if (pots && date) {

      // Parse that date
      date = new Date(date);
      var age = Coffee.minuteDiff(date);

      // Check for NaN here
      if (!isNaN(pots) && !isNaN(age)) {
        var storedPots = Number(ls.coffeePots);
        // New pot number?
        if (storedPots < pots) {
          // Not a meeting? Or DEBUG mode.
          if (ls.officeStatus !== 'meeting') {
            // Made less than 10 minutes ago?
            if (age < 10) {
              // And no meme was served within the last 10 minutes?
              if ((Date.now() - Number(ls.coffeeMemeTime)) > 600000) {
                // Send meme to everyone who has a coffee subscription :D
                Coffee.showNotification(pots, age);
                ls.coffeeMemeTime = Date.now();
              }
              else {console.lolg('Nope to coffee, last one was less than 10 minutes ago')}
            }
            else {console.lolg('Nope to coffee, not made less than 10 minutes ago')}
          }
          else {console.lolg('Nope to coffee, there is a meeting going on')}
        }
        // And remember to update localStorage
        ls.coffeePots = pots;
      }
    }
    if (typeof callback === 'function') callback();
  }
  catch (e) {
    console.error(e);
  }
}

// var updateCoffeeSubscription = function(callback) {
//   console.lolg('updateCoffeeSubscription');
//   Coffee.get(false, function(pots, age) {
//     // Error messages will be NaN here
//     if (!isNaN(pots) && !isNaN(age)) {
//       var storedPots = Number(ls.coffeePots);
//       // New pot number?
//       if (storedPots < pots) {
//         // Not a meeting? Or DEBUG mode.
//         if (ls.officeStatus !== 'meeting') {
//           // Made less than 10 minutes ago?
//           if (age < 10) {
//             // And no meme was served within the last 10 minutes?
//             if ((Date.now() - Number(ls.coffeeMemeTime)) > 600000) {
//               // Notify everyone with a coffee subscription :D
//               Coffee.showNotification(pots, age);
//               ls.coffeeMemeTime = Date.now();
//             }
//             else {console.lolg('Nope to coffee, last one was less than 10 minutes ago')}
//           }
//           else {console.lolg('Nope to coffee, not made less than 10 minutes ago')}
//         }
//         else {console.lolg('Nope to coffee, there is a meeting going on')}
//       }
//       // And remember to update localStorage
//       ls.coffeePots = pots;
//     }
//     if (typeof callback === 'function') callback();
//   });
// }

var updateCantinas = function(callback) {
  console.lolg('updateCantinas');
  // Fetch
  Cantina.get(ls.cantina1, function(result1) {
    Cantina.get(ls.cantina2, function(result2) {
      // Save
      ls.cantina1Data = JSON.stringify(result1);
      ls.cantina2Data = JSON.stringify(result2);
      // Callback
      if (typeof callback === 'function') callback();
    });
  });
}

var updateAffiliationNews = function(number, callback) {
  console.lolg('updateAffiliationNews'+number);
  // Get affiliation object
  var affiliationKey = ls['affiliationKey'+number];
  var affiliationObject = Affiliation.org[affiliationKey];
  if (affiliationObject) {
    // Get more news than needed to check for old news that have been updated
    var newsLimit = 10;
    News.get(affiliationObject, newsLimit, function(items) {
      // Error message, log it maybe
      if (typeof items === 'string') {
        console.lolg('ERROR:', items);
      }
      // Empty news items, don't count
      else if (items.length === 0) {
        updateUnreadCount(0, 0);
      }
      // News is here! NEWS IS HERE! FRESH FROM THE PRESS!
      else {
        saveAndCountNews(items, number);
        updateUnreadCount();
        fetchAndStoreImageLinks(number);
      }
      if (typeof callback === 'function') callback();
    });
  }
  else {
    console.lolg('ERROR: chosen affiliation', ls['affiliationKey'+number], 'is not known');
    if (typeof callback === 'function') callback();
  }
}

var saveAndCountNews = function(items, number) {
  var feedItems = 'affiliationFeedItems' + number;
  var newsList = 'affiliationNewsList' + number;
  var unreadCount = 'affiliationUnreadCount' + number;
  var lastNotified = 'affiliationLastNotified' + number;

  ls[feedItems] = JSON.stringify(items);
  var list = JSON.parse(ls[newsList]);
  ls[unreadCount] = News.countNewsAndNotify(items, list, lastNotified);
  ls[newsList] = News.refreshNewsList(items);
}

var updateUnreadCount = function(count1, count2) {
  var unreadCount = (Number(ls.affiliationUnreadCount1)) + (Number(ls.affiliationUnreadCount2));
  Browser.setBadgeText(String(unreadCount));
}

var fetchAndStoreImageLinks = function(number) {
  var key = ls['affiliationKey'+number];
  var newsList = JSON.parse(ls['affiliationNewsList'+number]);
  // If the organization has it's own getImage function, use it
  if (Affiliation.org[key].getImage !== undefined) {
    for (var i in newsList) {
      var link = newsList[i];
      // It's important to get the link from the callback within the function below,
      // not the above code, - because of race conditions mixing up the news posts, async ftw.
      Affiliation.org[key].getImage(link, function(link, image) {
        if (null !== image[0]) {
          var storedImages = JSON.parse(ls.storedImages);
          storedImages[link] = image[0];
          ls.storedImages = JSON.stringify(storedImages);
        }
      });
    }
  }
  // If the organization has it's own getImages (plural) function, use it
  if (Affiliation.org[key].getImages !== undefined) {
    Affiliation.org[key].getImages(newsList, function(links, images) {
      var storedImages = JSON.parse(ls.storedImages);
      for (var i in links) {
        if (null !== images[i]) {
          storedImages[links[i]] = images[i];
        }
      }
      ls.storedImages = JSON.stringify(storedImages);
    });
  }
}

var loadAffiliationIcon = function() {
  var key = ls.affiliationKey1;
  // Set badge icon
  var icon = Affiliation.org[key].icon;
  Browser.setIcon(icon);
  // Set badge title
  var name = Affiliation.org[key].name;
  Browser.setTitle(name + ' Notifier');
}

// Document ready, go!
$(document).ready( function() {
  // Clear values that should start undefined
  Affiliation._onProgramStartup_();

  // Check if both current affiliations still exist, reset if not
  var keys = Object.keys(Affiliation.org);
  Defaults.resetAffiliationsIfNotExist(ls.affiliationKey1, ls.affiliationKey2, keys);

  // Turn off hardwarefeatures if they're not available
  var isAvailable = (Affiliation.org[ls.affiliationKey1].hw ? true : false);
  Defaults.setHardwareFeatures(isAvailable);

  // Open options page after install
  if (ls.everOpenedOptions === 'false' && !DEBUG) {
    Browser.openTab('options.html');
    Analytics.trackEvent('loadOptions (fresh install)');
  }
  // Open Bigscreen if the option is set
  if (ls.useBigscreen === 'true') {
    if (ls.whichScreen === 'infoscreen') {
      Browser.openTab('infoscreen.html');
      Analytics.trackEvent('loadInfoscreen');
    }
    else if (ls.whichScreen === 'officescreen') {
      Browser.openTab('officescreen.html');
      Analytics.trackEvent('loadOfficescreen');
    }
    else {
      console.lolg('ERROR: useBigscreen enabled, but whichScreen was', ls.whichScreen);
    }
  }

  loadAffiliationIcon();

  Browser.bindCommandHotkeys();
  Browser.registerNotificationListeners();
  Browser.bindOmniboxToOracle();

  // Send some basic statistics once a day
  setInterval( function() {
    // App version is interesting
    Analytics.trackEvent('appVersion', Browser.getAppVersion() + ' @ ' + Browser.name);
    // Affiliation is also interesting, in contrast to the popup some of these are inactive users
    // To find inactive user count, subtract these stats from popup stats
    if (ls.showAffiliation2 !== 'true') {
      Analytics.trackEvent('singleAffiliation', ls.affiliationKey1);
      Analytics.trackEvent('affiliation1', ls.affiliationKey1);
    }
    else {
      Analytics.trackEvent('doubleAffiliation', ls.affiliationKey1 + ' - ' + ls.affiliationKey2);
      Analytics.trackEvent('affiliation1', ls.affiliationKey1);
      Analytics.trackEvent('affiliation2', ls.affiliationKey2);
    }
  }, 1000 * 60 * 60 * 24);

  // Enter main loop, keeping everything up-to-date
  var stayUpdated = function(now) {
    console.lolg(ONLINE_MESSAGE);
    var loopTimeout = (DEBUG ? BACKGROUND_LOOP_DEBUG : BACKGROUND_LOOP);
    // Schedule for repetition
    intervalId = setInterval( function() {
      mainLoop();
    }, loopTimeout);
    // Run once right now (just wait 2 secs to avoid network-change errors)
    var timeout = (now ? 0 : 2000);
    setTimeout( function() {
      mainLoop(true);
    }, timeout);
  };
  // When offline mainloop is stopped to decrease power consumption
  window.addEventListener('online', stayUpdated);
  window.addEventListener('offline', function() {
    console.lolg(OFFLINE_MESSAGE);
    clearInterval(intervalId);
  });
  // Go
  if (navigator.onLine) {
    stayUpdated(true);
  }
  else {
    mainLoop();
  }
});
