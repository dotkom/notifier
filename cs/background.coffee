# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  console.lolg "\n#" + iteration

  if ls.useInfoscreen isnt 'true'
    if navigator.onLine
      updateHours() if iteration % UPDATE_HOURS_INTERVAL is 0 and ls.showCantina is 'true'
      updateCantinas() if iteration % UPDATE_CANTINAS_INTERVAL is 0 and ls.showCantina is 'true'
      updateAffiliationNews '1' if iteration % UPDATE_NEWS_INTERVAL is 0 and ls.showAffiliation1 is 'true'
      updateAffiliationNews '2' if iteration % UPDATE_NEWS_INTERVAL is 0 and ls.showAffiliation2 is 'true'
    if Affiliation.org[ls.affiliationKey1].hw
      updateOfficeAndMeetings() if iteration % UPDATE_OFFICE_INTERVAL is 0 and ls.showOffice is 'true'
      updateCoffeeSubscription() if iteration % UPDATE_COFFEE_INTERVAL is 0 and ls.coffeeSubscription is 'true'
  
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
  console.lolg 'updateOfficeAndMeetings'
  Office.get (status, message) ->
    title = ''
    if force or ls.officeStatus isnt status or ls.officeStatusMessage isnt message
      # Extension icon
      if status in Object.keys Office.foods
        title = Office.foods[status].title
        Browser.setIcon Office.foods[status].icon
      else
        title = Office.statuses[status].title
        statusIcon = Affiliation.org[ls.affiliationKey1].hw.statusIcons[status]
        if statusIcon isnt undefined
          Browser.setIcon statusIcon
        else
          errorIcon = Affiliation.org[ls.affiliationKey1].icon
          Browser.setIcon errorIcon
      ls.officeStatus = status
      # Extension title (hovering mouse over icon shows the title text)
      Meetings.get (meetings) ->
        today = '### Nå\n' + title + ": " + message + "\n### Resten av dagen\n" + meetings
        Browser.setTitle today
        ls.officeStatusMessage = message

updateCoffeeSubscription = ->
  console.lolg 'updateCoffeeSubscription'
  Coffee.get false, (pots, age) ->
    # Error messages will be NaN here
    if not isNaN pots and not isNaN age
      storedPots = Number ls.coffeePots
      # New pot number?
      if storedPots < pots
        # Not a meeting?
        if ls.officeStatus isnt 'meeting'
          # Made less than 10 minutes ago?
          if age < 10
            # Notify everyone with a coffee subscription :D
            Coffee.showNotification pots, age
      # And remember to update localStorage
      ls.coffeePots = pots

updateCantinas = ->
  console.lolg 'updateCantinas'
  Cantina.get ls.leftCantina, (menu) ->
    ls.leftCantinaMenu = JSON.stringify menu
  Cantina.get ls.rightCantina, (menu) ->
    ls.rightCantinaMenu = JSON.stringify menu

updateHours = ->
  console.lolg 'updateHours'
  Hours.get ls.leftCantina, (hours) ->
    ls.leftCantinaHours = hours
  Hours.get ls.rightCantina, (hours) ->
    ls.rightCantinaHours = hours

updateAffiliationNews = (number) ->
  console.lolg 'updateAffiliationNews'+number
  # Get affiliation object
  affiliationKey = ls['affiliationKey'+number]
  affiliationObject = Affiliation.org[affiliationKey]
  if affiliationObject
    # Get more news than needed to check for old news that have been updated
    newsLimit = 10
    News.get affiliationObject, newsLimit, (items) ->
      # Error message, log it maybe
      if typeof items is 'string'
        console.lolg 'ERROR:', items
      # Empty news items, don't count
      else if items.length is 0
        updateUnreadCount 0, 0
      # News is here! NEWS IS HERE! FRESH FROM THE PRESS!
      else
        saveAndCountNews items, number
        updateUnreadCount()
  else
    console.lolg 'ERROR: chosen affiliation', ls['affiliationKey'+number], 'is not known'

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

  # Check if both current affiliations still exist, reset if not
  keys = Object.keys Affiliation.org
  Defaults.resetAffiliationsIfNotExist ls.affiliationKey1, ls.affiliationKey2, keys

  # Turn off hardwarefeatures if they're not available
  isAvailable = if Affiliation.org[ls.affiliationKey1].hw then true else false
  Defaults.setHardwareFeatures isAvailable

  # Open options page after install
  if ls.everOpenedOptions is 'false' and !DEBUG
    Browser.openTab 'options.html'
    Analytics.trackEvent 'loadOptions (fresh install)'
  # Open Infoscreen if the option is set
  if ls.useInfoscreen is 'true'
    Browser.openTab 'infoscreen.html'
    Analytics.trackEvent 'loadInfoscreen'
  # Open Chatter if the option is set
  if ls.openChatter is 'true'
    Browser.openBackgroundTab 'http://webchat.freenode.net/?channels=online'
    Analytics.trackEvent 'loadChatter'

  loadAffiliationIcon()

  Browser.bindCommandHotkeys()
  Browser.registerNotificationListeners()
  Browser.bindOmniboxToOracle()

  # Attaching the update-functions to the window (global) object so other pages
  # may lend these functions via Browser.getBackgroundProcess().function()
  # instead of having to rewrite the function on that page which may lead
  # to code rot.
  window.updateOfficeAndMeetings = updateOfficeAndMeetings
  window.updateCoffeeSubscription = updateCoffeeSubscription
  window.updateHours = updateHours
  window.updateCantinas = updateCantinas
  window.updateAffiliationNews = updateAffiliationNews
  window.loadAffiliationIcon = loadAffiliationIcon

  # Send some basic statistics once a day
  setInterval ( ->
    # App version is interesting
    Analytics.trackEvent 'appVersion', Browser.getAppVersion()
    # Affiliation is also interesting, in contrast to the popup some of these are inactive users
    # To find inactive user count, subtract these stats from popup stats
    if ls.showAffiliation2 isnt 'true'
      Analytics.trackEvent 'singleAffiliation', ls.affiliationKey1
      Analytics.trackEvent 'affiliation1', ls.affiliationKey1
    else
      Analytics.trackEvent 'doubleAffiliation', ls.affiliationKey1 + ' - ' + ls.affiliationKey2
      Analytics.trackEvent 'affiliation1', ls.affiliationKey1
      Analytics.trackEvent 'affiliation2', ls.affiliationKey2
  ), 1000 * 60 * 60 * 24

  # Enter main loop, keeping everything up-to-date
  mainLoop()
