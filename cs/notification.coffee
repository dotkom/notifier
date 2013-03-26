# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage

setNotification = ->
  title = ls.notificationTitle
  link = ls.notificationLink
  description = ls.notificationDescription
  creator = ls.notificationCreator
  
  # Shorten title and description to fit nicely
  maxlength = 90
  if maxlength < description.length
    description = description.substring(0, maxlength) + '...'
  
  # Capture clicks
  $('#notification').click ->
    Browser.openTab link
    window.close

  # Asynchronously fetch the image
  News.online_getImage link, (id, image) ->
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
  setNotification()
  setTimeout ( ->
    window.close()
  ), 5000
