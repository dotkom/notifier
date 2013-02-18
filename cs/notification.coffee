# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage

setNotification = ->
  id = ls.notificationId
  link = ls.notificationLink
  creator = ls.notificationCreator
  title = ls.notificationTitle
  description = ls.notificationDescription
  
  # Shorten title and description to fit nicely
  maxlength = 90
  if maxlength < description.length
    description = description.substring(0, maxlength) + '...'
  
  # Capture clicks
  $('#notification').click ->
    if BROWSER is "Chrome"
      chrome.tabs.create {url: link, selected: true}
    else if BROWSER is "Opera"
      console.log "OPERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA notification"
    window.close

  # Asynchronously fetch the image
  getImageUrlForId id, (id, image) ->
    # Create the HTML
    $('#notification').html('
      <div class="item">
        <div class="title">' + title + '</div>
        <img id="' + id + '" src="' + image + '" />
        <div class="textwrapper">
          <div class="emphasized">- Av ' + creator + '</div>
          <div class="description">' + description + '</div>
        </div>
      </div>
      </a>')

# show the html5 notification with timeout when the document is ready
$ ->
  # if DEBUG then less.watch() # not needed when using CodeKit
  
  setNotification()
  setTimeout ( ->
    window.close()
  ), 5000
