"use strict";

var ls = localStorage;
var iteration = 0;
var intervalId = null;

var newsLimit = 8; // The most news you can cram into Infoscreen, if other features are disabled

var mainLoop = function(force) {
  console.log("\n#" + iteration);

  if (ls.showCantina === 'true')
    if (force || iteration % UPDATE_CANTINAS_INTERVAL === 0)
      updateCantinas();
  if (ls.showAffiliation1 === 'true')
    if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
      updateAffiliationNews('1');
  if (ls.showAffiliation2 === 'true')
    if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
      updateAffiliationNews('2');
  // Only if hardware
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (ls.showStatus === 'true') {
      if (force || iteration % UPDATE_AFFILIATION_INTERVAL === 0) {
        Browser.getBackgroundProcess().updateAffiliation(function() {
          updateMeeting();
          updateServant();
          updateCoffee();
          updateStatus();
        });
      }
    }
  }
  // Always update, tell when offline
  if (ls.showBus === 'true')
    if (force || iteration % UPDATE_BUS_INTERVAL === 0)
      updateBus();

  // No reason to count to infinity
  if (10000 < iteration)
    iteration = 0;
  else
    iteration++;
}

var updateStatus = function(debugStatus) {
  console.log('updateStatus');
  
  // Get meeting data
  var meeting = ls.meetingString;

  // Get status data
  var strings = JSON.parse(ls.statusStrings);
  var statusCode = strings.statusCode;
  var statusTitle = strings.statusTitle;
  var statusMessage = strings.statusMessage;

  if (DEBUG && debugStatus) {
    statusCode = debugStatus;
    statusMessage = 'debugging';
  }
  if (ls.infoscreenLastStatusCode !== statusCode || ls.infoscreenLastMessage !== statusMessage) {
    if (Object.keys(Affiliation.foods).indexOf(statusCode) > -1) {
      if (typeof Affiliation.foods[statusCode].image !== 'undefined') {
        // Food status with image
        $('#office #status img').attr('src', Affiliation.foods[statusCode].image);
        $('#office #status #text').hide();
        $('#office #status img').show();
      }
      else {
        // Food status with just title
        $('#office #status #text').text(Affiliation.foods[statusCode].title);
        $('#office #status #text').css('color', Affiliation.foods[statusCode].color);
        $('#office #status img').hide();
        $('#office #status #text').show();
      }
    }
    else {
      // Regular status
      $('#office #status #text').html(Affiliation.statuses[statusCode].title);
      $('#office #status #text').css('color', Affiliation.statuses[statusCode].color);
      $('#office #status img').hide();
      $('#office #status #text').show();
    }
    // Save them
    ls.infoscreenLastStatusCode = statusCode;
    ls.infoscreenLastMessage = statusMessage;
    // Check for Affiliation specific status message
    var msgs = Affiliation.org[ls.affiliationKey1].hw.statusMessages;
    if (msgs)
      if (msgs[statusCode])
        statusMessage = msgs[statusCode];
    $('#office #subtext').html(statusMessage);
  }
}

//
// Update functions: Servant
//

var updateServant = function() {
  console.log('updateServant');

  if (!ls.servantString) {
    $('#todays #schedule #servant').html('- '+Affiliation.msgConnectionError);
  }
  else {
    var servantString = ls.servantString;
    $('#todays #schedule #servant').html('- '+servantString);
  }
}

//
// Update functions: Meetings
//

var updateMeeting = function() {
  console.log('updateMeeting');

  if (!ls.meetingString) {
    $('#todays #schedule #meetings').html(Affiliation.msgConnectionError);
  }
  else {
    var meetingString = ls.meetingString;
    var htmlMeeting = meetingString.replace(/\n/g, '<br />');

    // Online and Abakus gets the Hackerspace info as well as meetings
    if (ls.affiliationKey1.match(/online|abakus/g)) {
      Hackerspace.get(function(hackerspace) {
        $('#todays #schedule #meetings').html(htmlMeeting + '<div id="hackerspace">' + hackerspace + '</div>');
        $('#todays #schedule #meetings #hackerspace span').click(function(elem) {
          Browser.openTab(Hackerspace.web);
          window.close();
        });
      });
    }
    else {
      $('#todays #schedule #meetings').html(htmlMeeting);
    }
  }
}

//
// Update functions: Coffee
//

var updateCoffee = function() {
  console.log('updateCoffee');

  if (!ls.coffeePotsString || !ls.coffeeDateString) {
    $('#todays #coffee #pots').html('- ' + Coffee.msgConnectionError);
    $('#todays #coffee #age').html(Coffee.msgComforting);
  }
  else {
    var coffeePotsString = ls.coffeePotsString;
    var coffeeDateString = ls.coffeeDateString;
    $('#todays #coffee #pots').html('- ' + coffeePotsString);
    $('#todays #coffee #age').html(coffeeDateString);
  }
}

//
// Update functions: Cantina
//

var updateCantinas = function() {
  // This function just fetches from localstorage (updates in background)
  console.log('updateCantinas');

  var update = function(shortname, data, selector) {
    var name = Cantina.names[shortname];
    var hours = '#cantinas '+selector+' .hours';
    var dinners = '#cantinas '+selector+' #dinnerbox';

    // Set current cantina as selected in the title dropdown
    var name = Cantina.names[shortname];
    $('#cantinas '+selector+' .title').html(name);

    // If data is just a message
    if (typeof data === 'string') {
      $(hours).html('- ' + data);
      $(dinners).html('');
    }
    // Otherwise data has attributes "name", "hours", "menu" and possibly "error"
    else {
      // Set hours
      $(hours).html('');
      if (data.hours && data.hours.message) {
        $(hours).html('- ' + data.hours.message);
      }
      // Set dinners
      $(dinners).html('');
      if (data.dinner) {
        for (var i in data.dinner) {
          var dinner = data.dinner[i];
          if (dinner.price !== undefined) {
            if (dinner.price) {
              $(dinners).append('<li>' + dinner.price + ',- ' + dinner.text + '</li>');
            }
            else {
              $(dinners).append('<li class="message">"' + dinner.text + '"</li>');
            }
          }
          else {
            $(dinners).append('<li class="message">"' + dinner + '"</li>');
          }
        }
      }
      // Log error messages
      if (data.error) console.error(data.error);
    }
  };

  // Load data from cantinas
  var cantina1Data = JSON.parse(ls.cantina1Data);
  var cantina2Data = JSON.parse(ls.cantina2Data);
  update(ls.cantina1, cantina1Data, '.first');
  update(ls.cantina2, cantina2Data, '.second');
};

var updateBus = function() {
  console.log('updateBus');

  var createBusDataRequest = function(bus, cssIdentificator) {
    var activeLines = ls[bus+'ActiveLines']; // array of lines stringified with JSON (hopefully)
    // Parse self (was stored as array)
    activeLines = JSON.parse(activeLines);
    // Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
    Bus.get(ls[bus], activeLines, function(lines) {
      insertBusInfo(lines, ls[bus+'Name'], ls[bus+'Direction'], cssIdentificator);
    });
  };

  var insertBusInfo = function(lines, stopName, direction, cssIdentificator) {
    var busStop = '#bus ' + cssIdentificator;
    var spans = ['first', 'second', 'third', 'fourth'];

    $(busStop+' .name').html(stopName + (direction !== 'null' ? ' ' + direction : ''));

    // Reset spans
    for (var i in spans) {
      $(busStop+' .'+spans[i]+' .line').html('');
      $(busStop+' .'+spans[i]+' .time').html('');
    }
    $(busStop+' .error').html('');
    
    // if lines is an error message
    if (typeof lines === 'string') {
      $(busStop+' .error').html(lines);
    }
    else {
      // No lines to display, bus stop is sleeping
      if (lines['departures'].length === 0) {
        $(busStop+' .error').html('....zzzZZZzzz....');
      }
      else {
        // Display line for line with according times
        for (var i in spans) {
          // If there aren't any more lines left: break
          if (!lines['destination'][i] && !lines['departures'][i]) {
            break;
          }
          // Add the current line
          $(busStop+' .'+spans[i]+' .line').append(lines['destination'][i]);
          // Calculate urgency
          var urgency = Bus.calculateUrgency(lines['departures'][i]);
          var departString = '<span style="color: ' + urgency + ';">' + lines['departures'][i] + '</span>';
          $(busStop+' .'+spans[i]+' .time').append(departString);
        }
      }
    }
  };

  // Inner functions are ready, go!
  createBusDataRequest('firstBus', '#firstBus');
  createBusDataRequest('secondBus', '#secondBus');
}

//
// Update functions: Affiliation News
//

var updateAffiliationNews = function(number) {
  console.log('updateAffiliationNews'+number);

  var displayItems = function(items, selector, newsListName, viewedListName, unreadCountName) {

    // Get feedkey
    var feedKey = items[0].feedKey;

    // Get list of last viewed items and check for news that are just
    // updated rather than being actual news
    var newsList = JSON.parse(ls[newsListName]);
    var viewedList = JSON.parse(ls[viewedListName]);
    var updatedList = findUpdatedPosts(newsList, viewedList);

    // Build list of last viewed for the next time the user views the news
    viewedList = [];

    // Prepare the list of images with salt, pepper and some vinegar
    var storedImages = JSON.parse(ls.storedImages);

    // Prepare a column for our elements
    var column = $();

    // Add feed items
    $.each(items, function (index, item) {

      if (index < newsLimit) {
        viewedList.push(item.link);

        var unreadCount = Number(ls[unreadCountName]);
        var readUnread = '';
        // if (!isFlashy) {
        //   if (index < unreadCount) {
        //     if (updatedList.indexOf(item.link) > -1) {
        //       readUnread += '<span class="unread">UPDATED <b>::</b> </span>';
        //     }
        //     else {
        //       readUnread += '<span class="unread">NEW <b>::</b> </span>';
        //     }
        //   }
        // }

        // EXPLANATION NEEDED:
        // article[data] contains the link
        // article[name] contains the alternative link, if one exists, otherwise null
        var altLink = '';
        if (item.altLink !== null) {
          altLink = ' name="' + item.altLink + '"';
        }

        var descLimit = 140;
        if (ls.showAffiliation2 === 'true') {
          descLimit = 100;
        }
        if (item.description.length > descLimit) {
          item.description = item.description.substr(0, descLimit) + '...';
        }
        // Use image we've found to accompany the news item
        var storedImage = storedImages[item.link];
        if (typeof storedImage !== 'undefined') {
          // Also, check whether there's already a qualified image before replacing it
          if (item.image.indexOf('http') === -1) {
            console.warn('Unqualified image:', item.image);
            item.image = storedImage;
          }
        }

        var htmlItem = '';

        if (ls.showAffiliation2 === 'true') {
          htmlItem = [
            '<article data="' + item.link + '"' + altLink + '>',
              '<img class="flashy" src="' + item.image + '" />',
              '<div class="title flashy">' + readUnread + item.title + '</div>',
              '<div class="author flashy">&ndash; Av ' + item.creator + '</div>',
            '</article>',
          ].join('\n');
        }
        else {
          htmlItem = [
            '<article data="' + item.link + '"' + altLink + '>',
              '<img class="regular" src="' + item.image + '" />',
              '<div class="title">' + readUnread + item.title + '</div>',
              item.description,
              '<br /><div class="author">&ndash; Av ' + item.creator + '</div>',
            '</article>',
          ].join('\n');
        }

        column = column.add(htmlItem);
      }
    });

    // Remove old news, add fresh news
    $('#news ' + selector + ' article').remove();
    $('#news ' + selector).append(column);

    // Store list of last viewed items
    ls[viewedListName] = JSON.stringify(viewedList);

    // All items are now considered read
    Browser.setBadgeText('');
    ls[unreadCountName] = 0;

    // Update images some times after news are loaded in case of late image arrivals
    // which are common when the browser has just started Notifier
    var times = [100, 500, 1000, 2000, 3000, 5000, 10000];
    for (var i in times) {
      setTimeout(function() {
        updateNewsImages();
      }, times[i]);
    }
  }

  // Checks the most recent list of news against the most recently viewed list of news
  var findUpdatedPosts = function(newsList, viewedList) {
    var updatedList = [];
    // Compare lists, keep your mind straight here:
    // Updated news are:
    // - saved in the newsList before the first identical item in the viewedList
    // - saved in the viewedList after the first identical item in the newsList
    for (var i in newsList) {
      if (newsList[i] === viewedList[0]) {
        break;
      }
      for (var j in viewedList) {
        if (j === 0) {
          continue;
        }
        if (newsList[i] === viewedList[j]) {
          updatedList.push(newsList[i]);
        }
      }
    }
    return updatedList;
  }

  var updateNewsImages = function() {
    console.log('updateNewsImages');
    // The background process looks for images, and sometimes that process
    // isn't finished before the popup loads, that's why we have to check
    // in with localStorage.storedImages a couple of times.
    $.each($('#news article'), function(i, val) {
      var link = $(this).attr('data');
      var image = JSON.parse(localStorage.storedImages)[link];
      if (typeof image !== 'undefined') {
        $(this).find('img').attr('src', image);
      }
    });
  }

  // Get the news feed (prefetched by the background page)
  var news = ls['affiliationNews'+number];
  
  // Detect selector
  var selector = (number === '1' ? '#left' : '#right');
  if (ls.showAffiliation2 !== 'true') {
    selector = '#full';
  }

  // Set affiliation name
  var name = Affiliation.org[ls['affiliationKey'+number]].name;
  $('#news '+selector+' .title').html(name);

  // Parse and display news
  if (typeof news !== 'undefined') {
    news = JSON.parse(news);
    displayItems(news, selector, 'affiliationNewsList'+number, 'affiliationViewedList'+number, 'affiliationUnreadCount'+number);
  }
  else {
    // Offline or unresponsive
    var key = ls['affiliationKey'+number];
    var name = Affiliation.org[key].name;
    $('#news '+selector+' article').remove(); // Remove all existing articles
    $('#news '+selector).append('<article>Frakoblet fra nyhetsstrøm</article>');
    $('#news '+selector+' article').click(function() {
      // Link to affiliation website
      Browser.openTab(Affiliation.org[key].web);
    });
  }
}

var officeFontRotate = function(font) {
  var fonts = ['cardo','fondamento','oleoscript','sourcesans'];
  var chosenFont = null;
  if (fonts.indexOf(font) > -1) {
    chosenFont = font;
  }
  else {
    chosenFont = fonts[Math.floor(Math.random() * fonts.length)];
  }
  $('#office #status #text').prop('class', chosenFont);
  if (DEBUG)
    $('#office #subtext').html(ls.infoscreenLastMessage + '<br />' + chosenFont);
}

// Pageflip

var changeCreatorName = function(name) {
  // Stop previous changeCreatorName instance, if any
  clearTimeout(ls.changeCreatorNameTimeoutId);
  // Animate creator name change in the pageflip
  animateCreatorName(name);
}

var animateCreatorName = function(name, build) {
  // Animate it
  var text = $('#pagefliptyping').text();
  if (text.length === 0) {
    build = true;
    name = name + " with <3";
  }
  var random = Math.floor(350 * Math.random() + 50);
  if (!build) {
    $('#pagefliptyping').text(text.slice(0, text.length-1));
    ls.animateCreatorNameTimeoutId = setTimeout(function() {
      animateCreatorName(name);
    }, random);
  }
  else {
    if (text.length !== name.length) {
      if (text.length === 0) {
        $('#pagefliptyping').text(name.slice(0, 1));
      }
      else {
        $('#pagefliptyping').text(name.slice(0, text.length+1));
      }
      ls.animateCreatorNameTimeoutId = setTimeout(function() {
        animateCreatorName(name, true);
      }, random);
    }
  }
}

var loopCreatorName = function() {
  setInterval(function() {
    var namesAsRegex = new RegExp(ls.extensionOwner + '|' + ls.extensionCreator, 'gi');
    var currentName = $('#pagefliptyping').text().match(namesAsRegex)[0];
    if (currentName === ls.extensionOwner)
      changeCreatorName(ls.extensionCreator);
    else
      changeCreatorName(ls.extensionOwner);
  }, 3600000);
}

// Document ready, go!
$(document).ready(function() {

  if (DEBUG) {
    // show the cursor and remove the overlay (the gradient at the bottom)
    // (allows DOM inspection with the mouse)
    $('html').css('cursor', 'auto');
    $('#container').css('overflow-y', 'auto');
    $('#container').css('overflow-x', 'hidden');
    $('body').on('keypress', function(e) {
      // <enter> removes the overlay
      if (e.which === 13) {
        $('#overlay').toggle();
        $('#fadeOutNews').toggle();
        $('#logo').toggle();
        $('#pageflip').toggle();
      }
      // <space> loops through statuses
      if (e.which === 32) {
        e.preventDefault();
        switch (ls.infoscreenLastStatusCode) {
          case 'waffle': updateStatus('error'); break;
          case 'error': updateStatus('open'); break;
          case 'open': updateStatus('closed'); break;
          case 'closed': updateStatus('meeting'); break;
          case 'meeting': updateStatus('bun'); break;
          case 'bun': updateStatus('cake'); break;
          case 'cake': updateStatus('coffee'); break;
          case 'coffee': updateStatus('pizza'); break;
          case 'pizza': updateStatus('taco'); break;
          case 'taco': updateStatus('waffle'); break;
          default: updateStatus('error');
        }
      }
    });
  }
  
  // Clear values that should start empty
  Affiliation.clearAffiliationData();

  // Track popularity of the chosen palette, the palette itself is loaded a lot earlier for perceived speed
  Analytics.trackEvent('loadPalette', ls.affiliationPalette);

  // If only one affiliation is to be shown remove the second news column
  if (ls.showAffiliation2 !== 'true') {
    $('#news #right').hide();
    $('#news #left').attr('id', 'full');
    // Who uses single affiliations?
    Analytics.trackEvent('loadSingleAffiliation', ls.affiliationKey1);
    // What is the prefered primary affiliation?
    Analytics.trackEvent('loadAffiliation1', ls.affiliationKey1);
  }
  else {
    // What kind of double affiliations are used?
    Analytics.trackEvent('loadDoubleAffiliation', ls.affiliationKey1 + ' - ' + ls.affiliationKey2);
    // What is the prefered primary affiliation?
    Analytics.trackEvent('loadAffiliation1', ls.affiliationKey1);
    // What is the prefered secondary affiliation?
    Analytics.trackEvent('loadAffiliation2', ls.affiliationKey2);
  }

  // Hide stuff that the user has disabled in options
  if (ls.showStatus !== 'true')
    $('#office').hide();
  if (ls.showStatus !== 'true')
    $('#todays').hide();
  if (ls.showCantina !== 'true')
    $('#cantinas').hide();
  if (ls.showBus !== 'true')
    $('#bus').hide();

  // Applying affiliation graphics
  var key = ls.affiliationKey1;
  var logo = Affiliation.org[key].logo;
  var icon = Affiliation.org[key].icon;
  var placeholder = Affiliation.org[key].placeholder;
  var sponsor = Affiliation.org[key].sponsor;
  if (typeof sponsor !== 'undefined')
    $('#logo').prop('src', sponsor);
  else
    $('#logo').prop('src', logo);
  $('link[rel="shortcut icon"]').attr('href', icon);
  $('#news .post img').attr('src', placeholder);

  // Apply the affiliation's own name for it's office
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (Affiliation.org[ls.affiliationKey1].hw.office) {
      $('#todays #schedule .title').text(Affiliation.org[ls.affiliationKey1].hw.office);
    }
  }
  
  // Adding creator name to pageflip and looping it periodically
  changeCreatorName(ls.extensionOwner);
  loopCreatorName();
  // Blinking cursor at pageflip
  setInterval(function() {
    $(".pageflipcursor").animate({opacity: 0}, "fast", "swing", function() {
      $(this).animate({opacity: 1}, "fast", "swing");
    });
  }, 600);
  // Minor esthetical adjustments for Windows
  if (Browser.onWindows()) {
    $('#pfText').attr("style", "bottom:9px;");
    $('#pfLink').attr("style", "bottom:9px;");
  }

  // Randomize font in the office status
  officeFontRotate();
  setInterval(function() {
    officeFontRotate();
  }, 1800000);

  // Prevent image burn-in by fading to black every half hour
  var linebreaks = function() {
    var random = Math.ceil(Math.random() * 25);
    var br = '';
    for (var i = 0; i < random; i++) {
      br += '<br />';
    };
    return br;
  };
  setInterval(function() {
    $('#overlay').html(linebreaks() + 'preventing image burn-in...');
    $('#overlay').css('opacity', 1);
    setTimeout(function() {
      $('#overlay').css('opacity', 0);
    }, 3500);
  }, 1800000);

  // Reload entirely every 24 hours, in case of app updates
  setInterval(function() {
    document.location.reload();
  }, 86400000);

  // Enter main loop, keeping everything up-to-date
  var stayUpdated = function(now) {
    console.log(ONLINE_MESSAGE);
    var loopTimeout = (DEBUG ? PAGE_LOOP_DEBUG : PAGE_LOOP);
    // Schedule for repetition
    intervalId = setInterval(function() {
      mainLoop();
    }, loopTimeout);
    // Run once right now (just wait 2 secs to avoid network-change errors)
    var timeout = (now ? 0 : 2000);
    setTimeout(function() {
      mainLoop(true);
    }, timeout);
  };
  // When offline mainloop is stopped to decrease power consumption
  window.addEventListener('online', stayUpdated);
  window.addEventListener('offline', function() {
    console.log(OFFLINE_MESSAGE);
    clearInterval(intervalId);
    updateBus();
  });
  // Go
  if (navigator.onLine) {
    stayUpdated(true);
  }
  else {
    mainLoop();
  }

});
