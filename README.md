Online Notifier
===============

This is a Chrome/Opera extension from the student organization Online at NTNU in Trondheim, Norway.

The software fetches data from sources like SiT, AtB and student organizations in order to provide you, as a student, with practical information in your daily life. It is made by the Application Committee (appKom) in Online.

* appkom@online.ntnu.no

Installation of Notifier
------------------------

* Install for Chrome: https://chrome.google.com/webstore/detail/hfgffimlnajpbenfpaofmmffcdmgkllf
* Install for Opera: https://addons.opera.com/en/extensions/details/online-notifier

Technology stack
----------------

Some of the data is delivered by [OmegaV Notipi](https://github.com/appKom/notipi)s (raspberry pis), via the middle layer [Online Notiwire](https://github.com/appKom/notiwire). Notipi is a joint project between Omega Verksted and Onlines appKom. Notipis consist of hardware from Omega Verksted and software from Online appKom.

The hardware bundle which complements makes hardware features in Notifier accessible to any student union who purchases and installs the bundle. OmegaV currently sells this bundle at a reasonable price. The earnings goes to further development and to support OmegaV's operations.

* omegav@omegav.no (hardware)
* appkom@online.ntnu.no (software)

Features overview
-----------------

For all the included affiliations

- Displays and notifies about news from the selected "linjeforening"
- Displays todays dinner menu and opening hours from SiT cantinas, cafés and kiosks
- Displays bus data from AtB in realtime and through the Oracle
- All pages in the extension are live, they stay updated while open

Additional features for affiliations who have a [OmegaV NotiPi](https://github.com/appKom/notipi)

- Displays office status: Open, closed, meeting, waffles
- Displays todays meetings and current servant at the office
- Displays the status of the coffee pot at the office

In-depth features
-----------------

General

- Only HTML5, CSS3 and JavaScript
- Libraries used: jQuery, LESS
- All pages keep themselves updated while running
- Separate scripts containing constants and defaults, for changeability
- Runs Google Analytics on all pages, tracking both pages and events anonymously
- Detects network status, halts all operations and resource usage when offline
- Dev mode: Faster updates, frequent clearing of localstorage
- Automatic production detection prevents accidentally using developer mode in production

Student organizations

- Affiliations
  - Tons of different organizations and institutions are supported (all of Gløshaugen is included)
  - Each organization has it's own logos and symbols
  - Each organizations' news feed is fetched and parsed
  - Each organization has a recommended color palette
  - Support for organization specific color palettes
  - A highly customizable image fetcher that extracts images from each affiliation websites since the RSS-feeds usually doesn't contain image links
- News
  - Fetches and parses feeds from affiliations' websites, both for primary and secondary affiliation
  - Support for a separate news fetching function specific to an organization, even ones without RSS/Atom feeds
  - Counts unread news and presents unread number in icon badge
  - Separates between new, updated and read items (deprecated)
  - Serves HTML5 desktop notifications on news / updates
- Palettes
  - Stored as plain, short CSS stylesheets
  - Override common CSS selectors in the popup
  - Primarily changing style of the background image via CSS3 hue-rotation and such
  - Palettes may also change colors of titles and other details

SiT

- Cantinas
  - Fetches and parses feed from SiTs website through http://sit.no/rss
  - User may select any two cantinas at any campus to be shown in the popup
  - Strips down dinner menu down to the bare necessities
  - Presents dinners with pricing in ascending order
  - Able to handle all known cases of strange formatting for SiT
- Hours
  - Also fetches opening hours for all cantinas through http://sit.no/ajax

AtB

- Realtime
  - Displays the user's two favorite stops
  - Fetches realtime bus data from a third-party API at bybussen.api.tmn.io
  - Frequently updated in order to always show correct information
  - Support for favorite bus lines, simplifying finding a particular bus at a busy stop
  - Smart selection of bus stops, quickly determining which stop the user wants
  - The complete list of bus stops is fetched and parsed every now and then
- Oracle
  - Allows the user access to SiTs bus oracle
  - The oracle has been improved with a feature that learns what you search for in order to allow intelligent auto-completion
  - The replies from the Oracle are simplified for better readability

Hardware Features (requires [NotiPi](https://github.com/appKom/notipi))

- Office
  - Office open/closed/meeting status is fetched from [Online Notiwire](https://github.com/appKom/notiwire) where it is based on light intensity data from [Notipis](https://github.com/appKom/notipi) and each affiliations Google Calendar
  - Icon changes based on light values and calendar events
  - Uses title text containing the name of the event, or other appropriate text
  - Separate icon showing when you are offline or when an error has occured
  - All states: Default, open, closed, meeting, waffles, error (error usually means disconnected)
- Meetings
  - Meeting list is fetched via [Online Notiwire](https://github.com/appKom/notiwire)
  - Showing the rest of the days meetings so users may easily spot when to grab a coffee
- Servant
  - Shows who is responsible for the affiliation office at any given time
  - Servant list fetched [Online Notiwire](https://github.com/appKom/notiwire)
- Coffee
  - Coffee pot status fetched via [Online Notiwire](https://github.com/appKom/notiwire)
  - Push the button on the [Notipi](https://github.com/appKom/notipi) in your organizations office to notify users when someone is cooking a new pot of coffee
  - Users get a HTML desktop notification with a random coffee meme when the coffee button is clicked
  - Overview shows how fresh the last pot of coffee is and how many pots of coffee has been made today

Injected script

- Detects when user is visiting the affiliation website, nullifying the counter badge

Analytics

- All statistics are anonymously collected and helps develop the project further
- Runs page tracking on all pages which gives general traffic, OS, browsers, countries etc.
- Runs event tracking on key events throughout all main javascript files
- Event tracking is split into categories which have the same name as the page name it originates from, this is done because there are so few pages in the project
- Categories are split into actions which are either clickSomething, loadSomething or toggleSomething
- An action may have a label, which is usually the clicked link, the loaded file, and so on

People
------

Project lead (chronologically descending)

- *(New lead developer coming)* is the current lead developer
- Michael Johansen was the lead developer of Notifier from v1.0 in 2012 to v5.0 in 2015

Credz to (chronologically descending)

- Christian Duvholt wrote the API, [Online Notiwire](https://github.com/appKom/notiwire)
- Petter Rostrup made the Konami code video roll
- Eirik Larsen made the OmegaV NotiPi, which made coffee notifications and office status accessible to all the student unions in Trondheim
- Vegard Stenhjem Hagen installed all the hardware for Delta
- Jim Frode Hoff made Online's coffee button, attached to an Arduino
- Jonas Svarvaa wrote several revisions of calendar services
- Tri Minh Nguyen created the API for AtB's realtime bus API
- René Räisänen designed the background images
- Dag Olav Prestegarden wrote the initial calendar service
- Roy Sindre Norangshol wrote the initial light service
- Espen Jacobsson wrote Onlines API-service in OnlineWeb3

Media coverage
--------------

* 2013.09.03 "Hemmelig program ble suksess": http://dusken.no/articles/details/23569/online-notifier/
* 2013.05.28 "Siste nytt - og om
litt er kaffen klar": http://universitetsavisa.no/campus/article17115.ece

Issues submitted to Chromium/Opera
----------------------------------

- Regex word boundary and ÆØÅ: https://code.google.com/p/chromium/issues/detail?id=223360
- Desktop Notification logging: https://code.google.com/p/chromium/issues/detail?id=225212
- Rich Notifications Don't Timeout at Midnight: https://code.google.com/p/chromium/issues/detail?id=284018&thanks=284018&ts=1378160265
- Transparent borders not playing well with inset box shadow: https://code.google.com/p/chromium/issues/detail?id=423881
- Opera 16.0 stable crashes instantly when selecting private key file (during extension packaging): DNA-12164@bugs.opera.com
- Multi-screen fullscreen on OSX not playing well with desktop notifications: https://code.google.com/p/chromium/issues/detail?id=430728
