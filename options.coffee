# Notify Coffeescript that jQuery is here
$ = jQuery

resizeBackgroundImage = ->
  if 1550 < $(window).width()
    $('#background').attr "style", "background:url('img/background-large.png') center center no-repeat;"
  else if 1200 < $(window).height()
    $('#background').attr "style", "background:url('img/background-large-vertical.png') center center no-repeat;"
  else
    $('#background').attr "style", "background:url('img/background-medium.png') center center no-repeat;"

displayOnPageNotification = ->
  $("#notification").fadeIn 200
  setTimeout ( ->
    $("#notification").fadeOut 200
  ), OPTIONS_NOTIFICATION_TIMEOUT

pageFlipCursorBlinking = ->
  $(".pageflipcursor").animate opacity: 0, "fast", "swing", ->
    $(@).animate opacity: 1, "fast", "swing",

testDesktopNotification = ->
  notification = webkitNotifications.createHTMLNotification('notification.html')
  notification.show()

# The UI won't talk to this function :(
fadeInCanvas = ->
  webGLStart();
  $('#LessonCanvas').animate
    opacity:1,
    1300,
    'swing',
    ->
      setTimeout ( ->
        $('#LessonCanvas').animate
          opacity:0,
          1300,
          'swing'
      ), 200

# Document ready, go!
$ ->
  # Workaround to make sure Less is working nice (no GET for locally stored images).
  $('#background').attr "style", "background:url('img/background-medium.png') center center no-repeat;"
  $('#pageflipbg').attr "style", "background:transparent url('img/options-pageflipbg.png') no-repeat left bottom;"
  $('#pageflip').attr "style", "background:transparent url('img/options-pageflip.png') no-repeat left bottom;"

  # Restore checks to boxes from localStorage
  $('input:checkbox').each (index, element) ->
    element.checked = localStorage[element.id] == "true"

  # Bind the windows resize function
  $(window).bind "resize", resizeBackgroundImage
  resizeBackgroundImage() # Run once in case the window is quite big
  
  # Minor esthetical adjustments for OS version
  if OPERATING_SYSTEM == 'Windows'
    $('#pagefliptext').attr "style", "bottom:9px;"
    $('#pagefliplink').attr "style", "bottom:9px;"

  # Blinking cursor at pageflip
  setInterval ( ->
    pageFlipCursorBlinking()
  ), 600

  # Fade in the +1 button when (probably) ready
  setTimeout ( ->
    $('#plusonebutton').fadeIn 150
  ), 1100

  # Bind a click function to the on-page notification for the canvas
  $('#notification').click ->
    fadeInCanvas()

  # Catch new clicks
  $('input:checkbox').click ->
    localStorage[this.id] = this.checked;
    
    if this.id == 'showOfficeStatus' && this.checked == false
      officeStatus_disable()
    else if this.id == 'showOfficeStatus' && this.checked == true
      officeStatus_update()
    
    if this.id == 'showNotifications' && this.checked == true
      testDesktopNotification()
    
    if this.id == 'showCantinaMenu' && this.checked == false
      cantinaMenu_disable()
    else if this.id == 'showCantinaMenu' && this.checked == true
      cantinaMenu_update()
    
    displayOnPageNotification()