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
  # Get affiliation object
  affiliationKey = ls.affiliationKey
  affiliation = Affiliation.org[affiliationKey]
  if affiliation is undefined
    if DEBUG then console.log 'ERROR: chosen affiliation', affiliationKey, 'is not known'
  else
    # Get more news than needed to check for old news that have been updated
    newsLimit = 10
    News.get affiliation, newsLimit, (items) ->
      if typeof items is 'string'
        # Error message, log it maybe
        if DEBUG then console.log 'ERROR:', items
      else
        ls.feedItems = JSON.stringify items
        News.unreadCountAndNotify items
        News.refreshNewsIdList items

loadAffiliationIcon = ->
  symbol = ls.affiliationSymbol
  if symbol isnt undefined and symbol isnt ''
    Browser.setIcon ls.affiliationSymbol
  else
    if DEBUG then console.log 'ERROR: tried to load empty/undefined affiliation icon'

# Document ready, go!
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup AJAX_SETUP
  
  # Clear previous thoughts
  if DEBUG then ls.clear()
  ls.removeItem 'currentStatus'
  ls.removeItem 'currentStatusMessage'
  
  # Set default choices if undefined, in the same order as on the options page

  if ls.extensionName is undefined
    ls.extensionName = 'Online Notifier'
  if ls.extensionWebsite is undefined
    ls.extensionWebsite = 'https://online.ntnu.no'
  if ls.extensionCreator is undefined
    ls.extensionCreator = 'dotKom' # Max 8 letters because of styling

  if ls.showAffiliation is undefined
    ls.showAffiliation = 'true'
  if ls.affiliationKey is undefined
    ls.affiliationKey = 'online'
  if ls.affiliationColor is undefined
    ls.affiliationColor = 'blue'
  if ls.affiliationSymbol is undefined
    ls.affiliationSymbol = '/img/icon-default.png'

  # Lists of links (IDs) for news items
  if ls.newsList is undefined
    ls.newsList = JSON.stringify []
  if ls.viewedNewsList is undefined
    ls.viewedNewsList = JSON.stringify []

  if ls.showBus is undefined
    ls.showBus = 'true'

  # If any of these properties are undefined we'll reset all of them
  firstBusProps = [
    ls.firstBus,
    ls.firstBusName,
    ls.firstBusDirection,
    ls.firstBusActiveLines,
    ls.firstBusInactiveLines,
  ]
  secondBusProps = [
    ls.secondBus,
    ls.secondBusName,
    ls.secondBusDirection,
    ls.secondBusActiveLines,
    ls.secondBusInactiveLines,
  ]
  firstBusOk = true
  secondBusOk = true
  firstBusOk = false for prop in firstBusProps when prop is undefined
  secondBusOk = false for prop in secondBusProps when prop is undefined
  if !firstBusOk
    ls.firstBus = 16011333
    ls.firstBusName = 'Gløshaugen Nord'
    ls.firstBusDirection = 'til byen'
    ls.firstBusActiveLines = JSON.stringify [5, 22]
    ls.firstBusInactiveLines = JSON.stringify [169]
  if !secondBusOk
    ls.secondBus = 16010333
    ls.secondBusName = 'Gløshaugen Nord'
    ls.secondBusDirection = 'fra byen'
    ls.secondBusActiveLines = JSON.stringify [5, 22]
    ls.secondBusInactiveLines = JSON.stringify [169]
  
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

  loadAffiliationIcon()

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
  window.loadAffiliationIcon = loadAffiliationIcon

  # Enter main loop, keeping everything up-to-date
  mainLoop()

