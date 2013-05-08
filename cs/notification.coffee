# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage

setNotification = ->
  try
    title = ls.notificationTitle
    link = ls.notificationLink
    description = ls.notificationDescription
    creator = ls.notificationCreator
    image = ls.notificationImage
    feedKey = ls.notificationFeedKey
    feedName = ls.notificationFeedName
    
    # Shorten title and description to fit nicely
    maxlength = 90
    if maxlength < description.length
      description = description.substring(0, maxlength) + '...'
    
    # Capture clicks
    $('#notification').click ->
      if (DEBUG) then _gaq.push(['_trackEvent', 'notification', 'click', link]);
      Browser.openTab link
      window.close

    # Create the HTML
    $('#notification').html '
      <div class="item">
        <div class="title">' + title + '</div>
        <img src="' + image + '" />
        <div class="textwrapper">
          <div class="emphasized">- Av ' + creator + '</div>
          <div class="description">' + description + '</div>
        </div>
      </div>
      </a>'

    # If the organization has an image API, use it
    if Affiliation.org[feedKey].getImage isnt undefined
      Affiliation.org[feedKey].getImage link, (link, image) ->
        $('img').prop 'src', image

    if Affiliation.org[feedKey].getImages isnt undefined
      links = []
      links.push link
      Affiliation.org[feedKey].getImages links, (links, images) ->
        $('img').attr 'src', images[0]

  catch e
    log 'ERROR in desktop notification', e

# Support for inspection of desktop notification views disappeared
# in a Chrome version back in 2012. Use the background process to
# log debug messages out.
# https://code.google.com/p/chromium/issues/detail?id=162724
log = (object...) ->
  if !DEBUG then Browser.getBackgroundProcess().console.log object...

# show the html5 notification with timeout when the document is ready
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup AJAX_SETUP
  
  setNotification()
  setTimeout ( ->
    window.close()
  ), 5500
