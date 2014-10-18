var ls = localStorage;
var iteration = 0;

mainLoop = function(force) {
  console.lolg("\n#" + iteration);

  if (ls.showCantina === 'true')
    if (force || iteration % UPDATE_HOURS_INTERVAL === 0)
      updateHours();
  if (ls.showCantina === 'true')
    if (force || iteration % UPDATE_CANTINAS_INTERVAL === 0)
      updateCantinas();
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
    // Add span to time
    meetings = '<span>'+meetings;
    meetings = meetings.replace(/\n/g, '<br /><span>');
    meetings = meetings.replace(/:/g, ':</span>');
    if (ls.affiliationKey1.match(/online|abakus/g) === null) {
      $('#todays #schedule #meetings').html(meetings);
    }
    else {
      Hackerspace.get(function(hackerspace) {
        $('#todays #schedule #meetings').html(meetings + '<br />' + hackerspace);
      }); 
    }
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
        dinnerlist += '<li id="' + dinner.index + '"><span>' + dinner.price + '</span> ' + dinner.text + '</li>'
      }
      else {
        dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>';
      }
    }
  }
  return dinnerlist;
}

updateHours = function(first) {
  // This function just fetches from localstorage (updates in background)
  console.lolg('updateHours');
  update = function(shortname, hours, selector) {
    $('#cantinas #'+selector+' .hours').html(hours);
  }
  update(ls.leftCantina, ls.leftCantinaHours, 'left');
  update(ls.rightCantina, ls.rightCantinaHours, 'right');
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
    $('#bus #firstBus .name').html(ls.firstBusName + ' ' + ls.firstBusDirection);
    $('#bus #secondBus .name').html(ls.secondBusName + ' ' + ls.secondBusDirection);
    $('#bus #firstBus .error').html('<div class="error">' + Bus.msgDisconnected + '</div>');
    $('#bus #secondBus .error').html('<div class="error">' + Bus.msgDisconnected + '</div>');
  }
  else {
    // All good, go ahead!
    createBusDataRequest('firstBus', '#firstBus');
    createBusDataRequest('secondBus', '#secondBus');
  }
}

createBusDataRequest = function(bus, cssIdentificator) {
  var activeLines = ls[bus+'ActiveLines']; // array of lines stringified with JSON (hopefully)
  // Parse self (was stored as array)
  activeLines = JSON.parse(activeLines);
  // Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
  Bus.get(ls[bus], activeLines, function(lines) {
    insertBusInfo(lines, ls[bus+'Name'], ls[bus+'Direction'], cssIdentificator);
  });
}

insertBusInfo = function(lines, stopName, cssIdentificator) {
  var busStop = '#bus '+cssIdentificator;
  var spans = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

  $(busStop+' .name').html(stopName + ' ' + direction);

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
        // Calculate urgency
        var urgency = Bus.calculateUrgency(lines['departures'][i]);
        var departString = '<span style="color: ' + urgency + ';">' + lines['departures'][i] + '</span>';
        $(busStop+' .'+spans[i]+' .time').append(departString);
      }
    }
  }
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
