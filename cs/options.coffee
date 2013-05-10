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

bindAffiliationSelector = (number, isPrimaryAffiliation) ->
  id = 'affiliationKey'+number
  affiliationKey = ls[id]
  # Default values, set only the chosen affiliation as selected, because it is the Chosen One
  $('#'+id).val affiliationKey
  # React to change
  $('#'+id).change ->
    affiliationKey = $(this).val()
    oldAffiliation = ls[id]
    # Save the change
    ls[id] = affiliationKey

    if isPrimaryAffiliation
      # Check if switching from or to Online
      if oldAffiliation is 'online'
        disableOnlineSpecificFeatures()
      else if affiliationKey is 'online'
        enableOnlineSpecificFeatures()
      
      # Palette
      palette = Affiliation.org[affiliationKey].palette
      if palette isnt undefined
        $('#affiliationPalette').val palette
        ls.affiliationPalette = palette
        if DEBUG then console.log 'Applying chosen palette', palette
        $('#palette').attr 'href', Palettes.get palette
      
      # Extension icon
      icon = Affiliation.org[affiliationKey].icon
      Browser.setIcon icon
      # Favicon
      $('link[rel="shortcut icon"]').attr 'href', icon
      # Symbol
      symbol = Affiliation.org[affiliationKey].symbol
      $('#affiliationSymbol').attr 'style', 'background-image:url("'+symbol+'");'
      # "Popup here"-bubble
      $('#popupHere img.icon').attr 'src', symbol
      # Website link
      web = Affiliation.org[affiliationKey].web
      $('#affiliationSymbol').unbind 'click'
      $('#affiliationSymbol').click ->
        Browser.openTab web
      # Name to badge title and localstorage
      name = Affiliation.org[affiliationKey].name
      Browser.setTitle name + ' Notifier'
      ls.extensionName = name + ' Notifier'
    
    # Throw out old news
    ls.removeItem 'affiliationFeedItems'+number

    if ls['showAffiliation'+number] is 'true'
      # Update to new feed
      Browser.getBackgroundProcess().updateAffiliationNews number
    
    # Display Saved<3
    displayOnPageNotification()
    # Analytics
    if !DEBUG then _gaq.push(['_trackEvent', 'options', 'clickAffiliation'+number, affiliationKey])

bindPaletteSelector = ->
  # Default values
  $('#affiliationPalette').val ls.affiliationPalette
  # React to change
  $('#affiliationPalette').change ->
    # Get newly set value
    palette = $(this).val()
    # Save it
    ls.affiliationPalette = palette
    # Applying palette to options page
    if DEBUG then console.log 'Applying chosen palette', palette
    $('#palette').attr 'href', Palettes.get palette
    # Display Saved<3
    displayOnPageNotification()
    # Analytics
    if !DEBUG then _gaq.push(['_trackEvent', 'options', 'clickPalette', palette])

disableOnlineSpecificFeatures = (quick) ->
  ls.showOffice = 'false'
  ls.coffeeSubscription = 'false'
  ls.extensionCreator = 'Online'
  if quick
    $('label[for="showOffice"]').slideUp {duration:0}
    $('label[for="coffeeSubscription"]').slideUp {duration:0}
    $('#container').css 'top', '60%'
    $('header').css 'top', '60%'
    $('#plusonebutton').fadeOut {duration:0}
    # No need to change creator name in pageflip when quick-disabling
  else
  # Hide office status option
  $('label[for="showOffice"]').slideUp 'slow'
  # Hide coffee subscription option
  $('label[for="coffeeSubscription"]').slideUp 'slow', ->
    # Move all content back down
    $('#container').animate {'top':'60%'}, 300
    $('header').animate {'top':'60%'}, 300, ->
      # Fade out the Google +1 Button
      $('#plusonebutton').fadeOut 'slow', ->
        # Change pageflip name
        changeCreatorName ls.extensionCreator

enableOnlineSpecificFeatures = (quick) ->
  ls.showOffice = 'true'
  ls.coffeeSubscription = 'true'
  ls.extensionCreator = 'dotKom'
  restoreChecksToBoxes()
  if quick
    $('label[for="showOffice"]').slideDown {duration:0}
    $('label[for="coffeeSubscription"]').slideDown {duration:0}
    $('#container').css 'top', '50%'
    $('header').css 'top', '50%'
    $('#plusonebutton').fadeIn {duration:0}
    # No need to change creator name in pageflip when quick-enabling
  else
    # Update office status
    Browser.getBackgroundProcess().updateOfficeAndMeetings true
    # Move all content back up
    $('#container').animate {'top':'50%'}, 300
    $('header').animate {'top':'50%'}, 300, ->
      # Show office status option
      $('label[for="showOffice"]').slideDown 'slow'
      # Show coffee subscription option
      $('label[for="coffeeSubscription"]').slideDown 'slow', ->
        # Fade in the Google +1 Button
        $('#plusonebutton').fadeIn 'slow', ->
          # Change pageflip name
          changeCreatorName ls.extensionCreator

bindCantinaSelector = (selector) ->
  # Default values
  $('#' + selector).val ls[selector]
  # React to change
  $('#' + selector).change ->
    cantina = $(this).prop 'value'
    ls[selector] = cantina
    if !DEBUG then _gaq.push(['_trackEvent', 'options', 'clickCantina', cantina])

bindBusFields = (busField) ->
  cssSelector = '#' + busField
  # if DEBUG then console.log 'Binding bus fields for ' + cssSelector
  fadeTime = 50

  stop = $(cssSelector + ' input')
  direction = $(cssSelector + ' select')

  # Load users saved buses
  loadBus busField

  $(stop).focus ->
    
    # Clear stop field on click
    if DEBUG then console.log 'focus - clear field and show saved value as placeholder'
    ls.busStopClickedAway = ls[busField+'Name']
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
    # HOTFIX console.log json ############################################################
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
  ls[busField + 'Name'] = stopName
  ls[busField + 'Direction'] = direction
  ls[busField + 'ActiveLines'] = JSON.stringify activeLines
  ls[busField + 'InactiveLines'] = JSON.stringify inactiveLines
  if DEBUG then console.log 'saved activeLines for '+busField, '"', activeLines, '"'
  if DEBUG then console.log 'saved inactiveLines '+busField, '"', inactiveLines, '"'
  if DEBUG then console.log 'saved http://api.visuweb.no/bybussen/1.0/Departure/Realtime/' + busStopId + '/f6975f3c1a3d838dc69724b9445b3466'
  displayOnPageNotification()
  # Analytics? No, we're not running analytics on bus stops, it would have privacy implications.

loadBus = (busField) ->
  cssSelector = '#' + busField
  stopName = ls[busField + 'Name']
  direction = ls[busField + 'Direction']
  activeLines = ls[busField + 'ActiveLines']
  inactiveLines = ls[busField + 'InactiveLines']

  # Add stopname and direction to busfields
  if stopName isnt undefined and direction isnt undefined
    $(cssSelector + ' input').val stopName
    $(cssSelector + ' select').val direction
    # if DEBUG then console.log 'loaded "' + stopName + '" to "' + busField + '"'
  
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
  if activate
    $('#useInfoscreen').attr 'checked', false
    # Remove subtext
    $('#header_text').fadeOut()
    # Animate away all other options
    $('#container #left').animate {'width':'0pt'}, speed, ->
      $('#container #left').hide()
      $('#infoscreen_slider').slideUp speed, ->
        # Animate the useInfoscreen image
        $('img#useInfoscreen').slideUp speed, ->
          # Animate in the infoscreen preview
          $('#infoscreen_preview').slideDown speed, ->
            # New logo subtext
            $('#header_text').html '<b>Info</b>screen'
            $('#header_text').fadeIn ->
              # Move infoscreen preview to the circa middle of the screen
              $('#container #right').animate {'margin-left':'160pt'}, speed
              # Move all content a bit up
              $('header').animate {'top':'50%'}, speed
              $('#container').animate {'top':'50%'}, speed, ->
                name = Affiliation.org[ls.affiliationKey1].name
                if force or confirm 'Sikker på at du vil skru på '+name+' Infoscreen?\n\n- Krever full-HD skjerm som står på høykant\n- Popup-knappen åpner Infoskjerm i stedet\n- Infoskjermen skjuler musepekeren\n- Infoskjermen åpnes hver gang '+BROWSER+' starter\n- Infoskjermen åpnes nå!'
                  # Enable, and check the checkbox
                  ls['useInfoscreen'] = 'true'
                  $('#useInfoscreen').prop 'checked', true
                  # Reset icon, icon title and icon badge
                  Browser.setIcon Affiliation.org[ls.affiliationKey1].icon
                  Browser.setTitle Affiliation.org[ls.affiliationKey1].name + ' Infoscreen'
                  Browser.setBadgeText ''
                  # Create Infoscreen in a new tab
                  if not force
                    Browser.openBackgroundTab 'infoscreen.html'
                else
                  revertInfoscreen()
  else
    # Disable
    ls['useInfoscreen'] = 'false'
    # # Close any open Infoscreen tabs
    # closeInfoscreenTabs()
    # Refresh office status
    if ls.affiliationKey1 is 'online'
      Browser.getBackgroundProcess().updateOfficeAndMeetings true
    else
      Browser.setIcon Affiliation.org[ls.affiliationKey1].icon
      Browser.setTitle Affiliation.org[ls.affiliationKey1].name + ' Notifier'
    # Animations
    revertInfoscreen()

revertInfoscreen = ->
  speed = 300
  # Remove subtext
  $('#header_text').fadeOut speed, ->
    # Move all content back down
    if ls.affiliationKey1 is 'online'
      $('#container').animate {'top':'50%'}, speed
      $('header').animate {'top':'50%'}, speed
    else
      $('#container').animate {'top':'60%'}, speed
      $('header').animate {'top':'60%'}, speed
    # Move infoscreen preview back in place (to the left)
    $('#container #right').animate {'margin-left':'0'}, speed
    # Animate in the infoscreen preview
    $('#infoscreen_preview').slideUp speed, ->
      # Animate the useInfoscreen image
      $('img#useInfoscreen').slideDown speed, ->
        # Slide more options back open
        $('#infoscreen_slider').slideDown speed, ->
          # Show the rest of the options again
          $('#container #left').show()
          # Animate in the rest of the options
          $('#container #left').animate {'width':'54%'}, speed, ->
            # Back to old logo subtext
            $('#header_text').html '<b>Notifier</b> Options'
            $('#header_text').fadeIn()

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

restoreChecksToBoxes = ->
  # Restore checks to boxes from localStorage
  $('input:checkbox').each (index, element) ->
    if ls[element.id] is 'true'
      element.checked = true

fadeInCanvas = ->
  if !DEBUG then _gaq.push(['_trackEvent', 'options', 'toggleCanvas'])
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

changeCreatorName = (name) ->
  # Stop previous changeCreatorName instance, if any
  clearTimeout Number ls.animateCreatorNameTimeoutId
  # Animate creator name change in the pageflip
  animateCreatorName name + " with <3"

animateCreatorName = (line, build) ->
  # Animate it
  text = $('#pagefliptyping').text()
  if text.length is 0
    build = true
  random = Math.floor 350 * Math.random() + 50
  if !build
    $('#pagefliptyping').text text.slice 0, text.length-1
    ls.animateCreatorNameTimeoutId = setTimeout ( ->
      animateCreatorName line
    ), random
  else
    if text.length isnt line.length
      if text.length is 0
        $('#pagefliptyping').text line.slice 0, 1
      else
        $('#pagefliptyping').text line.slice 0, text.length+1
      ls.animateCreatorNameTimeoutId = setTimeout ( ->
        animateCreatorName line, true
      ), random

# Document ready, go!
$ ->
  if DEBUG
    $('#debug_links').show()
    $('button.debug').click ->
      Browser.openTab $(this).attr 'data'

  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup AJAX_SETUP

  # Remove Online specific features if the affiliation is another
  if ls.affiliationKey1 isnt 'online'
    disableOnlineSpecificFeatures true # true means be quick about it!

  # Apply affiliation specific features
  # favicon
  icon = Affiliation.org[ls.affiliationKey1].icon
  $('link[rel="shortcut icon"]').attr 'href', icon
  # news symbol
  symbol = Affiliation.org[ls.affiliationKey1].symbol
  $('#affiliationSymbol').attr 'style', 'background-image:url("'+symbol+'");'
  # website
  web = Affiliation.org[ls.affiliationKey1].web
  $('#affiliationSymbol').unbind 'click'
  $('#affiliationSymbol').click ->
    Browser.openTab web
  # palette
  $('#palette').attr 'href', Palettes.get ls.affiliationPalette

  restoreChecksToBoxes()

  # If useInfoscreen is on, slide away the rest of the options and switch the logo subtext
  if ls.useInfoscreen is 'true'
    setTimeout ( ->
      toggleInfoscreen true, true
    ), 300

  # Bind the windows resize function
  $(window).bind "resize", resizeBackgroundImage
  resizeBackgroundImage() # Run once in case the window is quite big

  # Uncommented as long as we are not using the Chatter option (noone admits to using it)
  # # Minor esthetical adjustmenst for Browser
  # html = $('label[for=openChatter] span').html().replace /__nettleseren__/g, BROWSER
  # $('label[for=openChatter] span').html html
  
  # Minor esthetical adjustments for OS
  if OPERATING_SYSTEM is 'Windows'
    $('#pagefliptext').attr "style", "bottom:9px;"
    $('#pagefliplink').attr "style", "bottom:9px;"
  # Google Analytics
  $('#pagefliplink').click ->
    if !DEBUG then _gaq.push(['_trackEvent', 'options', 'clickPageflip'])
  # Adding creator name to pageflip
  changeCreatorName ls.extensionCreator
  # Blinking cursor at pageflip
  setInterval ( ->
    pageFlipCursorBlinking()
  ), 600

  # Fade in the "popup here"-bubble if options page haven't been used before
  # Also blink the first affiliation-selection field with light green colors to attract the bees
  if ls.everOpenedOptions is 'false'
    ls.everOpenedOptions = 'true'
    setTimeout ( ->
      $('#popupHere').fadeIn 'slow'
      setTimeout ( ->
        $('#popupHere').fadeOut 6000
      ), 30000
    ), 2500
    blinkAffiliation = (iteration) ->
      if 0 < iteration
        setTimeout ( ->
          $('#affiliationKey1').attr 'style', 'background-color:#87d677; color:black; border:1pt solid black;'
          setTimeout ( ->
            $('#affiliationKey1').attr 'style', ''
            blinkAffiliation iteration-1
          ), 140
        ), 140
    setTimeout ( ->
      blinkAffiliation 6
    ), 5000

  # Fade in the +1 button when (probably) ready
  if ls.affiliationKey1 is 'online'
    setTimeout ( ->
      $('#plusonebutton').fadeIn 150
    ), 1100

  # Bind a click function to the on-page notification for the canvas
  # $('#notification').click ->
  #   fadeInCanvas()

  # Allow user to change affiliation and palette
  bindAffiliationSelector '1', true
  bindAffiliationSelector '2', false
  bindPaletteSelector()
  if ls.showAffiliation2 isnt 'true'
    $('#affiliationKey2').attr 'disabled', 'disabled'

  # Allow user to select cantinas
  bindCantinaSelector 'left_cantina'
  bindCantinaSelector 'right_cantina'

  # Give user suggestions for autocomplete of bus stops
  bindBusFields 'firstBus'
  bindBusFields 'secondBus'

  # Slide away favorite bus lines when not needed to conserve space
  slideFavoriteBusLines()

  # Load lists of bus stops
  Stops.load()

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
    # Turn off palette feature
    $('#affiliationPalette').prop "disabled", "disabled"

  # Adding a hover class to #bus_box whenever the mouse is hovering over it
  $('#bus_box').hover ->
    $(this).addClass 'hover'
  , ->
    $(this).removeClass 'hover'

  # Catch new clicks
  $('input:checkbox').click ->
    _capitalized = this.id.charAt(0).toUpperCase() + this.id.slice(1)
    if !DEBUG then _gaq.push(['_trackEvent', 'options', 'click'+_capitalized, this.checked])
    
    # Special case for 'useInfoscreen'
    if this.id is 'useInfoscreen'
      toggleInfoscreen this.checked

    # All the other checkboxes (not Infoscreen)
    else
      ls[this.id] = this.checked;

      if this.id is 'showAffiliation2' and this.checked is false
        $('#affiliationKey2').attr 'disabled', 'disabled'
      if this.id is 'showAffiliation2' and this.checked is true
        $('#affiliationKey2').removeAttr 'disabled'
      
      if this.id is 'showOffice' and this.checked is true
        Browser.getBackgroundProcess().updateOfficeAndMeetings(true);
      if this.id is 'showOffice' and this.checked is false
        Browser.setIcon 'img/icon-default.png'
        Browser.setTitle ls.extensionName
      
      if this.id is 'showNotifications' and this.checked is true
        testDesktopNotification()
      
      if this.id is 'coffeeSubscription' and this.checked is true
        testCoffeeSubscription()

      displayOnPageNotification()
