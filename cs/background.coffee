# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  if ls.useInfoscreen isnt 'true'
    updateOfficeAndMeetings() if iteration % UPDATE_OFFICE_INTERVAL is 0 and ls.showOffice is 'true'
    updateCoffeeSubscription() if iteration % UPDATE_COFFEE_INTERVAL is 0 and ls.coffeeSubscription is 'true'
    updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0 and navigator.onLine # Only if online, otherwise keep old news
  
  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++
  
  # Schedule for repetition once a minute (checking connectivity,
  # feed and office status). Runs every 3rd second if it's offline,
  # trying to react quickly upon reconnection...
  if DEBUG or !navigator.onLine
    loopTimeout = BACKGROUND_LOOP_OFFLINE
  else
    loopTimeout = BACKGROUND_LOOP

  setTimeout ( ->
    mainLoop()
  ), loopTimeout

updateOfficeAndMeetings = (force) ->
  if DEBUG then console.log 'updateOfficeAndMeetings'
  Office.get (status, title, message) ->
    if force or ls.currentStatus isnt status or ls.currentStatusMessage isnt message
      Browser.setIcon 'img/icon-'+status+'.png'
      ls.currentStatus = status
      Meetings.get (meetings) ->
        today = '### Nå\n' + title + ": " + message + "\n### Resten av dagen\n" + meetings
        Browser.setTitle today
        ls.currentStatusMessage = message

updateCoffeeSubscription = ->
  if DEBUG then console.log 'updateCoffeeSubscription'
  Coffee.get false, (pots, age) ->
    # Error messages will be NaN here
    if not isNaN pots and not isNaN age
      storedPots = Number ls.coffeePots
      # New pot number?
      if storedPots < pots
        # Not a meeting?
        if ls.currentStatus isnt 'meeting'
          # Made less than 10 minutes ago?
          if age < 10
            # Notify everyone with a coffee subscription :D
            Coffee.showNotification pots, age
      # And remember to update localStorage
      ls.coffeePots = pots

updateNews = ->
  if DEBUG then console.log 'updateNews'
  affiliation = ls['affiliationName']
  # The number of news possible to cram into the infoscreen
  # if all other features are disabled is exactly 8, that's
  # what we'll keep in storage till we need it.
  newsLimit = 8
  News.get affiliation, newsLimit, (items) ->
    if typeof items is 'string'
      # Error message, log it
      if DEBUG then console.log 'ERROR:', items
    else
      ls.feedItems = JSON.stringify items
      News.unreadCount items

# Document ready, go!
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup timeout: AJAX_TIMEOUT
  
  # Clear previous thoughts
  if DEBUG then ls.clear()
  ls.removeItem 'currentStatus'
  ls.removeItem 'currentStatusMessage'
  
  # Set default choices if undefined, in the same order as on the options page

  if ls.showAffiliation is undefined
    ls.showAffiliation = 'true'
  if ls.affiliationName is undefined
    ls.affiliationName = 'online'
  if ls.affiliationColor is undefined
    ls.affiliationColor = 'blue'

  # Lists of IDs for news items
  if ls.lastViewedIdList is undefined
    ls.lastViewedIdList = JSON.stringify []
  if ls.mostRecentIdList is undefined
    ls.mostRecentIdList = JSON.stringify []

  if ls.showBus is undefined
    ls.showBus = 'true'

  # If any of these properties are undefined we'll reset all of them
  first_bus_props = [
    ls.first_bus,
    ls.first_bus_name,
    ls.first_bus_direction,
    ls.first_bus_active_lines,
    ls.first_bus_inactive_lines,
  ]
  second_bus_props = [
    ls.second_bus,
    ls.second_bus_name,
    ls.second_bus_direction,
    ls.second_bus_active_lines,
    ls.second_bus_inactive_lines,
  ]
  firstBusOk = true
  secondBusOk = true
  # Lol, CoffeeScript at it's best
  firstBusOk = false for prop in first_bus_props when prop is undefined
  secondBusOk = false for prop in second_bus_props when prop is undefined
  if !firstBusOk
    ls.first_bus = 16011333
    ls.first_bus_name = 'Gløshaugen Nord'
    ls.first_bus_direction = 'til byen'
    ls.first_bus_active_lines = JSON.stringify [5, 22]
    ls.first_bus_inactive_lines = JSON.stringify [169]
  if !secondBusOk
    ls.second_bus = 16010333
    ls.second_bus_name = 'Gløshaugen Nord'
    ls.second_bus_direction = 'fra byen'
    ls.second_bus_active_lines = JSON.stringify [5, 22]
    ls.second_bus_inactive_lines = JSON.stringify [169]
  
  if ls.showOffice is undefined
    ls.showOffice = 'true'
  
  if ls.showCantina is undefined
    ls.showCantina = 'true'
  if ls.left_cantina is undefined
    ls.left_cantina = 'hangaren'
  if ls.right_cantina is undefined
    ls.right_cantina = 'realfag'
  
  if ls.openChatter is undefined
    ls.openChatter = 'false'
  
  if ls.showNotifications is undefined
    ls.showNotifications = 'true'
  
  if ls.coffeeSubscription is undefined
    ls.coffeeSubscription = 'true'
  if ls.coffeePots is undefined
    ls.coffeePots = 0
  
  if ls.useInfoscreen is undefined
    ls.useInfoscreen = 'false'

  # Open options page after install
  if ls.everConnected is undefined and !DEBUG
    Browser.openTab 'options.html'

  # Open Infoscreen if the option is set
  if ls.useInfoscreen is 'true'
    Browser.openTab 'infoscreen.html'

  # Open Chatter if the option is set
  if ls.openChatter is 'true'
    Browser.openBackgroundTab 'http://webchat.freenode.net/?channels=online'

  # Set default vars for main loop
  ls.everConnected = ls.wasConnected = 'false'

  # Reload the page once every day
  setInterval ( ->
    document.location.reload()
  ), 86400000

  # Attaching the update-functions to the window (global) object so other pages
  # may lend these functions via Browser.getBackgroundProcess().function()
  # instead of having to rewrite the function on that page which may lead
  # to code rot.
  window.updateOfficeAndMeetings = updateOfficeAndMeetings
  window.updateCoffeeSubscription = updateCoffeeSubscription
  window.updateNews = updateNews

  # Enter main loop, keeping everything up-to-date
  mainLoop()

