# Online Notifier

This is a Chrome extension for the student organization Online at NTNU, see http://online.ntnu.no

Features

- Displays and notifies about news from Online
- Displays status for Onlines office: Open, closed, meeting, free waffles
- Displays todays dinner menu from cantinas at NTNU, with opening hours
- Displays bus data from AtB in real time
- Displays todays meetings and current servant at Onlines office
- Displays the status of the Coffee Pot at Onlines office
- Can be used as an infoscreen (full HD vertical screen) for continous use

Tech

- Written in HTML5, CSS3, LESS, JavaScript, CoffeeScript, jQuery and WebGL
- News is fetched through an RSS-feed for general data, API for images
- Office status is fetched from multiple sources
    - An Arduino with a light sensor measures light intensity at the office
    - An Apache server presents the light info here: http://draug.online.ntnu.no/lys.txt
    - A python script parses the Google Calendar for the office
    - A static service in Django presents the calendar info here: http://online.ntnu.no/service_static/online_notifier
- Dinner info is fetched through an RSS-feed from sit.no
- Servant and todays meetings is fetched through separate services at online.ntnu.no
- Coffee pot status is determined throught the push of a button
	- Literally, the servant pushes the button whenever a new pot is cooking

Chronological Credz

- Michael Johansen is the lead coder
- Espen Jacobsson wrote Onlines API-service
- Roy Sindre Norangshol wrote the light service
- Dag Olav Prestegarden wrote the initial calendar service
- René Räisänen designed the graphics
- Tri Minh Nguyen created the overlay API for AtB's realtime bus API
- Jonas Svarvaa wrote all the subsequent revisions of calendar services
- Roy Sindre Norangshol helped with several maintenance issues
- Magnus Dysthe has been working on hardware for the infoscreen
- Tor Håkon Bonsaksen helped with several hardware issues
- Kristoffer Dalby hacked up scripts that fixed ubuntu screen-to-black issues
- Jim Frode Hoff made the coffee button, attached to an Arduino
- Nils Herde fixed hardware issues, kept the infoscreen running and installed the coffee button
- The following made coffee memes:
	- Thomas Gautvedt
	- Aleksander Skraastad

# Featurelist

General

- Opens options page on first run
- All pages keep themselves fresh and updated when running
- Separate script containing some constants, for changeability
- Fancy HTML5, CSS3 and jQuery design on all pages
- Runs google analytics on all pages
- Detects network status adjusts all affected values accordingly
- Dev mode: Faster updates, frequent clearing of localstorage, Less CSS in watch mode
- Automatic determination of whether or not dev mode should be enabled

News

- Fetches and parses feed from Onlines website
- Counts unread news and presents unread number in icon badge
- Separates between new, updated and read items
- Serves HTML5 desktop notifications on news / updates
- Fetches images asynchronously from the API and injects them when needed

Office

- Reads light value from the Arduino Uno connected to draug.online.ntnu.no
- Uses a stable border value, fairly unaffected by sunlight
- Reads the light value frequently in order to react quickly to changes
- Reads events from Onlines systems which in turn is parsed from Onlines GoogleCal, service running at https://online.ntnu.no/service_static/online_notifier
- Retrieves very lightweight requests with event information
- Updates often in order to react to changes quickly
- Icon changes based on light values and calendar events.
- Uses title text containing the name of the event, or other appropriate text
- Separate icon showing when you are offline or when an error has occured
- All states: Default, open, closed, meeting, waffles, disconnected

Cantinas

- Fetches and parses feed from SiTs website, both from Hangaren and Realfag
- Strips down dinner menu down to the bare necessities
- Presents dinners with pricing in ascending order
- Able to handle all known cases of strange formatting for SiT

Bus

- Displays the user's two favorite stops
- Fetches realtime bus data from a third-party API at api.visuweb.no
- Frequently updated in order to always show correct information
- Support for favorite bus lines, simplifying finding a particular bus at a busy stop
- Smart selection of bus stops at the options page, quickly determining which stop the user wants

Meetings

- Showing the rest of the days meetings so users may easily spot when to grab a coffee
- Fetched via a service running at Onlines servers, which is fetched from a GoogleCal, service running at https://online.ntnu.no/service_static/online_notifier2

Servant

- Shows who is responsible for the Online office at any given time
- Fetched via a service running at Onlines servers, which is fetched from a GoogleCal, service running at https://online.ntnu.no/service_static/online_notifier3

Coffee

- An arduino is connected to a big button at the Online office, to be pushed whenever someone is cooking a new pot of coffee
- Whenever a new coffee pot is on it's way users will get a desktop notification
- Overview showing how old the last pot of coffee is and how many pots of coffee has been made today

Options page

- All options react to changes immediately
- Github link to the open source repository
- Google +1 button for Onlines website
- May contain easter egg

Content scritps

- Detects when user is visiting the Online website, nullifying the counter badge
- Opens sit.no and highlights the selected dinner when the user clicks a dinner menu
