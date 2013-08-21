# Notify Coffeescript that jQuery is here
$ = jQuery
ls = localStorage

setSubscription = ->

  memes = []

  # Add regular memes
  amount = MEME_AMOUNT # Number of memes, in regular human numbers, not zero-indexed
  memes.push './meme/'+num+'.jpg' for num in [1..amount]

  # Add affiliation memes
  if Affiliation.org[ls.affiliationKey1].hasMemes
    amount = Affiliation.org[ls.affiliationKey1].numberOfMemes
    path = Affiliation.org[ls.affiliationKey1].memePath
    memes.push path+num+'.jpg' for num in [1..amount]

  # Randomize image
  random = 1 + Math.floor Math.random() * memes.length
  if DEBUG then console.log 'memes[',random-1,'] of',0,'-',memes.length-1,'-> we found',memes[random-1]
  image = memes[random - 1] # the list is zero-indexed

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
