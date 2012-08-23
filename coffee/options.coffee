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

bindBusFields = (cssSelectors) ->
  $(cssSelectors).keyup ->
    nameStart = $(cssSelectors).val()

    if nameStart.length > 0
      suggestions = Bus.getPotentialStops nameStart

      $('#bus_suggestions').html ''
      for i of suggestions
        $('#bus_suggestions').append suggestions[i] + '<br />'

      # Only one suggestion? Inject it
      if suggestions.length is 1
        busStop = suggestions[0]
        $(cssSelectors).val busStop
        $(cssSelectors).blur()
        $('#bus_suggestions').html ''

        # Get and inject possible directions for the given stop
        # NOE

        # Get the requested direction for the bus stop
        stopNumbers = Bus.getStopNumbers suggestions[0]
        console.log 'stopnumbers: ', stopNumbers
        requestedDirection = $(cssSelectors).siblings(cssSelectors+'_direction').val()
        console.log 'direction: ', requestedDirection
        if requestedDirection is 'til byen'
          for i of stopNumbers
            console.log 'checking stopnumbers for 0: ', i
            if stopNumbers[i].charAt 5 is 0
              stopId = stopNumbers[i]
        else if requestedDirection is 'fra byen'
          for i of stopNumbers
            console.log 'checking stopnumbers for 1: ', i
            if stopNumbers[i].charAt 5 is 1
              stopId = stopNumbers[i]
        else
          console.log 'ERROR: No direction found' if DEBUG

        # Save the users selection
        ls.cssSelectors = stopId
        console.log 'http://api.visuweb.no/bybussen/1.0/Departure/Realtime/'+stopId+'/f6975f3c1a3d838dc69724b9445b3466'
        displayOnPageNotification()

bindBusSelectors = (cssSelectors) ->
  $(cssSelectors).change ->
    alert $(cssSelectors).val()

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

  # Give user suggestions for autocomplete of home bus stop
  bindBusFields '#bus_first'
  bindBusFields '#bus_second'
  bindBusSelectors '#bus_first_direction'
  bindBusSelectors '#bus_second_direction'

  # Catch new clicks
  $('input:checkbox').click ->

    # if $(this).siblings('#bus_home').is(':focus')
    #   # If the field for choosing bus stop was clicked we'll pretend the checkbox didn't change ^^
    #   _revert = !$(this).attr 'checked'
    #   $(this).attr 'checked', _revert
    #   # Also, clear the bus_home field in case the user wants to choose a new bus_home
    #   $('#bus_home').val('');

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
