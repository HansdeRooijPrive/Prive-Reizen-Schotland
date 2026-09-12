# Reizen Schotland

Mobiele web-app met interactieve routekaarten voor meerdere reizen. Bij het
openen kies je een bestemming:

- **⛵ Zeilen · Griekenland** — routekaarten voor de Ionische Zee (offline).
- **🏍️ Rondrit · Schotland** — motorroutes in delen (deel 1: Dinnet → Ardullie,
  deel 2: Ardullie → Durness) met bezienswaardigheden en lunch/koffie-stops.

## Live (GitHub Pages)

- **Productie** (stabiel, om te delen / als app toe te voegen):
  `https://hansderooijprive.github.io/Prive-Reizen-Schotland/`
- **Test** (voorproefje van nieuwe wijzigingen, met "TEST"-lint):
  `https://hansderooijprive.github.io/Prive-Reizen-Schotland/test/`

## Opzet

De hele app zit in één bestand: [`index.html`](index.html). De **URL blijft
altijd gelijk** — het versienummer staat niet in de link maar *in* de app, in
het `APP_VERSIE`-object (zichtbaar via de versie-chip en "Over deze app").

### Nieuwe versie uitbrengen
1. Wijzig `index.html`.
2. Werk bovenaan `APP_VERSIE` bij: bump `versie`/`datum` en voeg een regel toe
   aan `historie` (`soort`: `klein`/`middel`/`groot`).
3. Commit — dezelfde URL toont automatisch de nieuwe versie.

## Werkwijze: test → productie

Twee branches sturen twee omgevingen aan:

| Branch        | Omgeving   | URL         |
|---------------|------------|-------------|
| `main`        | Productie  | `/` (root)  |
| `development` | Test       | `/test/`    |

- Nieuwe wijzigingen commit je op **`development`**. Een push bouwt automatisch
  de test-omgeving (`/test/`). Die krijgt een zichtbaar **TEST**-lint en een
  eigen `localStorage`-sleutel, zodat test en productie elkaars gegevens niet
  raken.
- Ben je tevreden? Dan merge je `development` → **`main`**. Een push naar `main`
  publiceert de nieuwe versie op de **productie**-URL.

De deploys lopen via GitHub Actions
([`.github/workflows`](.github/workflows)); source van Pages staat op
"GitHub Actions".
