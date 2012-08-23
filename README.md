# Online Notifier

This is a Chrome extension for the student organization Online at NTNU, see http://online.ntnu.no

Features

- Displays and notifies about news from Online
- Displays status for Onlines office: Open, closed, meeting, free waffles
- Displays todays dinner menu from cantinas at NTNU Gløshaugen

Tech

- Written in HTML5, CSS3, LESS, JavaScript, CoffeeScript, jQuery and WebGL
- News is fetched through an RSS-feed for general data, API for images
- Dinner info is fetched through an RSS-feed from sit.no
- Office status is fetched from multiple sources
    - An Arduino with a light sensor measures light intensity at the office
    - An Apache server presents the light info here: http://draug.online.ntnu.no/lys.txt
    - A python script parses the Google Calendar for the office
    - A static service in Django presents the calendar info here: http://online.ntnu.no/service_static/online_notifier

Credz

- Michael Johansen is the lead coder
- Espen Jacobsson wrote Onlines API-service
- Roy Sindre Norangshol wrote the light service
- Dag Olav Prestegarden wrote the calendar service
- René Räisänen designed the graphics
- Tri Minh Nguyen created the overlay API for AtB's realtime bus API

# Featurelist

General stuff

- Opens options page on first run
- The popup page keeps itself updated even when open
- Separate script containing some constants, for changeability
- Fancy HTML5, CSS3 and jQuery design on all pages
- Runs google analytics on all pages
- Detects network status adjusts all affected values accordingly
- Dev mode: Faster updates, frequent clearing of localstorage, Less CSS in watch mode

News feed

- Fetches and parses feed from Onlines website
- Counts unread news and presents unread number in icon badge
- Separates between new, updated and read items
- Serves HTML5 desktop notifications on news / updates
- Fetches images asynchronously from the API and injects them only when needed

Cantina menus

- Fetches and parses feed from SiTs website, both from Hangaren and Realfag
- Strips down dinner menu down to the bare necessities
- Presents dinners with pricing in ascending order
- Able to handle all known cases of strange formatting for SiT

Light and calendar

- Reads light value from the Arduino Uno connected to draug.online.ntnu.no
- Uses a stable border value, fairly unaffected by sunlight
- Reads the light value frequently in order to react quickly to changes

Calendar

- Reads events from Onlines systems which in turn is parsed from Onlines Google Calendar
- Retrieves very lightweight requests with event information
- Updates often in order to react to changes quickly

Icon

- Icon changes based on light values and calendar events.
- Uses title text containing the name of the event, or other appropriate text
- Separate icon showing when you are offline or when an error has occured
- All states: Default, open, closed, meeting, waffles, disconnected

Options page

- Option for showing office status in the icon
- Option for desktop notifications
- Option for fetching cantina menus
- Option for opening chatter in a background tab on startup
- Google +1 button for Onlines website
- Github link to the open source repository
- All options react immediately to changes
- May contain easter egg

Content scritps

- Detects when user is visiting the Online website, nullifying the counter badge
- Opens sit.no and highlights the selected dinner when the user clicks a dinner menu
