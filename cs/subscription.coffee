# Notify Coffeescript that jQuery is here
$ = jQuery

setSubscription = ->

  # Randomize image
  amount = 27 # Number of memes, in regular human numbers, not zero-indexed
  random = 1 + Math.floor Math.random() * amount
  image = './meme/' + random + '.jpg'

  # Capture clicks
  $('#subscription').click ->
    if !DEBUG then _gaq.push(['_trackEvent', 'subscription', 'clickMeme', image])
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
