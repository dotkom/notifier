# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  updateOffice() if iteration % UPDATE_OFFICE_INTERVAL is 0
  updateServant() if iteration % UPDATE_SERVANT_INTERVAL is 0
  updateMeetings() if iteration % UPDATE_MEETINGS_INTERVAL is 0
  updateCoffee() if iteration % UPDATE_COFFEE_INTERVAL is 0
  updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0
  updateBus() if iteration % UPDATE_BUS_INTERVAL is 0
  updateCantinas() if iteration % UPDATE_CANTINAS_INTERVAL is 0
  updateHours() if iteration % UPDATE_HOURS_INTERVAL is 0 and ls.showCantina is 'true'
  
  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++
  
  setTimeout ( ->
    mainLoop()
  ), PAGE_LOOP

updateOffice = ->
  if DEBUG then console.log 'updateOffice'
  Office.get (status, title, message) ->
    if ls.currentStatus isnt status or ls.currentStatusMessage isnt message
      $('#office img').attr 'src', 'img/status-'+status+'.png'
      $('#office #subtext').html message
      ls.currentStatus = status
      ls.currentStatusMessage = message

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
  Coffee.get (pots, age) ->
    $('#todays #coffee #pots').html '- '+pots
    $('#todays #coffee #age').html age

updateNews = ->
  if DEBUG then console.log 'updateNews'
  # Fetching and displaying the news feed
  fetchFeed ->
    response = ls.lastResponseData
    if response != undefined
      displayStories response
    else
      $('#news').html '<div class="post"><div class="title">Nyheter</div><div class="item">Frakoblet fra online.ntnu.no</div></div>'
  
  # Private function
  displayStories = (xmlstring) ->

    # Parse the feed
    xmldoc = $.parseXML xmlstring
    $xml = $(xmldoc)
    items = $xml.find "item"

    ################################# BUG TRAP ################################
    lolRememberThis = ls.mostRecentRead
    
    # Find most recent post
    _guid = $(items[0]).find "guid"
    _text = $(_guid).text()
    _mostRecent = _text.split('/')[4]
    if ls.mostRecentRead is _mostRecent
      if DEBUG then console.log 'RETURNED EARLY' #####
      return
    ls.mostRecentRead = _mostRecent

    if DEBUG then console.log 'CLEARING HTML'
    $('#news').html ''
    
    if DEBUG then console.log 'BUILDING HTML'
    # Build list of last viewed for the next time the popup opens
    idsOfLastViewed = []
    
    # Add feed items to popup
    items.each (index, element) ->
      
      limit = 3
      limit = if ls.noDinnerInfo is 'true' then 3 else 2
      if DEBUG then console.log 'LIMIT IS "'+limit+'", typeof '+typeof limit
      if DEBUG then console.log 'INDEX IS "'+index+'", typeof '+typeof index
      if DEBUG then console.log 'index < limit :: '+(index < limit)
      if index < limit
        post = parsePost(element)
        idsOfLastViewed.push(post.id)
        
        item = '<div class="post"><span class="read"></span>'
        
        item += '
            <span class="title">' + post.title + '</span>
            <div class="item">
              <img id="' + post.id + '" src="' + post.image + '" width="107" />
              <div class="textwrapper">
                <div class="emphasized">- Skrevet av ' + post.creator + ' den ' + post.date + '</div>
                ' + post.description + '
              </div>
            </div>
          </div>'
        $('#news').append item

    ################################# BUG TRAP ################################
    whatsthis = $('#news').html()
    whatsthis = whatsthis.trim()
    if whatsthis is ''
      alert 'TRAP TRIGGERED!'
      console.log 'TRAPPED!'
      console.log 'items', typeof items, items
      console.log '#news', $('#news').html()
      console.log 'ls.mostRecentRead was', typeof lolRememberThis, lolRememberThis
      console.log '_mostRecent is', typeof _mostRecent, _mostRecent
    
    # Finally, fetch news post images from the API async synchronously
    for index, value of idsOfLastViewed
      getImageUrlForId value, (id, image) ->
        $('#'+id).attr 'src', image

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
  if activeLines.length is 0
    activeLines = undefined # if activelines is undefined we'll get all lines, no problemo.
  # Get bus data
  Bus.get ls[bus], activeLines, (lines) ->
    insertBusInfo lines, ls[bus+'_name'], cssIdentificator

insertBusInfo = (lines, stopName, cssIdentificator) ->
  busStop = '#bus '+cssIdentificator
  spans = ['first', 'second', 'third', 'fourth']

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

updateCantinas = ->
  if DEBUG then console.log 'updateCantinas'
  Cantina.get ls.left_cantina, (menu) ->
    $('#cantinas #left .title').html ls.left_cantina
    $('#cantinas #left #dinnerbox').html listDinners(menu)
  Cantina.get ls.right_cantina, (menu) ->
    $('#cantinas #right .title').html ls.right_cantina
    $('#cantinas #right #dinnerbox').html listDinners(menu)
  
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

updateHours = ->
  if DEBUG then console.log 'updateHours'
  Hours.get ls.left_cantina, (hours) ->
    $('#cantinas #left .hours').html hours
  Hours.get ls.right_cantina, (hours) ->
    $('#cantinas #right .hours').html hours

# Document ready, go!
$ ->
  if DEBUG
    # show the cursor and remove the overlay
    # (allows DOM inspection with the mouse)
    $('html').css 'cursor', 'auto'
    $('#overlay').hide()
  
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup timeout: AJAX_TIMEOUT
  
  # Clear all previous thoughts
  ls.removeItem 'mostRecentRead'
  ls.removeItem 'currentStatus'
  ls.removeItem 'currentStatusMessage'
  
  # Minor esthetical adjustments for OS version
  if OPERATING_SYSTEM == 'Windows'
    $('#pagefliptext').attr "style", "bottom:9px;"
    $('#pagefliplink').attr "style", "bottom:9px;"

  # Blinking cursor at pageflip
  setInterval ( ->
    $(".pageflipcursor").animate opacity: 0, "fast", "swing", ->
      $(@).animate opacity: 1, "fast", "swing",
  ), 600

  # Start the clock in #bus
  # From: http://www.alessioatzeni.com/blog/css3-digital-clock-with-jquery/
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

  # Reload the page once every day
  unless DEBUG
    setInterval ( ->
      document.location.reload()
    ), 3600000 # KILLBUG: set to once every hour for now in order to keep #news alive, set to 86400000 later

  # Enter main loop, keeping everything up-to-date
  mainLoop()