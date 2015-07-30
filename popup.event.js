"use strict";

popup.event = {

  bindAll: function() {
    this.bindSpecialNews();
    this.bindTipsLinks();
    this.bindHeaderButtonsAndLogo();
    this.bindRealtimeBus();
    this.bindOracle();
    this.bindKonami();
  },

  //
  // Event handler: Special news
  //

  bindSpecialNews: function() {
    $('div#specialNews a').click(function() {
      Analytics.trackEvent('clickSpecialNews', $('#specialNews').text().trim());
      Browser.openTab($('#specialNews a').attr('href'));
      window.close();
    });
    $('div#specialNews img').click(function() {
      Analytics.trackEvent('closeSpecialNews', $('#specialNews').text().trim());
      ls.closedSpecialNews = $('#specialNews a').attr('href');
      $('#specialNews').slideUp();
    });
  },

  //
  // Event handler: Links in div#tips (in the <header>)
  //

  bindTipsLinks: function() {
    $('#tips a').click(function() {
      var link = $(this).attr('href');
      Browser.openTab(link);
      Analytics.trackEvent('clickTipsLink', link);
      window.close();
    });
  },

  //
  // Event handler: Header buttons and logo
  //

  bindHeaderButtonsAndLogo: function() {

    // Hovertexts for the buttons

    this.bindButtonText();

    // Button and logo clicks

    $('#editButton').click(function() {
      this.toggleOptions();
    }.bind(this));
    if (ls.everClickedEdit === 'false') {
      // If the user hasn't ever clicked that button, highlight it, it's an important button
      $('#editButton').addClass('glow');
    }

    $('#chatterButton').click(function() {
      var slack = Affiliation.org[ls.affiliationKey1].slack;
      Browser.openTab(slack);
      Analytics.trackEvent('clickChatter', ls.affiliationKey1);
      window.close();
    });

    $('#tipsButton').click(function() {
      $('div#tips').toggle();
      $('body').css('overflow-y', 'hidden');
      Analytics.trackEvent('clickTips');
    });
    $('div#tips:not(a)').click(function() {
      // This binds the whole background of the tips box
      $(this).toggle();
      $('body').css('overflow-y', '');
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
      // Text feedback, fades out after timeout
      $('#buttonText').text('Fargepalett satt til "' + colors[index].capitalize() + '"');
      // And track it
      Analytics.trackEvent('clickColor', colors[index].capitalize());
    });

    // UNCOMMENTED, see also popup.js, popup.less, popup.html, - search for "comic"
    // $('#comicButton').click(function() {
    //   if ($('div#comic').is(':visible')) {
    //     $('div#comic').slideUp();
    //   }
    //   else {
    //     $('div#comic').slideDown();
    //     Analytics.trackEvent('clickComic');
    //   }
    // });

    $('#logo').click(function() {
      var name = Affiliation.org[ls.affiliationKey1].name;
      Analytics.trackEvent('clickLogo', name);
      var web = Affiliation.org[ls.affiliationKey1].web;
      Browser.openTab(web);
      window.close();
    });
  },

  // Use this function to bind/unbind the button texts
  bindButtonText: function(overrideButtons, unbindAll) {
    var buttons = {};
    
    // Param overrideButtons lets you override default values like so:
    //    {'#editButton': 'Some non-default text to show when hovering'}
    // Param unbindAll is a boolean. If set all buttons are unbound, then
    //    only the ones specified in overrideButtons are rebound
    if (unbindAll) {
      var buttonNames = ['#editButton', '#tipsButton', '#colorButton', '#chatterButton'];
      for (var i in buttonNames) {
        $(buttonNames[i]).unbind('mouseenter mouseleave');
      }
    }
    else {
      buttons = {
        '#editButton': 'Endre innstillinger',
        '#tipsButton': 'Om Notifier, changelog, ++',
        '#comicButton': 'Dagens Lunch',
        '#colorButton': 'Bytt fargepalett',
      }
      // We have to specially construct the Slack button text
      var slack = Affiliation.org[ls.affiliationKey1].slack;
      if (slack) {
        slack = 'Join us at ' + slack.match(/https?:\/\/(.*?)\//)[1];
        buttons['#chatterButton'] = slack;
      }
    }

    // Add in any overriding arguments
    for (var selector in overrideButtons) {
      buttons[selector] = overrideButtons[selector];
    }

    // Now rebind the specified buttons to new texts
    for (var selector in buttons) {
      // Unbind
      $(selector).unbind('mouseenter mouseleave');
      // Rebind
      var textToShow = buttons[selector];
      $(selector).attr('data', textToShow);
      $(selector).hover(function() {
        var textToShowInner = $(this).attr('data');
        $('#buttonText').html(textToShowInner);
        $('#buttonText').toggle();
      });
    }
  },

  toggleOptions: function() {
    var toggled = ('img/popup-edit-done.png' === $('#editButton').attr('src')); // Hack
    if (!toggled) {
      // Switch image and change other buttons
      $('#editButton').attr('src', 'img/popup-edit-done.png').addClass('glow');
      $('div#normalButtons').fadeOut(function() {
        $("div#bigOptions").fadeIn();
      });
      // Change button text, unbind all other button texts
      $('#buttonText').html('Trykk på knappen når du er ferdig');
      this.bindButtonText({'#editButton': 'Trykk på knappen når du er ferdig'}, true);
      // Slide in all options
      $("div.content").slideUp()
      $("div.options").slideDown();
      // Slide away things the user doesn't need to see in options mode
      $("div#oracle").slideUp();
      // For affiliation news, options are shown only in div#left and div#right, hence div#full must slide away
      $('div#news div#full').slideUp();
      $('div#news div#left').slideDown();
      $('div#news div#right').slideDown();
      // Analytics
      Analytics.trackEvent('clickEdit');
      // Note the options page as opened so that it won't be opened automatically again
      ls.everClickedEdit = 'true'; // Will never be false again
    }
    else {
      // Switch image and change other buttons
      $('#editButton').attr('src', 'img/popup-edit.png').removeClass('glow');
      $('div#bigOptions').fadeOut(function() {
        $('div#normalButtons').fadeIn();
      });
      // Switch back to regular hover texts for buttons
      $('#buttonText').html('Sweet! <3');
      this.bindButtonText(); // Back to default
      // Slide away all options
      $("div.options").slideUp()
      $("div.content").slideDown();
      // Add back the other stuff that the user didn't need to see while in options mode
      $("div#oracle").slideDown();
      // For affiliation news, we must slide down the correct column and its news
      if (ls.showAffiliation2 === 'false') {
        $('div#news div#left').slideUp();
        $('div#news div#right').slideUp();
        $('div#news div#full').slideDown();
      }
      // Analytics
      Analytics.trackEvent('clickEditDone');
    }
  },

  //
  // Event handler: Realtime bus
  //

  bindRealtimeBus: function() {

    // Bind realtimebus lines to their timetables
    var timetables = JSON.parse(ls.busTimetables);
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
  },

  //
  // Event handler: Oracle
  //

  bindOracle: function() {

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

  },

  //
  // Event handler: Konami code
  //

  bindKonami: function() {
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
  },

};
