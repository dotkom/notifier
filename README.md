Online Notifier
===============

This is a Chrome extension for the student organisation Online at NTNU, see http://online.ntnu.no

Features

- Notifies about news from Online
- Displays status information for Onlines office: Open, closed, meeting, free waffles
- Displays dinner information from cantinas at NTNU Gløshaugen

Tech

- Written in HTML5, CSS3 and Javascript/JQuery
- News is fetched through an RSS-feed for general data, API for images
- Dinner info is fetched through an RSS-feed from sit.no
- Office status is fetched from multiple sources
    - An Arduino with a light sensor measures light intensity at the office
    - An Apache server presents the light info here: http://draug.online.ntnu.no/lys.txt
    - A python script parses the Google Calendar for the office
    - A static service in Django presents the calendar info here: http://online.ntnu.no/service_static/online_notifier

Credz

- Michael Johansen is the lead coder
- Espen Jacobsson wrote the API-service
- Roy Sindre Norangshol wrote the light service
- Dag Olav Prestegarden wrote the calendar service
- René Räisänen designed the graphics
