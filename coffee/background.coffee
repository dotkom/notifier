# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  if ls.useInfoscreen isnt 'true'
    # Update office status every mainloop if we're offline in order to react quickly when we're back
    updateOffice() if iteration % UPDATE_OFFICE_INTERVAL is 0 or !navigator.onLine
    # Only update the news when online
    updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0 and navigator.onLine
  
  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++
  
  # Schedule for repetition once a minute (checking connectivity,
  # feed and office status). Runs every 3rd second if it's offline,
  # trying to react quickly upon reconnection...
  if DEBUG or !navigator.onLine
    loopTimeout = BACKGROUND_LOOP_QUICK
  else
    loopTimeout = BACKGROUND_LOOP

  setTimeout ( ->
    mainLoop()
  ), loopTimeout

updateOffice = ->
  if DEBUG then console.log 'updateOffice'
  Office.get (status, title) ->
    if ls.currentStatus isnt status or ls.currentStatusTitle isnt title
      chrome.browserAction.setIcon {path: 'img/icon-'+status+'.png'}
      chrome.browserAction.setTitle {title: title}
      ls.currentStatus = status
      ls.currentStatusTitle = title

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
  $.ajaxSetup timeout: 15000
  
  # Clear previous thoughts
  if DEBUG then ls.clear()
  ls.removeItem 'currentStatus'
  ls.removeItem 'currentStatusTitle'
  
  # Set default choices and open options page after install
  if ls.everConnected is undefined
    if ls.showOffice is undefined
      ls.showOffice = 'true'
    if ls.showNotifications is undefined
      ls.showNotifications = 'true'
    if ls.showBus is undefined
      ls.showBus = 'true'
    if ls.showCantina is undefined
      ls.showCantina = 'true'
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

