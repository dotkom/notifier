# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

newsLimit = 4 # The best amount of news for Mobile, IMO

window.IS_MOBILE = 1 # An easy hack saving a lot of work, ajaxer.js checks this to determine URL path and HTTP method

mainLoop = ->
  console.lolg "\n#" + iteration

  # Only if hardware
  if Affiliation.org[ls.affiliationKey1].hw
    updateOffice() if iteration % UPDATE_OFFICE_INTERVAL is 0 and ls.showOffice is 'true'
    updateServant() if iteration % UPDATE_SERVANT_INTERVAL is 0 and ls.showOffice is 'true'
    updateMeetings() if iteration % UPDATE_MEETINGS_INTERVAL is 0 and ls.showOffice is 'true'
    updateCoffee() if iteration % UPDATE_COFFEE_INTERVAL is 0 and ls.showOffice is 'true'
  # Always update, tell when offline
  updateBus() if iteration % UPDATE_BUS_INTERVAL is 0 and ls.showBus is 'true'
  updateHours() if iteration % UPDATE_HOURS_INTERVAL is 0 and ls.showCantina is 'true'
  updateCantinas() if iteration % UPDATE_CANTINAS_INTERVAL is 0 and ls.showCantina is 'true'
  updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0
  
  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++
  
  setTimeout ( ->
    mainLoop()
  ), PAGE_LOOP

updateOffice = ->
  console.lolg 'updateOffice'
  Office.get (status, message) ->
    if ls.officeStatus isnt status or ls.officeStatusMessage isnt message
      title = ''
      if status in Object.keys Office.foods
        title = Office.foods[status].title
      else
        title = Office.statuses[status].title
      $('#office #status').html title
      $('#office #status').attr 'class', status
      $('#office #subtext').html message
      ls.officeStatus = status
      ls.officeStatusMessage = message

updateServant = ->
  console.lolg 'updateServant'
  Servant.get (servant) ->
    $('#todays #schedule #servant').html '- '+servant

updateMeetings = ->
  console.lolg 'updateMeetings'
  Meetings.get (meetings) ->
    meetings = meetings.replace /\n/g, '<br />'
    $('#todays #schedule #meetings').html meetings

updateCoffee = ->
  console.lolg 'updateCoffee'
  Coffee.get true, (pots, age) ->
    $('#todays #coffee #pots').html '- '+pots
    $('#todays #coffee #age').html age

updateCantinas = (first) ->
  console.lolg 'updateCantinas'
  update = (shortname, menu, selector) ->
    name = Cantina.names[shortname]
    $('#cantinas #'+selector+' .title').html name
    $('#cantinas #'+selector+' #dinnerbox').html listDinners menu
    clickDinnerLink '#cantinas #'+selector+' #dinnerbox li', shortname
  Cantina.get ls.leftCantina, (menu) ->
    update ls.leftCantina, menu, 'left'
  Cantina.get ls.rightCantina, (menu) ->
    update ls.rightCantina, menu, 'right'

listDinners = (menu) ->
  dinnerlist = ''
  # If menu is just a message, not a menu: (yes, a bit hackish, but reduces complexity in the cantina script)
  if typeof menu is 'string'
    ls.noDinnerInfo = 'true'
    dinnerlist += '<li>' + menu + '</li>'
  else
    ls.noDinnerInfo = 'false'
    for dinner in menu
      if dinner.price != null
        if not isNaN dinner.price
          dinner.price = dinner.price + ',-'
        else
          dinner.price = dinner.price + ' -'
        dinnerlist += '<li id="' + dinner.index + '">' + dinner.price + ' ' + dinner.text + '</li>'
      else
        dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>'
  return dinnerlist

clickDinnerLink = (cssSelector) ->
  $(cssSelector).click ->
    Browser.openTab Cantina.url
    window.close()

updateHours = ->
  console.lolg 'updateHours'
  Hours.get ls.leftCantina, (hours) ->
    $('#cantinas #left .hours').html hours
  Hours.get ls.rightCantina, (hours) ->
    $('#cantinas #right .hours').html hours

updateBus = ->
  console.lolg 'updateBus'
  if !navigator.onLine
    $('#bus #firstBus .name').html ls.firstBusName
    $('#bus #secondBus .name').html ls.secondBusName
    $('#bus #firstBus .first .line').html '<div class="error">Frakoblet fra api.visuweb.no</div>'
    $('#bus #secondBus .first .line').html '<div class="error">Frakoblet fra api.visuweb.no</div>'
  else
    createBusDataRequest('firstBus', '#firstBus')
    createBusDataRequest('secondBus', '#secondBus')

createBusDataRequest = (bus, cssIdentificator) ->
  activeLines = ls[bus+'ActiveLines'] # array of lines stringified with JSON (hopefully)
  activeLines = JSON.parse activeLines
  # Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
  Bus.get ls[bus], activeLines, (lines) ->
    insertBusInfo lines, ls[bus+'Name'], cssIdentificator

insertBusInfo = (lines, stopName, cssIdentificator) ->
  busStop = '#bus '+cssIdentificator
  spans = ['first', 'second', 'third']

  $(busStop+' .name').html stopName

  # Reset spans
  for i of spans
    $(busStop+' .'+spans[i]+' .line').html ''
    $(busStop+' .'+spans[i]+' .time').html ''
  
  if typeof lines is 'string'
    # Lines is an error message
    $(busStop+' .first .line').html '<div class="error">'+lines+'</div>'
  else
    # No lines to display, busstop is sleeping
    if lines['departures'].length is 0
      $(busStop+' .first .line').html '<div class="error">....zzzZZZzzz....</div>'
    else
      # Display line for line with according times
      for i of spans
        # Add the current line
        $(busStop+' .'+spans[i]+' .line').append lines['destination'][i]
        $(busStop+' .'+spans[i]+' .time').append lines['departures'][i]

# This function is an edited, combined version of the similar functions from
# both background.coffee (fetches news) and popup.coffee (displays news)
updateNews = ->
  console.lolg 'updateNews'
  # Get affiliation object
  affiliationKey1 = ls['affiliationKey1']
  affiliation = Affiliation.org[affiliationKey1]
  if affiliation is undefined
    console.lolg 'ERROR: chosen affiliation', affiliationKey1, 'is not known'
  else
    # Get more news than needed to check for old news that have been updated
    getNewsAmount = 10
    News.get affiliation, getNewsAmount, (items) ->
      if typeof items is 'string'
        # Error message, log it maybe
        console.lolg 'ERROR:', items
        name = Affiliation.org[affiliationKey1].name
        $('#news').html '<div class="post"><div class="title">Nyheter</div><div class="item">Frakoblet fra '+name+'</div></div>'
      else
        ls.feedItems = JSON.stringify items
        News.refreshNewsIdList items
        displayItems items

displayItems = (items) ->
  # Empty the newsbox
  $('#news').html ''
  # Get feedname
  feedKey = items[0].feedKey

  # Get list of last viewed items and check for news that are just
  # updated rather than being actual news
  newsList = JSON.parse ls.newsList
  viewedList = JSON.parse ls.viewedNewsList
  updatedList = findUpdatedPosts newsList, viewedList

  # Build list of last viewed for the next time the user views the news
  viewedList = []

  # Add feed items to popup
  $.each items, (index, item) ->
    
    if index < newsLimit
      viewedList.push item.link
      
      htmlItem = '<div class="post"><div class="title">'
      if index < ls.unreadCount
        if item.link in updatedList.indexOf
          htmlItem += '<span class="unread">UPDATED <b>::</b> </span>'
        else
          htmlItem += '<span class="unread">NEW <b>::</b> </span>'

      # EXPLANATION NEEDED:
      # .item[data] contains the link
      # .item[name] contains the alternative link, if one exists, otherwise null
      date = altLink = ''
      if item.date isnt null
        date = ' den ' + item.date
      if item.altLink isnt null
        altLink = ' name="' + item.altLink + '"'
      htmlItem += item.title + '
        </div>
          <div class="item" data="' + item.link + '"' + altLink + '>
            <img src="' + item.image + '" width="107" />
            <div class="textwrapper">
              <div class="author">&ndash; Skrevet av ' + item.creator + date + '</div>
              ' + item.description + '
            </div>
          </div>
        </div>'
      $('#news').append htmlItem
  
  # Store list of last viewed items
  ls.viewedNewsList = JSON.stringify viewedList

  # All items are now considered read
  Browser.setBadgeText ''
  ls.unreadCount = 0

  # Make news items open extension website while closing popup
  $('.item').click ->
    # The link is embedded as the ID of the element, we don't want to use
    # <a> anchors because it creates an ugly box marking the focus element.
    # Note that altLinks are embedded in the name-property of the element,
    # - if preferred by the organization, we should use that instead.
    altLink = $(this).attr 'name'
    useAltLink = Affiliation.org[ls.affiliationKey1].useAltLink
    if altLink isnt undefined and useAltLink is true
      Browser.openTab $(this).attr 'name'
    else
      Browser.openTab $(this).attr 'data'
    window.close()

  # If organization prefers alternative links, use them
  if Affiliation.org[feedKey].useAltLink
    altLink = $('.item[data="'+link+'"]').attr 'name'
    if altLink isnt 'null'
      $('.item[data="'+link+'"]').attr 'data', altLink

  # If the organization has it's own getImage function, use it
  if Affiliation.org[feedKey].getImage isnt undefined
    for index, link of viewedList
      # It's important to get the link from the callback within the function below,
      # not the above code, - because of race conditions mixing up the news posts, async ftw.
      Affiliation.org[feedKey].getImage link, (link, image) ->
        # Also, check whether there's already a qualified image before replacing it.
        if ($('.item[data="'+link+'"] img').attr('src').indexOf('http') == -1)
          $('.item[data="'+link+'"] img').attr 'src', image

  # If the organization has it's own getImages (plural) function, use it
  if Affiliation.org[feedKey].getImages isnt undefined
    Affiliation.org[feedKey].getImages viewedList, (links, images) ->
      for index of links
        if ($('.item[data="'+links[index]+'"] img').attr('src').indexOf('http') == -1)
          $('.item[data="'+links[index]+'"] img').attr 'src', images[index]

# Checks the most recent list of news against the most recently viewed list of news
findUpdatedPosts = (newsList, viewedList) ->
  updatedList = []
  # Compare lists, keep your mind straight here:
  # Updated news are:
  # - saved in the newsList before the first identical item in the viewedList
  # - saved in the viewedList after the first identical item in the newsList
  for i of newsList
    break if newsList[i] is viewedList[0]
    for j of viewedList
      continue if j is 0
      if newsList[i] is viewedList[j]
        updatedList.push newsList[i]
  return updatedList

busLoading = (cssIdentificator) ->
  console.lolg 'busLoading:', cssIdentificator
  cssSelector = '#' + cssIdentificator
  loading = if cssIdentificator is 'firstBus' then 'loadingLeft' else 'loadingRight'
  $(cssSelector + ' .name').html '<img class="'+loading+'" src="mimg/loading.gif" />'
  spans = ['first', 'second', 'third', 'fourth']
  for span in spans
    $(cssSelector + ' .' + span + ' .line').html ''
    $(cssSelector + ' .' + span + ' .time').html ''

# Document ready, go!
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup AJAX_SETUP

  # Show loading gifs
  busLoading 'firstBus'
  busLoading 'secondBus'

  # Adding the background image, from localstorage or from file
  if ls.background_image isnt undefined
    # Base64-encoded image made with http://webcodertools.com/imagetobase64converter/Create
    $('body').attr 'style', 'background-attachment:fixed;background-image:' + ls.background_image
  else
    # No background image, fetching for the first time
    $('head').append '<script src="mimg/background_image.js"></script>'
    $('body').attr 'style', 'background-attachment:fixed;background-image:' + BACKGROUND_IMAGE
    ls.background_image = BACKGROUND_IMAGE

  # Enter main loop, keeping everything up-to-date
  mainLoop()
