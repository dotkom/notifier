popup.options = {

  loadAll: function() {
    this.loadBigOptionValues();
    this.loadCoffeeOptionValues();
    this.loadCantinaOptionValues();
    this.loadBusOptionValues();
    this.loadAffiliationOptionValues();
  },

  bindAll: function() {
    this.bindBigOptions();
    this.bindCoffeeOptions();
    this.bindCantinaOptions();
    this.bindBusOptions();
    this.bindAffiliationOptions();
  },

  //
  // Big options
  //

  loadBigOptionValues: function () {
    var showCantina = ('true' === ls.showCantina);
    $('input#showCantina').prop('checked', showCantina);
    var showBus = ('true' === ls.showBus);
    $('input#showBus').prop('checked', showBus);
  },

  bindBigOptions: function () {
    $('input#showCantina').click(function() {
      // Save
      ls[this.name] = this.checked;
      // Animate
      if (this.checked === true) {
        $('#cantinas').slideDown();
      }
      else {
        $('#cantinas').slideUp();
      }
      // Track
      Analytics.trackEvent('toggleCantinas', this.checked);
    });
    $('input#showBus').click(function() {
      // Save
      ls[this.name] = this.checked;
      // Animate
      if (this.checked === true) {
        $('#bus').slideDown();
      }
      else {
        $('#bus').slideUp();
      }
      // Track
      Analytics.trackEvent('toggleBus', this.checked);
    });
  },

  //
  // Coffee
  //

  loadCoffeeOptionValues: function() {
    var checked = ('true' === ls.coffeeSubscription);
    $('input#coffeeSubscription').prop('checked', checked);
  },

  bindCoffeeOptions: function() {
    var self = this;
    $('input#coffeeSubscription').click(function() {
      // Save
      ls[this.name] = this.checked;
      // Demo
      if (this.checked === true) {
        ls.activelySetCoffee = 'true';
        Coffee.showNotification();
      }
      else {
        // Note: activelySetCoffee is a reminder about what concious choice the user has made.
        // Don't override that choice with defaults later.
        ls.activelySetCoffee = 'true';
      }
      // Track
      Analytics.trackEvent('clickCoffeeOption', this.checked);
    });
  },

  //
  // Cantinas
  //

  loadCantinaOptionValues: function() {
    // Dropdowns
    $('#cantinas .first .options select').val(ls.cantina1);
    $('#cantinas .second .options select').val(ls.cantina2);
  },

  bindCantinaOptions: function() {

    var bindOption = function(selector, storageKey) {
      var cantina = '#cantinas ' + selector + ' ';

      // Content
      var title = cantina + '.title';
      var hoursBox = cantina + '.hours';
      var mealBox = cantina + '.mealBox';

      // Options
      var selectCantina = cantina + 'select';

      // Handle change
      $(selectCantina).change(function () {
        // Save
        ls[storageKey] = this.value; // ls.cantina1, ls.cantina2
        // Set new title
        var name = Cantina.names[this.value];
        $(title).text(name);
        // Add loading bar
        $(hoursBox).html('');
        $(mealBox).html('<img class="loadingLeft" src="img/loading.gif" />');
        // Prepare for connection error
        window._cantinaOptionTimeout_ = setTimeout(function() {
          $(hoursBox).html('');
          $(mealBox).html(Cantina.msgConnectionError);
        }, 6000);
        // Load
        Browser.getBackgroundProcess().updateCantinas(function () {
          clearTimeout(window._cantinaOptionTimeout_);
          popup.update.cantinas();
        });
        // Track
        Analytics.trackEvent('clickCantinaOption', name);
      });
    }
    // Hit it
    bindOption('.first', 'cantina1');
    bindOption('.second', 'cantina2');
  },

  //
  // Bus
  //

  loadBusOptionValues: function() {},

  bindBusOptions: function() {



    // Give user suggestions for autocomplete of bus stops
    this.bindBusFields('firstBus');
    this.bindBusFields('secondBus');

    // Slide away favorite bus lines when not needed to conserve space
    this.slideFavoriteBusLines();

    // Load lists of bus stops
    Stops.load();
  },

  bindBusFields: function(busField) {
    var cssSelector = '#' + busField;
    // console.log('Binding bus fields for ' + cssSelector);
    var fadeTime = 50;

    var stop = $(cssSelector + ' input');
    var direction = $(cssSelector + ' select');

    // Load users saved buses
    this.loadBus(busField);

    $(stop).focus(function() {
      // Clear stop field on click
      console.log('focus - clear field and show saved value as placeholder');
      ls.busStopClickedAway = ls[busField+'Name'];
      $(stop).val('');
      $(stop).attr('placeholder', ls.busStopClickedAway);
    });

    $(stop).focusout(function() {

      // Lost focus, suggestions on busstops?
      var partialStop = $(stop).val();
      var suggestions = Stops.partialNameToPotentialNames(partialStop);

      // No input, revert to the busstop that was clicked away
      if (partialStop === '' || suggestions.length === 0) {
        console.log('focusout - empty field or invalid input, return to last saved value');
        if (ls.busStopClickedAway !== null) {
          $(stop).val(ls.busStopClickedAway);
        }
        $('#busSuggestions').html('');
      }
      // 1 suggestion, go for it!
      else if (suggestions.length === 1) {
        console.log('focusout - 1 suggestion, save it');
        var correctStop = suggestions[0];
        $(stop).val(correctStop);
        $('#busSuggestions').html('');
        this.getDirections(busField, correctStop);
        this.getFavoriteLines(busField);
        this.saveBus(busField);
      }
      // Several suggestions, allow the user to see them and click them for a short while
      else if (suggestions.length > 1) {
        console.log('focusout - several suggestions, remove them');
        setTimeout(function() {
          $('#busSuggestions .suggestion').fadeOut(function() {
            $('#busSuggestions').html('');
          });
        }, 5000);
      }
      else {
        console.log('focusout - nothing to do');
      }
    });

    $(stop).keyup(function(event) {

      // Do nothing if arrow key or function key is pressed
      var k = event.keyCode;
      if ((37 <= k && k <= 40) || (17 <= k && k <= 18) || k === 91) {
        console.log('keyup - arrow key or function key, do nothing');
      }

      // If Enter is clicked, check it and save it
      else if (event.keyCode === 13) {
        console.log('keyup - enter, checking input');
        var possibleStop = $(stop).val();
        var suggestions = Stops.nameToIds(possibleStop);
        if (suggestions.length !== 0) {
          var realStopName = Stops.idToName(suggestions[0]);
          $(stop).val(realStopName);
          // then empty the suggestion list
          $('#busSuggestions').html('');
          // then show only the correct stop for a little over a second
          var suggestion = $('<div class="correct">' + realStopName + '</div>').hide();
          $('#busSuggestions').append(suggestion);
          $(suggestion).fadeIn();
          setTimeout(function() {
            $('#busSuggestions .correct').fadeOut(fadeTime);
            setTimeout(function() {
              $('#busSuggestions').html('');
            }, 300);
          }, 1200);
          // and of course, save and get directions
          this.getDirections(busField, realStopName);
          this.getFavoriteLines(busField);
          this.saveBus(busField);
        }
      }

      // If anything else is clicked, get suggestions
      else {
        console.log('keyup - getting suggestions');
        // Save the id of the bus field in focus
        ls.busInFocus = $(stop).parent().attr('id');
        // Find the partial name
        var nameStart = $(stop).val();

        if (nameStart.length > 0) {
          // Suggestions
          var suggestions = Stops.partialNameToPotentialNames(nameStart);
          $('#busSuggestions').html('');
          for (var i in suggestions) {
            var _text = suggestions[i];
            var suggestion = $('<div class="suggestion">' + _text + '</div>').hide();

            $('#busSuggestions').append(suggestion);
            $(suggestion).fadeIn();
          }

          // Only one suggestion? Inject it
          if (suggestions.length === 1) {
            var correctStop = suggestions[0];
            $(stop).val(correctStop);
            $(stop).blur();
            $('#busSuggestions').html('');
            suggestion = $('<div class="correct">' + correctStop + '</div>').hide();
            $('#busSuggestions').append(suggestion);
            $(suggestion).fadeIn();
            setTimeout(function() {
              $('#busSuggestions .correct').fadeOut(fadeTime);
              setTimeout(function() {
                $('#busSuggestions').html('');
              }, 300);
            }, 1200);
            this.getDirections(busField, correctStop);
            this.getFavoriteLines(busField);
            this.saveBus(busField);
          }
        }
        // All characters removed, remove suggestions
        else {
          $('#busSuggestions .suggestion').fadeOut(fadeTime, function() {
            $('#busSuggestions').html(''  );
          });
        }
        // After inserting new results, rebind suggestions, making them clickable
        this.bindSuggestions();
      }
    });

    $(direction).change(function() {
      // Get new favorite lines in case they are different, and save changes ofc
      this.getFavoriteLines(busField);
      this.saveBus(busField);
    });

    this.bindFavoriteBusLines(busField);
  },

  bindFavoriteBusLines: function(busField) {
    var self = this;
    var cssSelector = '#' + busField;
    // Switch status on click
    $(cssSelector + ' .lines .line').click(function() {
      // Switch status and save
      if ($(this).hasClass('active')) {
        $(this).attr('class', 'inactive');
      }
      else if ($(this).hasClass('inactive')) {
        $(this).attr('class', 'active');
      }
      else {
        console.error('Favorite bus line <span> with neither .active nor .inactive');
      }
      self.saveBus(busField);
    });
  },

  getDirections: function(busField, correctStop) {
    var cssSelector = '#' + busField;
    var stopName = $(cssSelector + ' input');
    var directionField = $(cssSelector + ' select');
    // Get and inject possible directions for correct stop
    var allDirections = Stops.nameToDirections(correctStop);
    $(directionField).html('');
    for (var i in allDirections) {
      var direction = allDirections[i];
      $(directionField).append('<option>' + direction + '</option>');
    }
  },

  getFavoriteLines: function(busField) {
    var cssSelector = '#' + busField;

    // Show it
    $('#busBox .lines').slideDown();
    $('#busBox #arrowDown').fadeOut();

    // Get stopname, direction, stopid
    var stopName = $(cssSelector + ' input').val();
    var direction = $(cssSelector + ' select').val();
    // Get and inject possible lines for correct stop
    var busStopId = Stops.nameAndDirectionToId(stopName, direction);
    // Load lines for that bus stop
    var lines = Favorite.getLinesForStop(busStopId);

    // Error message? (string)
    if (typeof lines === 'string') {
      $(cssSelector + ' .lines').html('<span class="error">'+lines+'</span>');
    }
    else {
      // Add lines to bus stop
      $(cssSelector + ' .lines').html('<table border="0" cellpadding="0" cellspacing="0"><tr>');
      var counter = 0;
      for (var i in lines) {
        var line = lines[i];
        if (counter % 4 === 0) {
          $(cssSelector + ' .lines table').append('</tr><tr>');
        }
        $(cssSelector + ' .lines table tr:last').append('<td class="line active">'+line+'</td>');
        counter++;
      }
      $(cssSelector + ' .lines').append('</tr></table>');

      // Save the newly added lines
      this.saveBus(busField);
      // Make the bus lines clickable
      this.bindFavoriteBusLines(busField);
    }

    // Hide the favorite lines after a short timeout
    setTimeout(function() {
      if (!$('#busBox').hasClass('hover')) {
        $('#busBox .lines').slideUp();
        $('#busBox #arrowDown').fadeIn();
      }
    }, 2500);
  },

  saveBus: function(busField) {
    var cssSelector = '#' + busField;
    // Get stopname, direction, stopid
    var stopName = $(cssSelector + ' input').val();
    var direction = $(cssSelector + ' select').val();
    var busStopId = Stops.nameAndDirectionToId(stopName, direction);
    // Get active/inactive lines
    var activeLines = [];
    $(cssSelector + ' .lines .active').each(function() {
      activeLines.push(Number($(this).text()));
    });
    var inactiveLines = [];
    $(cssSelector + ' .lines .inactive').each(function() {
      inactiveLines.push(Number($(this).text()));
    });
    // Save all to localStorage
    ls[busField] = busStopId;
    ls[busField + 'Name'] = stopName;
    ls[busField + 'Direction'] = direction;
    ls[busField + 'ActiveLines'] = JSON.stringify(activeLines);
    ls[busField + 'InactiveLines'] = JSON.stringify(inactiveLines);
    console.log('saved activeLines for '+busField, '"', activeLines, '"');
    console.log('saved inactiveLines '+busField, '"', inactiveLines, '"');
    console.log('saved for busStopId ' + busStopId);
    // Track? No, we're not running analytics on bus stops, it would have privacy implications.
  },

  loadBus: function(busField) {
    var cssSelector = '#' + busField;
    var stopName = ls[busField + 'Name'];
    var direction = ls[busField + 'Direction'];
    var activeLines = ls[busField + 'ActiveLines'];
    var inactiveLines = ls[busField + 'InactiveLines'];

    // Add stopname and direction to busfields
    if (typeof stopName !== 'undefined' && typeof direction !== 'undefined') {
      $(cssSelector + ' input').val(stopName);
      $(cssSelector + ' select').val(direction);
      // console.log('loaded "' + stopName + '" to "' + busField + '"');
    }

    // Add active and inactive lines to busfields
    if (typeof activeLines !== 'undefined' && typeof inactiveLines !== 'undefined') {
      // If the page just opened and there are no favorite lines then get some
      if (activeLines === '' && inactiveLines === '') {
        this.getFavoriteLines(busField);
      }
      else {
        activeLines = JSON.parse(activeLines); // stringified array
        inactiveLines = JSON.parse(inactiveLines); // stringified array
        // Collect active and inactive lines to a single dict
        // with boolean values showing active or inactive
        var lines = {};
        for (var i in activeLines) {
          var line = activeLines[i]
          lines[line] = true;
        }
        for (var i in inactiveLines) {
          var line = inactiveLines[i]
          lines[line] = false;
        }
        // Sort the dict by keys (bus line numbers sorted in ascending order)
        var keys = [];
        for (var i in lines) {
          keys.push(i);
        }
        keys = keys.sort(function(a,b) {
          return a - b;
        });
        // Add lines to bus stop as a generated table
        $(cssSelector + ' .lines').html('<table border="0" cellpadding="0" cellspacing="0"><tr>');
        var counter = 0;
        for (var i in keys) {
          var i = keys[i];
          if (counter % 4 == 0) {
            $(cssSelector + ' .lines table').append('</tr><tr>');
          }
          var status = (lines[i] === true ? 'active' : 'inactive');
          $(cssSelector + ' .lines table tr:last').append('<td class="line '+status+'">'+i+'</td>');
          counter++;
        }
        $(cssSelector + ' .lines').append('</tr></table>');
      }
    }
  },

  slideFavoriteBusLines: function() {
    // Hide the favorite bus line spans from the start
    setTimeout(function() {
      if (!$('#busBox').hasClass('hover')) {
        $('#busBox .lines').slideUp();
        $('#busBox #arrowDown').fadeIn();
      }
    }, 1500);
    // Show favorite bus line spans when hovering
    $('#busBox').mouseenter(function() {
      clearTimeout($(this).data('timeoutId'));
      $('#busBox .lines').slideDown();
      $('#busBox #arrowDown').fadeOut();
    });
    $('#busBox').mouseleave(function() {
      var timeoutId = setTimeout(function() {
        if ($('#busBox .lines img').length === 0) { // currently displaying loading gifs?
          $('#busBox .lines').slideUp();
          $('#busBox #arrowDown').fadeIn();
        }
      }, 500);
      // Set the timeoutId, allowing us to clear this trigger if the mouse comes back over
      $('#busBox').data('timeoutId', timeoutId);
    });
  },

  bindSuggestions: function() {
    $('.suggestion').click(function() {
      if (typeof ls.busInFocus !== 'undefined') {
        var text = $(this).text();
        $('#' + ls.busInFocus + ' input').val(text);
        this.getDirections(ls.busInFocus, text);
        this.getFavoriteLines(ls.busInFocus);
        this.saveBus(ls.busInFocus);
        $('#busSuggestions .suggestion').fadeOut(50, function() {
          $('#busSuggestions').html('');
        });
      }
    });
  },

  //
  // Affiliation
  //

  loadAffiliationOptionValues: function() {

    // Show affiliation 2
    var showAffiliation2 = ('true' === ls.showAffiliation2);
    $('input#showAffiliation2').prop('checked', showAffiliation2);
    if (!showAffiliation2) {
      $('select#affiliationKey2').prop('disabled', 'disabled');
      $('input#showNotifications2').prop('disabled', 'disabled');
      $('label[for="showNotifications2"]').css('color', 'grey');
    }

    // Affiliations
    $('select#affiliationKey1').val(ls.affiliationKey1);
    $('select#affiliationKey2').val(ls.affiliationKey2);

    // Notifications
    var showNotifications1 = ('true' === ls.showNotifications1);
    $('input#showNotifications1').prop('checked', showNotifications1);
    var showNotifications2 = ('true' === ls.showNotifications2);
    $('input#showNotifications2').prop('checked', showNotifications2);
  },

  bindAffiliationOptions: function() {
    // Show affiliation 2?
    this.bindShowAffiliation2();

    // Affiliations
    this.bindAffiliationSelector('1');
    this.bindAffiliationSelector('2');

    // Notifications
    this.bindAffiliationNotifications('1');
    this.bindAffiliationNotifications('2');
  },

  bindShowAffiliation2: function() {
    $('input#showAffiliation2').click(function() {
      // Save
      ls.showAffiliation2 = this.checked;
      // React
      if (this.checked) {
        $('select#affiliationKey2').removeAttr('disabled');
        $('input#showNotifications2').removeAttr('disabled');
        $('label[for="showNotifications2"]').css('color', '');
      }
      else {
        $('select#affiliationKey2').attr('disabled', 'disabled');
        $('input#showNotifications2').attr('disabled', 'disabled');
        $('label[for="showNotifications2"]').css('color', 'grey');
      }
      // Track
      Analytics.trackEvent('clickShowAffiliation2', this.checked);
    });
  },

  bindAffiliationSelector: function(number) {
    var isPrimaryAffiliation = (''+number === '1');
    var id = 'affiliationKey' + number;
    var affiliationKey = ls[id];
    var newsSelector = '#news ' + (number === '1' ? '#left' : '#right');

    var self = this;
    $('#' + id).change(function() {
      var affiliationKey = $(this).val();
      var oldAffiliation = ls[id];
      // Save
      ls[id] = affiliationKey;

      if (isPrimaryAffiliation) {

        // Affiliation settings: Popup
        applyAffiliationSettings(); // in popup.js
        // Affiliation settings: Extension Icon
        Browser.getBackgroundProcess().loadAffiliationIcon();
        // Affiliation settings: Palette
        var palette = Affiliation.org[affiliationKey].palette;
        if (typeof palette !== 'undefined') {
          ls.affiliationPalette = palette;
          Palettes.load();
        }

        // Check if switching from or to an affiliation with hardware features
        var old_has_hardware = (Affiliation.org[oldAffiliation].hw ? true : false);
        var new_has_hardware = (Affiliation.org[affiliationKey].hw ? true : false);
        if (old_has_hardware && !new_has_hardware) {
          self.disableHardwareFeatures();
        }
        else if (!old_has_hardware && new_has_hardware) {
          self.enableHardwareFeatures();
        }
        // either way, change the icons shown in the office status feature
        if (new_has_hardware) {
          // Clear and update affiliation data
          Affiliation.clearAffiliationData();
          Browser.getBackgroundProcess().updateAffiliation();
        }
      }

      // Affiliation news: Change news title (until overwritten by the popup.update.news function)
      $(newsSelector + ' .title').html(Affiliation.org[affiliationKey].name);
      // Affiliation news: Remove old news from last affiliation
      ls.removeItem('affiliationNews' + number);
      $(newsSelector + ' div.articles article').remove();
      // Affiliation news: Request fresh news
      Browser.getBackgroundProcess().updateAffiliationNews(number, function() {
        popup.update.affiliationNews(number);
      });

      // Analytics
      Analytics.trackEvent('clickAffiliation'+number, affiliationKey);
    });
  },

  bindAffiliationNotifications: function(number) {
    number = ''+number;
    var id = 'show' + number;
    var self = this;
    $('input#showNotifications' + number).click(function() {
      // Save
      ls[this.id] = this.checked;
      // Demo notification
      if (this.checked === true) {
        News.showNotification({
          demo: true,
          key: ls['affiliationKey' + number],
        });
      }
      // Track
      Analytics.trackEvent('clickShowNotifications' + number, this.checked);
    });
  },

  disableHardwareFeatures: function() {
    ls.coffeeSubscription = 'false';
    $('div#todays').slideUp();
  },

  enableHardwareFeatures: function(quick) {
    ls.coffeeSubscription = 'true';
    $('div#todays').slideDown();
    // FIXME this is probably overkill:
    // // Update office status
    // Browser.getBackgroundProcess().updateStatusAndMeetings(true);
  },

};
