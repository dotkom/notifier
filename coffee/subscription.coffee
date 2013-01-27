# Notify Coffeescript that jQuery is here
$ = jQuery

setSubscription = ->
  
  # Capture clicks
  $('#subscription').click ->
    chrome.tabs.create {url: 'https://', selected: true}
    window.close

  # Create the HTML
  $('#subscription').html 'test'

# show the html5 notification with timeout when the document is ready
$ ->
  # if DEBUG then less.watch() # not needed when using CodeKit
  
  setSubscription()
  setTimeout ( ->
    window.close()
  ), 5000
