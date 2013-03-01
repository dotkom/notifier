# Online Notifier

This is a Chrome/Opera extension for the student organization Online at NTNU, see http://online.ntnu.no

Features

- Displays status for Onlines office: Open, closed, meeting, free waffles
- Displays todays meetings and current servant at Onlines office
- Displays the status of the coffee pot at Onlines office
- Displays todays dinner menu from cantinas at NTNU, with opening hours
- Displays bus data from AtB in real time
- Displays and notifies about news from Online
- Can be used as an infoscreen (full HD vertical screen) for continous use
- All pages in the extension are live, they keep themselves updated
- Written in HTML5, CSS3, LESS, JavaScript, CoffeeScript, jQuery and WebGL

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
	- John Hanssen Kolstad
	- Magnus Dysthe

# In-depth features

General

- Opens options page on first run
- All pages keep themselves fresh and updated when running
- Separate script containing some constants, for changeability
- Fancy HTML5, CSS3 and jQuery design on all pages
- Runs google analytics on all pages
- Detects network status adjusts all affected values accordingly
- Dev mode: Faster updates, frequent clearing of localstorage
- Automatic determination of whether or not dev mode should be enabled

News

- Fetches and parses feed from Onlines website, through https://online.ntnu.no/feeds/news/
- Counts unread news and presents unread number in icon badge
- Separates between new, updated and read items
- Serves HTML5 desktop notifications on news / updates
- Images are not present in the news feed, instead they are fetched asynchronously from Onlines API and injected when needed, API at https://online.ntnu.no/api/<API_KEY>/news_image_by_id/

Office

- Office status is fetched from multiple sources, including Google Calendar and two Arduinos running on a Raspberry Pi
- Reads roof light intensity from an Arduino Uno at http://draug.online.ntnu.no/lys.txt
- Uses a stable border value, fairly unaffected by sunlight
- Reads the light value frequently in order to react quickly to changes
- Reads events from Onlines systems which in turn is parsed from Onlines GoogleCal, service running at https://online.ntnu.no/service_static/office_status
- Retrieves very lightweight requests with event information from GCal
- Updates often in order to react to changes quickly
- Icon changes based on light values and calendar events.
- Uses title text containing the name of the event, or other appropriate text
- Separate icon showing when you are offline or when an error has occured
- All states: Default, open, closed, meeting, waffles, disconnected

Cantinas

- Fetches and parses feed from SiTs website through http://sit.no/rss
- User may select any two cantinas at any campus to be shown in the popup
- Strips down dinner menu down to the bare necessities
- Presents dinners with pricing in ascending order
- Able to handle all known cases of strange formatting for SiT
- Also fetches opening hours for all cantinas through http://sit.no/ajax

Bus

- Displays the user's two favorite stops
- Fetches realtime bus data from a third-party API at api.visuweb.no
- Frequently updated in order to always show correct information
- Support for favorite bus lines, simplifying finding a particular bus at a busy stop
- Smart selection of bus stops at the options page, quickly determining which stop the user wants

Meetings

- Showing the rest of the days meetings so users may easily spot when to grab a coffee
- Fetched via a service running at Onlines servers, which is fetched from a GoogleCal, service running at https://online.ntnu.no/service_static/meeting_plan

Servant

- Shows who is responsible for the Online office at any given time
- Fetched via a service running at Onlines servers, which is fetched from a GoogleCal, service running at https://online.ntnu.no/service_static/servant_list

Coffee

- An arduino is connected to a big button at the Online office, to be pushed whenever someone is cooking a new pot of coffee
- Whenever a new coffee pot is on it's way users will get a desktop notification
- Overview showing how old the last pot of coffee is and how many pots of coffee has been made today
- Fetched via a service running at Onlines Raspberry Pi, found at http://draug.online.ntnu.no/coffee.txt

Options page

- All options react to changes immediately
- Github link to the open source repository
- Google +1 button for Onlines website
- May contain easter egg

Injected script

- Detects when user is visiting the Online website, nullifying the counter badge
