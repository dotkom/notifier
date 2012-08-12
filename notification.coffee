# Notify Coffeescript that jQuery is here
$ = jQuery

setNotification = ->
  id = localStorage.notificationId
  link = localStorage.notificationLink
  creator = localStorage.notificationCreator
  date = localStorage.notificationDate
  title = localStorage.notificationTitle
  desc = localStorage.notificationDescription
  
  # shorten title and description to fit nicely
  maxlength = 90
  total = title.length + desc.length
  if maxlength < total
    diff = total - maxlength
    desc = desc.substring(0, desc.length - diff) + '...'
  
  # asynchronously fetch the image
  getImageUrlForId id, (id, image) ->
    # create the HTML
    $('#notification').html('
      <a href="' + link + '">
      <div class="item" onclick="openUrl(\'' + link + '\'); window.close();">
        <header>
          <span class="creator">' + creator + '</span>
          <span class="date"> <b>::</b> ' + date + '</span>
        </header>
        <img id="' + id + '" src="' + image + '" />
        <div class="textwrapper">
          <span class="title">' + title + ' :: </span>
          <span class="description">' + desc + '</span>
        </div>
      </div>
      </a>')

# show the html5 notification with timeout when the document is ready
$ ->
  setNotification()
  setTimeout ( ->
    window.close()
  ), DESKTOP_NOTIFICATION_TIMEOUT