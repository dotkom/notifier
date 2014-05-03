// Notify Coffeescript that jQuery is here
var $ = jQuery;
var ls = localStorage;
var iteration = 0;
var intervalId = null;

var newsLimit = 8; // The most news you can cram into Infoscreen, if other features are disabled

mainLoop = function(force) {
  console.lolg("\n#" + iteration);

  if (ls.showCantina === 'true')
    if (force || iteration % UPDATE_HOURS_INTERVAL === 0)
      updateHours();
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
  if (Affiliation.org[ls.affiliationKey1].hw)
    if (ls.showOffice === 'true')
      if (force || iteration % UPDATE_OFFICE_INTERVAL === 0)
        updateOffice();
    if (ls.showOffice === 'true')
      if (force || iteration % UPDATE_SERVANT_INTERVAL === 0)
        updateServant();
    if (ls.showOffice === 'true')
      if (force || iteration % UPDATE_MEETINGS_INTERVAL === 0)
        updateMeetings();
    if (ls.showOffice === 'true')
      if (force || iteration % UPDATE_COFFEE_INTERVAL === 0)
        updateCoffee();
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

updateOffice = function(debugStatus) {
  console.lolg('updateOffice');
  Office.get(function(status, message) {
    if (DEBUG && debugStatus) {
      status = debugStatus;
      message = 'debugging';
    }
    if (ls.infoscreenOfficeStatus !== status || ls.infoscreenOfficeStatusMessage !== message) {
      if (Object.keys(Office.foods).indexOf(status) > -1) {
        if (typeof Office.foods[status].image !== 'undefined') {
          // Food status with image
          $('#office #status img').attr('src', Office.foods[status].image);
          $('#office #status #text').hide();
          $('#office #status img').show();
        }
        else {
          // Food status with just title
          $('#office #status #text').text(Office.foods[status].title);
          $('#office #status #text').css('color', Office.foods[status].color);
          $('#office #status img').hide();
          $('#office #status #text').show();
        }
      }
      else {
        // Regular status
        $('#office #status #text').html(Office.statuses[status].title);
        $('#office #status #text').css('color', Office.statuses[status].color);
        $('#office #status img').hide();
        $('#office #status #text').show();
      }
      // Save them
      ls.infoscreenOfficeStatus = status;
      ls.infoscreenOfficeStatusMessage = message;
      // Check for Affiliation specific status message
      var msgs = Affiliation.org[ls.affiliationKey1].hw.statusMessages;
      if (msgs)
        if (msgs[status])
          message = msgs[status];
      $('#office #subtext').html(message);
    }
  });
}

updateServant = function() {
  console.lolg('updateServant');
  Servant.get(function(servant) {
    $('#todays #schedule #servant').html('- '+servant);
  });
}

updateMeetings = function() {
  console.lolg('updateMeetings');
  Meetings.get(function(meetings) {
    meetings = meetings.replace(/\n/g, '<br />');
    $('#todays #schedule #meetings').html(meetings);
  });
}

updateCoffee = function() {
  console.lolg('updateCoffee');
  Coffee.get(true, function(pots, age) {
    $('#todays #coffee #pots').html('- '+pots);
    $('#todays #coffee #age').html(age);
  });
}

updateCantinas = function(first) {
  // This function just fetches from localstorage (updates in background)
  console.lolg('updateCantinas');
  update = function(shortname, menu, selector) {
    var name = Cantina.names[shortname];
    $('#cantinas #'+selector+' .title').html(name);
    $('#cantinas #'+selector+' #dinnerbox').html(listDinners(menu));
    clickDinnerLink('#cantinas #'+selector+' #dinnerbox li', shortname);
  };
  var menu1 = JSON.parse(ls.leftCantinaMenu);
  var menu2 = JSON.parse(ls.rightCantinaMenu);
  update(ls.leftCantina, menu1, 'left');
  update(ls.rightCantina, menu2, 'right');
}

listDinners = function(menu) {
  var dinnerlist = '';
  // If menu is just a message, not a menu: (yes, a bit hackish, but reduces complexity in the cantina script)
  if (typeof menu === 'string') {
    ls.noDinnerInfo = 'true';
    dinnerlist += '<li>' + menu + '</li>';
  }
  else {
    ls.noDinnerInfo = 'false'
    for (index in menu) {
      var dinner = menu[index];
      if (dinner.price != null) {
        dinner.price = dinner.price + ',-';
        dinnerlist += '<li id="' + dinner.index + '">' + dinner.price + ' ' + dinner.text + '</li>';
      }
      else {
        dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>';
      }
    }
  }
  return dinnerlist;
}

clickDinnerLink = function(cssSelector, cantina) {
  $(cssSelector).click(function() {
    Analytics.trackEvent('clickDinner', $(this).text());
    ls.clickedCantina = cantina;
    Browser.openTab(Cantina.url);
    window.close();
  });
}

updateHours = function(first) {
  // This function just fetches from localstorage (updates in background)
  console.lolg('updateHours');
  update = function(shortname, hours, selector) {
    $('#cantinas #'+selector+' .hours').html(hours);
    clickHours('#cantinas #'+selector+' .hours', shortname);
  }
  update(ls.leftCantina, ls.leftCantinaHours, 'left');
  update(ls.rightCantina, ls.rightCantinaHours, 'right');
}

clickHours = function(cssSelector, cantina) {
  $(cssSelector).click(function() {
    Analytics.trackEvent('clickHours', $(this).text());
    ls.clickedHours = Hours.cantinas[cantina];
    Browser.openTab(Hours.url);
    window.close();
  });
}

updateBus = function() {
  console.lolg('updateBus');
  if (!navigator.onLine) {
    // Reset
    var stops = ['firstBus', 'secondBus'];
    var spans = ['first', 'second', 'third', 'fourth'];
    for (i in stops) {
      for (j in spans) {
        $('#bus #'+stops[i]+' .'+spans[j]+' .line').html('');
        $('#bus #'+stops[i]+' .'+spans[j]+' .time').html('');
      }
    }
    // Error message
    $('#bus #firstBus .name').html(ls.firstBusName);
    $('#bus #secondBus .name').html(ls.secondBusName);
    $('#bus #firstBus .error').html('<div class="error">Frakoblet fra api.visuweb.no</div>');
    $('#bus #secondBus .error').html('<div class="error">Frakoblet fra api.visuweb.no</div>');
  }
  else {
    // All good, go ahead!
    createBusDataRequest('firstBus', '#firstBus');
    createBusDataRequest('secondBus', '#secondBus');
  }
}

createBusDataRequest = function(bus, cssIdentificator) {
  var activeLines = ls[bus+'ActiveLines']; // array of lines stringified with JSON (hopefully)
  var activeLines = JSON.parse(activeLines);
  // Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
  Bus.get(ls[bus], activeLines, function(lines) {
    insertBusInfo(lines, ls[bus+'Name'], cssIdentificator);
  });
}

insertBusInfo = function(lines, stopName, cssIdentificator) {
  var busStop = '#bus '+cssIdentificator;
  var spans = ['first', 'second', 'third', 'fourth'];

  $(busStop+' .name').html(stopName);

  // Reset spans
  for (i in spans) {
    $(busStop+' .'+spans[i]+' .line').html('');
    $(busStop+' .'+spans[i]+' .time').html('');
  }
  $(busStop+' .error').html('');
  
  // if lines is an error message
  if (typeof lines === 'string') {
    $(busStop+' .error').html(lines);
  }
  else {
    // No lines to display, busstop is sleeping
    if (lines['departures'].length === 0) {
      $(busStop+' .error').html('....zzzZZZzzz....');
    }
    else {
      // Display line for line with according times
      for (i in spans) {
        // Add the current line
        $(busStop+' .'+spans[i]+' .line').append(lines['destination'][i]);
        $(busStop+' .'+spans[i]+' .time').append(lines['departures'][i]);
      }
    }
  }
}

updateAffiliationNews = function(number) {
  console.lolg('updateAffiliationNews'+number);
  // Displaying the news feed (prefetched by the background page)
  var feedItems = ls['affiliationFeedItems'+number];
  // Detect selector
  var selector = (number === '1' ? '#left' : '#right');
  if (ls.showAffiliation2 !== 'true') {
    selector = '#full';
  }

  if (typeof feedItems !== 'undefined') {
    feedItems = JSON.parse(feedItems);
    displayItems(feedItems, selector, 'affiliationNewsList'+number, 'affiliationViewedList'+number, 'affiliationUnreadCount'+number);
  }
  else {
    var key = ls['affiliationKey'+number];
    var name = Affiliation.org[key].name;
    $('#news '+selector).html('<div class="post"><div class="item"><div class="title">'+name+'</div>Frakoblet fra nyhetsstrøm</div></div>');
    $('#news '+selector).click(function() {
      Browser.openTab(Affiliation.org[key].web);
    });
  }
}

displayItems = function(items, column, newsListName, viewedListName, unreadCountName) {
  // Empty the news column
  $('#news '+column).html('');
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
  storedImages = JSON.parse(ls.storedImages);

  // Figure out if flashy news are prefered
  var isDuplicate = (ls.affiliationKey1 === ls.affiliationKey2);
  var isPrimaryAffiliation = (ls.affiliationKey1 === feedKey);
  var isFlashy = false;
  if (isDuplicate)
    isFlashy = (ls.affiliationFlashy1 === 'true' || ls.affiliationFlashy2 === 'true');
  else if (isPrimaryAffiliation)
    isFlashy = (ls.affiliationFlashy1 === 'true');
  else
    isFlashy = (ls.affiliationFlashy2 === 'true');

  // Add feed items
  $.each(items, function (index, item) {
    
    if (index < newsLimit) {
      viewedList.push(item.link);
      
      var unreadCount = Number(ls[unreadCountName]);
      var readUnread = '';
      if (!isFlashy) {
        if (index < unreadCount) {
          if (updatedList.indexOf(item.link) > -1) {
            readUnread += '<span class="unread">UPDATED <b>::</b> </span>';
          }
          else {
            readUnread += '<span class="unread">NEW <b>::</b> </span>';
          }
        }
      }

      // EXPLANATION NEEDED:
      // .item[data] contains the link
      // .item[name] contains the alternative link, if one exists, otherwise null
      var date = '';
      var altLink = '';
      if (item.altLink !== null) {
        altLink = ' name="' + item.altLink + '"';
      }
      // NOTE: Removing date from use for now because it's borked
      // if item.date !== null and ls.showAffiliation2 is 'false'
      //   date = ' den ' + item.date
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
          item.image = storedImage;
        }
      }

      var htmlItem = '';

      if (isFlashy && ls.showAffiliation2 === 'true') {
        htmlItem = [
          '<div class="post">',
            '<div class="item" data="' + item.link + '"' + altLink + '>',
              '<img class="flashy" src="' + item.image + '" />',
              '<div class="title flashy">' + readUnread + item.title + '</div>',
              '<div class="author flashy">&ndash; Av ' + item.creator + '</div>',
            '</div>',
          '</div>',
        ].join('\n');
      }
      else {
        htmlItem = [
          '<div class="post">',
            '<div class="item" data="' + item.link + '"' + altLink + '>',
              '<div class="title">' + readUnread + item.title + '</div>',
              '<img class="regular" src="' + item.image + '" />',
              item.description,
              '<div class="author">&ndash; Av ' + item.creator + '</div>',
            '</div>',
          '</div>',
        ].join('\n');
      }

      $('#news '+column).append(htmlItem);
    }
  });
  
  // Store list of last viewed items
  ls[viewedListName] = JSON.stringify(viewedList);

  // All items are now considered read
  Browser.setBadgeText('');
  ls[unreadCountName] = 0;

  // Make news items open extension website while closing popup
  $('#news '+column+' .item').click(function() {
    // The link is embedded as the ID of the element, we don't want to use
    // <a> anchors because it creates an ugly box marking the focus element.
    // Note that altLinks are embedded in the name-property of the element,
    // - if preferred by the organization, we should use that instead.
    var link = $(this).attr('data');
    var altLink = $(this).attr('name');
    var useAltLink = Affiliation.org[feedKey].useAltLink;
    if (typeof altLink !== 'undefined' && useAltLink === true) {
      link = $(this).attr('name');
    }
    Browser.openTab(link);
    Analytics.trackEvent('clickNews', link);
    window.close();
  });

  // Update images some times after news are loaded in case of late image updates
  // which are common when the browser has just started Notifier
  times = [100, 500, 1000, 2000, 3000, 5000, 10000];
  for (i in times) {
    setTimeout(function() {
      updateNewsImages();
    }, times[i]);
  }
}

// Checks the most recent list of news against the most recently viewed list of news
findUpdatedPosts = function(newsList, viewedList) {
  var updatedList = [];
  // Compare lists, keep your mind straight here:
  // Updated news are:
  // - saved in the newsList before the first identical item in the viewedList
  // - saved in the viewedList after the first identical item in the newsList
  for (i in newsList) {
    if (newsList[i] === viewedList[0]) {
      break;
    }
    for (j in viewedList) {
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

updateNewsImages = function() {
  console.lolg('updateNewsImages');
  // The background process looks for images, and sometimes that process
  // isn't finished before the popup loads, that's why we have to check
  // in with localStorage.storedImages a couple of times.
  $.each($('#news .post .item'), function(i, val) {
    var link = $(this).attr('data');
    var image = JSON.parse(localStorage.storedImages)[link];
    if (typeof image !== 'undefined') {
      $(this).find('img').attr('src', image);
    }
  });
}

officeFontRotate = function(font) {
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
    $('#office #subtext').html(ls.infoscreenOfficeStatusMessage + '<br />' + chosenFont);
}

changeCreatorName = function(name) {
  // Stop previous changeCreatorName instance, if any
  clearTimeout(ls.changeCreatorNameTimeoutId);
  // Animate creator name change in the pageflip
  animateCreatorName(name);
}

animateCreatorName = function(name, build) {
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

// Document ready, go!
$(document).ready(function() {

  if (DEBUG) {
    // show the cursor and remove the overlay (the gradient at the bottom)
    // (allows DOM inspection with the mouse)
    $('html').css('cursor', 'auto');
    $('#container').css('overflow-y', 'auto');
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
        switch (ls.infoscreenOfficeStatus) {
          case 'waffle': updateOffice('error'); break;
          case 'error': updateOffice('open'); break;
          case 'open': updateOffice('closed'); break;
          case 'closed': updateOffice('meeting'); break;
          case 'meeting': updateOffice('bun'); break;
          case 'bun': updateOffice('cake'); break;
          case 'cake': updateOffice('coffee'); break;
          case 'coffee': updateOffice('pizza'); break;
          case 'pizza': updateOffice('taco'); break;
          case 'taco': updateOffice('waffle'); break;
          default: updateOffice('error');
        }
      }
    });
  }
  
  // Clear all previous thoughts
  ls.removeItem('infoscreenOfficeStatus');
  ls.removeItem('infoscreenOfficeStatusMessage');

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
  if (ls.showOffice !== 'true')
    $('#office').hide();
  if (ls.showOffice !== 'true')
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
  
  // Adding creator name to pageflip
  changeCreatorName(ls.extensionCreator);
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

  // Start the clock in #bus, from: alessioatzeni.com/blog/css3-digital-clock-with-jquery/
  setInterval(function() {
    var _d = new Date();
    var minutes = _d.getMinutes();
    var hours = _d.getHours();
    // Pad the number with a zero if less than 10
    if (minutes < 10)  minutes = '0' + minutes;
    if (hours < 10)    hours = '0' + hours;
    $("#bus #clock #minutes").html(minutes);
    $("#bus #clock #hours").html(hours);
  }, 1000);

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
  stayUpdated = function(now) {
    console.lolg(ONLINE_MESSAGE);
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
    console.lolg(OFFLINE_MESSAGE);
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
