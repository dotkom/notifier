# Notify Coffeescript that jQuery is here
$ = jQuery

displayStories = (xmlstring) ->
  # Parse the feed
  xmldoc = $.parseXML xmlstring
  $xml = $(xmldoc)
  items = $xml.find "item"
  
  # Find most recent post
  _guid = $(items[0]).find "guid"
  _text = $(_guid).text()
  localStorage.mostRecentRead = _text.split('/')[4]
  
  # Get list of last viewed items and check for news that are just
  # updated rather than being actual news
  updatedList = findUpdatedPosts()
  
  # Build list of last viewed for the next time the popup opens
  idsOfLastViewed = []
  
  # Add feed items to popup
  items.each (index, element) ->
  
    post = parsePost(element)
    idsOfLastViewed.push(post.id)
    
    if index < localStorage.unreadCount
      if post.id in updatedList.indexOf
        item = '<div class="post"><span class="unread">UPDATED</span><span class="date"> <b>::</b></span>'
      else
        item = '<div class="post"><span class="unread">NEW</span><span class="date"> <b>::</b></span>'
    else
      item = '<div class="post"><span class="read"></span>'
  
    item += '
        <span class="creator">' + post.creator + '</span><span class="date"> <b>::</b> ' + post.date + '</span>
        <a href="' + post.link + '">
        <div class="item" onclick="openUrl(\'' + post.link + '\')">
          <img id="' + post.id + '" src="' + post.image + '" width="107" />
          <div class="textwrapper">
            <span class="title">' + post.title + '</span><br />
            <span class="description">' + post.description + '</span>
          </div>
        </div>
        </a>
      </div>'
    $('#popup').append item
  
  # Add cantina menus to the top of the popup
  if localStorage.showCantinaMenu == 'true'
    if localStorage.hangarenMenu != 'undefined' && localStorage.realfagMenu != 'undefined'
      hangaren = buildCantinaMenuPost 'hangaren', HANGAREN_URL, localStorage.hangarenMenu
      realfag = buildCantinaMenuPost 'realfag', REALFAG_URL, localStorage.realfagMenu
      $('header').append '<div id="cantinamenus">' + hangaren + realfag + '</div>'
    else
      cantinaMenu_error CANTINA_CONNECTION_ERROR
  
  # Store list of last viewed items
  localStorage.lastViewedIdList = JSON.stringify idsOfLastViewed
  
  # All items are now considered read :)
  chrome.browserAction.setBadgeText({text:''})
  localStorage.unreadCount = 0
  
  # Finally, fetch news post images from the API async synchronously
  for index, value of idsOfLastViewed
    getImageUrlForId value, (id, image) ->
      $('#'+id).attr 'src', image

buildCantinaMenuPost = (title, link, menu) ->
  dinnerObjects = JSON.parse menu
  dinnerlist = '<div id="dinnerbox">'
  # If "dinnerObjects" is just a message, not a menu: (yes, a bit hackish, but reduces complexity in the cantina menu script)
  if typeof dinnerObjects == 'string'
    dinnerlist += '<li class="dinnerlist"><a href="' + link + '">' + dinnerObjects + '</a></li>'
  else
    for dinner in dinnerObjects
      if dinner.price != null
        price = dinner.price + ',- '
      else
        price = ''
      dinnerlist += '<li class="dinnerlist" id="'+dinner.index+'"><a href="' + link + '">' + price + dinner.text + '</a></li>'
  dinnerlist += '</div>'
  post = '<div id="' + title + '">
      <span class="creator">' + title + '</span>
      <span class="description">' + dinnerlist + '</span>
    </div>'
  return post

# Checks the most recent list of news against the most recently viewed list of news
findUpdatedPosts = ->
  # Definition checks first
  if localStorage.lastViewedIdList == undefined
    localStorage.lastViewedIdList = JSON.stringify []
    return []
  else if localStorage.mostRecentIdList == undefined
    localStorage.mostRecentIdList = JSON.stringify []
    return []
  # Compare lists, return union (updated items)
  else
    viewedList = JSON.parse localStorage.lastViewedIdList
    newsList = JSON.parse localStorage.mostRecentIdList
    updatedList = []
    for viewed in viewedList
      for news in newsList
        if viewedList[viewed] == newsList[news]
          updatedList.push viewedList[viewed]
    return updatedList

optionsText = (show) ->
  fadeButtonText show, 'Innstillinger'

chatterText = (show) ->
  fadeButtonText show, '&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Bli med i samtalen'

fadeButtonText = (show, msg) ->
  fadeInSpeed = 150
  fadeOutSpeed = 50
  if show
    $('#buttontext').html msg
    $('#buttontext').fadeIn fadeInSpeed
  else
    $('#buttontext').fadeOut fadeOutSpeed
    $('#buttontext').html ''

$ ->
  # Fetching the cantina menu feed
  cantinaMenu_update()
  
  # Fetching and displaying the news feed
  fetchFeed()
  displayStories localStorage.lastResponseData

  # Slight esthetical adjustment for OS'es different scrollbars
  # if OPERATING_SYSTEM == 'Mac'
  #   $('.textwrapper').attr "style", "width:250px"
  
  # Update the office status in case user clicked icon to update it
  officeStatus_update()

  # Make logo open extension website while closing popup
  $('#logo').click ->
    chrome.tabs.create({url: EXTENSION_WEBSITE})
    window.close()

  # Remember index of clicked dinner menu and open SiTs site
  $('.dinnerlist').click ->
    _id = $(this).attr('id')
    localStorage.chosenDinner = _id
    _element = $(this).find 'a'
    _url = _element.attr 'href'
    chrome.tabs.create({url: _url})
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