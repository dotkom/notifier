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

testDesktopNotification = ->
  notification = webkitNotifications.createHTMLNotification('notification.html')
  notification.show()

bindBusFields = (busField) ->
  cssSelector = '#' + busField
  if DEBUG then console.log 'Binding bus fields for ' + cssSelector
  stop = $(cssSelector + ' .stop');
  direction = $(cssSelector + ' .direction');

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
        suggestion = $('<div class="suggestion">' + suggestions[i] + '</div>').hide()
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
  displayOnPageNotification()
  if DEBUG then console.log 'http://api.visuweb.no/bybussen/1.0/Departure/Realtime/' + busStopId + '/f6975f3c1a3d838dc69724b9445b3466'

fadeInCanvas = ->
  webGLStart();
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

  # Restore checks to boxes from ls
  $('input:checkbox').each (index, element) ->
    element.checked = ls[element.id] is "true"

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

  # Catch new clicks
  $('input:checkbox').click ->

    # else
    ls[this.id] = this.checked;
    
    if this.id is 'showOffice' and this.checked is false
      chrome.browserAction.setIcon {path: 'img/icon-default.png'}
      chrome.browserAction.setTitle {title: EXTENSION_NAME}
    else if this.id is 'showOffice' and this.checked is true
      Office.get (status, title) ->
        chrome.browserAction.setIcon {path: 'img/icon-'+status+'.png'}
        chrome.browserAction.setTitle {title: title}
        ls.currentStatus = status
        ls.currentStatusTitle = title
    
    if this.id is 'showNotifications' and this.checked is true
      testDesktopNotification()
    
    if this.id is 'useInfoscreen' and this.checked is true
      chrome.tabs.create {url: chrome.extension.getURL("infoscreen.html"), selected: false}

    displayOnPageNotification()
