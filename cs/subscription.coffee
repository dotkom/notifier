# Notify Coffeescript that jQuery is here
$ = jQuery

setSubscription = ->

  # Randomize image
  images = numbers[1..27]
  random = Math.floor Math.random() * images.length
  image = './meme/' + images[random] + '.jpg'

  # Capture clicks
  $('#subscription').click ->
    Browser.openTab 'options.html'
    window.close

  # Create the HTML
  width = $('#subscription').width()
  $('#subscription').html '<img src="' + image + '" width="'+width+'" />'

# show the html5 notification with timeout when the document is ready
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup AJAX_SETUP
  
  setSubscription()
  setTimeout ( ->
    window.close()
  ), 6000
