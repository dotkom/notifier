"use strict";

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

  loadBusOptionValues: function() {

    var loadBus = function(busField) {
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
    };

    loadBus('firstBus');
    loadBus('secondBus');
  },

  bindBusOptions: function() {
    // Give user suggestions for autocomplete of bus stops
    this.bindBusFields('firstBus');
    this.bindBusFields('secondBus');

    // Load lists of bus stops
    Stops.load();
  },

  bindBusFields: function(busField) {
    var cssSelector = '#' + busField;
    // console.log('Binding bus fields for ' + cssSelector);
    var self = this;

    var stop = $(cssSelector + ' input');
    var direction = $(cssSelector + ' select');

    //
    // Stop field -> Focus
    //

    $(stop).focus(function() {
      // Clear stop field on click
      console.log('focus - clear field and show saved value as placeholder');
      // Show suggestion sheet
      if (busField === 'firstBus') {
        $('div#busSuggestions').css({'left': '', 'right': '0'});
      }
      else {
        $('div#busSuggestions').css({'left': '0', 'right': ''});
      }
      $('div#busSuggestions').slideDown();
      // Keep the stop that has been "clicked away"
      ls.busStopClickedAway = ls[busField+'Name'];
      $(stop).val('');
      $(stop).attr('placeholder', ls.busStopClickedAway);
    });

    //
    // Stop field -> Lose focus
    //

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
        self.clearSuggestions();
      }
      // 1 suggestion, go for it!
      else if (suggestions.length === 1) {
        console.log('focusout - 1 suggestion, save it');
        var correctStop = suggestions[0];
        $(stop).val(correctStop);
        $('div#suggestions').html('<div class="correct">' + correctStop + '</div>');
        // Show final bus stop in suggestion sheet for a short while
        setTimeout(function() {
          self.clearSuggestions();
        }, 1500);
        self.getDirections(busField, correctStop);
        self.getFavoriteLines(busField);
        self.saveBus(busField);
      }
      // Several suggestions, allow the user to see them and click them for a short while
      else if (suggestions.length > 1) {
        console.log('focusout - several suggestions, remove them');
        setTimeout(function() {
          $('div#suggestions .suggestion').fadeOut(function() {
            self.clearSuggestions();
            if (ls.busStopClickedAway !== null) {
              $(stop).val(ls.busStopClickedAway);
            }
          });
        }, 500);
      }
      else {
        console.log('focusout - nothing to do');
        $('div#busSuggestions').slideUp(); // Hide suggestion sheet
      }
    });

    //
    // Stop field -> Key up
    //

    $(stop).keyup(function(event) {

      // Do nothing if arrow key or function key is pressed
      var k = event.keyCode;
      if ((37 <= k && k <= 40) || (17 <= k && k <= 18) || k === 91) {
        console.log('keyup - arrow key or function key, do nothing');
      }

      // If anything else is clicked, get suggestions
      else {
        console.log('keyup - getting suggestions');
        // Find the partial name
        var nameStart = $(stop).val();

        if (nameStart.length > 0) {
          // Suggestions
          var suggestions = Stops.partialNameToPotentialNames(nameStart);
          $('div#suggestions').html('');
          for (var i in suggestions) {
            var _text = suggestions[i];
            $('div#suggestions').append('<div class="suggestion">' + _text + '</div>');
          }

          // Only one suggestion? Inject it
          if (suggestions.length === 1) {
            var correctStop = suggestions[0];
            $(stop).val(correctStop);
            $(stop).blur();
            $('div#suggestions').html('<div class="correct">' + correctStop + '</div>');
            // Show final bus stop in suggestion sheet for a short while
            setTimeout(function() {
              self.clearSuggestions();
            }, 1500);
            self.getDirections(busField, correctStop);
            self.getFavoriteLines(busField);
            self.saveBus(busField);
          }
        }
        // All characters removed, remove suggestions
        else {
          $('div#suggestions').html(''); // Empty suggestion sheet
          // But don't remove it, because the user still focuses on the field
        }
        // After inserting new results, rebind suggestions, making them clickable
        self.bindSuggestions(busField);
      }
    });

    //
    // Direction field -> Change
    //

    $(direction).change(function() {
      // Get new favorite lines in case they are different, and save changes ofc
      self.getFavoriteLines(busField);
      self.saveBus(busField);
    });

    // Bind favorite bus lines fields as well
    this.bindFavoriteBusLines(busField);
  },

  bindFavoriteBusLines: function(busField) {
    var cssSelector = '#' + busField;
    var self = this;
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

  clearSuggestions: function() {
    $('div#suggestions').html(''); // Empty suggestion sheet
    $('div#busSuggestions').slideUp(); // Hide suggestion sheet
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
    // Analytics? No, we're not running analytics on bus stops, it would have privacy implications.
  },

  bindSuggestions: function(busField) {
    var self = this;
    $('.suggestion').unbind('click');
    $('.suggestion').click(function() {
      var text = $(this).text();
      $('#' + busField + ' input').val(text);
      self.getDirections(busField, text);
      self.getFavoriteLines(busField);
      self.saveBus(busField);
      $('div#suggestions .suggestion').fadeOut(50, function() {
        self.clearSuggestions();
      });
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
        // Remove old news immediately
        $('#news #full div.content article').remove(); // NOTE: Old news was stored in #full, not #left / #right
        // Fetch fresh news while the user is still tweaking options
        popup.update.affiliationNews('1');
        popup.update.affiliationNews('2');
      }
      else {
        $('select#affiliationKey2').attr('disabled', 'disabled');
        $('input#showNotifications2').attr('disabled', 'disabled');
        $('label[for="showNotifications2"]').css('color', 'grey');
        // Remove old news immediately
        $('#news #left div.content article').remove(); // NOTE: Old news was stored in #left / #right, not #full
        $('#news #right div.content article').remove(); // NOTE: Old news was stored in #left / #right, not #full
        // Fetch fresh news while the user is still tweaking options
        popup.update.affiliationNews('1');
        // Throw out news that won't be shown anymore
        ls.removeItem('affiliationNews2');
      }
      // Track
      Analytics.trackEvent('clickShowAffiliation2', this.checked);
    });
  },

  bindAffiliationSelector: function(number) {
    var isPrimaryAffiliation = (''+number === '1');
    var id = 'affiliationKey' + number;
    var newsSelector = 'div#news ' + (number === '1' ? 'div#left' : 'div#right');
    if (ls.showAffiliation2 === 'false') {
      newsSelector = 'div#news div#full';
    }

    var self = this;
    $('#' + id).change(function() {
      var newAffiliationKey = $(this).val();
      var oldAffiliationKey = ls[id];
      // Save
      ls[id] = newAffiliationKey;

      if (isPrimaryAffiliation) {

        // Affiliation settings: Popup
        applyAffiliationSettings(); // in popup.js
        // Affiliation settings: Extension Icon
        Browser.getBackgroundProcess().loadAffiliationIcon();
        // Affiliation settings: Hardware features
        self.toggleHardwareFeatures(oldAffiliationKey, newAffiliationKey);
        // Affiliation settings: Palette
        var palette = Affiliation.org[newAffiliationKey].palette;
        if (typeof palette !== 'undefined') {
          ls.affiliationPalette = palette;
          Palettes.load();
        }
      }

      // Affiliation news: Change news title (until overwritten by the popup.update.news function)
      $(newsSelector + ' .title').html(Affiliation.org[newAffiliationKey].name);
      // Affiliation news: Remove old news from last affiliation
      ls.removeItem('affiliationNews' + number);
      $(newsSelector + ' div.content article').remove();
      // Affiliation news: Request fresh news
      Browser.getBackgroundProcess().updateAffiliationNews(number, function() {
        popup.update.affiliationNews(number);
      });

      // Track
      Analytics.trackEvent('clickAffiliation'+number, newAffiliationKey);
    });
  },

  toggleHardwareFeatures: function(oldAffiliationKey, newAffiliationKey) {
    // Check if switching from or to an affiliation with hardware features
    var old_has_hardware = (Affiliation.org[oldAffiliationKey].hardware ? true : false);
    var new_has_hardware = (Affiliation.org[newAffiliationKey].hardware ? true : false);
    if (old_has_hardware && !new_has_hardware) {
      // Disable hardware features
      ls.coffeeSubscription = 'false';
      $('div#todays').slideUp();
    }
    else if (!old_has_hardware && new_has_hardware) {
      // Enable hardware features
      ls.coffeeSubscription = 'true';
      $('div#todays').slideDown();
      Browser.getBackgroundProcess().updateStatusAndMeetings(true);
    }
    // either way, change the icons shown in the office status feature
    if (new_has_hardware) {
      // Clear and update affiliation data
      Affiliation.clearAffiliationData();
      Browser.getBackgroundProcess().updateAffiliation();
    }
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

};
