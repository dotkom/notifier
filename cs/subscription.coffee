# Notify Coffeescript that jQuery is here
$ = jQuery

setSubscription = ->

  # Randomize image
  images = [
    '/meme/1.jpg',
    '/meme/2.jpg',
    '/meme/3.jpg',
    '/meme/4.jpg',
    '/meme/5.jpg',
    '/meme/6.jpg',
    '/meme/7.jpg',
    '/meme/8.jpg',
    '/meme/9.jpg',
    '/meme/10.jpg',
    '/meme/11.jpg',
    '/meme/12.jpg',
    '/meme/13.png',
    '/meme/14.png',
    '/meme/15.png',
    '/meme/16.png',
    '/meme/17.png',
    '/meme/18.png',
  ]
  random = Math.floor Math.random() * images.length

  # Capture clicks
  $('#subscription').click ->
    Browser.openTab 'options.html'
    window.close

  # Create the HTML
  width = $('#subscription').width()
  $('#subscription').html '<img src="'+images[random]+'" width="'+width+'" />'

# show the html5 notification with timeout when the document is ready
$ ->
  # Setting the timeout for all AJAX and JSON requests
  $.ajaxSetup AJAX_SETUP
  
  setSubscription()
  setTimeout ( ->
    window.close()
  ), 6000
