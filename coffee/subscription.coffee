# Notify Coffeescript that jQuery is here
$ = jQuery

setSubscription = ->
  
  # Capture clicks
  $('#notification').click ->
    chrome.tabs.create {url: link, selected: true}
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
