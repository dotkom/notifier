"use strict";

var ls = localStorage;
var iteration = 0;
var intervalId = null;

var newsLimit = 4; // The best amount of news for the popup, IMO

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
          // updateStatus(); // TODO: No status info in popup yet
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

//
// Text measuring for title dropdowns and change handlers
//

var getTitleWidth = function (title) {
  var width = $('#titleMeasure').text(title).width();
  $('#titleMeasure').text('');
  return width * 1.1 + 30; // With buffer
};

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
    $('#cantinas '+selector+' .titleDropdown option').filter(function() {
      return shortname === $(this).val();
    }).attr('selected', true);

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
        clickHours(hours, shortname);
      }
      // Set dinners
      $(dinners).html('');
      if (data.dinner) {
        for (var i in data.dinner) {
          var dinner = data.dinner[i];
          if (dinner.price !== undefined) {
            $(dinners).append('<li>' + dinner.price + ',- ' + dinner.text + '</li>');
          }
          else {
            $(dinners).append('<li class="message">"' + dinner + '"</li>');
          }
        }
        clickDinners(dinners + ' li', shortname);
      }
      // Log error messages
      if (data.error) console.error(data.error);
    }
  };

  var clickHours = function(cssSelector, cantina) {
    $(cssSelector).click(function() {
      Analytics.trackEvent('clickHours', $(this).text());
      Browser.openTab(Cantina.webHours);
      window.close();
    });
  }

  var clickDinners = function(cssSelector, cantina) {
    $(cssSelector).click(function() {
      Analytics.trackEvent('clickDinner', $(this).text());
      Browser.openTab(Cantina.webDinner);
      window.close();
    });
  }

  // Load data from cantinas
  var cantina1Data = JSON.parse(ls.cantina1Data);
  var cantina2Data = JSON.parse(ls.cantina2Data);
  update(ls.cantina1, cantina1Data, '.first');
  update(ls.cantina2, cantina2Data, '.second');
};

var adjustCantinaTitleWidth = function(title, element) {
  var wrapper = element + ' .dropdownWrapper';
  var dropdown = element + ' .dropdownWrapper .titleDropdown';
  var cantinaName = Cantina.names[title];
  var width = getTitleWidth(cantinaName);
  $(wrapper).width(width);
  $(dropdown).width(width - 23);
};
adjustCantinaTitleWidth(ls.cantina1, '#cantinas .first');
adjustCantinaTitleWidth(ls.cantina2, '#cantinas .second');

var cantinaChangeHandler = function(which, cantina) {
  var titleDropdown = '#cantinas ' + which + ' .titleDropdown';
  var hoursBox = '#cantinas ' + which + ' .hours';
  var dinnerBox = '#cantinas ' + which + ' #dinnerbox';
  $(titleDropdown).change(function () {
    // Save
    ls[cantina] = this.value;
    // Measure
    adjustCantinaTitleWidth(ls[cantina], '#cantinas ' + which);
    // Add loading bar
    $(hoursBox).html('');
    $(dinnerBox).html('<img class="loadingLeft" src="img/loading.gif" />');
    window.cantinaTimeout = setTimeout(function() {
      $(hoursBox).html('');
      $(dinnerBox).html(Cantina.msgConnectionError);
    }, 6000);
    // Apply
    Browser.getBackgroundProcess().updateCantinas(function () {
      clearTimeout(window.cantinaTimeout);
      updateCantinas();
    });
  });
};
cantinaChangeHandler('.first', 'cantina1');
cantinaChangeHandler('.second', 'cantina2');

//
// Update functions: Bus
//

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
    var spans = ['first', 'second', 'third'];

    $(busStop+' .name').html(stopName + (direction !== 'null' ? ' ' + direction : ''));

    // Reset spans
    for (var i in spans) {
      $(busStop+' .'+spans[i]+' .line').html('');
      $(busStop+' .'+spans[i]+' .time').html('');
    }
    $(busStop+' .error').html('');

    // if lines is an error message
    if (typeof lines === 'string') {
      // if online, recommend oracle
      if (navigator.onLine) {
        $(busStop+' .error').html(lines+'<br />Prøv Orakelet i stedet');
      }
      else {
        $(busStop+' .error').html(lines);
      }
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

  var displayItems = function(items, column, newsListName, viewedListName, unreadCountName) {
    // Empty the news column
    $('#news '+column+' .post').remove();
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

        if (ls.showAffiliation2 === 'true') {
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
                '<img class="regular" src="' + item.image + '" />',
                '<div class="title">' + readUnread + item.title + '</div>',
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
    $.each($('#news .post .item'), function(i, val) {
      var link = $(this).attr('data');
      var image = JSON.parse(localStorage.storedImages)[link];
      if (typeof image !== 'undefined') {
        $(this).find('img').attr('src', image);
      }
    });
  }

  // Displaying the news feed (prefetched by the background page)
  var feedItems = ls['affiliationFeedItems'+number];
  // Detect selector
  var selector = (number === '1' ? '#left' : '#right');
  if (ls.showAffiliation2 !== 'true') {
    selector = '#full';
  }
  // Set affiliation name
  var name = Affiliation.org[ls['affiliationKey'+number]].name;
  $('#news '+selector+' .title').html(name);

  // Display news from storage
  if (typeof feedItems !== 'undefined') {
    feedItems = JSON.parse(feedItems);
    displayItems(feedItems, selector, 'affiliationNewsList'+number, 'affiliationViewedList'+number, 'affiliationUnreadCount'+number);
  }
  else {
    // Offline or unresponsive
    var key = ls['affiliationKey'+number];
    var name = Affiliation.org[key].name;
    $('#news '+selector+' .post').remove();
    $('#news '+selector).append('<div class="post"><div class="item">Frakoblet fra nyhetsstrøm</div></div>');
    $('#news '+selector+' .post').click(function() {
      Browser.openTab(Affiliation.org[key].web);
    });
  }
}

//
// Affiliation settings
//

var applyAffiliationSettings = function() {

  // Applying affiliation graphics
  var key = ls.affiliationKey1;
  var logo = Affiliation.org[key].logo;
  var icon = Affiliation.org[key].icon;
  var placeholder = Affiliation.org[key].placeholder;
  $('#logo').prop('src', logo);
  $('link[rel="shortcut icon"]').prop('href', icon);
  $('#news .post img').prop('src', placeholder);

  // Hide Chatter button if not applicable
  if (Affiliation.org[ls.affiliationKey1].slack) {
    $('#chatterButton').show();
  }

  // Apply the affiliation's own name for it's office
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (Affiliation.org[ls.affiliationKey1].hw.office) {
      $('#todays #schedule .title').text(Affiliation.org[ls.affiliationKey1].hw.office);
    }
  }
}

//
// Event handlers: Special news
//

var bindSpecialNews = function() {
  $('div#specialNews a').click(function() {
    Analytics.trackEvent('clickSpecialNews', $('#specialNews').text().trim());
    Browser.openTab($('#specialNews a').attr('href'));
    window.close();
  });
  $('div#specialNews img').click(function() {
    Analytics.trackEvent('closeSpecialNews', $('#specialNews').text().trim());
    localStorage.closedSpecialNews = $('#specialNews a').attr('href');
    $('#specialNews').slideUp();
  });
}

//
// Event handlers: Header buttons and logo
//

var bindHeaderButtonsAndLogo = function() {

  // Bind buttons to hovertext

  var fadeButtonText = function(buttons) {
    for (var selector in buttons) {
      var textToShow = buttons[selector];
      $(selector).attr('data', textToShow);
      $(selector).hover(function() {
        var textToShowInner = $(this).attr('data');
        $('#buttontext').html(textToShowInner);
        $('#buttontext').toggle();
      });
    };
  };
  var slack = Affiliation.org[ls.affiliationKey1].slack;
  var slackText = 'Join us at ' + slack.match(/https?:\/\/(.*?)\//)[1];
  fadeButtonText({
    '#optionsButton': 'Endre innstillinger',
    '#chatterButton': slackText,
    '#tipsButton': 'Om appKom, tips, linker, ++',
    '#colorButton': 'Endre fargepalett',
  });

  // Button and logo clicks

  $('#logo').click(function() {
    var name = Affiliation.org[ls.affiliationKey1].name;
    Analytics.trackEvent('clickLogo', name);
    var web = Affiliation.org[ls.affiliationKey1].web;
    Browser.openTab(web);
    window.close();
  });

  $('#optionsButton').click(function() {
    Browser.openTab('options.html');
    Analytics.trackEvent('clickOptions');
    window.close();
  });

  $('#chatterButton').click(function() {
    var slack = Affiliation.org[ls.affiliationKey1].slack;
    Browser.openTab(slack);
    Analytics.trackEvent('clickChatter', ls.affiliationKey1);
    window.close();
  });

  $('#tipsButton').click(function() {
    if ($('#tips').filter(':visible').length === 1) {
      $('#tips').fadeOut('fast');
    }
    else {
      $('#tips').fadeIn('fast');
      Analytics.trackEvent('clickTips');
    }
  });
  $('#tips:not(a)').click(function() {
    $('#tips').fadeOut('fast');
  });
  $('#tips a').click(function() {
    var link = $(this).attr('href');
    Browser.openTab(link);
    Analytics.trackEvent('clickTipsLink', link);
    window.close();
  });

  $('#colorButton').click(function() {
    // Clear timeout that might be waiting to fade out button text
    if (isNumber(ls.colorTimeout))
      clearTimeout(parseInt(ls.colorTimeout));
    // Get all palettes
    var colors = Object.keys(Palettes.palettes);
    // And any special affiliation palette as well
    var affPalette = Affiliation.org[ls.affiliationKey1].palette;
    if (colors.indexOf(affPalette) === -1) {
      colors.push(affPalette);
    }
    // Find current palette
    var currentPalette = $('#palette').attr('href').match(/\w+\/\w+\/(\w+)\.\w+/)[1];
    var index = colors.indexOf(currentPalette);
    // Goto next palette
    index++;
    if (!colors[index])
      index = 0;
    ls.affiliationPalette = colors[index];
    Palettes.load();
    // Text feedback, fade out after timeout
    fadeButtonText(true, 'Fargepalett satt til "' + colors[index].capitalize() + '"');
    clearTimeout()
    ls.colorTimeout = setTimeout(function() {
      fadeButtonText(false, '')
    }, 2000);
    // And track it
    Analytics.trackEvent('clickColor');
  });
};

//
// Event handlers: Realtime bus
//

var bindRealtimeBus = function() {

  // Bind realtimebus lines to their timetables
  var timetables = JSON.parse(localStorage.busTimetables);
  var clickBus = function() {
    try {
      var line = $(this).find('.line').text().trim().split(' ')[0];
      var link = timetables[line];
      Browser.openTab(link);
      Analytics.trackEvent('clickTimetable');
      window.close();
    }
    catch (e) {
      console.error('Failed at clickBus', e);
    }
  }

  // Register click event for all lines
  var busLanes = ['.first', '.second', '.third'];
  for (var i in busLanes) {
    $('#bus #firstBus '+busLanes[i]).click(clickBus);
    $('#bus #secondBus '+busLanes[i]).click(clickBus);
  }

  // Bind AtB logo and any realtimebus error messages to atb.no/…
  var openAtb = function() {
    Browser.openTab('http://www.atb.no');
    Analytics.trackEvent('clickAtb');
    window.close();
  };
  $('#bus #atbLogo').click(openAtb);
  var openOracle = function() {
    Browser.openTab('http://www.atb.no/bussorakelet');
    Analytics.trackEvent('clickAtbError');
    window.close();
  };
  $('#bus .error').click(openOracle);
}

//
// Event handlers: Oracle
//

var bindOracle = function() {

  var changeOracleAnswer = function(answer) {
    console.log('changeOracleAnswer to "' + answer + '"');
    // Stop previous changeOracleAnswer instance, if any
    clearTimeout(Number(ls.animateOracleAnswerTimeoutId));
    // If answer contains HTML, just insert it as HTML
    if (answer.match(/<\/?\w+>/g) !== null) {
      if ($('#oracle #answer .piece').size() === 0) {
        $('#oracle #answer').append('<div class="piece">' + answer + '</div>');
        $('#oracle #answer .piece a').attr('target', '_blank');
      }
      else {
        // Remove all preexisting pieces
        $('#oracle #answer .piece').fadeOut(400, function() {
          $('#oracle #answer .piece').remove();
          $('#oracle #answer').append('<div class="piece">' + answer + '</div>');
          $('#oracle #answer .piece a').attr('target', '_blank');
        });
      }
    }
    // Animate oracle answer name change
    else {
      var func = function(answer) {
        var pieces = answer.split('@');
        // Insert piece placeholders
        for (var i in pieces) {
          $('#oracle #answer').append('<div class="piece"></div>');
        }
        for (var i in pieces) {
          animateOracleAnswer(pieces[i], i);
        }
      }
      // Check for preexisting pieces
      if ($('#oracle #answer .piece').size() === 0) {
        func(answer);
      }
      else {
        // Remove all preexisting pieces
        $('#oracle #answer .piece').fadeOut(400, function() {
          $('#oracle #answer .piece').remove();
          func(answer);
        });
      }
    }
  }

  var animateOracleAnswer = function(line, index, callback, build) {
    // Animate it
    var text = $('#oracle #answer .piece').eq(index).text();
    if (text.length === 0) {
      build = true;
    }
    var millisecs = 6;
    if (!build) {
      $('#oracle #answer .piece').eq(index).text(text.slice(0, text.length-1));
      ls.animateOracleAnswerTimeoutId = setTimeout(function() {
        animateOracleAnswer(line, index, callback);
      }, millisecs);
    }
    else {
      if (text.length !== line.length) {
        if (text.length === 0) {
          $('#oracle #answer .piece').eq(index).text(line.slice(0, 1));
        }
        else {
          $('#oracle #answer .piece').eq(index).text(line.slice(0, text.length+1));
        }
        ls.animateOracleAnswerTimeoutId = setTimeout(function() {
          animateOracleAnswer(line, index, callback, true);
        }, millisecs);
      }
      else {
        // Animation for this element is complete
        if (typeof callback != 'undefined') {
          callback(index);
        }
      }
    }
  }

  var oraclePrediction = function() {
    var question = Oracle.predict();
    if (question !== null) {
      // Add question
      changeOracleQuestion(question);
      // Add answer
      Oracle.ask(question, function(answer) {
        changeOracleAnswer(answer);
        $('#oracle #question').focus();
      });
    }
    else {
      // Tell the user to use the oracle more before using predictions
      $('#oracle #question').focus();
      // The timeout is...well...the timeout is a hack.
      setTimeout( function() {
        changeOracleAnswer(Oracle.msgAboutPredict);
      }, 200);
    }
  }

  var changeOracleQuestion = function(question) {
    // Stop previous changeOracleAnswer instance, if any
    clearTimeout(Number(ls.animateOracleQuestionTimeoutId));
    // Animate oracle question name change
    animateOracleQuestion(question);
  }

  var animateOracleQuestion = function(line) {
    // Animate it
    var text = $('#oracle #question').val();
    var random = Math.floor(100 * Math.random() + 10);
    if (text.length !== line.length) {
      if (text.length === 0) {
        $('#oracle #question').val(line.slice(0, 1));
      }
      else {
        $('#oracle #question').val(line.slice(0, text.length+1));
      }
      ls.animateOracleQuestionTimeoutId = setTimeout(function() {
        animateOracleQuestion(line);
      }, random);
    }
  }

  // Suggest prediction
  if (Oracle.predict() !== null) {
    $('#oracle #question').attr('placeholder', Oracle.predict() + Oracle.msgPredictPostfix);
    Analytics.trackEvent('oracleSuggest');
  }
  // User input
  $('#oracle').on('keyup', '#question', function(e) {
    var question = $('#oracle #question').val()
    // Clicked enter
    if (e.which === 13) {
      if (question !== '') {
        Oracle.ask(question, function(answer) {
          changeOracleAnswer(answer);
          Analytics.trackEvent('oracleAnswer');
          // Update suggested prediction
          if (Oracle.predict() !== null) {
            $('#oracle #question').attr('placeholder', Oracle.predict() + Oracle.msgPredictPostfix);
          }
        });
      }
      else {
        changeOracleAnswer(Oracle.greet());
        Analytics.trackEvent('oracleGreet');
      }
    }
    // Cleared field
    else if (question === '' && e.which !== 9) { // Tab is reserved
      changeOracleAnswer('');
      Analytics.trackEvent('oracleClear');
    }
  });
  // Keydown works better with tab
  $('#oracle').on('keydown', '#question', function(e) {
    // Clicked tab: Predict question
    if (e.which === 9) {
      e.preventDefault();
      // Prevent spam
      if (window.lastClickedTabInOracle && (Date.now() - window.lastClickedTabInOracle) < 1500) {
        console.warn('Do not hold down tab, the Oracle is very old and does not enjoy spam.');
      }
      else {
        oraclePrediction();
        Analytics.trackEvent('oraclePrediction');
      }
      window.lastClickedTabInOracle = Date.now();
    }
  });

}

//
// Event handlers: Konami code
//

var bindKonami = function() {
  // React to Konami code
  $(document).konami({
    code: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
    callback: function() {
      Analytics.trackEvent('toggleKonami');

      // Remove #bus background color and any #background filters
      $('#bus').attr('style', 'background-color:transparent; box-shadow:none;');
      $('#background').attr('style', '-webkit-filter: none');

      // A list of the vids available. Add more vids here if you want more
      var links = ['eh7lp9umG2I', 'qyXTgqJtoGM', 'z9Uz1icjwrM', 'sTSA_sWGM44', 'asnZjyWDFlQ', 'NL6CDFn2i3I', 'f4l_MxTMq-4'];

      // Gets a random number, builds the html and displays the vid
      var konamiNum = Math.floor(Math.random() * links.length);
      var htmlVid = '<iframe style="position:absolute;width:800px;height:660px;left:-145px;top:-30px;" src="http://www.youtube.com/embed/' + links[konamiNum] + '?autoplay=1&loop=1&autohide=1" frameborder="0" allowfullscreen></iframe>'
      $("#background").html(htmlVid);
    },
  });
}

//
// Document ready function
//

$(document).ready(function() {
  // If Bigscreen mode is enabled we'll open the bigscreen when the icon is clicked
  if (ls.useBigscreen === 'true') {
    if (ls.whichScreen === 'infoscreen') {
      Browser.openTab('infoscreen.html');
      Analytics.trackEvent('toggleInfoscreen');
    }
    else if (ls.whichScreen === 'officescreen') {
      Browser.openTab('officescreen.html');
      Analytics.trackEvent('toggleOfficescreen');
    }
    else {
      console.error('useBigscreen was enabled, but whichScreen was "' + ls.whichScreen + '"');
    }
    setTimeout(function() {
      window.close();
    }, 250);
  }

  // If this is a tiny computer screen, reduce popup height
  if (window.screen.availHeight < 700) {
    var shorter = window.screen.availHeight - 100;
    // shorter is available screenspace minus the height
    // of the browser taskbar, rounded up well to be sure
    $('body').css('height', shorter + 'px');
  }

  // If only one affiliation is to be shown remove the second news column
  // Also, some serious statistics
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

  // Show stuff that the user hasn't explicitly removed yet
  if (ls.closedSpecialNews !== $('#specialNews a').attr('href')) $('#specialNews').show();
  // Hide stuff the user can't or doesn't want to see
  if (ls.showStatus !== 'true') $('#todays').hide();
  if (ls.showCantina !== 'true') $('#cantinas').hide();
  if (ls.showBus !== 'true') $('#bus').hide();

  // Apply all affiliation settings
  applyAffiliationSettings();

  // Bind special news
  bindSpecialNews();
  // Bind header buttons and logo
  bindHeaderButtonsAndLogo();
  // Bind realtime bus and oracle
  bindRealtimeBus();
  bindOracle();
  // Bind konami code
  bindKonami();

  // Track popularity of the chosen palette, the palette
  // itself is loaded a lot earlier for perceived speed
  Analytics.trackEvent('loadPalette', ls.affiliationPalette);

  // Set the cursor to focus on the question field
  // (e.g. Chrome on Windows doesn't do this automatically so I blatantly blame Windows)
  $('#oracle #question').focus();
  // Repeat for good measure (the browser may sometimes blur the question-field)
  setTimeout(function() {$('#oracle #question').focus();}, 400);

  // Enter main loop, keeping everything up-to-date
  var stayUpdated = function(now) {
    console.log(ONLINE_MESSAGE);
    var loopTimeout = (DEBUG ? PAGE_LOOP_DEBUG : PAGE_LOOP);
    // Schedule for repetition
    intervalId = setInterval( function() {
      mainLoop();
    }, loopTimeout);
    // Run once right now (just wait 2 secs to avoid network-change errors)
    var timeout = (now ? 0 : 2000);
    setTimeout( function() {
      mainLoop(true);
    }, timeout);
  }
  // When offline mainloop is stopped to decrease power consumption
  window.addEventListener('online', stayUpdated);
  window.addEventListener('offline', function() {
    console.log(OFFLINE_MESSAGE);
    clearInterval(intervalId);
    updateBus();
  });
  // Go
  if (navigator.onLine)
    stayUpdated(true);
  else
    mainLoop();

});
