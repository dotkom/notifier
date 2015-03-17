"use strict";

var ls = localStorage;
var iteration = 0;

var mainLoop = function(force) {
  console.lolg("\n#" + iteration);

  if (ls.showCantina === 'true')
    if (force || iteration % UPDATE_CANTINAS_INTERVAL === 0)
      updateCantinas();
  // Only if hardware
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (ls.showOffice === 'true') {
      if (force || iteration % UPDATE_OFFICE_INTERVAL === 0) {
        Browser.getBackgroundProcess().updateAffiliation(function() {
          updateOffice();
          updateServant();
          updateMeetings();
          updateCoffee();
        });
      }
    }
  }
  // if (Affiliation.org[ls.affiliationKey1].hw)
  //   if (ls.showOffice === 'true')
  //     if (force || iteration % UPDATE_OFFICE_INTERVAL === 0)
  //       updateOffice();
  //   if (ls.showOffice === 'true')
  //     if (force || iteration % UPDATE_SERVANT_INTERVAL === 0)
  //       updateServant();
  //   if (ls.showOffice === 'true')
  //     if (force || iteration % UPDATE_MEETINGS_INTERVAL === 0)
  //       updateMeetings();
  //   if (ls.showOffice === 'true')
  //     if (force || iteration % UPDATE_COFFEE_INTERVAL === 0)
  //       updateCoffee();
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

var updateOffice = function(debugStatus) {
  console.lolg('updateOffice');
  
  
  // Get
  var meetingData = JSON.parse(ls.meetingData);
  var statusData = JSON.parse(ls.statusData);
  
  // Presume the worst
  var status = 'error';
  var title = Office.statuses['error'].title;
  var message = Office.statuses['error'].title;
  var meetings = 'En feil oppstod.';

  try {
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
  
  if (DEBUG && debugStatus) {
    status = debugStatus;
    message = 'debugging';
  }
  if (ls.officescreenOfficeStatus !== status || ls.officescreenOfficeStatusMessage !== message) {
    if (Object.keys(Office.foods).indexOf(status) > -1 ) {
      // Food status with just title
      $('#now #text #status').text(Office.foods[status].title);
      $('#now #text #status').css('color', Office.foods[status].color);
    }
    else {
      // Regular status
      $('#now #text #status').html(Office.statuses[status].title);
      $('#now #text #status').css('color', Office.statuses[status].color);
    }
    $('#now #text #info').html(message);
    ls.officescreenOfficeStatus = status;
    ls.officescreenOfficeStatusMessage = message;
  }
}

//
// Update functions: Servant
//

var updateServant = function() {
  console.lolg('updateServant');

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
  console.lolg('updateMeeting');

  if (!ls.meetingString) {
    $('#todays #schedule #meetings').html(Affiliation.msgConnectionError);
  }
  else {
    var meetingString = ls.meetingString;
    var htmlMeeting = meetingString.replace(/\n/g, '<br />');

    $('#todays #schedule #meetings').html(htmlMeeting);

    // Online and Abakus gets the Hackerspace info as well as meetings
    if (ls.affiliationKey1.match(/online|abakus/g)) {
      Hackerspace.get(function(hackerspace) {
        $('#todays #schedule #meetings').append('<div id="hackerspace">' + hackerspace + '</div>');
        $('#todays #schedule #meetings #hackerspace span').click(function(elem) {
          Browser.openTab(Hackerspace.web);
          window.close();
        });
      });
    }
  }
}

//
// Update functions: Coffee
//

var updateCoffee = function() {
  console.lolg('updateCoffee');

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

var updateCantinas = function(first) {
  // This function just fetches from localstorage (updates in background)
  console.lolg('updateCantinas');
  var update = function(shortname, data, selector) {
    // Set name
    var name = Cantina.names[shortname];
    $('#cantinas '+selector+' .title').html(name);
    // Set hours
    var hours = data.hours;
    $('#cantinas '+selector+' .hours').html(hours);
    // Set dinners
    var menu = data.menu;
    $('#cantinas '+selector+' #dinnerbox').html(listDinners(menu));
  };
  var cantina1Data = JSON.parse(ls.cantina1Data);
  var cantina2Data = JSON.parse(ls.cantina2Data);
  update(ls.cantina1, cantina1Data, '.first');
  update(ls.cantina2, cantina2Data, '.second');
}

var listDinners = function(menu) {
  var dinnerlist = '';
  // If menu is just a message, not a menu: (yes, a bit hackish, but reduces complexity)
  if (typeof menu === 'string') {
    dinnerlist += '<li>' + menu + '</li>';
  }
  else {
    for (var i in menu) {
      var dinner = menu[i];
      if (dinner.price != null) {
        dinner.price = dinner.price + ',-';
        dinnerlist += '<li><span>' + dinner.price + '</span> ' + dinner.text + '</li>'
      }
      else {
        dinnerlist += '<li class="message">"' + dinner.text + '"</li>';
      }
    }
  }
  return dinnerlist;
}

var updateBus = function() {
  console.lolg('updateBus');

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
    var spans = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

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
    $('body').on('keypress', function(e) {
      // <enter> removes the overlay
      if (e.which === 13) {
        $('#overlay').toggle();
        $('#fadeOutNews').toggle();
        $('#logo').toggle();
        $('#pageflip').toggle();
      }
    });
  }
  
  // Clear all previous thoughts
  ls.removeItem('officescreenOfficeStatus');
  ls.removeItem('officescreenOfficeStatusMessage');

  // Track popularity of the chosen palette, the palette itself is loaded a lot earlier for perceived speed
  Analytics.trackEvent('loadPalette', ls.affiliationPalette);

  // If only one affiliation is to be shown remove the second news column
  if (ls.showAffiliation2 !== 'true') {
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
    console.lolg(ONLINE_MESSAGE);
    var loopTimeout = (DEBUG ? PAGE_LOOP_DEBUG : PAGE_LOOP);
    // Schedule for repetition
    window.intervalId = setInterval(function() {
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
    clearInterval(window.intervalId);
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
