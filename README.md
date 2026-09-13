# Prive-Reizen-Schotland — Reizen Schotland

Interactieve motorroutes door Schotland: etappes, bezienswaardigheden,
tankstations en meer. Privé-app op het OTAP-platform; de CI/CD én de bouwstap
komen centraal uit [`OTAP-CI`](https://github.com/HansdeRooijPrive/OTAP-CI) (versie `v2`).

## OTAP
| Branch | Omgeving | URL |
|--------|----------|-----|
| `development` | Test | https://hansderooijprive.github.io/Prive-Reizen-Schotland/test/ |
| `acceptatie` | Acceptatie | https://hansderooijprive.github.io/Prive-Reizen-Schotland/acceptatie/ |
| `main` | Productie | https://hansderooijprive.github.io/Prive-Reizen-Schotland/ |

Werkwijze: wijzig op `development` → CI groen → door naar `acceptatie` →
testen op de acceptatie-URL → pas na expliciet akkoord naar `main` (productie).

## Opbouw
```
app.json                  naam, opslagsleutel en kleuren per omgeving
build.py                  dunne ingang naar de centrale bouwstap (niet aanpassen)
src/index.template.html   de app (nog één bestand; opknippen kan later)
src/styles.css            (leeg; stijl staat nog in het sjabloon)
src/icons/icon.<env>.png  eigen icoon per omgeving (blauw / oranje / groen)
public/data/*.json        routedata per etappe, op aanvraag geladen
public/sw.js              service worker (offline), per omgeving gescheiden
public/manifest.json      installatiegegevens, naam en icoon per omgeving
index.html                ingecheckte productie-build
```
Alles in `public/` komt per omgeving naast `index.html` te staan; in tekst-
bestanden daar worden de placeholders (zoals `{{STORAGE_KEY}}`) ingevuld.

## Lokaal (O)
```bash
python build.py            # bouwt index.html (productie); haalt eenmalig OTAP-CI op in .otap/
python build.py --env=test --out ../tmp/test/index.html   # testvariant incl. public/
python build.py --check    # platformafspraken + index.html controleren
```
