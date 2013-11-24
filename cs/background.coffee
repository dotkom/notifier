# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  if ls.useInfoscreen isnt 'true'
    if Affiliation.org[ls.affiliationKey1].hardwareFeatures
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
  Office.get (status, message) ->
    title = ''
    if force or ls.officeStatus isnt status or ls.officeStatusMessage isnt message
      # Extension icon
      if status in Object.keys Office.foods
        title = Office.foods[status].title
        Browser.setIcon Office.foods[status].icon
      else
        title = Office.statuses[status].title
        statusIcon = Affiliation.org[ls.affiliationKey1].statusIcons[status]
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
  if DEBUG then console.log 'updateCoffeeSubscription'
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

bindOmniboxToOracle = ->
  # This event is fired each time the user updates the text in the omnibox,
  # as long as the extension's keyword mode is still active.
  chrome.omnibox.onInputChanged.addListener (text, suggest) ->
    console.log 'inputChanged: ' + text
    suggest [
      {content: text + " one", description: text + " the first one"},
      {content: text + " number two", description: text + " the second entry"}
    ]
  # This event is fired with the user accepts the input in the omnibox.
  chrome.omnibox.onInputEntered.addListener (text) ->
    console.log 'inputEntered: ' + text
    Oracle.ask text, (answer) ->
      console.log 'oracle answer: ' + answer
      Browser.createNotification
        'feedKey': ls.affiliationKey1
        'title': 'Orakelet'
        'description': answer
        'link': 'http://atb.no'
        'longStory': true
      # alert answer

# Document ready, go!
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup AJAX_SETUP

  # Turn off hardwarefeatures if they're not available
  isAvailable = Affiliation.org[ls.affiliationKey1].hardwareFeatures
  Defaults.setHardwareFeatures isAvailable

  # Open options page after install
  if ls.everOpenedOptions is 'false' and !DEBUG
    Browser.openTab 'options.html'
    if !DEBUG then _gaq.push(['_trackEvent', 'background', 'loadOptions (fresh install)'])
  # Open Infoscreen if the option is set
  if ls.useInfoscreen is 'true'
    Browser.openTab 'infoscreen.html'
    if !DEBUG then _gaq.push(['_trackEvent', 'background', 'loadInfoscreen'])
  # Open Chatter if the option is set
  if ls.openChatter is 'true'
    Browser.openBackgroundTab 'http://webchat.freenode.net/?channels=online'
    if !DEBUG then _gaq.push(['_trackEvent', 'background', 'loadChatter'])

  loadAffiliationIcon()

  bindOmniboxToOracle()
  
  Browser.registerNotificationListeners()

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
