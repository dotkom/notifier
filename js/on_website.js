// This is a injected script.

// That means the script is called when any page is loaded. This script does
// not have access to the rest of the extension's stuff, like localStorage.
// Therefore the script needs to send requests about variables in storage
// to the extension.

// It is important to just use regular javascript here, at most some jQuery.
// Remember that the environment you are in here is NOT the extension, it
// might be an old, insecure website. Except, of course, if we are visiting
// the Online website which is secured by our most paranoid guy, Rockj ;)

if (typeof chrome != 'undefined') {

  var host = window.location.href;

  // online.ntnu.no

  if (host.indexOf('online.ntnu.no') != -1) {
    // Hide Notifier install button
    $('#install_notifier').hide();
  }

  // sit.no

  if (host.indexOf('www.sit.no') != -1) {

    // Switch Dinner Menus

    var cantinaCallback = function(clickedCantina) {
      // Kick out SiTs own change function, which doesn't play
      // well with our more updated version of jQuery
      $('#displayWeek').unbind('change');
      // Rebind the cantina selector with SiT's own function
      $('#displayWeek').change( function() {
        var selectedDiner = $(this).val();
        $.ajax({
          url: 'ajaxdinner/get',
          type: 'POST',
          data: { diner: selectedDiner, trigger: 'week' },
          success: function(menu){
            $('#dinner-output').html(menu.html);
          }
        });
      });
      // Change cantina and trigger the change
      $('#displayWeek').val(clickedCantina).trigger('change');
    };
    chrome.extension.sendMessage({'action':'getClickedCantina'}, cantinaCallback);

    // Switch Opening Hours

    var hoursCallback = function(clickedCantina) {
      // Kick out SiTs own change function, which doesn't play
      // well with our more updated version of jQuery
      $('#diner-info-select').unbind('change');
      // Rebind the cantina selector with SiT's own function
      $('#diner-info-select').change( function() {
        var selectedDiner = $(this).val();
        $.ajax({
          url: 'ajaxdiner/get',
          type: 'POST',
          data: { diner: selectedDiner },
          success: function(menu){
            $('.diner-info-view').html(menu.html);
          }
        });
      });
      // Change cantina and trigger the change
      $('#diner-info-select').val(clickedCantina).trigger('change');
    }
    chrome.extension.sendMessage({'action':'getClickedHours'}, hoursCallback);
  }

  // all affiliations

  var resetCounter = function(affiliationNumber) {
    if (typeof chrome.runtime != 'undefined') {
      if (typeof chrome.runtime.connect != 'undefined') {
        var port = chrome.runtime.connect({name: "affiliationCounter"});
        port.postMessage({getAffiliationWeb: affiliationNumber});
        port.onMessage.addListener(function(msg) {
          if (typeof msg.affiliationWeb != 'undefined') {
            // Strip it down the bare essential web address for easy matching
            // the format, for making communication really easy: 1@https://online.ntnu.no
            var pieces = msg.affiliationWeb.split('@');
            var number = pieces[0];
            var web = pieces[1];
            var strippedWeb = web.match(/(org\.ntnu\.no\/[\w\-]+)|([^w\/\.\s][\w\-]+\.[\w\.]+)/g);
            if (strippedWeb != null) {
              if (host.indexOf(strippedWeb) != -1) {
                // The website has been recognized as an affiliation
                port.postMessage({resetAffiliationCounter: String(number)});
                // This resets badge counter for affiliation, example:
                // If affiliation1 has 4 unread news items and affiliation2 has 3 unread news items,
                // then upon a visit to affiliation1's website the counter will be decreased to 3.
              }
            }
          }
        });
      }
    }
  };
  // Try to reset the news counters
  resetCounter(1);
  resetCounter(2);

  // kiwiirc.com

  if (host.indexOf('kiwiirc.com') != -1) {

    if (typeof chrome.runtime != 'undefined') {
      if (typeof chrome.runtime.connect != 'undefined') {

        // Change the title from Kiwi IRC to Chatter
        $(document).ready(function(){
          $('title').bind('DOMSubtreeModified', function(event) {
            if ($('title').text() == 'Kiwi IRC')
              $('title').text('Chatter');
          });
        });

        // Load in all affiliation related stuff
        var loadAffiliation = function() {
          var n = localStorage.name;
          var w = localStorage.web;
          var i = localStorage.icon;
          var l = localStorage.logo;
          var p = localStorage.placeholder;
          // Favicon
          $('link[rel="shortcut icon"]').attr('href', i);
          // Logo and welcome message
          $('div.status').html('<img src="'+p+'" width="200px" style="z-index:1000;" align="center"><br /><h1>'+n+'</h1><p>Velkommen til chatten, hva er nicket ditt?</p>');
          // // Icon in channel view
          $('#kiwi .toolbar .app_tools img').attr('src', l).attr('style', 'width:100px;').parent().attr('href', w);
        };

        // Start talking
        var port = chrome.runtime.connect({name: 'chatter'});
        port.postMessage({hasIrc: host});

        port.onMessage.addListener(function(answer) {
          
          // Check if affiliation has IRC and we are currently in their channel or welcome page
          if (answer.hasIrc) {
            // Create nodes we'll use later
            $('div.server_details').prepend('<div id="notifierWelcome"></div>');
            // Affiliation has IRC, start loading stuff that might be stored from before
            loadAffiliation();
            // Request a blob of all the info we need
            port.postMessage({getBlob: true});
          }

          else if (answer.blob) {
            var blob = JSON.parse(answer.blob)
            ls = localStorage
            ls.name = blob.name
            ls.icon = blob.icon
            ls.logo = blob.logo
            ls.placeholder = blob.placeholder
            ls.web = blob.web
            setTimeout(loadAffiliation, 200);
            setTimeout(loadAffiliation, 2000);
          }

        });

      }
    }

  }

}
