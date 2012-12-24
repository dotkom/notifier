# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  if ls.useInfoscreen isnt 'true'
    updateOfficeAndMeetings() if iteration % UPDATE_OFFICE_INTERVAL is 0
    updateCoffee() if iteration % UPDATE_COFFEE_INTERVAL is 0
    updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0 and navigator.onLine # Only if online
  
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
  if DEBUG then console.log 'updateOffice'
  Office.get (status, title, message) ->
    if ls.currentStatus isnt status or ls.currentStatusMessage isnt message
      chrome.browserAction.setIcon {path: 'img/icon-'+status+'.png'}
      ls.currentStatus = status
      Meetings.get (meetings) ->
        today = '### Nå\n' + title + ": " + message + "\n\n### Resten av dagen\n" + meetings
        chrome.browserAction.setTitle {title: today}
        ls.currentStatusMessage = message

updateCoffee = ->
  # IMPLEMENT THIS
  if DEBUG then console.log 'updateCoffee'
  Coffee.get (pots, age) ->
    console.log pots, age

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
  # Setting the global timeout for all AJAX and JSON requests
  $.ajaxSetup timeout: 6000
  
  # Clear previous thoughts
  if DEBUG then ls.clear()
  ls.removeItem 'currentStatus'
  ls.removeItem 'currentStatusMessage'
  
  # Set default choices and open options page after install
  if ls.everConnected is undefined
    
    if ls.first_bus is undefined
      ls.showBus = 'true'
      ls.first_bus = 16011333
      ls.first_bus_name = 'Gløshaugen Nord'
      ls.first_bus_direction = 'til byen'
      ls.first_bus_active_lines = JSON.stringify [5, 22]
      ls.first_bus_inactive_lines = JSON.stringify [169]
      ls.second_bus = 16010333
      ls.second_bus_name = 'Gløshaugen Nord'
      ls.second_bus_direction = 'fra byen'
      ls.second_bus_active_lines = JSON.stringify [5, 22]
      ls.second_bus_inactive_lines = JSON.stringify [169]
    if ls.showOffice is undefined
      ls.showOffice = 'true'
    if ls.showCantina is undefined
      ls.showCantina = 'true'
    
    if ls.showNotifications is undefined
      ls.showNotifications = 'true'
    if ls.openChatter is undefined
      ls.openChatter = 'false'
    if ls.useInfoscreen is undefined
      ls.useInfoscreen = 'false'

    if !DEBUG
      chrome.tabs.create {url: chrome.extension.getURL("options.html"), selected: true}

  # Open Infoscreen if the option is set
  if ls.useInfoscreen is 'true'
    chrome.tabs.create {url: chrome.extension.getURL("infoscreen.html"), selected: true}

  # Open Chatter if the option is set
  if ls.openChatter is 'true'
    chrome.tabs.create {url: 'http://webchat.freenode.net/?channels=online', selected: false}

  # Set default vars for main loop
  ls.everConnected = ls.wasConnected = 'false'

  # Reload the page once every day
  setInterval ( ->
    document.location.reload()
  ), 86400000

  # Enter main loop, keeping everything up-to-date
  mainLoop()

