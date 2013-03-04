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
  if DEBUG or !navigator.onLine or ls.currentStatus is 'error'
    loopTimeout = BACKGROUND_LOOP_QUICK
  else
    loopTimeout = BACKGROUND_LOOP

  setTimeout ( ->
    mainLoop()
  ), loopTimeout

updateOfficeAndMeetings = ->
  if DEBUG then console.log 'updateOfficeAndMeetings'
  Office.get (status, title, message) ->
    if ls.currentStatus isnt status or ls.currentStatusMessage isnt message
      Browser.setIcon 'img/icon-'+status+'.png'
      ls.currentStatus = status
      Meetings.get (meetings) ->
        today = '### Nå\n' + title + ": " + message + "\n\n### Resten av dagen\n" + meetings
        Browser.setTitle today
        ls.currentStatusMessage = message

updateCoffeeSubscription = ->
  if DEBUG then console.log 'updateCoffeeSubscription'
  Coffee.getPots (pots) ->
    storedPots = Number(ls.coffeePots);
    if storedPots < pots
      Coffee.showNotification(pots)
    ls.coffeePots = pots

updateNews = ->
  if DEBUG then console.log 'updateNews'
  # Fetching and counting the news feed
  fetchFeed ->
    response = ls.lastResponseData
    if response != null
      unreadCount response
    else
      console.log 'ERROR: response was null'

# Document ready, go!
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup timeout: AJAX_TIMEOUT
  
  # Clear previous thoughts
  if DEBUG then ls.clear()
  ls.removeItem 'currentStatus'
  ls.removeItem 'currentStatusMessage'
  ls.removeItem 'coffeePots'
  
  # Set default choices if undefined, in the same order as on the options page

  if ls.showBus is undefined
    ls.showBus = 'true'
  if ls.first_bus is undefined
    ls.first_bus = 16011333
  if ls.first_bus_name is undefined
    ls.first_bus_name = 'Gløshaugen Nord'
  if ls.first_bus_direction is undefined
    ls.first_bus_direction = 'til byen'
  if ls.first_bus_active_lines is undefined
    ls.first_bus_active_lines = JSON.stringify [5, 22]
    # hack
    ls.first_bus = 16011333
    ls.first_bus_name = 'Gløshaugen Nord'
    ls.first_bus_direction = 'til byen'
    ls.second_bus = 16010333
    ls.second_bus_name = 'Gløshaugen Nord'
    ls.second_bus_direction = 'fra byen'
    ls.second_bus_active_lines = JSON.stringify [5, 22]
    # /hack
  if ls.first_bus_inactive_lines is undefined
    ls.first_bus_inactive_lines = JSON.stringify [169]
  if ls.second_bus is undefined
    ls.second_bus = 16010333
  if ls.second_bus_name is undefined
    ls.second_bus_name = 'Gløshaugen Nord'
  if ls.second_bus_direction is undefined
    ls.second_bus_direction = 'fra byen'
  if ls.second_bus_active_lines is undefined
    ls.second_bus_active_lines = JSON.stringify [5, 22]
  if ls.second_bus_inactive_lines is undefined
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

  # Enter main loop, keeping everything up-to-date
  mainLoop()

