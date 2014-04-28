# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = (force) ->
  console.lolg "\n#" + iteration

  if ls.showCantina is 'true'
    if force or iteration % UPDATE_HOURS_INTERVAL is 0
      updateHours()
  if ls.showCantina is 'true'
    if force or iteration % UPDATE_CANTINAS_INTERVAL is 0
      updateCantinas()
  # Only if hardware
  if Affiliation.org[ls.affiliationKey1].hw
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_OFFICE_INTERVAL is 0
        updateOffice()
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_SERVANT_INTERVAL is 0
        updateServant()
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_MEETINGS_INTERVAL is 0
        updateMeetings()
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_COFFEE_INTERVAL is 0
        updateCoffee()
  # Always update, tell when offline
  if ls.showBus is 'true'
    if force or iteration % UPDATE_BUS_INTERVAL is 0
      updateBus()

  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++

updateOffice = (debugStatus) ->
  console.lolg 'updateOffice'
  Office.get (status, message) ->
    if DEBUG and debugStatus
      status = debugStatus
      message = 'debugging'
    if ls.officescreenOfficeStatus isnt status or ls.officescreenOfficeStatusMessage isnt message
      if status in Object.keys Office.foods
        # Food status with just title
        $('#now #text #status').text Office.foods[status].title
        $('#now #text #status').css 'color', Office.foods[status].color
      else
        # Regular status
        $('#now #text #status').html Office.statuses[status].title
        $('#now #text #status').css 'color', Office.statuses[status].color
      $('#now #text #info').html message
      ls.officescreenOfficeStatus = status
      ls.officescreenOfficeStatusMessage = message

updateServant = ->
  console.lolg 'updateServant'
  Servant.get (servant) ->
    $('#todays #schedule #servant').html '- '+servant

updateMeetings = ->
  console.lolg 'updateMeetings'
  Meetings.get (meetings) ->
    #Add span to time
    meetings = '<span>'+meetings;
    meetings = meetings.replace(/\n/g, '<br /><span>');
    meetings = meetings.replace(/:/g, ':</span>');
    $('#todays #schedule #meetings').html meetings

updateCoffee = ->
  console.lolg 'updateCoffee'
  Coffee.get true, (pots, age) ->
    $('#todays #coffee #pots').html '- '+pots
    $('#todays #coffee #age').html age

updateCantinas = (first) ->
  console.lolg 'updateCantinas'
  update = (shortname, menu, selector) ->
    name = Cantina.names[shortname]
    $('#cantinas #'+selector+' .title').html name
    $('#cantinas #'+selector+' #dinnerbox').html listDinners menu
  Cantina.get ls.leftCantina, (menu) ->
    update ls.leftCantina, menu, 'left'
  Cantina.get ls.rightCantina, (menu) ->
    update ls.rightCantina, menu, 'right'

listDinners = (menu) ->
  dinnerlist = ''
  # If menu is just a message, not a menu: (yes, a bit hackish, but reduces complexity in the cantina script)
  if typeof menu is 'string'
    ls.noDinnerInfo = 'true'
    dinnerlist += '<li>' + menu + '</li>'
  else
    ls.noDinnerInfo = 'false'
    for dinner in menu
      if dinner.price != null
        dinner.price = dinner.price + ',-'
        dinnerlist += '<li id="' + dinner.index + '"><span>' + dinner.price + '</span> ' + dinner.text + '</li>'
      else
        dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>'
  return dinnerlist

updateHours = ->
  console.lolg 'updateHours'
  Hours.get ls.leftCantina, (hours) ->
    $('#cantinas #left .hours').html hours
  Hours.get ls.rightCantina, (hours) ->
    $('#cantinas #right .hours').html hours

updateBus = ->
  console.lolg 'updateBus'
  if !navigator.onLine
    $('#bus #firstBus .name').html ls.firstBusName
    $('#bus #secondBus .name').html ls.secondBusName
    $('#bus #firstBus .first .line').html '<div class="error">Frakoblet fra api.visuweb.no</div>'
    $('#bus #secondBus .first .line').html '<div class="error">Frakoblet fra api.visuweb.no</div>'
  else
    createBusDataRequest('firstBus', '#firstBus')
    createBusDataRequest('secondBus', '#secondBus')

createBusDataRequest = (bus, cssIdentificator) ->
  activeLines = ls[bus+'ActiveLines'] # array of lines stringified with JSON (hopefully)
  activeLines = JSON.parse activeLines
  # Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
  Bus.get ls[bus], activeLines, (lines) ->
    insertBusInfo lines, ls[bus+'Name'], cssIdentificator

insertBusInfo = (lines, stopName, cssIdentificator) ->
  busStop = '#bus '+cssIdentificator
  spans = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']

  $(busStop+' .name').html stopName

  # Reset spans
  for i of spans
    $(busStop+' .'+spans[i]+' .line').html ''
    $(busStop+' .'+spans[i]+' .time').html ''
  
  if typeof lines is 'string'
    # Lines is an error message
    $(busStop+' .first .line').html '<div class="error">'+lines+'</div>'
  else
    # No lines to display, busstop is sleeping
    if lines['departures'].length is 0
      $(busStop+' .first .line').html '<div class="error">....zzzZZZzzz....</div>'
    else
      # Display line for line with according times
      for i of spans
        # Add the current line
        $(busStop+' .'+spans[i]+' .line').append lines['destination'][i]
        urgency = calculateUrgency lines['departures'][i]
        departString = '<span style="color: ' + urgency + ';">' + lines['departures'][i] + '</span>'
        $(busStop+' .'+spans[i]+' .time').append departString

calculateUrgency = (timeString) ->
  urgencyColors = ['#DF0101', '#FF0000', '#FE2E2E', '#FA5858', '#F78181', '#F5A9A9', '#F6CECE', '#F8E0E0', '#FBEFEF', '#FFFFFF', '#DDDDDD', '#BBBBBB']
  timeString = timeString.replace('ca ', '')
  timeString = timeString.replace(' min', '')
  if timeString is 'nå'
    return urgencyColors[0]
  else if timeString.match(/[0-9]{2}:[0-9]{2}/g)
    return urgencyColors[11]
  else
    time = Number(timeString)
    if time < 22
      return urgencyColors[Math.floor(time / 2)]
  return urgencyColors[11]

changeCreatorName = (name) ->
  # Stop previous changeCreatorName instance, if any
  clearTimeout ls.changeCreatorNameTimeoutId
  # Animate creator name change in the pageflip
  animateCreatorName name

animateCreatorName = (name, build) ->
  # Animate it
  text = $('#pagefliptyping').text()
  if text.length is 0
    build = true
    name = name + " with <3"
  random = Math.floor 350 * Math.random() + 50
  if !build
    $('#pagefliptyping').text text.slice 0, text.length-1
    ls.animateCreatorNameTimeoutId = setTimeout ( ->
      animateCreatorName name
    ), random
  else
    if text.length isnt name.length
      if text.length is 0
        $('#pagefliptyping').text name.slice 0, 1
      else
        $('#pagefliptyping').text name.slice 0, text.length+1
      ls.animateCreatorNameTimeoutId = setTimeout ( ->
        animateCreatorName name, true
      ), random

# Document ready, go!
$ ->
  if DEBUG
    # show the cursor and remove the overlay (the gradient at the bottom)
    # (allows DOM inspection with the mouse)
    $('html').css 'cursor', 'auto'
    $('#container').css 'overflow-y', 'auto'
    $('body').on 'keypress', (e) ->
      if e.which is 13
        $('#overlay').toggle()
        $('#fadeOutNews').toggle()
        $('#logo').toggle()
        $('#pageflip').toggle()
      if e.which is 32
        e.preventDefault()

  # Clear all previous thoughts
  ls.removeItem 'officescreenOfficeStatus'
  ls.removeItem 'officescreenOfficeStatusMessage'

  # If only one affiliation is to be shown remove the second news column
  if ls.showAffiliation2 isnt 'true'
    # Who uses single affiliations?
    Analytics.trackEvent 'loadSingleAffiliation', ls.affiliationKey1
    # What is the prefered primary affiliation?
    Analytics.trackEvent 'loadAffiliation1', ls.affiliationKey1
  else
    # What kind of double affiliations are used?
    Analytics.trackEvent 'loadDoubleAffiliation', ls.affiliationKey1 + ' - ' + ls.affiliationKey2
    # What is the prefered primary affiliation?
    Analytics.trackEvent 'loadAffiliation1', ls.affiliationKey1
    # What is the prefered secondary affiliation?
    Analytics.trackEvent 'loadAffiliation2', ls.affiliationKey2

  # Hide stuff that the user has disabled in options
  $('#todays').hide() if ls.showOffice isnt 'true'
  $('#cantinas').hide() if ls.showCantina isnt 'true'
  $('#bus').hide() if ls.showBus isnt 'true'

  # Applying affiliation graphics
  key = ls.affiliationKey1
  logo = Affiliation.org[key].logo
  icon = Affiliation.org[key].icon
  placeholder = Affiliation.org[key].placeholder
  sponsor = Affiliation.org[key].sponsor
  if sponsor isnt undefined
    $('#logo').prop 'src', sponsor
  else
    $('#logo').prop 'src', logo
  $('link[rel="shortcut icon"]').attr 'href', icon

  # Track popularity of the chosen palette, the palette itself is loaded a lot earlier for perceived speed
  Analytics.trackEvent 'loadPalette', ls.affiliationPalette
  
  # Minor esthetical adjustments for OS version
  if Browser.onWindows()
    $('#pfText').attr "style", "bottom:9px;"
    $('#pfLink').attr "style", "bottom:9px;"
  # Adding creator name to pageflip
  changeCreatorName ls.extensionCreator
  # Blinking cursor at pageflip
  setInterval ( ->
    $(".pageflipcursor").animate opacity: 0, "fast", "swing", ->
      $(@).animate opacity: 1, "fast", "swing",
  ), 600

  # Prevent image burn-in by fading to black every half hour
  setInterval ( ->
    random = Math.ceil Math.random() * 25
    linebreaks = ('<br />' for num in [0..random]).join(' ')
    $('#overlay').html linebreaks + 'preventing image burn-in...'
    $('#overlay').css 'opacity', 1
    setTimeout ( ->
      $('#overlay').css 'opacity', 0
    ), 3500
  ), 1800000

  # Reload entirely every 24 hours, in case of app updates
  setInterval ( ->
    document.location.reload()
  ), 86400000

  # Enter main loop, keeping everything up-to-date
  stayUpdated = (now) ->
    console.lolg ONLINE_MESSAGE
    loopTimeout = if DEBUG then PAGE_LOOP_DEBUG else PAGE_LOOP
    # Schedule for repetition
    intervalId = setInterval ( ->
      mainLoop()
    ), PAGE_LOOP
    # Run once right now (just wait 2 secs to avoid network-change errors)
    timeout = if now then 0 else 2000
    setTimeout ( ->
      mainLoop true
    ), timeout
  # When offline mainloop is stopped to decrease power consumption
  window.addEventListener 'online', stayUpdated
  window.addEventListener 'offline', ->
    console.lolg OFFLINE_MESSAGE
    clearInterval intervalId
    updateBus()
  # Go
  if navigator.onLine
    stayUpdated true
  else
    mainLoop()
