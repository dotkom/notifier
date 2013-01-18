# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  updateOffice() if iteration % UPDATE_OFFICE_INTERVAL is 0
  updateMeetings() if iteration % UPDATE_MEETINGS_INTERVAL is 0
  updateCoffee() if iteration % UPDATE_COFFEE_INTERVAL is 0
  updateServant() if iteration % UPDATE_SERVANT_INTERVAL is 0
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

updateMeetings = ->
  if DEBUG then console.log 'updateMeetings'
  Meetings.get (meetings) ->
    $('#todays #meetings .content').html meetings

updateCoffee = ->
  if DEBUG then console.log 'updateCoffee'
  Coffee.get (pots, age) ->
    $('#todays #coffee .content').html 'Kanna er '+age+' gammel<br />'+pots+' kanner i dag'

updateServant = ->
  if DEBUG then console.log 'updateServant'
  Servant.get (servant) ->
    $('#todays #servant .content').html servant

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
    return if ls.mostRecentRead is _mostRecent
    ls.mostRecentRead = _mostRecent

    $('#news').html ''
    
    # Build list of last viewed for the next time the popup opens
    idsOfLastViewed = []
    
    # Add feed items to popup
    items.each (index, element) ->
      
      limit = if ls.noDinnerInfo is 'true' then 3 else 2
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
  
  # Get favorite lines
  if activeLines isnt undefined and activeLines isnt '' # empty string if user deactivated all bus lines like an idiot, or if bus stop is unused
    activeLines = JSON.parse activeLines
    Bus.getFavoriteLines ls[bus], activeLines, (lines) ->
      insertBusInfo lines, ls[bus+'_name'], cssIdentificator
  # Get any lines
  if activeLines is undefined or activeLines is ''
    amountOfLines = 3 # only 3 lines per bus stop in the popup
    Bus.getAnyLines ls[bus], amountOfLines, (lines) ->
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
  hangaren_rss = 'http://sit.no/rss.ap?thisId=36444&ma=on&ti=on&on=on&to=on&fr=on'
  realfag_rss = 'http://sit.no/rss.ap?thisId=36447&ma=on&ti=on&on=on&to=on&fr=on'

  Cantina.get hangaren_rss, (menu) ->
    $('#cantinas #hangaren #dinnerbox').html listDinners(menu)
  Cantina.get realfag_rss, (menu) ->
    $('#cantinas #realfag #dinnerbox').html listDinners(menu)
  
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
        dinnerlist += '<li class="message" id="' + dinner.index + '">- "' + dinner.text + '"</li>'
  return dinnerlist

updateHours = ->
  if DEBUG then console.log 'updateHours'
  Hours.get 'hangaren', (hours) ->
    $('#cantinas #hangaren .hours').html hours
  Hours.get 'realfag', (hours) ->
    $('#cantinas #realfag .hours').html hours

# Document ready, go!
$ ->
  if DEBUG
    # not needed when using CodeKit
    less.watch()
    # show the cursor and remove the overlay
    # (allows DOM inspection with the mouse)
    $('html').css 'cursor', 'auto'
    $('#overlay').hide()
  
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
  setInterval ( ->
    document.location.reload()
  ), 86400000

  # Enter main loop, keeping everything up-to-date
  mainLoop()