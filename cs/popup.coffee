# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

newsLimit = 4 # The best amount of news for the popup, IMO

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  updateServant() if iteration % UPDATE_SERVANT_INTERVAL is 0 and ls.showOffice is 'true'
  updateMeetings() if iteration % UPDATE_MEETINGS_INTERVAL is 0 and ls.showOffice is 'true'
  updateCoffee() if iteration % UPDATE_COFFEE_INTERVAL is 0 and ls.showOffice is 'true'
  updateCantinas() if iteration % UPDATE_CANTINAS_INTERVAL is 0 and ls.showCantina is 'true'
  updateHours() if iteration % UPDATE_HOURS_INTERVAL is 0 and ls.showCantina is 'true'
  updateBus() if iteration % UPDATE_BUS_INTERVAL is 0 and ls.showBus is 'true'
  updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0
  
  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++
  
  setTimeout ( ->
    mainLoop()
  ), PAGE_LOOP

updateServant = ->
  if DEBUG then console.log 'updateServant'
  Servant.get (servant) ->
    $('#todays #schedule #servant').html '- '+servant

updateMeetings = ->
  if DEBUG then console.log 'updateMeetings'
  Meetings.get (meetings) ->
    meetings = meetings.replace /\n/g, '<br />'
    $('#todays #schedule #meetings').html meetings

updateCoffee = ->
  if DEBUG then console.log 'updateCoffee'
  Coffee.get true, (pots, age) ->
    $('#todays #coffee #pots').html '- '+pots
    $('#todays #coffee #age').html age

updateCantinas = ->
  if DEBUG then console.log 'updateCantinas'
  Cantina.get ls.left_cantina, (menu) ->
    $('#cantinas #left .title').html ls.left_cantina
    $('#cantinas #left #dinnerbox').html listDinners(menu)
    clickDinnerLink '#cantinas #left #dinnerbox li'
  Cantina.get ls.right_cantina, (menu) ->
    $('#cantinas #right .title').html ls.right_cantina
    $('#cantinas #right #dinnerbox').html listDinners(menu)
    clickDinnerLink '#cantinas #right #dinnerbox li'

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
        dinner.price = dinner.price + ',- '
        dinnerlist += '<li id="' + dinner.index + '">' + dinner.price + dinner.text + '</li>'
      else
        dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>'
  return dinnerlist

clickDinnerLink = (cssSelector) ->
  $(cssSelector).click ->
    Browser.openTab Cantina.url
    window.close()

updateHours = ->
  if DEBUG then console.log 'updateHours'
  Hours.get ls.left_cantina, (hours) ->
    $('#cantinas #left .hours').html hours
  Hours.get ls.right_cantina, (hours) ->
    $('#cantinas #right .hours').html hours

updateBus = ->
  if DEBUG then console.log 'updateBus'
  if !navigator.onLine
    $('#bus #first_bus .name').html ls.first_bus_name
    $('#bus #second_bus .name').html ls.second_bus_name
    $('#bus #first_bus .first .line').html '<div class="error">Frakoblet fra api.visuweb.no</div>'
    $('#bus #second_bus .first .line').html '<div class="error">Frakoblet fra api.visuweb.no</div>'
  else
    createBusDataRequest('first_bus', '#first_bus')
    createBusDataRequest('second_bus', '#second_bus')

createBusDataRequest = (bus, cssIdentificator) ->
  activeLines = ls[bus+'_active_lines'] # array of lines stringified with JSON (hopefully)
  activeLines = JSON.parse activeLines
  # Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
  Bus.get ls[bus], activeLines, (lines) ->
    insertBusInfo lines, ls[bus+'_name'], cssIdentificator

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

updateNews = ->
  if DEBUG then console.log 'updateNews'
  # Displaying the news feed (prefetched by the background page)
  feedItems = ls.feedItems
  if feedItems isnt undefined
    displayItems JSON.parse feedItems
  else
    chosenAffiliation = ls.affiliationName
    $('#news').html '<div class="post"><div class="title">Nyheter</div><div class="item">Frakoblet fra '+chosenAffiliation+'</div></div>'

displayItems = (items) ->
  # Empty the newsbox
  $('#news').html ''
  # Get feedname
  feedName = items[0].feedName

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
              <div class="emphasized">- Skrevet av ' + item.creator + date + '</div>
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
    # <a> anchors because it creates an ugly box marking the focus element
    Browser.openTab $(this).attr 'data'
    window.close()

  # Online specific stuff
  if feedName is 'online'
    # Fetch images from the API asynchronously
    for index, link of viewedList
      Affiliation.online_getImage link, (link, image) ->
        # It's important to get the link from the callback, not the above code
        # in order to have the right link at the right time, async ftw.
        $('.item[data="'+link+'"] img').attr 'src', image
        # When that's done for an image, check if the link could be a better one
        altLink = $('.item[data="'+link+'"]').attr 'name'
        if altLink isnt 'null'
          $('.item[data="'+link+'"]').attr 'data', altLink

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

optionsText = (show) ->
  fadeButtonText show, 'Innstillinger'

chatterText = (show) ->
  fadeButtonText show, '&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Bli med i samtalen' # lol i know ^^

fadeButtonText = (show, msg) ->
  fadeInSpeed = 150
  fadeOutSpeed = 50
  if show
    $('#buttontext').html msg
    $('#buttontext').fadeIn fadeInSpeed
  else
    $('#buttontext').fadeOut fadeOutSpeed
    $('#buttontext').html ''

# Document ready, go!
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup timeout: AJAX_TIMEOUT

  # If Infoscreen mode is enabled we'll open the infoscreen when the icon is clicked
  if ls.useInfoscreen is 'true'
    Browser.openTab 'infoscreen.html'
    setTimeout ( ->
      window.close()
    ), 250

  # Hide stuff the user does not want to see
  $('#todays').hide() if ls.showOffice isnt 'true'
  $('#cantinas').hide() if ls.showCantina isnt 'true'
  $('#bus').hide() if ls.showBus isnt 'true'

  # Show the logo and placeholder image for the correct organization
  if ls.affiliationName isnt 'online'
    affiliation = ls.affiliationName
    # If the affiliation has a defined logo
    logo = Affiliation.org[affiliation].logo
    if logo isnt undefined and logo isnt ''
      if DEBUG then console.log 'Applying affiliation logo', logo
      $('#header #logo').prop 'src', logo
  
  # Show the color palette the user has chosen
  color = ls['affiliationColor']
  if color isnt 'undefined' and color isnt ''
    if DEBUG then console.log 'Applying affiliation color', color
    cssMap = Colors.getBackgroundStyle color
    $('#background').css cssMap

  # Make logo open extension website while closing popup
  $('#logo').click ->
    Browser.openTab EXTENSION_WEBSITE
    window.close()

  $('#options_button').click ->
    Browser.openTab 'options.html'
    window.close()

  $('#chatter_button').click ->
    Browser.openTab 'http://webchat.freenode.net/?channels=online'
    window.close()

  # Bind buttons to hovertext
  $('#options_button').mouseenter ->
    optionsText true
  $('#options_button').mouseleave ->
    optionsText false

  $('#chatter_button').mouseenter ->
    chatterText true
  $('#chatter_button').mouseleave ->
    chatterText false

  $('#bus #atb_logo').click ->
    Browser.openTab 'http://www.atb.no'
    window.close()

  # React to Konami code
  $(document).konami (
    code: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
    callback: ->
      $('head').append '<style type="text/css">
        @-webkit-keyframes adjustHue {
          0% { -webkit-filter: hue-rotate(0deg); }
          10% { -webkit-filter: hue-rotate(36deg); }
          20% { -webkit-filter: hue-rotate(72deg); }
          30% { -webkit-filter: hue-rotate(108deg); }
          40% { -webkit-filter: hue-rotate(144deg); }
          50% { -webkit-filter: hue-rotate(180deg); }
          60% { -webkit-filter: hue-rotate(216deg); }
          70% { -webkit-filter: hue-rotate(252deg); }
          80% { -webkit-filter: hue-rotate(288deg); }
          90% { -webkit-filter: hue-rotate(324deg); }
          100% { -webkit-filter: hue-rotate(360deg); }
        }</style>'
      $('#background').attr 'style','-webkit-animation:adjustHue 10s alternate infinite;'
  )

  # Enter main loop, keeping everything up-to-date
  mainLoop()
