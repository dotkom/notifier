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
  Browser.createNotification 'notification.html'

testCoffeeSubscription = ->
  Browser.createNotification 'subscription.html'

bindAffiliationSelector = ->
  cssSelector = '#affiliationName'
  chosenAffiliation = ls['affiliationName']
  # Default values
  $(cssSelector + '[value=' + chosenAffiliation + ']').prop 'selected', 'selected'
  # React to change
  $(cssSelector).change ->
    chosenAffiliation = $(this).val()
    # Check if switching from or to Online
    oldAffiliation = ls[selector]
    if oldAffiliation is 'online'
      disableOnlineSpecificFeatures()
    else if chosenAffiliation is 'online'
      enableOnlineSpecificFeatures()
    # Save the change
    ls[selector] = chosenAffiliation
    # Reload news
    Browser.getBackgroundProcess().updateNews()

disableOnlineSpecificFeatures = ->
  ls['showOffice'] = 'false'
  ls['coffeeSubscription'] = 'false'
  ls['useInfoscreen'] = 'false'
  # if typeof force isnt 'undefined' and typeof force isnt 'boolean'
  #   console.log 'ERROR: force must be a boolean'

enableOnlineSpecificFeatures = ->


bindCantinaSelector = (selector) ->
  # Default values
  $('#' + selector).val ls[selector]
  # React to change
  $('#' + selector).change ->
    ls[selector] = $(this).prop('value')

bindBusFields = (busField) ->
  cssSelector = '#' + busField
  if DEBUG then console.log 'Binding bus fields for ' + cssSelector
  fadeTime = 50

  stop = $(cssSelector + ' input')
  direction = $(cssSelector + ' select')

  # Load users saved buses
  loadBus busField

  $(stop).focus ->
    
    # Clear stop field on click
    if DEBUG then console.log 'focus - clear field and show saved value as placeholder'
    ls.busStopClickedAway = ls[busField+'_name']
    $(stop).val ''
    $(stop).attr 'placeholder', ls.busStopClickedAway

  $(stop).focusout ->
    
    # Lost focus, suggestions on busstops?
    partialStop = $(stop).val()
    suggestions = Stops.partialNameToPotentialNames partialStop

    # No input, revert to the busstop that was clicked away
    if partialStop is '' or suggestions.length is 0
      if DEBUG then console.log 'focusout - empty field or invalid input, return to last saved value'
      if ls.busStopClickedAway isnt null
        $(stop).val ls.busStopClickedAway
      $('#bus_suggestions').html ''
    # 1 suggestion, go for it!
    else if suggestions.length is 1
      if DEBUG then console.log 'focusout - 1 suggestion, save it'
      correctStop = suggestions[0]
      $(stop).val correctStop
      $('#bus_suggestions').html ''
      getDirections busField, correctStop
      getFavoriteLines busField
      saveBus busField
    # Several suggestions, allow the user to see them and click them for a short while
    else if suggestions.length > 1
      if DEBUG then console.log 'focusout - several suggestions, remove them'
      setTimeout ( ->
        $('#bus_suggestions .suggestion').fadeOut ->
          $('#bus_suggestions').html ''
      ), 5000
    else
      if DEBUG then console.log 'focusout - nothing to do'

  $(stop).keyup (event) ->

    # Do nothing if arrow key or function key is pressed
    if event.keyCode in [37..40] or event.keyCode in [17..18] or event.keyCode is 91
      if DEBUG then console.log 'keyup - arrow key or function key, do nothing'

    # If Enter is clicked, check it and save it
    else if event.keyCode is 13
      if DEBUG then console.log 'keyup - enter, checking input'
      possibleStop = $(stop).val()
      suggestions = Stops.nameToIds possibleStop
      if suggestions.length isnt 0
        realStopName = Stops.idToName suggestions[0]
        $(stop).val realStopName
        # then empty the suggestion list
        $('#bus_suggestions').html ''
        # then show only the correct stop for a little over a second
        suggestion = $('<div class="correct">' + realStopName + '</div>').hide()
        $('#bus_suggestions').append suggestion
        $(suggestion).fadeIn()
        setTimeout ( ->
          $('#bus_suggestions .correct').fadeOut fadeTime
          setTimeout ( ->
            $('#bus_suggestions').html ''
          ), 300
        ), 1200
        # and of course, save and get directions
        getDirections busField, realStopName
        getFavoriteLines busField
        saveBus busField

    # If anything else is clicked, get suggestions
    else
      if DEBUG then console.log 'keyup - getting suggestions'
      # Save the id of the bus field in focus
      ls.busInFocus = $(stop).parent().attr 'id'
      # Find the partial name
      nameStart = $(stop).val()

      if nameStart.length > 0
        # Suggestions
        suggestions = Stops.partialNameToPotentialNames nameStart
        $('#bus_suggestions').html ''
        for i of suggestions
          _text = suggestions[i]
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
            $('#bus_suggestions .correct').fadeOut fadeTime
            setTimeout ( ->
              $('#bus_suggestions').html ''
            ), 300
          ), 1200
          getDirections busField, correctStop
          getFavoriteLines busField
          saveBus busField
      # All characters removed, remove suggestions
      else
        $('#bus_suggestions .suggestion').fadeOut fadeTime, ->
          $('#bus_suggestions').html ''  
      # After inserting new results, rebind suggestions, making them clickable
      bindSuggestions()

  $(direction).change ->

    # Get new favorite lines in case they are different, and save changes ofc
    getFavoriteLines busField
    saveBus busField

  bindFavoriteBusLines busField

bindFavoriteBusLines = (busField) ->
  cssSelector = '#' + busField
  # Switch status on click
  $(cssSelector + ' .lines .line').click ->
    # Switch status and save
    if $(this).hasClass 'active'
      $(this).attr 'class', 'inactive'
    else if $(this).hasClass 'inactive'
      $(this).attr 'class', 'active'
    else
      console.log 'ERROR: favorite bus line <span> with neither .active nor .inactive'
    saveBus busField

getDirections = (busField, correctStop) ->
  cssSelector = '#' + busField
  stopName = $(cssSelector + ' input')
  direction = $(cssSelector + ' select')
  # Get and inject possible directions for correct stop
  allDirections = Stops.nameToDirections correctStop
  $(direction).html ''
  for i in allDirections
    $(direction).append '<option>' + i + '</option>'

getFavoriteLines = (busField) ->
  cssSelector = '#' + busField
  # Loading gif
  if -1 isnt busField.indexOf 'first'
    $(cssSelector + ' .lines').html '<div style="text-align:center;"><img class="loading_left" src="img/loading-atb.gif" /></div>'
  else if -1 isnt busField.indexOf 'second'
    $(cssSelector + ' .lines').html '<div style="text-align:center;"><img class="loading_right" src="img/loading-atb.gif" /></div>'

  # Show it
  $('#bus_box .lines').slideDown()
  $('#bus_box #arrow_down').fadeOut()

  # Get stopname, direction, stopid
  stopName = $(cssSelector + ' input').val()
  direction = $(cssSelector + ' select').val()
  # Get and inject possible lines for correct stop
  busStopId = Stops.nameAndDirectionToId stopName, direction
  
  Bus.getLines busStopId, (json) ->
    # Did the json even reach us? Is the result an error message?
    console.log json
    errorMessage = null
    if typeof json is 'undefined' then errorMessage = 'Oops, frakoblet'
    if typeof json is 'string' then errorMessage = json
    if typeof json[0] isnt 'undefined' then errorMessage = 'Feil: ' + json[0]
    
    if errorMessage isnt null
      # Show error message
      $(cssSelector + ' .lines').html '<span class="error">'+errorMessage+'</span>'
      # Show retry-button
      clearTimeout $('#bus_box').data 'timeoutId'
      setTimeout ( ->
        $(cssSelector + ' .lines').html '<span class="retry">Prøve igjen?</span>'
        $(cssSelector + ' .lines .retry').click ->
          getFavoriteLines busField
        setTimeout ( ->
          slideFavoriteBusLines()
        ), 1500
      ), 2200
    else
      # Sort lines and remove duplicates
      arrayOfLines = []
      # for item in json.lines # this is probably more correct to use for the future
      for item in json.next
        if -1 is arrayOfLines.indexOf Number item.line
          # Casting strings to numbers to make them easily sortable
          arrayOfLines.push Number item.line
      arrayOfLines = arrayOfLines.sort (a,b) -> return a-b
      
      # Add lines to bus stop
      $(cssSelector + ' .lines').html '<table border="0" cellpadding="0" cellspacing="0"><tr>'
      counter = 0
      for line in arrayOfLines
        if counter % 4 == 0
          $(cssSelector + ' .lines table').append '</tr><tr>'
        $(cssSelector + ' .lines table tr:last').append '<td class="line active">'+line+'</td>'
        counter = counter + 1
      $(cssSelector + ' .lines').append '</tr></table>'

      # Save the newly added lines
      saveBus busField

      # Make the bus lines clickable
      bindFavoriteBusLines busField

    # Hide the favorite lines after a short timeout
    setTimeout ( ->
      if not $('#bus_box').hasClass 'hover'
        $('#bus_box .lines').slideUp()
        $('#bus_box #arrow_down').fadeIn()
    ), 2500

saveBus = (busField) ->
  cssSelector = '#' + busField
  
  # Get stopname, direction, stopid
  stopName = $(cssSelector + ' input').val()
  direction = $(cssSelector + ' select').val()
  busStopId = Stops.nameAndDirectionToId stopName, direction
  
  # Get active/inactive lines
  activeLines = []
  $(cssSelector + ' .lines .active').each ->
    activeLines.push Number $(this).text()
  inactiveLines = []
  $(cssSelector + ' .lines .inactive').each ->
    inactiveLines.push Number $(this).text()
  
  # Save all to localStorage
  ls[busField] = busStopId
  ls[busField + '_name'] = stopName
  ls[busField + '_direction'] = direction
  ls[busField + '_active_lines'] = JSON.stringify activeLines
  ls[busField + '_inactive_lines'] = JSON.stringify inactiveLines
  if DEBUG then console.log 'saved activeLines for '+busField, '"', activeLines, '"' ######################################
  if DEBUG then console.log 'saved inactiveLines '+busField, '"', inactiveLines, '"' ######################################
  if DEBUG then console.log 'saved http://api.visuweb.no/bybussen/1.0/Departure/Realtime/' + busStopId + '/f6975f3c1a3d838dc69724b9445b3466'
  displayOnPageNotification()

loadBus = (busField) ->
  cssSelector = '#' + busField
  stopName = ls[busField + '_name']
  direction = ls[busField + '_direction']
  activeLines = ls[busField + '_active_lines']
  inactiveLines = ls[busField + '_inactive_lines']

  # Add stopname and direction to busfields
  if stopName isnt undefined and direction isnt undefined
    $(cssSelector + ' input').val stopName
    $(cssSelector + ' select').val direction
    if DEBUG then console.log 'loaded "' + stopName + '" to "' + busField + '"'
  
  # Add active and inactive lines to busfields
  if activeLines isnt undefined and inactiveLines isnt undefined
    # If the page just opened and there are no favorite lines then get some
    if activeLines is '' and inactiveLines is ''
      getFavoriteLines busField
    else
      activeLines = JSON.parse activeLines # stringified array
      inactiveLines = JSON.parse inactiveLines # stringified array
      # Collect active and inactive lines to a single dict
      # with boolean values showing active or inactive
      lines = {}
      for line in activeLines
        lines[line] = true
      for line in inactiveLines
        lines[line] = false
      # Sort the dict by keys (bus line numbers sorted in ascending order)
      keys = []
      for i of lines
        keys.push i
      keys = keys.sort (a,b) ->
        return a - b
      # Add lines to bus stop as a generated table
      $(cssSelector + ' .lines').html '<table border="0" cellpadding="0" cellspacing="0"><tr>'
      counter = 0
      for i in keys
        if counter % 4 == 0
          $(cssSelector + ' .lines table').append '</tr><tr>'
        status = if lines[i] is true then 'active' else 'inactive'
        $(cssSelector + ' .lines table tr:last').append '<td class="line '+status+'">'+i+'</td>'
        counter = counter + 1
      $(cssSelector + ' .lines').append '</tr></table>'

slideFavoriteBusLines = ->
  # Hide the favorite bus line spans from the start
  setTimeout (->
    if not $('#bus_box').hasClass 'hover'
      $('#bus_box .lines').slideUp()
      $('#bus_box #arrow_down').fadeIn()
  ), 1500
  # Show favorite bus line spans when hovering
  $('#bus_box').mouseenter ->
    clearTimeout $(this).data 'timeoutId'
    $('#bus_box .lines').slideDown()
    $('#bus_box #arrow_down').fadeOut()
  $('#bus_box').mouseleave ->
    timeoutId = setTimeout (->
      if $('#bus_box .lines img').length is 0 # currently displaying loading gifs?
        $('#bus_box .lines').slideUp()
        $('#bus_box #arrow_down').fadeIn()
    ), 500
    # Set the timeoutId, allowing us to clear this trigger if the mouse comes back over
    $('#bus_box').data 'timeoutId', timeoutId

bindSuggestions = ->
  $('.suggestion').click ->
    if ls.busInFocus isnt undefined
      text = $(this).text()
      $('#' + ls.busInFocus + ' input').val text
      getDirections ls.busInFocus, text
      getFavoriteLines ls.busInFocus
      saveBus ls.busInFocus
      $('#bus_suggestions .suggestion').fadeOut 50, ->
        $('#bus_suggestions').html ''

toggleInfoscreen = (activate, force) -> # Welcome to callback hell, - be glad it's well commented
  speed = 400
  id = 'useInfoscreen'
  if activate
    $('#'+id).attr 'checked', false
    # Remove subtext
    $('#logo_subtext').fadeOut()
    # Animate away all other options
    $('#container #left').animate {'width':'0pt'}, speed, ->
      $('#container #left').hide()
      $('#infoscreen_slider').slideUp speed, ->
        # Animate in the infoscreen preview
        $('#infoscreen_preview').fadeIn speed, ->
          # New logo subtext
          $('#logo_subtext').html 'infoscreen&nbsp;&nbsp;&nbsp;&nbsp;'
          $('#logo_subtext').fadeIn ->
            # Move logo and subtext a little to the right
            $('header #logo_subtext').animate {'margin-left':'265pt'}, speed
            $('header #logo').animate {'margin-left':'75pt'}, speed
            # Move infoscreen preview to the circa middle of the screen
            $('#container #right').animate {'margin-left':'180pt'}, speed
            # Move all content a bit up
            $('header').animate {'top':'40%'}, speed
            $('#container').animate {'top':'40%'}, speed, ->
              if force or confirm 'Sikker på at du vil skru på Online Infoscreen?\n\n- Krever full-HD skjerm som står på høykant\n- Popup-knappen åpner Infoskjerm i stedet\n- Infoskjermen skjuler musepekeren\n- Infoskjermen åpnes hver gang '+BROWSER+' starter\n- Infoskjermen åpnes nå!'
                # Enable, and check the checkbox
                ls[id] = 'true'
                $('#'+id).prop 'checked', true
                # Reset icon, icon title and icon badge
                Browser.setIcon 'img/icon-default.png'
                Browser.setTitle 'Online Infoscreen'
                Browser.setBadgeText ''
                # Set news limit to infoscreen size, up to 8
                ls.newsLimit = 8
                Browser.getBackgroundProcess().updateNews()
                # Create Infoscreen in a new tab
                if not force
                  Browser.openBackgroundTab 'infoscreen.html'
              else
                revertInfoscreen()
  else
    # Disable
    ls[id] = 'false'
    # # Close any open Infoscreen tabs
    # closeInfoscreenTabs()
    # Refresh office status
    Browser.getBackgroundProcess().updateOfficeAndMeetings(true);
    # Set news limit to popup size, max 4
    ls.newsLimit = 4
    # Animations
    revertInfoscreen()

revertInfoscreen = ->
  speed = 300
  # Remove subtext
  $('#logo_subtext').fadeOut speed, ->
    # Move all content back down
    $('#container').animate {'top':'50%'}, speed
    $('header').animate {'top':'50%'}, speed
    # Move infoscreen preview back in place (to the left)
    $('#container #right').animate {'margin-left':'0'}, speed
    # Move logo and subtext back in place (to the left)
    $('header #logo_subtext').animate {'margin-left':'215pt'}, speed
    $('header #logo').animate {'margin-left':'25pt'}, speed, ->
      # Animate in the infoscreen preview
      $('#infoscreen_preview').fadeOut speed, ->
        # Slide more options back open
        $('#infoscreen_slider').slideDown speed, ->
          # Show the rest of the options again
          $('#container #left').show()
          # Animate in the rest of the options
          $('#container #left').animate {'width':'54%'}, speed, ->
            # Back to old logo subtext
            $('#logo_subtext').html 'notifier options'
            $('#logo_subtext').fadeIn()

# COMMENTED OUT: This requires 'tabs' permission, which isn't cool.
# closeInfoscreenTabs = ->
#   chrome.windows.getAll # OPERA?
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
#               chrome.tabs.remove tab.id # OPERA?

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
  if DEBUG
    $('#debug_links').show()
    $('button.debug').click ->
      Browser.openTab $(this).attr 'data'
  
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup timeout: AJAX_TIMEOUT

  # Restore checks to boxes from localStorage
  $('input:checkbox').each (index, element) ->
    if ls[element.id] is 'true'
      element.checked = true

  # If useInfoscreen is on, slide away the rest of the options and switch the logo subtext
  if ls.useInfoscreen is 'true'
    setTimeout ( ->
      toggleInfoscreen true, true
    ), 300

  # Bind the windows resize function
  $(window).bind "resize", resizeBackgroundImage
  resizeBackgroundImage() # Run once in case the window is quite big
  
  # Minor esthetical adjustments for OS
  if OPERATING_SYSTEM is 'Windows'
    $('#pagefliptext').attr "style", "bottom:9px;"
    $('#pagefliplink').attr "style", "bottom:9px;"

  # Note: Uncommented as long as the Chatter option us uncommented in options.html
  # # Minor esthetical adjustmenst for Browser
  # html = $('label[for=openChatter] span').html().replace /__nettleseren__/g, BROWSER
  # $('label[for=openChatter] span').html html

  # Blinking cursor at pageflip
  setInterval ( ->
    pageFlipCursorBlinking()
  ), 600

  # Fade in the +1 button when (probably) ready
  setTimeout ( ->
    $('#plusonebutton').fadeIn 150
  ), 1100

  # Bind a click function to the on-page notification for the canvas
  # $('#notification').click ->
  #   fadeInCanvas()

  # Allow user to change affiliation
  bindAffiliationSelector()

  # Allow user to select cantinas
  bindCantinaSelector 'left_cantina'
  bindCantinaSelector 'right_cantina'

  # Give user suggestions for autocomplete of bus stops
  bindBusFields 'first_bus'
  bindBusFields 'second_bus'

  # Slide away favorite bus lines when not needed to conserve space
  slideFavoriteBusLines()

  # Load lists of bus stops
  # Through this call the Stops List will auto-upate if it's old
  Stops.load (result) ->
    if DEBUG then console.log 'Loading bus lists:', result

  # If Opera, disable and redesign features related to desktop notifications
  if BROWSER is 'Opera'
    # The actual features doesn't need to be turned off, they aren't working
    # anyway, so just uncheck the option to make the user understand it too
    # Turn off showNotifications feature
    $('input#showNotifications').prop "disabled", "disabled"
    $('input#showNotifications').prop "checked", "false"
    text = 'Varsle om nyheter'
    $('label[for=showNotifications] span').html('<del>'+text+'</del> <b>Vent til Opera 12.50</b>')
    # Turn off coffeeSubscription feature
    $('input#coffeeSubscription').prop "disabled", "disabled"
    $('input#coffeeSubscription').prop "checked", "false"
    text = $('label[for=coffeeSubscription] span').text()
    text = text.trim()
    $('label[for=coffeeSubscription] span').html('<del>'+text+'</del> <b>Vent til Opera 12.50</b>')

  # CSS tweaks for Opera until they start using WebKit
  if BROWSER is 'Opera'
    $('#logo_subtext').css 'margin-top', '7pt'
    $('#notification').css 'top', '14.5pt'

  # Adding a hover class to #bus_box whenever the mouse is hovering over it
  $('#bus_box').hover ->
    $(this).addClass 'hover'
  , ->
    $(this).removeClass 'hover'

  # Catch new clicks
  $('input:checkbox').click ->
    
    # Special case for 'useInfoscreen'
    if this.id is 'useInfoscreen'
      toggleInfoscreen this.checked

    # All the other checkboxes (not Infoscreen)
    else
      ls[this.id] = this.checked;
      
      if this.id is 'showOffice' and this.checked is true
        Browser.getBackgroundProcess().updateOfficeAndMeetings(true);
      if this.id is 'showOffice' and this.checked is false
        Browser.setIcon 'img/icon-default.png'
        Browser.setTitle EXTENSION_NAME
      
      if this.id is 'showNotifications' and this.checked is true
        testDesktopNotification()
      
      if this.id is 'coffeeSubscription' and this.checked is true
        testCoffeeSubscription()

      displayOnPageNotification()