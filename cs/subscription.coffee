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
  ]
  random = Math.floor Math.random() * images.length

  # Capture clicks
  $('#subscription').click ->
    chrome.tabs.create {url: 'options.html', selected: true}
    window.close

  # Create the HTML
  width = $('#subscription').width()
  $('#subscription').html '<img src="'+images[random]+'" />'
  # $('#subscription').html '<img src="'+images[random]+'" width="'+width+'" />'

# show the html5 notification with timeout when the document is ready
$ ->
  if DEBUG then less.watch() # not needed when using CodeKit
  
  setSubscription()
  setTimeout ( ->
    window.close()
  ), 5000
