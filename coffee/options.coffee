# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage

resizeBackgroundImage = ->
  if 1550 < $(window).width()
    $('#background').attr "style", "background:url('img/background-large.png') center center no-repeat;"
  else if 1200 < $(window).height()
    $('#background').attr "style", "background:url('img/background-large-vertical.png') center center no-repeat;"
  else
    $('#background').attr "style", "background:url('img/background-medium.png') center center no-repeat;"

displayOnPageNotification = ->
  $("#notification").fadeIn 200
  setTimeout ( ->
    $("#notification").fadeOut 200
  ), 800

pageFlipCursorBlinking = ->
  $(".pageflipcursor").animate opacity: 0, "fast", "swing", ->
    $(@).animate opacity: 1, "fast", "swing",

updateOfficeStatus = ->
  Office.get (status, title, message) ->
    chrome.browserAction.setIcon {path: 'img/icon-'+status+'.png'}
    ls.currentStatus = status
    Office.getTodaysEvents (meetingPlan) ->
      meetingPlan = $.trim meetingPlan
      today = '### Nå\n' + title + ": " + message + "\n\n### Resten av dagen\n" + meetingPlan
      chrome.browserAction.setTitle {title: today}
      ls.currentStatusMessage = message

testDesktopNotification = ->
  notification = webkitNotifications.createHTMLNotification('notification.html')
  notification.show()

bindBusFields = (busField) ->
  cssSelector = '#' + busField
  if DEBUG then console.log 'Binding bus fields for ' + cssSelector
  stop = $(cssSelector + ' .stop');
  direction = $(cssSelector + ' .direction');

  # Load users saved buses
  loadBus busField

  # Clear stop field on click
  $(stop).focus ->
    if DEBUG then console.log '.stop focus'
    $(stop).val ''
    $('#bus_suggestions').html ''

  # If focus is lost, check for correct stop name
  $(stop).focusout ->
    if DEBUG then console.log '.stop blur'
    contents = $(stop).val()
    suggestions = Bus.getPotentialStops contents
    if suggestions.length is 1
      correctStop = suggestions[0]
      $(stop).val correctStop
      $('#bus_suggestions').html ''
    else
      $(stop).val ''
      $('#bus_suggestions').html ''

  # Suggest stops on keystrokes, save if there's only one suggestion
  $(stop).keyup ->
    if DEBUG then console.log '.stop keyup'
    nameStart = $(stop).val()

    if nameStart.length > 0
      # Suggestions
      suggestions = Bus.getPotentialStops nameStart
      $('#bus_suggestions').html ''
      for i of suggestions
        _text = suggestions[i]
        for char, index in nameStart
          _text = _text.replace char, '<b>'+char+'</b>'
        suggestion = $('<div class="suggestion">' + _text + '</div>').hide()

        $('#bus_suggestions').append suggestion
        $(suggestion).fadeIn()

      # Only one suggestion? Inject it
      if suggestions.length is 1
        correctStop = suggestions[0]
        $(stop).val correctStop
        $(stop).blur()
        $('#bus_suggestions').html ''
        suggestion = $('<div class="correct">' + correctStop + '</div>').hide()
        $('#bus_suggestions').append suggestion
        $(suggestion).fadeIn()
        setTimeout ( ->
          $('#bus_suggestions .correct').fadeOut(200)
          setTimeout ( ->
            $('#bus_suggestions').html ''
          ), 300
        ), 1200

        # Get and inject possible directions for correct stop
        directions = Bus.getDirections correctStop
        $(direction).html ''
        for i of directions
          $(direction).append '<option>' + directions[i] + '</option>'
        saveBus busField

  # Save bus line if user changes the direction field
  $(direction).change ->
    if DEBUG then console.log '.direction change'
    saveBus busField

saveBus = (busField) ->
  cssSelector = '#' + busField
  stop = $(cssSelector + ' .stop').val();
  direction = $(cssSelector + ' .direction').val();
  busStopId = Bus.getStop stop, direction
  ls[busField] = busStopId
  ls[busField + '_name'] = stop
  ls[busField + '_direction'] = direction
  displayOnPageNotification()
  if DEBUG then console.log 'http://api.visuweb.no/bybussen/1.0/Departure/Realtime/' + busStopId + '/f6975f3c1a3d838dc69724b9445b3466'

loadBus = (busField) ->
  cssSelector = '#' + busField
  $(cssSelector + ' .stop').val ls[busField + '_name']
  $(cssSelector + ' .direction').val ls[busField + '_direction']

toggleInfoscreen = (activate) -> # Welcome to callback hell, - be glad it's well commented
  id = 'useInfoscreen'
  if activate
    $('#'+id).attr 'checked', false
    $('#logo_subtext').fadeOut()
    $('#infoscreen_slider').slideUp 400, ->
      $('#infoscreen_preview').fadeIn 400, ->
        # New logo subtext
        $('#logo_subtext').html 'infoscreen&nbsp;&nbsp;&nbsp;&nbsp;'
        $('#logo_subtext').fadeIn ->
          if confirm 'Sikker på at du vil skru på Online Infoscreen?\n\n- Krever full-HD skjerm som står på høykant\n- Popup-knappen åpner Infoskjerm i stedet\n- Infoskjermen åpnes hver gang Chrome starter\n- Infoskjerm åpnes nå!'
            # Enable, and check the checkbox
            ls[id] = 'true'
            $('#'+id).attr 'checked', true
            # Reset icon, icon title and icon badge
            chrome.browserAction.setIcon {path: 'img/icon-default.png'}
            chrome.browserAction.setTitle {title: 'Online Infoscreen'}
            chrome.browserAction.setBadgeText {text: ''}
            # Create Infoscreen in a new tab
            chrome.tabs.create {url: chrome.extension.getURL("infoscreen.html"), selected: false}
          else
            setTimeout ( ->
              $('#logo_subtext').fadeOut()
              $('#infoscreen_preview').fadeOut 200, ->
                $('#infoscreen_slider').slideDown 400, ->
                  # New logo subtext
                  $('#logo_subtext').html 'notifier options'
                  $('#logo_subtext').fadeIn()
            ), 200
  else
    # Disable
    ls[id] = 'false'
    # Close any open Infoscreen tabs
    # closeInfoscreenTabs()
    # Refresh office status
    updateOfficeStatus()
    # Animations
    $('#logo_subtext').fadeOut()
    $('#infoscreen_preview').fadeOut 400, ->
      $('#infoscreen_slider').slideDown 400, ->
        # Notify user
        $('#logo_subtext').html 'notifier options'
        $('#logo_subtext').fadeIn()

# COMMENTED OUT: This requires 'tabs' permission, which isn't cool.
# closeInfoscreenTabs = ->
#   chrome.windows.getAll
#     populate: true,
#     (window_list) ->
#       list = []
#       for win of window_list
#         tabs = window_list[win].tabs
#         for tab of tabs
#           tab = tabs[tab]
#           titleIndex = tab.title.indexOf "Infoscreen"
#           urlIndex = tab.url.indexOf "infoscreen.html"
#           if titleIndex >= 0
#             if urlIndex >= 0
#               chrome.tabs.remove tab.id

fadeInCanvas = ->
  webGLStart()
  $('#LessonCanvas').animate
    opacity:1,
    1300,
    'swing',
    ->
      setTimeout ( ->
        $('#LessonCanvas').animate
          opacity:0,
          1300,
          'swing'
      ), 200

# Document ready, go!
$ ->
  if DEBUG then less.watch()

  # Restore checks to boxes from localStorage
  $('input:checkbox').each (index, element) ->
    if ls[element.id] is 'true'
      element.checked = true

  # If useInfoscreen is on, slide away the rest of the options and switch the logo subtext
  if ls.useInfoscreen is 'true'
    $('#logo_subtext').html 'infoscreen&nbsp;&nbsp;&nbsp;&nbsp;'
    $('#infoscreen_slider').hide()
    $('#infoscreen_preview').show()

  # Bind the windows resize function
  $(window).bind "resize", resizeBackgroundImage
  resizeBackgroundImage() # Run once in case the window is quite big
  
  # Minor esthetical adjustments for OS version
  if OPERATING_SYSTEM is 'Windows'
    $('#pagefliptext').attr "style", "bottom:9px;"
    $('#pagefliplink').attr "style", "bottom:9px;"

  # Blinking cursor at pageflip
  setInterval ( ->
    pageFlipCursorBlinking()
  ), 600

  # Fade in the +1 button when (probably) ready
  setTimeout ( ->
    $('#plusonebutton').fadeIn 150
  ), 1100

  # Bind a click function to the on-page notification for the canvas
  $('#notification').click ->
    fadeInCanvas()

  # Give user suggestions for autocomplete of bus stops
  bindBusFields 'first_bus'
  bindBusFields 'second_bus'

  # Bind the infoscreen option to an avgrund.js modal dialog
  # $('#useInfoscreen').avgrund
  #   width: 540,
  #   height: 330,
  #   holderClass: 'custom',
  #   showClose: true,
  #   showCloseText: 'Avbryt',
  #   enableStackAnimation: true,
  #   onBlurContainer: '#avgrund',
  #   template: '
  #     <img class="avgrund_image" src="/img/options-infoscreen-preview.png" />
  #     <div class="avgrund_content">
  #       <b>Sikker på at du vil skru på infoskjerm?</b>
  #       <ul style="text-align:left;">
  #         <li>Popupknappen vil åpne infoskjerm</li>
  #         <li>Infoskjerm åpnes i fullscreen ved oppstart</li>
  #         <li>Infoskjermen vil åpnes nå!</li>
  #       </ul>
  #       <a href="#" class="button yesbutton" onclick="">Skru på infoskjerm</a>
  #       <a href="#" class="button nobutton">Avbryt</a>
  #     </div>'

  # Catch new clicks
  $('input:checkbox').click ->
    
    # Special case for 'useInfoscreen'
    if this.id is 'useInfoscreen'
      toggleInfoscreen( this.checked )

    # All the other checkboxes (not Infoscreen)
    else
      ls[this.id] = this.checked;
      
      if this.id is 'showOffice' and this.checked is false
        chrome.browserAction.setIcon {path: 'img/icon-default.png'}
        chrome.browserAction.setTitle {title: EXTENSION_NAME}
      else if this.id is 'showOffice' and this.checked is true
        updateOfficeStatus()
      
      if this.id is 'showNotifications' and this.checked is true
        testDesktopNotification()

      displayOnPageNotification()
