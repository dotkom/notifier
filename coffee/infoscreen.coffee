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
  
  if 10000 < iteration
    iteration = 0 # no reason to count to infinity
  else
    iteration++
  
  setTimeout ( ->
    mainLoop()
  ), PAGE_LOOP

updateOffice = ->
  if DEBUG then console.log 'updateOffice'
  Office.get (status, title) ->
    if ls.currentStatus isnt status or ls.currentStatusTitle isnt title
      $('#office img').attr 'src', 'img/status-'+status+'.png'
      $('#office #subtext').html title
      ls.currentStatus = status
      ls.currentStatusTitle = title

updateNews = ->
  if DEBUG then console.log 'updateNews'
  # Fetching and displaying the news feed
  fetchFeed ->
    response = ls.lastResponseData
    if response != null
      displayStories response
    else
      console.log 'ERROR: response was null'
  
  # Private function
  displayStories = (xmlstring) ->

    # Parse the feed
    xmldoc = $.parseXML xmlstring
    $xml = $(xmldoc)
    items = $xml.find "item"
    
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
    
    # Finally, fetch news post images from the API async synchronously
    for index, value of idsOfLastViewed
      getImageUrlForId value, (id, image) ->
        $('#'+id).attr 'src', image

updateBus = ->
  if DEBUG then console.log 'updateBus'
  url_mot_byen = 'http://api.visuweb.no/bybussen/1.0/Departure/Realtime/16011333/f6975f3c1a3d838dc69724b9445b3466'
  url_fra_byen = 'http://api.visuweb.no/bybussen/1.0/Departure/Realtime/16010333/f6975f3c1a3d838dc69724b9445b3466'
  requestedLines =
    '5': 2
    '22': 2

  Bus.get url_mot_byen, requestedLines, (lines) ->
    insertBusInfo lines, '#left'
  Bus.get url_fra_byen, requestedLines, (lines) ->
    insertBusInfo lines, '#right'

  # Private function
  insertBusInfo = (lines, cssIdentificator) ->
    spans = ['.first', '.second']
    counter = 0
    
    for i of lines
      # Add the arrows
      arrow = if cssIdentificator is '#left' then '&larr;' else '&rarr;'
      $('#bus '+cssIdentificator+' '+spans[counter]+' .arrow').html arrow

      # Add the destination
      if lines[i]['destination'] is undefined
        $('#bus '+cssIdentificator+' '+spans[counter]+' .line').html i+' ...zzZZzz...'
      else
        $('#bus '+cssIdentificator+' '+spans[counter]+' .line').html i+' '+lines[i]['destination']
        # Add the departure times
        times = ''
        for j of lines[i]['departures']
          times += ', ' unless j is '0'
          times += lines[i]['departures'][j]
        $('#bus '+cssIdentificator+' '+spans[counter]+' .time').html times
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
  if DEBUG then less.watch()
  
  # Clear all previous thoughts
  if DEBUG then ls.clear()
  ls.removeItem 'mostRecentRead'
  ls.removeItem 'currentIcon'
  ls.removeItem 'currentTitle'
  
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
  
  updateAll()

  # Reload the page once every day
  setInterval ( ->
    document.location.reload()
  ), 86400000

  # Enter main loop, keeping everything up-to-date
  mainLoop()