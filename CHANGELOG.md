# Changelog
Denne changeloggen er på norsk fordi den skal vises i popupen.
Alle viktige endringer i Notifier dokumenteres i denne filen.
Dette prosjektet følger [Semantic Versioning](http://semver.org/).

## Fremtidsplaner
- Options direkte i popupen, i stedet for den separate Options-siden
- Lunsjmeny for de forskjellige kantinene
- Vise endringer fra forrige versjon
- Trekke ut infoskjermene som en egen Chrome extension
- Events fra kalenderne til linjeforeningene
- 1024-integrasjon

## Versjonshistorie

### YYYY-MM-DD Versjon 5.0 (planlagt)
- Ekstreme ytelsesforbedringer (opptil 50%(?) raskere)
- Kuttet mange tusen linjer kode (opptil 50%(?) kortere)
- Mer data hentes ferdiglaget fra Notiwire (API) i stedet for å lages i Notifier

### 2015-04-16 Versjon 4.7
- Notiwire (APIet) er installert på en sekundær lokasjon
- Automatisk fallback fra primær-API til sekundær-API for å forhindre "frakoblet"-meldinger
- Spesielle en-linjers nyheter kan vises i popupen

### 2015-03-23 Versjon 4.6
- La til 2 nye linjeforeninger: Janus, Timini
- Følgende data hentes nå ferdiglaget og komprimert fra Notiwire (API) i stedet for å lages i Notifier:
-- Kantinedata (kantiner, kaféer, kiosker, åpningstider)
-- Møtekalender, kontorvaktkalender
-- Kaffestatus, kontorstatus
- Byttet ut IRC-link med Slack-link for linjeforeninger med aktiv Slack

### 2015-03-17 Versjon 4.5
- La til 2 nye linjeforeninger: STØH, A/F Smørekoppen
- La til 2 nye kantiner: Elgeseter, Tungasletta
- Fjernet 1 kantine: Ranheimsveien
- La til denne changeloggen

### 2015-02-10 Versjon 4.4
- Valg for kantine direkte i popupen

### 2015-02-03 Versjon 4.3
- Retina-kaffememes
- La til 1 ny linjeforening: MF Placebo
- Fjernet 1 linjeforening: Ludimus (grunnet nedleggelse)

### 2014-10-14 Versjon 4.2
- La til 2 ny linjeforeninger: Mannhullet, Sct. Omega Broderskab

### 2014-09-30 Versjon 4.1
- Retinastøtte
- Hackerspace-døra (Online/Abakus)
- La til 5 nye linjeforeninger: Høiskolens Chemikerforening, Arkitektstudentenes Broderskab, Communitas, Theodor, ESN (gjenopplivet)
- Fjernet foreningene Fraktur, De Folkevalgte, grunnet døde nettsider
- Høiskolens Chemikerforening fikk hardwarefeatures og den tredje Notipien fra Omega Verksted

### 2014-05-06 Versjon 4.0
- Officescreen
- Bildefokuserte nyheter
- Favorittbusslinjer ble reintrodusert
- Rutetabeller lenket fra sanntidsbuss
- Grå og gul palett ble redesignet
- La til 3 linjeforeninger: Teaterlosjen, Psykolosjen, Signifikant
- Fjernet Notifier Mobile grunnet planer om ny og bedre app
- Fjernet foreningen ESN på grunn av død newsfeed
- Fjernet støtte for IRC for de fleste foreninger grunnet at funksjonen ikke brukes
- La til enkel link til IRC-kanaler for linjeforeninger med aktive kanaler

### 2014-02-19 Versjon 3.8
- Solan fikk hardwarefeatures og den første Notipien fra Omega Verksted
- Nabla fikk hardwarefeatures og den andre Notipien fra Omega Verksted
- La til MIT-lisens

### 2014-01-25 Versjon 3.7
- Chattekanal for alle linjeforeninger, via Kiwi IRC

### 2013-11-29 Versjon 3.6
- Abakus fikk hardwarefeatures

### 2013-11-22 Versjon 3.5
- Nye kontorstatuser: Boller, Kaffe, Kake, Pizza, Taco

### 2013-10-29 Versjon 3.4
- Bedre sikkerhet

### 2013-10-22 Versjon 3.3
- Delta fikk hardwarefeatures

### 2013-10-01 Versjon 3.2
- Bussorakel

### 2013-08-27 Versjon 3.1
- Støtte for at alle linjeforeninger kan få kontorstatus ved å sette opp lyssensor og googlekalendere
- Støtte for at alle linjeforeninger kan få kaffestatus ved å sette opp kaffeknapp
- Støtte for at hver linjeforening kan ha kaffememes som er spesifikke for sin linjeforening
- Nytt og penere nyhetsvarslingssystem
- La til 4 linjeforeninger på Gløshaugen
- La til 3 linjeforeninger på Dragvoll
- La til 2 master-/doktor-/internasjonale foreninger
- La til 2 linjeforeninger på HiST

### 2013-05-10 Versjon 3.0
- Støtte for andre nyhetsstrømmer (RSS/Atom) enn Online sin
- Støtte for å bytte fargepaletter på alle sider, samt å ha spesielle paletter for forskjellige tilhørigheter
- Støtte for å vise nyheter fra to nyhetsstrømmer samtidig
- Støtte for egne logoer og ikoner basert på tilhørighet
- Støtte for å kunne hente ut nyhetsbilder fra hvilken som helst nettside med minst mulig tilpasning
- La til 9 linjeforeninger på Gløshaugen
- La til 13 linjeforeninger på Dragvoll
- La til 4 master-/internasjonale foreninger
- La til 6 linjeforeninger på HiST/DMMH/TJSF/BI
- La til medier: Dusken, Universitetsavisa, Gemini, Adressa
- La til Samfundet
- La til Studenttinget NTNU, Studentparlamentet HiST, Velferdstinget
- La til institusjonene NTNU, HiST, DMMH, samt egen feed fra rektoratet på NTNU
- Fjernet favorittbusslinjer pga. manglende støtte i API

### 2013-04-07 Versjon 2.5
- Middagsmeny fra alle SiT-kantiner
- Åpningstider for alle SiT-kantiner, Sito kaféer, SiT storkiosker
- Støtte for andre linjeforeninger var 80% ferdig og i beta, men var kommentert ut i koden

### 2013-03-09 Versjon 2.0
- Kaffestatus
- Kaffeabonnement med meme-varsling
- Middagsmeny fra alle kantiner
- Favorittbusslinjer
- Operastøtte
- Kontorvakt

### 2012-12-04 Versjon 1.3
- Sanntidsbuss

### 2012-09-24 Versjon 1.2
- Møteplan for dagen i hoverboks over ikonet
- Middagsmenyer lenket nå direkte til sit.no med highlighting av valgt middag

### 2012-08-21 Versjon 1.1
- Infoscreen gikk fra å være en frittstående side til å bli en del av Notifier

### 2012-05-15 Versjon 1.0
- Kontorstatus
- Nyheter fra online.ntnu.no
- Nyhetsvarsler
- Middagsmeny fra Hangaren og Realfag
