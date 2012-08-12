# Dev mode? Clear localStorage
if DEBUG
  localStorage.clear()

# Set default choices and open options page after install
if localStorage.everConnected is undefined
  if localStorage.showOfficeStatus is undefined
    localStorage.showOfficeStatus = 'true'
  if localStorage.showNotifications is undefined
    localStorage.showNotifications = 'true'
  if localStorage.showCantinaMenu is undefined
    localStorage.showCantinaMenu = 'true'
  if localStorage.openChatter is undefined
    localStorage.openChatter = 'false'
  if !DEBUG
    chrome.tabs.create({url: chrome.extension.getURL("options.html"), selected: true})

# Open Chatter if the option is set
if localStorage.openChatter is 'true'
    chrome.tabs.create({url: CHATTER_URL, selected: false})

# Reset vars from last run
cantinaMenu_reset()
officeStatus_reset()
localStorage.everConnected = 'false'
localStorage.wasConnected = 'true'
localStorage.mainLoopTimeout = MAIN_LOOP_QUICK_TIMEOUT
iterationCounter = 1

# Setting the global timeout for all AJAX and JSON requests
$.ajaxSetup({ timeout: AJAX_REQUEST_TIMEOUT })

mainLoop = ->
  if DEBUG
    console.log '\n# '+iterationCounter

  # we're online :)
  if navigator.onLine
    # now online, fetch all
    if localStorage.wasConnected is 'false' or localStorage.everConnected is 'false'
      officeStatus_update()
      fetchFeed(unreadCount)
      cantinaMenu_update()
    
    if localStorage.everConnected is 'false'
      connectGoogleAnalytics()
    
    # normal operation
    else
      if iterationCounter % REFRESH_OFFICE_STATUS_INTERVAL is 0
        officeStatus_update()
      if iterationCounter % REFRESH_NEWS_FEED_INTERVAL is 0
        fetchFeed(unreadCount)
      if iterationCounter % REFRESH_CANTINA_MENU_INTERVAL is 0
        cantinaMenu_update()

    localStorage.everConnected = 'true'
    localStorage.wasConnected = 'true'
  # we're offline :(
  else
    officeStatus_disconnected(localStorage.wasConnected)
    localStorage.wasConnected = 'false'
  
  iterationCounter++
  if (10000 < iterationCounter) # no reason to count to infinity
    iterationCounter = 1
  
  # Schedule for repetition once a minute (checking connectivity,
  # feed and office status). Runs every 3rd second if it's offline,
  # trying to react quickly upon reconnection...
  loopTimeout = Number localStorage.mainLoopTimeout
  if DEBUG or localStorage.wasConnected is 'false'
    loopTimeout = MAIN_LOOP_QUICK_TIMEOUT

  setTimeout ( ->
    mainLoop()
  ), loopTimeout

# This page runs continously and will therefore experience downtime.
# In case there is downtime when the page opens for the first time
# we'll need to load the GAnalytics scripts once we're connected.
connectGoogleAnalytics = ->
  if DEBUG then console.log 'connecting google analytics'
  script = document.createElement "script"
  script.type = 'text/javascript'
  script.src = 'js/google_analytics.js'
  document.getElementsByTagName("head")[0].appendChild(script)
  
$ ->
  mainLoop()
