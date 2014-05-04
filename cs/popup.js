// Notify Coffeescript that jQuery is here
var $ = jQuery;
var ls = localStorage;
var iteration = 0;
var intervalId = null;

var newsLimit = 4; // The best amount of news for the popup, IMO

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
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (ls.showOffice === 'true')
      if (force || iteration % UPDATE_SERVANT_INTERVAL === 0)
        updateServant();
    if (ls.showOffice === 'true')
      if (force || iteration % UPDATE_MEETINGS_INTERVAL === 0)
        updateMeetings();
    if (ls.showOffice === 'true')
      if (force || iteration % UPDATE_COFFEE_INTERVAL === 0)
        updateCoffee();
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
    $('#todays #coffee #pots').html('- ' + pots);
    $('#todays #coffee #age').html(age);
  });
}

updateCantinas = function() {
  // This function just fetches from localstorage (updates in background)
  console.lolg('updateCantinas');
  var update = function(shortname, menu, selector) {
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
    ls.noDinnerInfo = 'false';
    for (i in menu) {
      var dinner = menu[i];
      if (dinner.price !== null) {
        dinner.price = dinner.price + ',-';
        dinnerlist += '<li id="' + dinner.index + '">' + dinner.price + ' ' + dinner.text + '</li>';
      }
      else {
        dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>'
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
  };
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
    var spans = ['first', 'second', 'third'];
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
    createBusDataRequest('firstBus', '#firstBus');
    createBusDataRequest('secondBus', '#secondBus');
  }
}

createBusDataRequest = function(bus, cssIdentificator) {
  var activeLines = ls[bus+'ActiveLines'] // array of lines stringified with JSON (hopefully)
  // Parse self (was stored as array)
  activeLines = JSON.parse(activeLines);
  // Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
  Bus.get(ls[bus], activeLines, function(lines) {
    insertBusInfo(lines, ls[bus+'Name'], cssIdentificator);
  });
}

insertBusInfo = function(lines, stopName, cssIdentificator) {
  var busStop = '#bus ' + cssIdentificator;
  var spans = ['first', 'second', 'third'];

  $(busStop+' .name').html(stopName);

  // Reset spans
  for (i in spans) {
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

bindOracle = function() {
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
      oraclePrediction();
      Analytics.trackEvent('oraclePrediction');
    }
  });
}

changeOracleAnswer = function(answer) {
  console.lolg('changeOracleAnswer to "' + answer + '"');
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
      for (i in pieces) {
        $('#oracle #answer').append('<div class="piece"></div>');
      }
      for (i in pieces) {
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

animateOracleAnswer = function(line, index, callback, build) {
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

oraclePrediction = function() {
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

changeOracleQuestion = function(question) {
  // Stop previous changeOracleAnswer instance, if any
  clearTimeout(Number(ls.animateOracleQuestionTimeoutId));
  // Animate oracle question name change
  animateOracleQuestion(question);
}

animateOracleQuestion = function(line) {
  // Animate it
  var text = $('#oracle #question').val();
  if (text.length === 0) {
    build = true;
  }
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

updateAffiliationNews = function(number) {
  console.lolg('updateAffiliationNews'+number);
  // Displaying the news feed (prefetched by the background page)
  var feedItems = ls['affiliationFeedItems'+number];
  // Detect selector
  var selector = (number === '1' ? '#left' : '#right');
  if (ls.showAffiliation2 !== 'true') {
    selector = '#full';
  }

  // Display news from storage
  if (typeof feedItems !== 'undefined') {
    feedItems = JSON.parse(feedItems);
    displayItems(feedItems, selector, 'affiliationNewsList'+number, 'affiliationViewedList'+number, 'affiliationUnreadCount'+number);
  }
  else {
    // Offline or unresponsive
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

optionsText = function(show) {
  fadeButtonText(show, 'Innstillinger');
}

tipsText = function(show) {
  fadeButtonText(show, '&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Tips++');
}

chatterText = function(show) {
  var irc = Affiliation.org[ls.affiliationKey1].irc;
  var text = 'Join ' + irc.channel + ' :)';
  fadeButtonText(show, '&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ' + text); // lol i know ^^
}

fadeButtonText = function(show, msg) {
  var fadeInSpeed = 150;
  var fadeOutSpeed = 50;
  if (show) {
    $('#buttontext').html(msg);
    $('#buttontext').fadeIn(fadeInSpeed);
  }
  else {
    $('#buttontext').fadeOut(fadeOutSpeed);
    $('#buttontext').html('');
  }
}

// Document ready, go!
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
      console.lolg('ERROR: useBigscreen was enabled, but whichScreen was', ls.whichScreen);
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

  // Hide stuff the user can't or doesn't want to see
  if (ls.showOffice !== 'true') $('#todays').hide();
  if (ls.showCantina !== 'true') $('#cantinas').hide();
  if (ls.showBus !== 'true') $('#bus').hide();

  // Applying affiliation graphics
  var key = ls.affiliationKey1;
  var logo = Affiliation.org[key].logo;
  var icon = Affiliation.org[key].icon;
  var placeholder = Affiliation.org[key].placeholder;
  $('#logo').prop('src', logo);
  $('link[rel="shortcut icon"]').prop('href', icon);
  $('#news .post img').prop('src', placeholder);
  $('#chatterIcon').prop('src', icon);

  // Hide Chatter button if not applicable
  if (!Affiliation.org[ls.affiliationKey1].irc) {
    $('#chatterButton').hide();
    $('#chatterIcon').hide();
  }
  
  // Track popularity of the chosen palette, the palette
  // itself is loaded a lot earlier for perceived speed
  Analytics.trackEvent('loadPalette', ls.affiliationPalette);

  // Click events
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

  $('#chatterButton').click(function() {
    var irc = Affiliation.org[ls.affiliationKey1].irc;
    var server = irc.server;
    var channel = irc.channel;
    var noNick = irc.noNick;
    Browser.openTab('https://kiwiirc.com/client/' + server + '/' + channel);
    Analytics.trackEvent('clickChatter', ls.affiliationKey1);
    window.close();
  });

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
      console.lolg('ERROR: Failed at clickBus', e);
    }
  }
  // Register click event for all lines
  var busLanes = ['.first', '.second', '.third'];
  for (i in busLanes) {
    $('#bus #firstBus '+busLanes[i]).click(clickBus);
    $('#bus #secondBus '+busLanes[i]).click(clickBus);
  }

  // Bind AtB logo and any realtimebus error messages to atb.no
  var openAtb = function() {
    Browser.openTab('http://www.atb.no');
    Analytics.trackEvent('clickAtb');
    window.close();
  };
  $('#bus #atbLogo').click(openAtb);
  $('#bus .error').click(openAtb);

  // Bind oracle
  bindOracle();
  $('#oracle #name').click(function(){
    $('#oracle #question').focus();
  });

  // Bind buttons to hovertext
  $('#optionsButton').mouseenter(function() {
    optionsText(true);
  });
  $('#optionsButton').mouseleave(function() {
    optionsText(false);
  });

  $('#tipsButton').mouseenter(function() {
    tipsText(true);
  });
  $('#tipsButton').mouseleave(function() {
    tipsText(false);
  });

  $('#chatterButton').mouseenter(function() {
    chatterText(true);
  });
  $('#chatterButton').mouseleave(function() {
    chatterText(false);
  });
  $('#chatterIcon').mouseenter(function() {
    chatterText(true);
  });
  $('#chatterIcon').mouseleave(function() {
    chatterText(false);
  });

  // React to Konami code
  $(document).konami({
    code: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
    callback: function() {
      Analytics.trackEvent('toggleKonami');
      // Animate background
      $('head').append(([
        '<style type="text/css">',
          '@-webkit-keyframes adjustHue {',
          '0% { -webkit-filter: hue-rotate(0deg); }',
          '10% { -webkit-filter: hue-rotate(36deg); }',
          '20% { -webkit-filter: hue-rotate(72deg); }',
          '30% { -webkit-filter: hue-rotate(108deg); }',
          '40% { -webkit-filter: hue-rotate(144deg); }',
          '50% { -webkit-filter: hue-rotate(180deg); }',
          '60% { -webkit-filter: hue-rotate(216deg); }',
          '70% { -webkit-filter: hue-rotate(252deg); }',
          '80% { -webkit-filter: hue-rotate(288deg); }',
          '90% { -webkit-filter: hue-rotate(324deg); }',
          '100% { -webkit-filter: hue-rotate(360deg); }',
        '}</style>'
        ]).join('\n'));
      $('#background').attr('style','-webkit-animation:adjustHue 10s alternate infinite;');
    },
  });

  // Set the cursor to focus on the question field
  // (e.g. Chrome on Windows doesn't do this automatically so I blatantly blame Windows)
  $('#oracle #question').focus();

  // Enter main loop, keeping everything up-to-date
  var stayUpdated = function(now) {
    console.lolg(ONLINE_MESSAGE);
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
    console.lolg(OFFLINE_MESSAGE);
    clearInterval(intervalId)
    updateBus();
  });
  // Go
  if (navigator.onLine)
    stayUpdated(true);
  else
    mainLoop();
});
