# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  if ls.useInfoscreen isnt 'true'
    updateOfficeAndMeetings() if iteration % UPDATE_OFFICE_INTERVAL is 0 and ls.showOffice is 'true'
    updateCoffeeSubscription() if iteration % UPDATE_COFFEE_INTERVAL is 0 and ls.coffeeSubscription is 'true'
    updateAffiliationNews() if iteration % UPDATE_NEWS_INTERVAL is 0 and ls.showAffiliation is 'true' and navigator.onLine # Only if online, otherwise keep old news
    updateMediaNews() if iteration % UPDATE_MEDIA_INTERVAL is 0 and ls.showMedia is 'true' and navigator.onLine # Only if online, otherwise keep old media
  
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

updateAffiliationNews = ->
  if DEBUG then console.log 'updateAffiliationNews'
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
        ls.affiliationFeedItems = JSON.stringify items
        newsList = JSON.parse ls.affiliationNewsList
        ls.affiliationUnreadCount = News.countNewsAndNotify items, newsList, 'affiliationLastNotified'
        unreadCount = (Number ls.mediaUnreadCount) + (Number ls.affiliationUnreadCount)
        Browser.setBadgeText String unreadCount
        ls.affiliationNewsList = News.refreshNewsList items

updateMediaNews = ->
  if DEBUG then console.log 'updateMediaNews'
  # Get affiliation object
  mediaKey = ls.mediaKey
  media = Affiliation.org[mediaKey]
  if media is undefined
    if DEBUG then console.log 'ERROR: chosen media', mediaKey, 'is not known'
  else
    # Get more news than needed to check for old news that have been updated
    newsLimit = 10
    News.get media, newsLimit, (items) ->
      if typeof items is 'string'
        # Error message, log it maybe
        if DEBUG then console.log 'ERROR:', items
      else
        ls.mediaFeedItems = JSON.stringify items
        newsList = JSON.parse ls.mediaNewsList
        ls.mediaUnreadCount = News.countNewsAndNotify items, newsList, 'mediaLastNotified'
        unreadCount = (Number ls.mediaUnreadCount) + (Number ls.affiliationUnreadCount)
        Browser.setBadgeText String unreadCount
        ls.mediaNewsList = News.refreshNewsList items

loadAffiliationIcon = ->
  key = ls.affiliationKey
  # Set badge icon
  icon = Affiliation.org[key].icon
  Browser.setIcon icon
  # Set badge title
  name = Affiliation.org[key].name
  Browser.setTitle name + ' Notifier'

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
  if ls.extensionCreator is undefined
    ls.extensionCreator = 'dotKom' # Max 8 letters because of styling

  if ls.showAffiliation is undefined
    ls.showAffiliation = 'true'
  if ls.affiliationKey is undefined
    ls.affiliationKey = 'online'
  if ls.affiliationPalette is undefined
    ls.affiliationPalette = 'online'

  if ls.affiliationUnreadCount is undefined
    ls.affiliationUnreadCount = 0
  if ls.affiliationNewsList is undefined
    ls.affiliationNewsList = JSON.stringify []
  if ls.affiliationViewedList is undefined
    ls.affiliationViewedList = JSON.stringify []

  if ls.showMedia is undefined
    ls.showMedia = 'true'
  if ls.mediaKey is undefined
    ls.mediaKey = 'dusken'

  if ls.mediaUnreadCount is undefined
    ls.mediaUnreadCount = 0
  if ls.mediaNewsList is undefined
    ls.mediaNewsList = JSON.stringify []
  if ls.mediaViewedList is undefined
    ls.mediaViewedList = JSON.stringify []

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

  # Reload the page once every day (in case the extension updates)
  setInterval ( ->
    document.location.reload()
  ), 86400000

  # Attaching the update-functions to the window (global) object so other pages
  # may lend these functions via Browser.getBackgroundProcess().function()
  # instead of having to rewrite the function on that page which may lead
  # to code rot.
  window.updateOfficeAndMeetings = updateOfficeAndMeetings
  window.updateCoffeeSubscription = updateCoffeeSubscription
  window.updateAffiliationNews = updateAffiliationNews
  window.updateMediaNews = updateMediaNews
  window.loadAffiliationIcon = loadAffiliationIcon

  # Enter main loop, keeping everything up-to-date
  mainLoop()

