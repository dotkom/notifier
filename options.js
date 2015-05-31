"use strict";

var ls = localStorage;

var showSavedNotification = function() {
  $("#notification").fadeIn(200);
  setTimeout(function() {
    $("#notification").fadeOut(200);
  }, 800);
}

var pageFlipCursorBlinking = function() {
  setInterval(function() {
    $(".pageflipcursor").animate({opacity: 0}, "fast", "swing", function() {
      $(this).animate({opacity: 1}, "fast", "swing");
    });
  }, 600);
}

var loopCreatorName = function() {
  setInterval(function() {
    var namesAsRegex = new RegExp(ls.extensionOwner + '|' + ls.extensionCreator, 'gi');
    var currentName = $('#pagefliptyping').text().match(namesAsRegex)[0];
    if (currentName === ls.extensionOwner)
      changeCreatorName(ls.extensionCreator);
    else
      changeCreatorName(ls.extensionOwner);
  }, 60000);
}

var testDesktopNotification = function() {
  News.showNotification();
}

var testCoffeeSubscription = function() {
  Coffee.showNotification();
}

var bindAffiliationSelector = function(number, isPrimaryAffiliation) {
  var id = 'affiliationKey'+number;
  var affiliationKey = ls[id];
  // Default values, set only the chosen affiliation as selected, because it is the Chosen One
  $('#'+id).val(affiliationKey);
  // React to change
  $('#'+id).change(function() {
    var affiliationKey = $(this).val();
    var oldAffiliation = ls[id];
    // Save the change
    ls[id] = affiliationKey;

    if (!isPrimaryAffiliation) {
      // Symbol
      var symbol = Affiliation.org[ls.affiliationKey2].symbol;
      $('#affiliation2Symbol').attr('style', 'background-image:url("'+symbol+'");');
      // Website link
      var web = Affiliation.org[ls.affiliationKey2].web
      $('#affiliation2Symbol').unbind('click');
      $('#affiliation2Symbol').click(function() {
        Browser.openTab(web);
      });
    }
    else {
      // Check if switching from or to an affiliation with fancy features
      var old_has_hardware = (Affiliation.org[oldAffiliation].hw ? true : false);
      var new_has_hardware = (Affiliation.org[affiliationKey].hw ? true : false);
      if (old_has_hardware && !new_has_hardware) {
        disableHardwareFeatures();
      }
      else if (!old_has_hardware && new_has_hardware) {
        enableHardwareFeatures();
      }
      // either way, change the icons shown in the office status feature
      if (new_has_hardware) {
        changeStatusIcons();
        // Clear and update affiliation data
        Affiliation.clearAffiliationData();
        Browser.getBackgroundProcess().updateAffiliation();
      }

      // Palette
      var palette = Affiliation.org[affiliationKey].palette;
      if (typeof palette !== 'undefined') {
        $('#affiliationPalette').val(palette);
        ls.affiliationPalette = palette;
        // Applying chosen palette
        $('#palette').attr('href', Palettes.get(palette));
      }

      // Extension icon
      var icon = Affiliation.org[affiliationKey].icon;
      Browser.setIcon(icon);
      // Favicon
      $('link[rel="shortcut icon"]').attr('href', icon);
      // Symbol
      var symbol = Affiliation.org[affiliationKey].symbol;
      $('#affiliation1Symbol').attr('style', 'background-image:url("'+symbol+'");');
      // "Popup here"-bubble
      $('#popupHere img.icon').attr('src', symbol);
      // Website link
      var web = Affiliation.org[affiliationKey].web;
      $('#affiliation1Symbol').unbind('click');
      $('#affiliation1Symbol').click(function() {
        Browser.openTab(web);
      });
      // Name to badge title and localstorage
      var name = Affiliation.org[affiliationKey].name;
      Browser.setTitle(name + ' Notifier');
      ls.extensionName = name + ' Notifier';
    }

    // Throw out old news
    ls.removeItem('affiliationNews'+number);

    if (ls['showAffiliation'+number] === 'true') {
      // Update to new feed
      Browser.getBackgroundProcess().updateAffiliationNews(number);
    }

    // Display Saved<3
    showSavedNotification();
    // Analytics
    Analytics.trackEvent('clickAffiliation'+number, affiliationKey);
    // Display popup here with new icon
    popupHere(3000);
  });
}

var bindPaletteSelector = function() {
  // Default values
  $('#affiliationPalette').val(ls.affiliationPalette);
  // React to change
  $('#affiliationPalette').change(function() {
    // Get newly set value
    var palette = $(this).val();
    // Save it
    ls.affiliationPalette = palette;
    // Applying palette to options page
    console.log('Applying chosen palette', palette);
    $('#palette').attr('href', Palettes.get(palette));
    // Display Saved<3
    showSavedNotification();
    // Analytics
    Analytics.trackEvent('clickPalette', palette);
  });
}

var disableHardwareFeatures = function(quick) {
  ls.showStatus = 'false';
  ls.coffeeSubscription = 'false';
  if (quick) {
    $('label[for="showStatus"]').slideUp({duration:0});
    $('label[for="coffeeSubscription"]').slideUp({duration:0});
    $('#container').css('top', '60%');
    $('header').css('top', '60%');
    // No need to change creator name in pageflip when quick-disabling
  }
  else {
    // Hide office status option
    $('label[for="showStatus"]').slideUp('slow');
    // Hide coffee subscription option
    $('label[for="coffeeSubscription"]').slideUp('slow', function() {
      // Move all content back down
      $('#container').animate({'top':'60%'}, 300);
      $('header').animate({'top':'60%'}, 300);
    });
  }
}

var enableHardwareFeatures = function(quick) {
  ls.showStatus = 'true';
  ls.coffeeSubscription = 'true';
  restoreChecksToBoxes();
  if (quick) {
    $('label[for="showStatus"]').slideDown({duration:0});
    $('label[for="coffeeSubscription"]').slideDown({duration:0});
    $('#container').css('top', '50%');
    $('header').css('top', '50%');
    // No need to change creator name in pageflip when quick-enabling
  }
  else {
    // Update office status
    Browser.getBackgroundProcess().updateStatusAndMeetings(true);
    // Move all content back up
    $('#container').animate({'top':'50%'}, 300);
    $('header').animate({'top':'50%'}, 300, function() {
      // Show office status option
      $('label[for="showStatus"]').slideDown('slow');
      // Show coffee subscription option
      $('label[for="coffeeSubscription"]').slideDown('slow');
    });
  }
}

var changeStatusIcons = function() {
  if (Affiliation.org[ls.affiliationKey1].hw) {
    var statusIcons = Affiliation.org[ls.affiliationKey1].hw.statusIcons;
    $('img.icon.open').attr('src', statusIcons.open);
    $('img.icon.closed').attr('src', statusIcons.closed);
    $('img.icon.meeting').attr('src', statusIcons.meeting);
    $('#statusOverlay').attr('src', statusIcons.open);
  }
}

var bindCantinaSelector = function(selector) {
  // Default values
  $('#' + selector).val(ls[selector]);
  // React to change
  $('#' + selector).change(function() {
    var cantina = $(this).prop('value');
    ls[selector] = cantina;
    Analytics.trackEvent('clickCantina', cantina);
    Browser.getBackgroundProcess().updateCantinas();
  });
}

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

var toggleBigscreen = function(activate, type, force) {
  var run = function() {
    if (activate) {
      // Welcome to callback hell, - be glad it's well commented
      var speed = 400;
      var url = type + '.html';
      // Load bigscreen preview
      $('#bigscreenPreview').attr('src', url);
      // Remove subtext
      $('#headerText').fadeOut();
      // No hw-features? Move content higher up on the page
      if (!Affiliation.org[ls.affiliationKey1].hw) {
        $('#container').animate({'top':'50%'}, speed);
        $('header').animate({'top':'50%'}, speed);
      }
      // Animate away options for news notifications and coffee subscription
      $('#bigscreenSlider').slideUp(speed, function() {
        // Animate the useBigscreen image
        $('img#useBigscreen').slideUp(speed, function() {
          // Animate in the bigscreen preview
          $('#bigscreenPreview').slideDown(speed, function() {
            // New logo subtext
            if (type === 'infoscreen') {
              $('#headerText').html('<b>Infoscreen</b> Options');
            }
            else if (type === 'officescreen') {
              $('#headerText').html('<b>Officescreen</b> Options');
            }
            $('#headerText').fadeIn(function() {
              var name = Affiliation.org[ls.affiliationKey1].name
              if (type === 'infoscreen') {
                name = name + ' Infoscreen';
              }
              else if (type === 'officescreen') {
                name = name + ' Officescreen';
              }
              // Reset icon, icon title and icon badge
              Browser.setIcon(Affiliation.org[ls.affiliationKey1].icon);
              Browser.setTitle(name);
              Browser.setBadgeText('');
              // Create Bigscreen in a new tab
              Browser.openBackgroundTab(url);
            });
          });
        });
      });
    }
    else {
      // Refresh office status
      if (Affiliation.org[ls.affiliationKey1].hw) {
        Browser.getBackgroundProcess().updateStatusAndMeetings(true);
      }
      else {
        Browser.setIcon(Affiliation.org[ls.affiliationKey1].icon);
        Browser.setTitle(Affiliation.org[ls.affiliationKey1].name + ' Notifier');
      }
      // Animations
      revertBigscreen();
    }
  }
  // Wait till after the modal is properly closed
  setTimeout(run, 500);
}

var switchBigScreen = function(type) {
  if (type !== 'infoscreen' && type !== 'officescreen') {
    console.error('Unsupported infoscreen mode: "'+type+'"');
    return;
  }
  // Wait till after the modal is properly closed
  var run = function() {
    var speed = 600;
    // Slide away the bigscreen preview
    $('#bigscreenPreview').slideUp(speed, function() {
      // Switch bigscreen preview
      var url = type + '.html';
      $('#bigscreenPreview').attr('src', url);
      // Fade out header
      $('#headerText').fadeOut(function() {
        // Change header
        if (type === 'infoscreen') {
          $('#headerText').html('<b>Infoscreen</b> Options');
        }
        else if (type === 'officescreen') {
          $('#headerText').html('<b>Officescreen</b> Options');
        }
        // Fade header back in
        $('#headerText').fadeIn(function() {
          // Wait for loading (looks better when the bigscreen is properly loaded)
          setTimeout(function() {
            // Slide bigscreen preview back down
            $('#bigscreenPreview').slideDown(speed);
          }, 500);
        });
      });
    });
  }
  // Wait till after the modal is properly closed
  setTimeout(run, 500);
}

var revertBigscreen = function() {
  // Wait till after the modal is properly closed
  var run = function() {
    var speed = 300;
    // Remove subtext
    $('#headerText').fadeOut(speed, function() {
      // No hw-features? Move content further down the page
      if (!Affiliation.org[ls.affiliationKey1].hw) {
        $('#container').animate({'top':'60%'}, speed);
        $('header').animate({'top':'60%'}, speed);
      }
      // Animate in the bigscreen preview
      $('#bigscreenPreview').slideUp(speed, function() {
        // Animate the useBigscreen image
        $('img#useBigscreen').slideDown(speed, function() {
          // Slide more options back open
          $('#bigscreenSlider').slideDown(speed, function() {
            // Back to old logo subtext
            $('#headerText').html('<b>Notifier</b> Options');
            $('#headerText').fadeIn(function() {
              // Finally, unload bigscreen preview (resource heavy)
              $('#bigscreenPreview').attr('src', 'about:blank');
            });
          });
        });
      });
    });
  }
  // Wait till after the modal is properly closed
  setTimeout(run, 500);
}

var restoreChecksToBoxes = function() {
  // Restore checks to boxes from localStorage
  $('input:checkbox').each(function(index, element) {
    if (ls[element.id] === 'true') {
      element.checked = true;
    }
  });
}

var changeCreatorName = function(name) {
  // Stop previous changeCreatorName instance, if any
  clearTimeout(Number(ls.animateCreatorNameTimeoutId));
  // Animate creator name change in the pageflip
  animateCreatorName(name + " with <3");
}

var animateCreatorName = function(line, build) {
  // Animate it
  var text = $('#pagefliptyping').text();
  if (text.length === 0) {
    build = true;
  }
  var random = Math.floor(350 * Math.random() + 50);
  if (!build) {
    $('#pagefliptyping').text(text.slice(0, text.length-1));
    ls.animateCreatorNameTimeoutId = setTimeout(function() {
      animateCreatorName(line);
    }, random);
  }
  else {
    if (text.length !== line.length) {
      if (text.length === 0) {
        $('#pagefliptyping').text(line.slice(0, 1));
      }
      else {
        $('#pagefliptyping').text(line.slice(0, text.length+1));
      }
      ls.animateCreatorNameTimeoutId = setTimeout(function() {
        animateCreatorName(line, true);
      }, random);
    }
  }
}

var popupHere = function(time) {
  if (typeof time === 'undefined') {
    time = 7000;
  }
  // Fade in the "popup here"-bubble
  setTimeout(function() {
    $('#popupHere').fadeIn('swing');
    setTimeout(function() {
      $('#popupHere').fadeOut('fast');
    }, 7000);
  }, time);
}

// Document ready, go!
$(document).ready(function() {
  if (DEBUG) {
    // Show the DEBUG affiliation
    $('optgroup.debugAffiliation').show();
    // Show buttons directly to cantina feeds
    $('#debugLinks').show();
    $('button.debug').click(function() {
      Browser.openTab($(this).attr('data'));
    });
  }

  // Remove hardware features if the affiliation does not have it
  if (!Affiliation.org[ls.affiliationKey1].hw) {
    disableHardwareFeatures(true); // true means be quick about it!
  }

  // Apply affiliation specific features
  // favicon
  var icon = Affiliation.org[ls.affiliationKey1].icon;
  $('link[rel="shortcut icon"]').attr('href', icon);
  // news symbol
  var symbol1 = Affiliation.org[ls.affiliationKey1].symbol;
  $('#affiliation1Symbol').attr('style', 'background-image:url("'+symbol1+'");');
  var symbol2 = Affiliation.org[ls.affiliationKey2].symbol;
  $('#affiliation2Symbol').attr('style', 'background-image:url("'+symbol2+'");');
  // website
  var web1 = Affiliation.org[ls.affiliationKey1].web;
  $('#affiliation1Symbol').unbind('click');
  $('#affiliation1Symbol').click(function() {
    Browser.openTab(web1);
  });
  var web2 = Affiliation.org[ls.affiliationKey2].web;
  $('#affiliation2Symbol').unbind('click');
  $('#affiliation2Symbol').click(function() {
    Browser.openTab(web2);
  });
  // palette
  $('#palette').attr('href', Palettes.get(ls.affiliationPalette));
  // icons
  changeStatusIcons();
  // popup-here bubble
  $('#popupHere img.icon').attr('src', symbol1);

  restoreChecksToBoxes();

  // Set focus to affiliation 1 selector
  $('#affiliationKey1').focus();

  // If useBigscreen is on, slide away the rest of the options and switch the logo subtext
  if (ls.useBigscreen === 'true') {
    setTimeout(function() {
      var type = ls.whichScreen;
      toggleBigscreen(true, type, true);
    }, 300);
  }

  // Minor esthetical adjustments for OS
  if (Browser.onWindows()) {
    $('#pfText').attr("style", "bottom:9px;");
    $('#pfLink').attr("style", "bottom:9px;");
  }
  if (Browser.onMac()) {
    $('#popupHere .subtext b').text('Cmd+Shift+A');
  }

  // Google Analytics
  $('#pfLink').click(function() {
    Analytics.trackEvent('clickPageflip');
  });
  // Adding creator name to pageflip
  setTimeout(function() {
    changeCreatorName(ls.extensionOwner);
  }, 2500);
  // Blinking cursor at pageflip
  pageFlipCursorBlinking();
  loopCreatorName();

  // Show the "popup here"-bubble in the top right corner
  popupHere();

  // Allow user to change affiliation and palette
  bindAffiliationSelector('1', true);
  bindAffiliationSelector('2', false);
  bindPaletteSelector();
  if (ls.showAffiliation2 !== 'true') {
    $('#affiliationKey2').attr('disabled', 'disabled');
    $('#affiliation2Symbol').css('-webkit-filter', 'grayscale(100%)');
  }

  // Allow user to select cantinas
  bindCantinaSelector('cantina1');
  bindCantinaSelector('cantina2');

  // Give user suggestions for autocomplete of bus stops
  bindBusFields('firstBus');
  bindBusFields('secondBus');

  // Slide away favorite bus lines when not needed to conserve space
  slideFavoriteBusLines();

  // Load lists of bus stops
  Stops.load();

  // If Opera, disable and redesign features related to desktop notifications
  if (Browser.name === 'Opera' && Browser.version < 25) {
    // The actual features doesn't need to be turned off, they aren't working
    // anyway, so just uncheck the option to make the user understand it too
    // Turn off showNotifications feature
    $('input#showNotifications').prop("disabled", "disabled");
    $('input#showNotifications').prop("checked", "false");
    var text = 'Varsle om nyheter';
    $('label[for=showNotifications] span').html('<del>'+text+'</del> <b>Oppgrader til Opera 25!</b>');
    // Turn off coffeeSubscription feature
    $('input#coffeeSubscription').prop("disabled", "disabled");
    $('input#coffeeSubscription').prop("checked", "false");
    text = $('label[for=coffeeSubscription] span').text();
    text = text.trim();
    $('label[for=coffeeSubscription] span').html('<del>'+text+'</del> <b>Oppgrader til Opera 25!</b>');
  }

  // Adding a hover class to #busBox whenever the mouse is hovering over it
  $('#busBox').hover(function() {
    $(this).addClass('hover');
  }, function() {
    $(this).removeClass('hover');
  });

  // Adding a hover class to #affiliationBox whenever the mouse is hovering over it
  $('#affiliationBox').hover(function() {
    $(this).addClass('hover');
  }, function() {
    $(this).removeClass('hover');
  });

  // Adding handling of buttons in the modal with infoscreen and officescreen
  $('#modalNotifier').click(function() {
    $.modal.close();
    // Check the box
    $('#useBigscreen').attr('checked', false);
    // Is there change?
    if (ls.whichScreen !== 'notifier') {
      toggleBigscreen(false);
      // Store it
      ls.useBigscreen = 'false';
      ls.whichScreen = 'notifier';
    }
  });

  $('#modalInfoscreen').click(function() {
    $.modal.close();
    // Check the box
    $('#useBigscreen').prop('checked', true);
    // Is there change?
    if (ls.whichScreen !== 'infoscreen') {
      // Is it a bigscreen switch?
      if (ls.whichScreen === 'officescreen') {
        switchBigScreen('infoscreen');
      }
      // From Notifier mode
      else {
        toggleBigscreen(true, 'infoscreen');
      }
      // Store it
      ls.useBigscreen = 'true';
      ls.whichScreen = 'infoscreen';
    }
  });

  $('#modalOfficescreen').click(function() {
    $.modal.close();
    // Check the box
    $('#useBigscreen').prop('checked', true);
    // Is there change?
    if (ls.whichScreen !== 'officescreen') {
      // Is it a bigscreen switch?
      if (ls.whichScreen === 'infoscreen') {
        switchBigScreen('officescreen');
      }
      // From Notifier mode
      else {
        toggleBigscreen(true, 'officescreen');
      }
      // Store it
      ls.useBigscreen = 'true';
      ls.whichScreen = 'officescreen';
    }
  });

  // Catch new clicks
  $('input:checkbox').click(function() {
    var _capitalized = this.id.charAt(0).toUpperCase() + this.id.slice(1);
    Analytics.trackEvent('click'+_capitalized, this.checked);

    // Special case for 'useBigscreen'
    if (this.id === 'useBigscreen') {
      // Remove the check/no-check, it will be corrected after the user's coice
      $('#useBigscreen').prop('checked', !this.checked);
      // Present the user with a choice between notifier and bigscreen
      $('.modal').modal({
        zIndex: 1000,
        fadeDuration: 250,
      });
    }

    // All the other checkboxes (not Infoscreen)
    else {
      ls[this.id] = this.checked;

      if (this.id === 'showAffiliation2' && this.checked === false) {
        $('#affiliationKey2').attr('disabled', 'disabled');
        $('#affiliation2Symbol').css('-webkit-filter', 'grayscale(100%)');
      }
      if (this.id === 'showAffiliation2' && this.checked === true) {
        $('#affiliationKey2').removeAttr('disabled');
        $('#affiliation2Symbol').css('-webkit-filter', 'grayscale(0%)');
      }

      if (this.id === 'showStatus' && this.checked === true) {
        ls.activelySetOffice = 'true';
        Browser.getBackgroundProcess().updateStatusAndMeetings(true);
      }
      if (this.id === 'showStatus' && this.checked === false) {
        ls.activelySetOffice = 'false';
        Browser.setIcon(Affiliation.org[ls.affiliationKey1].icon);
        Browser.setTitle(ls.extensionName);
      }

      if (this.id === 'showNotifications' && this.checked === true) {
        testDesktopNotification();
      }

      if (this.id === 'coffeeSubscription' && this.checked === true) {
        ls.activelySetCoffee = 'true';
        testCoffeeSubscription();
      }
      if (this.id === 'coffeeSubscription' && this.checked === false) {
        ls.activelySetCoffee = 'false';
      }

      showSavedNotification();
    }
  });

  if (ls.everOpenedOptions !== 'true') {
    // Note the options page as opened so that it won't be opened automatically again
    ls.everOpenedOptions = 'true'; // Will never be false again
  }

});
