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
      localStorage.closedSpecialNews = $('#specialNews a').attr('href');
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

    // Bind buttons to button hover text

    var toggleButtonText = function(buttons) {
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
      '#editButton': 'Endre innstillinger',
      '#tipsButton': 'Om appKom, changelog, ++',
      '#colorButton': 'Bytt fargepalett',
    }
    var slack = Affiliation.org[ls.affiliationKey1].slack;
    if (slack) {
      slack = 'Join us at ' + slack.match(/https?:\/\/(.*?)\//)[1];
      buttons['#chatterButton'] = slack;
    }
    toggleButtonText(buttons);

    // Button and logo clicks

    $('#editButton').click(function() {
      var toggled = ('img/popup-edit-done.png' === $(this).attr('src'));
      if (!toggled) {
        // Switch image and change other buttons
        $(this).attr('src', 'img/popup-edit-done.png').addClass('glow');
        $("img.popupbutton").not(this).each(function(index, value) {
          $(this).fadeOut();
        });
        setTimeout(function() {
          $("div#bigOptions").fadeIn();
        }, 600);
        // Show Done?-question in buttontext, leave it there until done
        $('#editButton').unbind('mouseenter mouseleave');
        $('#buttontext').text('Trykk på knappen når du er ferdig');
        // Slide in all options
        $("div.options").slideDown();
        $("div.content").slideUp();
        $("img#logo").animate({'opacity': '0.1'});
        $("img#atbLogo").animate({'opacity': '0.1'});
        $("div#oracle").slideUp();
        // Analytics
        Analytics.trackEvent('clickEdit');
      }
      else {
        // Switch image and change other buttons
        $(this).attr('src', 'img/popup-edit.png').removeClass('glow');
        $("div#bigOptions").fadeOut(function() {
          $("img.popupbutton").not(this).each(function(index, value) {
            $(this).fadeIn();
          });
        });
        // Switch back to regular hover texts for buttons
        $('#buttontext').html('Sweet! <3');
        toggleButtonText({'#editButton': 'Endre innstillinger'});
        // Slide away all options
        $("div.options").slideUp();
        $("div.content").slideDown();
        $("img#logo").animate({'opacity': '1.0'});
        $("img#atbLogo").animate({'opacity': '1.0'});
        $("div#oracle").slideDown();
        // Analytics
        Analytics.trackEvent('clickEditDone');
      }
    });

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
      $('#buttontext').text('Fargepalett satt til "' + colors[index].capitalize() + '"');
      // And track it
      Analytics.trackEvent('clickColor');
    });

    $('#logo').click(function() {
      var name = Affiliation.org[ls.affiliationKey1].name;
      Analytics.trackEvent('clickLogo', name);
      var web = Affiliation.org[ls.affiliationKey1].web;
      Browser.openTab(web);
      window.close();
    });
  },

  //
  // Event handler: Realtime bus
  //

  bindRealtimeBus: function() {

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
