# Notify Coffeescript that jQuery is here
$ = jQuery

setSubscription = ->

  # Randomize image
  images = [
    'darth_roast_coffee.jpg',
    'darth_vader_mug.jpg',
    'deadline_tomorrow.jpg',
    'drink_coffee_you_must.png',
    'early_morning.jpg',
    'get_him_some_coffee.jpg',
    'it_must_be_strong.png',
    'lack_of_caffeine.png',
    'lack_of_coffee.jpg',
    'love_it_i_do.jpg',
    'star_wars_coffee.png',
    'star-wars-coffee.jpeg',
    'to_do_or_not.jpg'
  ]
  
  # Capture clicks
  $('#subscription').click ->
    chrome.tabs.create {url: 'https://', selected: true}
    window.close

  # Create the HTML
  $('#subscription').html 'test'

# show the html5 notification with timeout when the document is ready
$ ->
  if DEBUG then less.watch() # not needed when using CodeKit
  
  setSubscription()
  setTimeout ( ->
    window.close()
  ), 5000
