# Notify Coffeescript that jQuery is here
$ = jQuery

setSubscription = ->

  # Randomize image
  images = [
    '/meme/1.jpg',
    '/meme/2.png'
    # '/meme/darth_roast_coffee.jpg',
    # '/meme/darth_vader_mug.jpg',
    # '/meme/deadline_tomorrow.jpg',
    # '/meme/drink_coffee_you_must.png',
    # '/meme/early_morning.jpg',
    # '/meme/get_him_some_coffee.jpg',
    # '/meme/it_must_be_strong.png',
    # '/meme/lack_of_caffeine.png',
    # '/meme/lack_of_coffee.jpg',
    # '/meme/love_it_i_do.jpg',
    # '/meme/star_wars_coffee.png',
    # '/meme/star-wars-coffee.jpeg',
    # '/meme/to_do_or_not.jpg'
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
