# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage
iteration = 0

mainLoop = ->
  if DEBUG then console.log "\n#" + iteration

  updateCantinas() if iteration % UPDATE_CANTINAS_INTERVAL is 0 and ls.showCantina is 'true'
  updateBus() if iteration % UPDATE_BUS_INTERVAL is 0 and ls.showBus is 'true'
  updateNews() if iteration % UPDATE_NEWS_INTERVAL is 0
  
  # No reason to count to infinity
  if 10000 < iteration then iteration = 0 else iteration++
  
  setTimeout ( ->
    mainLoop()
  ), PAGE_LOOP

updateCantinas = ->
  if DEBUG then console.log 'updateCantinas'
  hangaren_rss = 'http://sit.no/rss.ap?thisId=36444&ma=on&ti=on&on=on&to=on&fr=on'
  realfag_rss = 'http://sit.no/rss.ap?thisId=36447&ma=on&ti=on&on=on&to=on&fr=on'
  hangaren_url = 'http://sit.no/content/36444/Ukas-middagsmeny-pa-Hangaren'
  realfag_url = 'http://sit.no/content/36447/Ukas-middagsmeny-pa-Realfag'

  Cantina.get hangaren_rss, (menu) ->
    $('#cantinas #hangaren #dinnerbox').html listDinners(menu, hangaren_url)
    clickDinnerLink '#cantinas #hangaren #dinnerbox .dinnerlist', hangaren_url
  Cantina.get realfag_rss, (menu) ->
    $('#cantinas #realfag #dinnerbox').html listDinners(menu, realfag_url)
    clickDinnerLink '#cantinas #realfag #dinnerbox .dinnerlist', realfag_url

listDinners = (menu, url) ->
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
      dinnerlist += '<li class="dinnerlist" id="' + dinner.index + '">' + price + dinner.text + '</li>'
  return dinnerlist

clickDinnerLink = (cssSelector, url) ->
  # Remember index of clicked dinner menu and open SiTs site
  $(cssSelector).click ->
    _id = $(this).attr('id')
    ls.chosenDinner = _id
    chrome.tabs.create({url: url})
    window.close()

updateBus = ->
  if DEBUG then console.log 'updateBus'

  if !navigator.onLine
    $('#bus #left .name').html ls.first_bus_name
    $('#bus #right .name').html ls.second_bus_name
    $('#bus #left .first .line').html 'Frakoblet fra api.visuweb.no'
    $('#bus #right .first .line').html 'Frakoblet fra api.visuweb.no'

  else
    first_stop_name = ls.first_bus_name
    second_stop_name = ls.second_bus_name
    amountOfLines = 3;

    Bus.getAnyLines ls.first_bus, amountOfLines, (lines) ->
      insertBusInfo lines, first_stop_name, '#left'
    Bus.getAnyLines ls.second_bus, amountOfLines, (lines) ->
      insertBusInfo lines, second_stop_name, '#right'

insertBusInfo = (lines, stopName, cssIdentificator) ->
  if typeof lines is 'string'
    # lines is an error message
    $('#bus '+cssIdentificator+' .name').html stopName
    $('#bus '+cssIdentificator+' .first .line').html lines
  else
    $('#bus '+cssIdentificator+' .name').html stopName
    spans = ['.first', '.second', '.third']
    counter = 0

    if lines['departures'].length is 0
      $('#bus '+cssIdentificator+' '+spans[counter]+' .line').html '<i>....zzzZZZzzz....</i>'
    else
      for i of lines['departures']
        # Add the current line
        $('#bus '+cssIdentificator+' '+spans[counter]+' .line').html lines['destination'][i] + ' '
        $('#bus '+cssIdentificator+' '+spans[counter]+' .time').html lines['departures'][i]
        counter++

updateNews = ->
  if DEBUG then console.log 'updateNews'
  # Displaying the news feed (prefetched by the background page)
  response = ls.lastResponseData
  if response != undefined
    displayStories response
  else
    $('#news').append '<div class="post"><div class="title">No news</div><div class="item">Frakoblet fra online.ntnu.no</div></div>'
  
# Private function
displayStories = (xmlstring) ->
  # Parse the feed
  xmldoc = $.parseXML xmlstring
  $xml = $(xmldoc)
  items = $xml.find "item"
  
  # Find most recent post, return if there are no new posts
  _guid = $(items[0]).find "guid"
  _text = $(_guid).text()
  _mostRecent = _text.split('/')[4]
  ls.mostRecentRead = _mostRecent
  $('#news').html ''
  
  # Get list of last viewed items and check for news that are just
  # updated rather than being actual news
  updatedList = findUpdatedPosts()
  
  # Build list of last viewed for the next time the popup opens
  idsOfLastViewed = []
  
  # Add feed items to popup
  items.each (index, element) ->
    
    if index < 4
      post = parsePost(element)
      idsOfLastViewed.push(post.id)
      
      item = '<div class="post"><div class="title">'
      if index < ls.unreadCount
        if post.id in updatedList.indexOf
          item += '<span class="unread">UPDATED <b>::</b> </span>'
        else
          item += '<span class="unread">NEW <b>::</b> </span>'
      
      item += post.title + '</div>
          <div class="item" id="' + post.link + '">
            <img id="' + post.id + '" src="' + post.image + '" width="107" />
            <div class="textwrapper">
              <div class="emphasized">- Av ' + post.creator + ', skrevet ' + post.date + '</div>
              ' + post.description + '
            </div>
          </div>
        </div>'
      $('#news').append item
  
  # Store list of last viewed items
  ls.lastViewedIdList = JSON.stringify idsOfLastViewed
  
  # All items are now considered read :)
  chrome.browserAction.setBadgeText {text:''}
  ls.unreadCount = 0

  # Make news items open extension website while closing popup
  $('.item').click ->
    # The link is embedded as the ID of the element, we don't want to use
    # <a> anchors because it creates an ugly box marking the focus element
    chrome.tabs.create {url: $(this).attr('id')}
    window.close()

  # Finally, fetch news post images from the API async synchronously
  for index, value of idsOfLastViewed
    getImageUrlForId value, (id, image) ->
      $('img[id='+id+']').attr 'src', image

# Checks the most recent list of news against the most recently viewed list of news
findUpdatedPosts = ->
  # Definition checks first
  if ls.lastViewedIdList == undefined
    ls.lastViewedIdList = JSON.stringify []
    return []
  else if ls.mostRecentIdList == undefined
    ls.mostRecentIdList = JSON.stringify []
    return []
  # Compare lists, return union (updated items)
  else
    viewedList = JSON.parse ls.lastViewedIdList
    newsList = JSON.parse ls.mostRecentIdList
    updatedList = []
    for viewed in viewedList
      for news in newsList
        if viewedList[viewed] == newsList[news]
          updatedList.push viewedList[viewed]
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
  # if DEBUG then less.watch() # not needed when using CodeKit

  # If Infoscreen mode is enabled we'll open the infoscreen when the icon is clicked
  if ls.useInfoscreen is 'true'
    chrome.tabs.create {url: 'infoscreen.html'}
    setTimeout ( ->
      window.close()
    ), 250

  $('#cantinas').hide() if ls.showCantina isnt 'true'
  $('#bus').hide() if ls.showBus isnt 'true'

  # Make logo open extension website while closing popup
  $('#logo').click ->
    chrome.tabs.create {url: EXTENSION_WEBSITE}
    window.close()

  $('#options_button').click ->
    chrome.tabs.create {url: 'options.html'}
    window.close()

  $('#chatter_button').click ->
    chrome.tabs.create {url: 'http://webchat.freenode.net/?channels=online'}
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

  $('#bus #middle img').click ->
    chrome.tabs.create {url: 'http://www.atb.no'}
    window.close()

  # Enter main loop, keeping everything up-to-date
  mainLoop()
