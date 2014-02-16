# Online Notifier

This is a Chrome/Opera extension and a WebApp from the student organization Online at NTNU, see http://online.ntnu.no

* Install for Chrome: https://chrome.google.com/webstore/detail/hfgffimlnajpbenfpaofmmffcdmgkllf
* Install for Opera: https://addons.opera.com/en/extensions/details/online-notifier
* Add WebApp for Mobile: Navigate to http://informatikk.org/mobile and tap "Add to Home Screen" in the context menu of the browser

# OmegaV NotiPi

Omega Verksted (OmegaV) has created the hardware bundle which complements Online Notifier by making hardware features in Notifier accessible to any student union who purchases and installs the bundle. OmegaV currently sells this bundle at a reasonable price. The earnings goes to further development and to support OmegaV's operations.

* Contact Omega Verksted: omegav@omegav.no or http://omegav.no/

# Media coverage

* 2013.09.03 "Hemmelig program ble suksess": http://dusken.no/articles/details/23569/online-notifier/
* 2013.05.28 "Siste nytt - og om
litt er kaffen klar": http://universitetsavisa.no/campus/article17115.ece

# Terms of use

Use this program or it's code entirely at your own risk. We do not, in any way imaginable, take any responsibility for consequences that might arise from using this program, it's code, or any parts of the program or the code.

# Features overview

For all the included affiliations

- Displays and notifies about news from the selected "linjeforening"
- Displays todays dinner menu and opening hours from SiT cantinas, cafés and kiosks
- Displays bus data from AtB in real time
- Written in HTML5, CSS3, LESS, JavaScript, CoffeeScript, jQuery and WebGL
- All pages in the extension are live, they keep themselves updated
- Can be used as an infoscreen (full HD vertical screen) for continous use

Additional features for affiliations who have OmegaV NotiPi

- Displays office status: Open, closed, meeting, free waffles
- Displays todays meetings and current servant at the office
- Displays the status of the coffee pot at the office

Additional features currently only available for Online

- Usable as a webapp for iOS/Android by simply putting all the code on a PHP-enabled server and accessing it via the Safari browser in iOS

# Chronological Credz

Key people are annotated with their email address

- Michael Johansen <michael@informatikk.org> is the project leader and was the sole developer of the extension itself (not support services) for the first couple of years
- Espen Jacobsson wrote Onlines API-service in OnlineWeb3
- Roy Sindre Norangshol wrote the initial light service
- Dag Olav Prestegarden wrote the initial calendar service
- René Räisänen designed the background image
- Tri Minh Nguyen created the API for AtB's realtime bus API
- Jonas Svarvaa wrote several revisions of calendar services
- Roy Sindre Norangshol helped with several maintenance issues
- Magnus Dysthe has been working on hardware for the infoscreen
- Tor Håkon Bonsaksen helped with several hardware issues
- Kristoffer Dalby hacked up scripts that fixed ubuntu screen-to-black issues
- Jim Frode Hoff <jimfrodehoff@gmail.com> made the coffee button, attached to an Arduino
- Nils Herde fixed hardware issues, kept the infoscreen running and installed the coffee button
- Vegard Stenhjem Hagen installed all the hardware for Delta
- Eirik Larsen <eirik.larsen93@gmail.com> made the OmegaV NotiPi, which made Notifier's hardware features accessible to all the student unions in Trondheim

- Also, the following made coffee memes:
	- Thomas Gautvedt
	- Aleksander Skraastad
	- John Hanssen Kolstad
	- Magnus Dysthe
	- Michael Johansen

# Issues submitted to Chromium/Opera

- Regex word boundary and ÆØÅ: https://code.google.com/p/chromium/issues/detail?id=223360
- Desktop Notification logging: https://code.google.com/p/chromium/issues/detail?id=225212
- Rich Notifications Don't Timeout at Midnight: https://code.google.com/p/chromium/issues/detail?id=284018&thanks=284018&ts=1378160265
- Opera 16.0 stable crashes instantly when selecting private key file (during extension packaging): DNA-12164@bugs.opera.com

# In-depth features

General

- Opens options page on first run
- All pages keep themselves fresh and updated when running
- Separate script containing some constants, for changeability
- Fancy HTML5, CSS3 and jQuery design on all pages
- Runs Google Analytics on all pages, tracking both pages and events anonymously
- Detects network status, adjusts all affected values accordingly
- Dev mode: Faster updates, frequent clearing of localstorage
- Automatic determination of whether or not dev mode should be enabled

Affiliation

- Many different organizations and institutions are supported
- Each organization has it's own logos and symbols
- Each organizations' news feed is fetched and parsed
- Each organization has a recommended color palette
- Support for organization specific color palettes
- Support for a separate news fetching function specific to an organization, even without RSS/Atom feeds
- The affiliation script also contains a highly customizable function for fetching images from each affiliations' website since the RSS-feeds usually doesn't contain image links
- Each affiliation references the function for getting images in it's own way

Palettes

- Stored as plain, short CSS stylesheets
- Override common CSS selectors in options, popup and the infoscreen
- Primarily changing style of the background image via CSS3 hue-rotation and such
- Palettes may also change colors of titles, pageflip and other details

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
- The complete list of bus stops is fetched and parsed every now and then

News

- Fetches and parses feeds from affiliations' websites, both for primary and secondary affiliation
- Counts unread news and presents unread number in icon badge
- Separates between new, updated and read items
- Serves HTML5 desktop notifications on news / updates

Office (requires OmegaV NotiPi)

- Office status is fetched from multiple sources, including Google Calendar and two Arduinos running on a Raspberry Pi
- Reads roof light intensity from an Arduino Uno, the service displays a file like this: http://draug.online.ntnu.no/lys.txt
- Uses a stable border value, fairly unaffected by sunlight
- Reads the light value frequently in order to react quickly to changes
- Reads events which are parsed from the affiliation systems which in turn is parsed from a GoogleCal, the running service displays a file like this: https://online.ntnu.no/notifier/delta/office
- Retrieves very lightweight requests with event information from GCal
- Updates often in order to react to changes quickly
- Icon changes based on light values and calendar events
- Uses title text containing the name of the event, or other appropriate text
- Separate icon showing when you are offline or when an error has occured
- All states: Default, open, closed, meeting, waffles, error (error usually means disconnected)

Meetings (requires OmegaV NotiPi)

- Showing the rest of the days meetings so users may easily spot when to grab a coffee
- Fetched via a service running at Onlines servers, which is fetched from a GoogleCal, service running at https://online.ntnu.no/notifier/meetings

Servant (requires OmegaV NotiPi)

- Shows who is responsible for the affiliation office at any given time
- Fetched via Online, which has prefetched from a GoogleCal, service running at e.g. https://online.ntnu.no/notifier/delta/office

Coffee (requires OmegaV NotiPi)

- An arduino is connected to a button at your affiliations office, to be pushed whenever someone is cooking a new pot of coffee
- Whenever a new coffee pot is made users get a HTML desktop notification with a random coffee meme
- Overview showing how old the last pot of coffee is and how many pots of coffee has been made today
- Fetched via a running service, e.g. like this: http://draug.online.ntnu.no/coffee.txt

Options page

- All options react to changes immediately
- Github link to the open source repository
- Google +1 button for Onlines website when affiliation is Online

Injected script

- Automatically switches to the correct clicked cantina from the popup
- Detects when user is visiting the affiliation website, nullifying the counter badge
- Injects affiliation logo when opening the affiliation specific IRC channel via kiwiirc.com

Analytics

- All statistics are anonymously collected and helps develop the project further
- Runs page tracking on all pages which gives general traffic, OS, browsers, countries etc.
- Runs event tracking on key events throughout all coffeescript files in /cs/
- Event tracking is split into categories which have the same name as the page name it originates from, this is done because there are so few pages in the project
- Categories are split into actions which are either clickSomething, loadSomething or toggleSomething
- An action may have a label, which is usually the clicked link, the loaded file, and so on
