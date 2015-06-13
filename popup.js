"use strict";

var iteration = 0;
var intervalId = null;

var mainLoop = function(force) {
  console.log("\n#" + iteration);

  if (ls.showCantina === 'true')
    if (force || iteration % UPDATE_CANTINAS_INTERVAL === 0)
      popup.update.cantinas();
  if (ls.showAffiliation1 === 'true')
    if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
      popup.update.affiliationNews('1');
  if (ls.showAffiliation2 === 'true')
    if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
      popup.update.affiliationNews('2');
  // Only if hardware
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (ls.showStatus === 'true') {
      if (force || iteration % UPDATE_AFFILIATION_INTERVAL === 0) {
        Browser.getBackgroundProcess().updateAffiliation(function() {
          popup.update.meeting();
          popup.update.servant();
          popup.update.coffee();
          // popup.update.status(); // TODO: No status info in popup yet
        });
      }
    }
  }
  // Always update, tell when offline
  if (ls.showBus === 'true')
    if (force || iteration % UPDATE_BUS_INTERVAL === 0)
      popup.update.bus();

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
    Browser.getBackgroundProcess().popup.update.cantinas(function () {
      clearTimeout(window.cantinaTimeout);
      popup.update.cantinas();
    });
  });
};
cantinaChangeHandler('.first', 'cantina1');
cantinaChangeHandler('.second', 'cantina2');

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
  var buttons = {
    '#optionsButton': 'Endre innstillinger',
    '#tipsButton': 'Om appKom, tips, linker, ++',
    '#colorButton': 'Bytt fargepalett',
  }
  var slack = Affiliation.org[ls.affiliationKey1].slack;
  if (slack) {
    slack = 'Join us at ' + slack.match(/https?:\/\/(.*?)\//)[1];
    buttons['#chatterButton'] = slack;
  }
  fadeButtonText(buttons);

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
    $('#tips').toggle();
      Analytics.trackEvent('clickTips');
  });
  $('#tips:not(a)').click(function() {
    $(this).toggle();
  });

  $('#colorButton').click(function() {
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
    $('#buttontext').text('Fargepalett satt til "' + colors[index].capitalize() + '"');
    // And track it
    Analytics.trackEvent('clickColor');
  });
};

//
// Event handlers: Header: Links in tips box
//

var bindTipsLinks = (function _bindTipsLinks_() {
  $('#tips a').click(function() {
    var link = $(this).attr('href');
    Browser.openTab(link);
    Analytics.trackEvent('clickTipsLink', link);
    window.close();
  });
  return _bindTipsLinks_; // Make function callable even after self executing
})(); // Self executing

// Add CHANGELOG.md to div#tips
(function() {
  Ajaxer.getPlainText({
    url: "CHANGELOG.md",
    success: function(data) {
      var converter = new Markdown.Converter();
      var html = converter.makeHtml(data);
      $("div#changelog").html(html);
      // Rebind tips links
      bindTipsLinks();
    },
    error: function(e) {
      console.error('Could not include CHANGELOG.md because:', e);
    },
  });
}()); // Self executing

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
    popup.update.bus();
  });
  // Go
  if (navigator.onLine)
    stayUpdated(true);
  else
    mainLoop();

});
