
































































































































































































var bindBusFields = function(busField) {
  var cssSelector = '#' + busField;
  // console.log('Binding bus fields for ' + cssSelector);
  var fadeTime = 50;

  var stop = $(cssSelector + ' input');
  var direction = $(cssSelector + ' select');

  // Load users saved buses
  loadBus(busField);

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
      getDirections(busField, correctStop);
      getFavoriteLines(busField);
      saveBus(busField);
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
        getDirections(busField, realStopName);
        getFavoriteLines(busField);
        saveBus(busField);
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
          getDirections(busField, correctStop);
          getFavoriteLines(busField);
          saveBus(busField);
        }
      }
      // All characters removed, remove suggestions
      else {
        $('#busSuggestions .suggestion').fadeOut(fadeTime, function() {
          $('#busSuggestions').html(''  );
        });
      }
      // After inserting new results, rebind suggestions, making them clickable
      bindSuggestions();
    }
  });

  $(direction).change(function() {
    // Get new favorite lines in case they are different, and save changes ofc
    getFavoriteLines(busField);
    saveBus(busField);
  });

  bindFavoriteBusLines(busField);
}

var bindFavoriteBusLines = function(busField) {
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
    saveBus(busField);
  });
}

var getDirections = function(busField, correctStop) {
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
}

var getFavoriteLines = function(busField) {
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
    saveBus(busField);
    // Make the bus lines clickable
    bindFavoriteBusLines(busField);
  }

  // Hide the favorite lines after a short timeout
  setTimeout(function() {
    if (!$('#busBox').hasClass('hover')) {
      $('#busBox .lines').slideUp();
      $('#busBox #arrowDown').fadeIn();
    }
  }, 2500);
}

var saveBus = function(busField) {
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
  showSavedNotification();
  // Analytics? No, we're not running analytics on bus stops, it would have privacy implications.
}

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
      getFavoriteLines(busField);
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
}

var slideFavoriteBusLines = function() {
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
}

var bindSuggestions = function() {
  $('.suggestion').click(function() {
    if (typeof ls.busInFocus !== 'undefined') {
      var text = $(this).text();
      $('#' + ls.busInFocus + ' input').val(text);
      getDirections(ls.busInFocus, text);
      getFavoriteLines(ls.busInFocus);
      saveBus(ls.busInFocus);
      $('#busSuggestions .suggestion').fadeOut(50, function() {
        $('#busSuggestions').html('');
      });
    }
  });
}





























































































  // Give user suggestions for autocomplete of bus stops
  bindBusFields('firstBus');
  bindBusFields('secondBus');

  // Slide away favorite bus lines when not needed to conserve space
  slideFavoriteBusLines();

  // Load lists of bus stops
  Stops.load();
























































  if (ls.everOpenedOptions !== 'true') {
    // Note the options page as opened so that it won't be opened automatically again
    ls.everOpenedOptions = 'true'; // Will never be false again
  }


