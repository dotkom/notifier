# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0
intervalId = null

newsLimit = 8 # The most news you can cram into Infoscreen, if other features are disabled

mainLoop = (force) ->
  console.lolg "\n#" + iteration

  if ls.showCantina is 'true'
    if force or iteration % UPDATE_HOURS_INTERVAL is 0
      updateHours()
  if ls.showCantina is 'true'
    if force or iteration % UPDATE_CANTINAS_INTERVAL is 0
      updateCantinas()
  if ls.showAffiliation1 is 'true'
    if force or iteration % UPDATE_NEWS_INTERVAL is 0
      updateAffiliationNews '1'
  if ls.showAffiliation2 is 'true'
    if force or iteration % UPDATE_NEWS_INTERVAL is 0
      updateAffiliationNews '2'
  # Only if hardware
  if Affiliation.org[ls.affiliationKey1].hw
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_OFFICE_INTERVAL is 0
        updateOffice()
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_SERVANT_INTERVAL is 0
        updateServant()
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_MEETINGS_INTERVAL is 0
        updateMeetings()
    if ls.showOffice is 'true'
      if force or iteration % UPDATE_COFFEE_INTERVAL is 0
        updateCoffee()
  # Always update, tell when offline
  if ls.showBus is 'true'
    if force or iteration % UPDATE_BUS_INTERVAL is 0
      updateBus()

  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++

updateOffice = (debugStatus) ->
  console.lolg 'updateOffice'
  Office.get (status, message) ->
    if DEBUG and debugStatus
      status = debugStatus
      message = 'debugging'
    if ls.infoscreenOfficeStatus isnt status or ls.infoscreenOfficeStatusMessage isnt message
      if status in Object.keys Office.foods
        if Office.foods[status].image isnt undefined
          # Food status with image
          $('#office #status img').attr 'src', Office.foods[status].image
          $('#office #status #text').hide()
          $('#office #status img').show()
        else
          # Food status with just title
          $('#office #status #text').text Office.foods[status].title
          $('#office #status #text').css 'color', Office.foods[status].color
          $('#office #status img').hide()
          $('#office #status #text').show()
      else
        # Regular status
        $('#office #status #text').html Office.statuses[status].title
        $('#office #status #text').css 'color', Office.statuses[status].color
        $('#office #status img').hide()
        $('#office #status #text').show()
      # Save them
      ls.infoscreenOfficeStatus = status
      ls.infoscreenOfficeStatusMessage = message
      # Check for Affiliation specific status message
      msgs = Affiliation.org[ls.affiliationKey1].hw.statusMessages
      if msgs
        if msgs[status]
          message = msgs[status]
      $('#office #subtext').html message

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
  # This function just fetches from localstorage (updates in background)
  console.lolg 'updateCantinas'
  update = (shortname, menu, selector) ->
    name = Cantina.names[shortname]
    $('#cantinas #'+selector+' .title').html name
    $('#cantinas #'+selector+' #dinnerbox').html listDinners menu
    clickDinnerLink '#cantinas #'+selector+' #dinnerbox li', shortname
  menu1 = JSON.parse ls.leftCantinaMenu
  menu2 = JSON.parse ls.rightCantinaMenu
  update ls.leftCantina, menu1, 'left'
  update ls.rightCantina, menu2, 'right'

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
        dinner.price = dinner.price + ',-'
        dinnerlist += '<li id="' + dinner.index + '">' + dinner.price + ' ' + dinner.text + '</li>'
      else
        dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>'
  return dinnerlist

clickDinnerLink = (cssSelector, cantina) ->
  $(cssSelector).click ->
    Analytics.trackEvent 'clickDinner', $(this).text()
    ls.clickedCantina = cantina
    Browser.openTab Cantina.url
    window.close()

updateHours = (first) ->
  # This function just fetches from localstorage (updates in background)
  console.lolg 'updateHours'
  update = (shortname, hours, selector) ->
    $('#cantinas #'+selector+' .hours').html hours
    clickHours '#cantinas #'+selector+' .hours', shortname
  update ls.leftCantina, ls.leftCantinaHours, 'left'
  update ls.rightCantina, ls.rightCantinaHours, 'right'

clickHours = (cssSelector, cantina) ->
  $(cssSelector).click ->
    Analytics.trackEvent 'clickHours', $(this).text()
    ls.clickedHours = Hours.cantinas[cantina]
    Browser.openTab Hours.url
    window.close()

updateBus = ->
  console.lolg 'updateBus'
  if !navigator.onLine
    # Reset
    stops = ['firstBus', 'secondBus']
    spans = ['first', 'second', 'third', 'fourth']
    for i of stops
      for j of spans
        $('#bus #'+stops[i]+' .'+spans[j]+' .line').html ''
        $('#bus #'+stops[i]+' .'+spans[j]+' .time').html ''
    # Error message
    $('#bus #firstBus .name').html ls.firstBusName
    $('#bus #secondBus .name').html ls.secondBusName
    $('#bus #firstBus .error').html '<div class="error">Frakoblet fra api.visuweb.no</div>'
    $('#bus #secondBus .error').html '<div class="error">Frakoblet fra api.visuweb.no</div>'      
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
  spans = ['first', 'second', 'third', 'fourth']

  $(busStop+' .name').html stopName

  # Reset spans
  for i of spans
    $(busStop+' .'+spans[i]+' .line').html ''
    $(busStop+' .'+spans[i]+' .time').html ''
  $(busStop+' .error').html ''
  
  # if lines is an error message
  if typeof lines is 'string'
    $(busStop+' .error').html lines
  else
    # No lines to display, busstop is sleeping
    if lines['departures'].length is 0
      $(busStop+' .error').html '....zzzZZZzzz....'
    else
      # Display line for line with according times
      for i of spans
        # Add the current line
        $(busStop+' .'+spans[i]+' .line').append lines['destination'][i]
        $(busStop+' .'+spans[i]+' .time').append lines['departures'][i]

updateAffiliationNews = (number) ->
  console.lolg 'updateAffiliationNews'+number
  # Displaying the news feed (prefetched by the background page)
  feedItems = ls['affiliationFeedItems'+number]
  # Detect selector
  selector = if number is '1' then '#left' else '#right'
  if ls.showAffiliation2 isnt 'true' then selector = '#full'

  if feedItems isnt undefined
    feedItems = JSON.parse feedItems
    displayItems feedItems, selector, 'affiliationNewsList'+number, 'affiliationViewedList'+number, 'affiliationUnreadCount'+number
  else
    key = ls['affiliationKey'+number]
    name = Affiliation.org[key].name
    $('#news '+selector).html '<div class="post"><div class="item"><div class="title">'+name+'</div>Frakoblet fra nyhetsstrøm</div></div>'
    $('#news '+selector).click ->
      Browser.openTab Affiliation.org[key].web

displayItems = (items, column, newsListName, viewedListName, unreadCountName) ->
  # Empty the news column
  $('#news '+column).html ''
  # Get feedkey
  feedKey = items[0].feedKey

  # Get list of last viewed items and check for news that are just
  # updated rather than being actual news
  newsList = JSON.parse ls[newsListName]
  viewedList = JSON.parse ls[viewedListName]
  updatedList = findUpdatedPosts newsList, viewedList

  # Build list of last viewed for the next time the user views the news
  viewedList = []

  # Prepare the list of images with salt, pepper and some vinegar
  storedImages = JSON.parse ls.storedImages

  # Add feed items to popup
  $.each items, (index, item) ->
    
    if index < newsLimit
      viewedList.push item.link
      
      unreadCount = Number ls[unreadCountName]
      readUnread = ''
      unless Affiliation.org[feedKey].flashyNews
        if index < unreadCount
          if item.link in updatedList.indexOf
            readUnread += '<span class="unread">UPDATED <b>::</b> </span>'
          else
            readUnread += '<span class="unread">NEW <b>::</b> </span>'

      # EXPLANATION NEEDED:
      # .item[data] contains the link
      # .item[name] contains the alternative link, if one exists, otherwise null
      date = altLink = ''
      if item.altLink isnt null
        altLink = ' name="' + item.altLink + '"'
      # NOTE: Removing date from use for now because it's borked
      # if item.date isnt null and ls.showAffiliation2 is 'false'
      #   date = ' den ' + item.date
      descLimit = 140
      if ls.showAffiliation2 is 'true'
        descLimit = 100
      if item.description.length > descLimit
        item.description = item.description.substr(0, descLimit) + '...'
      # Use image we've found to accompany the news item
      storedImage = storedImages[item.link]
      if storedImage isnt undefined
        # Also, check whether there's already a qualified image before replacing it
        if -1 is item.image.indexOf 'http'
          item.image = storedImage

      if Affiliation.org[feedKey].flashyNews and ls.showAffiliation2 is 'true'
        htmlItem = '
          <div class="post">
            <div class="item" data="' + item.link + '"' + altLink + '>
              <img class="flashy" src="' + item.image + '" />
              <div class="title flashy">' + readUnread + item.title + '</div>
              <div class="author flashy">&ndash; Av ' + item.creator + '</div>
            </div>
          </div>'

      else
        htmlItem = '
          <div class="post">
            <div class="item" data="' + item.link + '"' + altLink + '>
              <div class="title">' + readUnread + item.title + '</div>
              <img class="regular" src="' + item.image + '" />
              ' + item.description + '
              <div class="author">&ndash; Av ' + item.creator + '</div>
            </div>
          </div>'
          
      $('#news '+column).append htmlItem
  
  # Store list of last viewed items
  ls[viewedListName] = JSON.stringify viewedList

  # All items are now considered read
  Browser.setBadgeText ''
  ls[unreadCountName] = 0

  # Make news items open extension website while closing popup
  $('#news '+column+' .item').click ->
    # The link is embedded as the ID of the element, we don't want to use
    # <a> anchors because it creates an ugly box marking the focus element.
    # Note that altLinks are embedded in the name-property of the element,
    # - if preferred by the organization, we should use that instead.
    link = $(this).attr 'data'
    altLink = $(this).attr 'name'
    useAltLink = Affiliation.org[feedKey].useAltLink
    if altLink isnt undefined and useAltLink is true
      link = $(this).attr 'name'
    Browser.openTab link
    Analytics.trackEvent 'clickNews', link
    window.close()

  # Update images some times after news are loaded in case of late image updates
  # which are common when the browser has just started Notifier
  times = [100, 500, 1000, 2000, 3000, 5000, 10000]
  for i of times
    setTimeout ( ->
      updateNewsImages()
    ), times[i]

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

updateNewsImages = ->
  console.lolg 'updateNewsImages'
  # The background process looks for images, and sometimes that process
  # isn't finished before the popup loads, that's why we have to check
  # in with localStorage.storedImages a couple of times.
  $.each($('#news .post .item'), (i, val) ->
    link = $(this).attr 'data'
    image = JSON.parse(localStorage.storedImages)[link]
    if image isnt undefined
      $(this).find('img').attr 'src', image
  )

officeFontRotate = (font) ->
  fonts = ['cardo','fondamento','oleoscript','sourcesans']
  if font in fonts
    chosenFont = font
  else
    chosenFont = fonts[Math.floor(Math.random() * fonts.length)]
  $('#office #status #text').prop 'class', chosenFont
  if DEBUG
    $('#office #subtext').html ls.infoscreenOfficeStatusMessage + '<br />' + chosenFont

changeCreatorName = (name) ->
  # Stop previous changeCreatorName instance, if any
  clearTimeout ls.changeCreatorNameTimeoutId
  # Animate creator name change in the pageflip
  animateCreatorName name

animateCreatorName = (name, build) ->
  # Animate it
  text = $('#pagefliptyping').text()
  if text.length is 0
    build = true
    name = name + " with <3"
  random = Math.floor 350 * Math.random() + 50
  if !build
    $('#pagefliptyping').text text.slice 0, text.length-1
    ls.animateCreatorNameTimeoutId = setTimeout ( ->
      animateCreatorName name
    ), random
  else
    if text.length isnt name.length
      if text.length is 0
        $('#pagefliptyping').text name.slice 0, 1
      else
        $('#pagefliptyping').text name.slice 0, text.length+1
      ls.animateCreatorNameTimeoutId = setTimeout ( ->
        animateCreatorName name, true
      ), random

# Document ready, go!
$ ->
  if DEBUG
    # show the cursor and remove the overlay (the gradient at the bottom)
    # (allows DOM inspection with the mouse)
    $('html').css 'cursor', 'auto'
    $('#container').css 'overflow-y', 'auto'
    $('body').on 'keypress', (e) ->
      if e.which is 13
        $('#overlay').toggle()
        $('#fadeOutNews').toggle()
        $('#logo').toggle()
        $('#pageflip').toggle()
      if e.which is 32
        e.preventDefault()
        switch ls.infoscreenOfficeStatus
          when 'waffle' then updateOffice 'error'
          when 'error' then updateOffice 'open'
          when 'open' then updateOffice 'closed'
          when 'closed' then updateOffice 'meeting'
          when 'meeting' then updateOffice 'bun'
          when 'bun' then updateOffice 'cake'
          when 'cake' then updateOffice 'coffee'
          when 'coffee' then updateOffice 'pizza'
          when 'pizza' then updateOffice 'taco'
          when 'taco' then updateOffice 'waffle'
          else updateOffice 'error'
  
  # Clear all previous thoughts
  ls.removeItem 'infoscreenOfficeStatus'
  ls.removeItem 'infoscreenOfficeStatusMessage'

  # If only one affiliation is to be shown remove the second news column
  if ls.showAffiliation2 isnt 'true'
    $('#news #right').hide()
    $('#news #left').attr 'id', 'full'
    # Who uses single affiliations?
    Analytics.trackEvent 'loadSingleAffiliation', ls.affiliationKey1
    # What is the prefered primary affiliation?
    Analytics.trackEvent 'loadAffiliation1', ls.affiliationKey1
  else
    # What kind of double affiliations are used?
    Analytics.trackEvent 'loadDoubleAffiliation', ls.affiliationKey1 + ' - ' + ls.affiliationKey2
    # What is the prefered primary affiliation?
    Analytics.trackEvent 'loadAffiliation1', ls.affiliationKey1
    # What is the prefered secondary affiliation?
    Analytics.trackEvent 'loadAffiliation2', ls.affiliationKey2

  # Hide stuff that the user has disabled in options
  $('#office').hide() if ls.showOffice isnt 'true'
  $('#todays').hide() if ls.showOffice isnt 'true'
  $('#cantinas').hide() if ls.showCantina isnt 'true'
  $('#bus').hide() if ls.showBus isnt 'true'

  # Applying affiliation graphics
  key = ls.affiliationKey1
  logo = Affiliation.org[key].logo
  icon = Affiliation.org[key].icon
  placeholder = Affiliation.org[key].placeholder
  sponsor = Affiliation.org[key].sponsor
  if sponsor isnt undefined
    $('#logo').prop 'src', sponsor
  else
    $('#logo').prop 'src', logo
  $('link[rel="shortcut icon"]').attr 'href', icon
  $('#news .post img').attr 'src', placeholder

  # Track popularity of the chosen palette, the palette itself is loaded a lot earlier for perceived speed
  Analytics.trackEvent 'loadPalette', ls.affiliationPalette
  
  # Minor esthetical adjustments for Windows
  if Browser.onWindows()
    $('#pfText').attr "style", "bottom:9px;"
    $('#pfLink').attr "style", "bottom:9px;"
  # Adding creator name to pageflip
  changeCreatorName ls.extensionCreator
  # Blinking cursor at pageflip
  setInterval ( ->
    $(".pageflipcursor").animate opacity: 0, "fast", "swing", ->
      $(@).animate opacity: 1, "fast", "swing",
  ), 600

  # Randomize font in the office status
  officeFontRotate()
  setInterval ( ->
    officeFontRotate()
  ), 1800000

  # Start the clock in #bus, from: alessioatzeni.com/blog/css3-digital-clock-with-jquery/
  setInterval ( ->
    _d = new Date()
    minutes = _d.getMinutes()
    hours = _d.getHours()
    # Pad the number with a zero if less than 10
    if minutes < 10 then minutes = '0' + minutes
    if hours < 10 then hours = '0' + hours
    $("#bus #clock #minutes").html minutes
    $("#bus #clock #hours").html hours
  ), 1000

  # Prevent image burn-in by fading to black every half hour
  setInterval ( ->
    random = Math.ceil Math.random() * 25
    linebreaks = ('<br />' for num in [0..random]).join(' ')
    $('#overlay').html linebreaks + 'preventing image burn-in...'
    $('#overlay').css 'opacity', 1
    setTimeout ( ->
      $('#overlay').css 'opacity', 0
    ), 3500
  ), 1800000

  # Enter main loop, keeping everything up-to-date
  stayUpdated = (now) ->
    console.lolg ONLINE_MESSAGE
    loopTimeout = if DEBUG then PAGE_LOOP_DEBUG else PAGE_LOOP
    # Schedule for repetition
    intervalId = setInterval ( ->
      mainLoop()
    ), PAGE_LOOP
    # Run once right now (just wait 2 secs to avoid network-change errors)
    timeout = if now then 0 else 2000
    setTimeout ( ->
      mainLoop true
    ), timeout
  # When offline mainloop is stopped to decrease power consumption
  window.addEventListener 'online', stayUpdated
  window.addEventListener 'offline', ->
    console.lolg OFFLINE_MESSAGE
    clearInterval intervalId
    updateBus()
  # Go
  if navigator.onLine
    stayUpdated true
  else
    mainLoop()
