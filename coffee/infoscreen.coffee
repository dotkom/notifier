# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  updateOffice() if iteration % UPDATE_OFFICE_INTERVAL is 0
  updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0
  updateBus() if iteration % UPDATE_BUS_INTERVAL is 0
  updateCantinas() if iteration % UPDATE_CANTINAS_INTERVAL is 0
  
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

updateNews = ->
  if DEBUG then console.log 'updateNews'
  # Fetching and displaying the news feed
  fetchFeed ->
    response = ls.lastResponseData
    if response != undefined
      displayStories response
    else
      $('#news').append '<div class="post"><div class="title">Nyheter</div><div class="item">Frakoblet fra online.ntnu.no</div></div>'
  
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
      
      limit = if ls.noDinnerInfo is 'true' then 4 else 3
      if index < limit
        post = parsePost(element)
        idsOfLastViewed.push(post.id)
        
        item = '<div class="post"><span class="read"></span>'
        
        item += '
            <span class="title">' + post.title + '</span>
            <div class="item">
              <img id="' + post.id + '" src="' + post.image + '" width="107" />
              <div class="textwrapper">
                <div class="emphasized">- Av ' + post.creator + ', skrevet ' + post.date + '</div>
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
    $('#bus #first_bus .first .line').html 'Frakoblet fra api.visuweb.no'
    $('#bus #second_bus .first .line').html 'Frakoblet fra api.visuweb.no'

  else
    first_stop_name = ls.first_bus_name
    second_stop_name = ls.second_bus_name
    amountOfLines = 4;

    Bus.getAnyLines ls.first_bus, amountOfLines, (lines) ->
      insertBusInfo lines, first_stop_name, '#first_bus'
    Bus.getAnyLines ls.second_bus, amountOfLines, (lines) ->
      insertBusInfo lines, second_stop_name, '#second_bus'

insertBusInfo = (lines, stopName, cssIdentificator) ->
  busStop = '#bus '+cssIdentificator

  if typeof lines is 'string'
    # lines is an error message
    $(busStop+' .name').html stopName
    $(busStop+' .line').html ''
    $(busStop+' .time').html ''
    $(busStop+' .first .line').html lines
  else
    $(busStop+' .name').html stopName
    spans = ['.first', '.second', '.third', '.fourth']
    counter = 0

    if lines['departures'].length is 0
      $(busStop+' .line').html ''
      $(busStop+' .time').html ''
      $(busStop+' '+spans[0]+' .line').html '<i>....zzzZZZzzz....</i>'
    else
      for i of lines['departures']
        # Add the current line
        $(busStop+' '+spans[counter]+' .line').html lines['destination'][i] + ' '
        $(busStop+' '+spans[counter]+' .time').html lines['departures'][i]
        counter++

updateCantinas = ->
  if DEBUG then console.log 'updateCantinas'
  hangaren_rss = 'http://sit.no/rss.ap?thisId=36444&ma=on&ti=on&on=on&to=on&fr=on'
  realfag_rss = 'http://sit.no/rss.ap?thisId=36447&ma=on&ti=on&on=on&to=on&fr=on'

  Cantina.get hangaren_rss, (menu) ->
    $('#cantinas #hangaren #dinnerbox').html listDinners(menu)
  Cantina.get realfag_rss, (menu) ->
    $('#cantinas #realfag #dinnerbox').html listDinners(menu)
  
  # Private function
  listDinners = (menu) ->
    dinnerlist = ''
    # If menu is just a message, not a menu: (yes, a bit hackish, but reduces complexity in the cantina script)
    if typeof menu is 'string'
      ls.noDinnerInfo = 'true'
      dinnerlist += '<li class="dinnerlist">' + menu + '</li>'
    else
      ls.noDinnerInfo = 'false'
      for dinner in menu
        if dinner.price != null
          price = dinner.price + ',- '
        else
          price = ''
        dinnerlist += '<li class="dinnerlist">' + price + dinner.text + '</li>'
    return dinnerlist

# Document ready, go!
$ ->
  # if DEBUG then less.watch() # not needed when using CodeKit
  
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