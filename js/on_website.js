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

  //innsida.ntnu.no
  if (host.indexOf("innsida.ntnu.no") != -1) {
    var its = '<div class="card" style="height: 210px; float: left; width:160px;"><div class="content" id="itslearning"><div class="cardface front"><a href="https://sats.itea.ntnu.no/sso-wrapper/web/wrapper?target=itslearning" class="track-main"><h2>Itslearning</h2><i class="pictogram itslearning"></i></a><i class="flip-button info flip-open"></i></div><div class="cardface back"><a href="https://sats.itea.ntnu.no/sso-wrapper/web/wrapper?target=itslearning" class="track-main"><h2>Itslearning</h2></a><p>Kanskje den viktigste siden i hverdagen - forelesningsfoiler, øvings-oppgaver og beskjeder fra foreleserne legges her.</p><i class="flip-button close"></i></div></div></div>'
    var epost = '<div class="card" style="height: 210px; float: left; width:160px;"><div class="content" id="email"><div class="cardface front"><a href="https://webmail.stud.ntnu.no/" class="track-main"><h2>Epost</h2><i class="pictogram email"></i></a><i class="flip-button info flip-open"></i></div><div class="cardface back"><a href="https://webmail.stud.ntnu.no/" class="track-main"><h2>Epost</h2></a><p>Det forventes at du sjekker NTNU-mailen din jevnlig. Et tips er å videresende disse epostene til din private epostadresse - les hvordan <a href="https://innsida.ntnu.no/wiki/-/wiki/Norsk/Slik+bruker+du+webmail#section-Slik+bruker+du+webmail-Videresende+epost+til+andre+kontoer" id="track-email-extra">her</a>.</p><i class="flip-button close"></i></div></div></div>'
    var timeplan = '<div class="card" style="height: 210px; float: left; width:160px;"><div class="content" id="schedule"><div class="cardface front"><a href="http://ntnu.1024.no/" class="track-main"><h2>Timeplan</h2><i class="pictogram schedule"></i></a><i class="flip-button info flip-open"></i><i id="schedule-settings-button" class="cogwheel"></i></div><div class="cardface back"><a href="http://ntnu.1024.no/petterrostrup" class="track-main"><h2>Timeplan</h2></a><p>Denne kjekke tjenesten lager timeplanen din for deg, hvis du forteller den hvilke   emner du tar. Bruk gjerne NTNU brukernavnet ditt.</p><i class="flip-button close"></i></div></div></div>'
    var studweb = '<div class="card" style="height: 210px; float: left; width:160px;"><div class="content" id="studweb"><div class="cardface front"><a href="https://idp.feide.no/simplesaml/saml2/idp/SSOService.php?SAMLRequest=fVJNj5swEL33VyD3DAbSSisrsEo3WjXSbhMtbCv1ZswATozt2iZs%2F30NJFJ6yYWDeW9m3sf68aMXwRmM5UpmKIliFIBkquayzdB7%2BRw%2BoMf809rSXmiyGVwn3%2BDPANYFG2vBOE97UtIOPZgCzJkzeH97yVDnnLYEY%2BuGGqQboYqkk0MkFWYtDysu8S%2Bo9tURmLM3qDQaFcUjxQ3wGl6V4RQFW7%2BOS%2BrmE6%2BTea2jGTTNtLzXAqYj8fRJp7%2B4KPaXkyLdaRTsthkSDISoNKvVSVPa1ae%2BaTToY9f10Ctoa6qOoj01Hm3tADtpHZUuQ2mcrML4a5g%2BlGlCkpTEq98oOBjlFFPiG5eLYYORRFHLLZG0B0scI8Xm9YWkUUyqBWTJ97I8hId9Uc4Dzl6C%2BeHRGbqVhIKf11DSKRQfk7RkEnd%2FC72mckvR9zn6IuNK%2BfANWIz2Po%2FjGI2rSJkWp3Gc4PgL9iiP%2BIzyuRZkdsrk04aeMiBXCcQu7vuVakmfO6DRFLZPeo1vyZeCTT7stgclOPsbbIRQ45MB6rw3zgyAgmdleuruq5leeB02M5Q4Q6XlvlwI58vK%2F2uc%2FwM%3D&amp;RelayState=NTNU%26fnromgjor%3D" class="track-main"><h2>Studweb</h2><i class="pictogram studweb"></i></a><i class="flip-button info flip-open"></i></div><div class="cardface back"><a href="https://idp.feide.no/simplesaml/saml2/idp/SSOService.php?SAMLRequest=fVJNj5swEL33VyD3DAbSSisrsEo3WjXSbhMtbCv1ZswATozt2iZs%2F30NJFJ6yYWDeW9m3sf68aMXwRmM5UpmKIliFIBkquayzdB7%2BRw%2BoMf809rSXmiyGVwn3%2BDPANYFG2vBOE97UtIOPZgCzJkzeH97yVDnnLYEY%2BuGGqQboYqkk0MkFWYtDysu8S%2Bo9tURmLM3qDQaFcUjxQ3wGl6V4RQFW7%2BOS%2BrmE6%2BTea2jGTTNtLzXAqYj8fRJp7%2B4KPaXkyLdaRTsthkSDISoNKvVSVPa1ae%2BaTToY9f10Ctoa6qOoj01Hm3tADtpHZUuQ2mcrML4a5g%2BlGlCkpTEq98oOBjlFFPiG5eLYYORRFHLLZG0B0scI8Xm9YWkUUyqBWTJ97I8hId9Uc4Dzl6C%2BeHRGbqVhIKf11DSKRQfk7RkEnd%2FC72mckvR9zn6IuNK%2BfANWIz2Po%2FjGI2rSJkWp3Gc4PgL9iiP%2BIzyuRZkdsrk04aeMiBXCcQu7vuVakmfO6DRFLZPeo1vyZeCTT7stgclOPsbbIRQ45MB6rw3zgyAgmdleuruq5leeB02M5Q4Q6XlvlwI58vK%2F2uc%2FwM%3D&amp;RelayState=NTNU%26fnromgjor%3D" class="track-main"><h2>Studweb</h2></a><p>Meld deg på (og av) emner, godkjenn studieplan, betal semesteravgift, og finn ut hvor hardt du failet på eksamen.</p><i class="flip-button close"></i></div></div></div>'
    var romres = '<div class="card" style="height: 210px; float: left; width:160px;"><div class="content" id="romres"><div class="cardface front"><a href="https://romres.ntnu.no/" class="track-main"><h2>Romres</h2><i class="pictogram romres"></i></a><i class="flip-button info flip-open"></i></div><div class="cardface back"><a href="https://romres.ntnu.no/" class="track-main"><h2>Romres</h2></a><p>Reservér grupperom og auditorier et halvt år i forveien. Timeplaner for enkeltrom   finner du <a href="http://www.ntnu.no/studieinformasjon/rom/" id="track-romres-extra">her</a>.</p><i class="flip-button close"></i></div></div></div>'
    var kart = '<div class="card" style="height: 210px; float: left; width:160px;"><div class="content" id="map"><div class="cardface front"><a href="http://use.mazemap.com/" class="track-main"><h2>Campuskart</h2><i class="pictogram map"></i></a><i class="flip-button info flip-open"></i></div><div class="cardface back"><a href="http://use.mazemap.com/" class="track-main"><h2>Campuskart</h2></a><p>Hjelp, hvor er datasalen Sprokkit? Hva er dette «Kjelhuset» alle snakker om? MazeMap  viser vei! <br>(…på Gløshaugen / St. Olav)</p><i class="flip-button close"></i></div></div></div>'
    var temp = chrome.extension.getURL('/img/bart.png')
    var src = ("url(" + temp + ")");
    // Replaces html of right-side column with Instabart buttons
    $('#mainpagelink a').css('background-image', src);
    $('#mainpagelink a').css('height', '90px');
    $('#mainpagelink a').attr('href', 'http://instabart.no/');
    $("#column-2").html(its);
    $("#column-2").append(epost);
    $("#column-2").append(timeplan);
    $("#column-2").append(studweb);
    $("#column-2").append(romres);
    $("#column-2").append(kart);
  };  

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
            $('div.server_details').append('<div id="notifierWelcome"></div>');
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
