# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  if ls.useInfoscreen isnt 'true'
    updateOfficeAndMeetings() if iteration % UPDATE_OFFICE_INTERVAL is 0 and ls.showOffice is 'true'
    updateCoffeeSubscription() if iteration % UPDATE_COFFEE_INTERVAL is 0 and ls.coffeeSubscription is 'true'
    updateAffiliationNews '1' if iteration % UPDATE_NEWS_INTERVAL is 0 and ls.showAffiliation1 is 'true' and navigator.onLine # Only if online, otherwise keep old news
    updateAffiliationNews '2' if iteration % UPDATE_NEWS_INTERVAL is 0 and ls.showAffiliation2 is 'true' and navigator.onLine # Only if online, otherwise keep old news
  
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

updateAffiliationNews = (number) ->
  if DEBUG then console.log 'updateAffiliationNews'+number
  # Get affiliation object
  affiliationKey = ls['affiliationKey'+number]
  affiliation = Affiliation.org[affiliationKey]
  if affiliation is undefined
    if DEBUG then console.log 'ERROR: chosen affiliation', ls['affiliationKey'+number], 'is not known'
  else
    # Get more news than needed to check for old news that have been updated
    newsLimit = 10
    News.get affiliation, newsLimit, (items) ->
      # Error message, log it maybe
      if typeof items is 'string'
        if DEBUG then console.log 'ERROR:', items
      # Empty news items, don't count
      else if items.length is 0
        updateUnreadCount 0, 0
      # News is here! NEWS IS HERE! FRESH FROM THE PRESS!
      else
        saveAndCountNews items, number
        updateUnreadCount()

saveAndCountNews = (items, number) ->
  feedItems = 'affiliationFeedItems'+number
  newsList = 'affiliationNewsList'+number
  unreadCount = 'affiliationUnreadCount'+number
  lastNotified = 'affiliationLastNotified'+number

  ls[feedItems] = JSON.stringify items
  list = JSON.parse ls[newsList]
  ls[unreadCount] = News.countNewsAndNotify items, list, lastNotified
  ls[newsList] = News.refreshNewsList items

updateUnreadCount = (count1, count2) ->
  unreadCount = (Number ls.affiliationUnreadCount1) + (Number ls.affiliationUnreadCount2)
  Browser.setBadgeText String unreadCount

loadAffiliationIcon = ->
  key = ls.affiliationKey1
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

  # Primary affiliation
  if ls.showAffiliation1 is undefined
    ls.showAffiliation1 = 'true'
  if ls.affiliationKey1 is undefined
    ls.affiliationKey1 = 'online'
  if ls.affiliationUnreadCount1 is undefined
    ls.affiliationUnreadCount1 = 0
  if ls.affiliationNewsList1 is undefined
    ls.affiliationNewsList1 = JSON.stringify []
  if ls.affiliationViewedList1 is undefined
    ls.affiliationViewedList1 = JSON.stringify []
  
  if ls.affiliationPalette is undefined
    ls.affiliationPalette = 'online'

  # Secondary affiliation
  if ls.showAffiliation2 is undefined
    ls.showAffiliation2 = 'true'
  if ls.affiliationKey2 is undefined
    ls.affiliationKey2 = 'dusken'
  if ls.affiliationUnreadCount2 is undefined
    ls.affiliationUnreadCount2 = 0
  if ls.affiliationNewsList2 is undefined
    ls.affiliationNewsList2 = JSON.stringify []
  if ls.affiliationViewedList2 is undefined
    ls.affiliationViewedList2 = JSON.stringify []

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
  
  if ls.everOpenedOptions is undefined
    ls.everOpenedOptions = 'false'

  if ls.justReloadingBgProcess is undefined
    ls.justReloadingBgProcess = 'false'

  # Open options page after install
  if ls.everOpenedOptions is 'false' and !DEBUG
    Browser.openTab 'options.html'
    if !DEBUG then _gaq.push(['_trackEvent', 'background', 'loadOptions (fresh install)'])
  # Open Infoscreen if the option is set
  if ls.useInfoscreen is 'true' and ls.justReloadingBgProcess is 'false'
    Browser.openTab 'infoscreen.html'
    if !DEBUG then _gaq.push(['_trackEvent', 'background', 'loadInfoscreen'])
  # Open Chatter if the option is set
  if ls.openChatter is 'true'
    Browser.openBackgroundTab 'http://webchat.freenode.net/?channels=online'
    if !DEBUG then _gaq.push(['_trackEvent', 'background', 'loadChatter'])

  loadAffiliationIcon()

  # Reload the page once every day (in case the extension updates)
  ls.justReloadingBgProcess = 'false'
  setInterval ( ->
    ls.justReloadingBgProcess = 'true'
    document.location.reload()
  ), 86400000

  # Attaching the update-functions to the window (global) object so other pages
  # may lend these functions via Browser.getBackgroundProcess().function()
  # instead of having to rewrite the function on that page which may lead
  # to code rot.
  window.updateOfficeAndMeetings = updateOfficeAndMeetings
  window.updateCoffeeSubscription = updateCoffeeSubscription
  window.updateAffiliationNews = updateAffiliationNews
  window.loadAffiliationIcon = loadAffiliationIcon

  # Enter main loop, keeping everything up-to-date
  mainLoop()

