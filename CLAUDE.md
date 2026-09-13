# Reizen Schotland (Prive-Reizen-Schotland)

Privé-app on the OTAP platform. CI/CD and the build come from `HansdeRooijPrive/OTAP-CI@v2`
(thin `build.py` in this repo). See README.md for URLs and layout.

## Working method (OTAP)
- Always work on `development` (T). Never commit directly to `acceptatie` or `main`.
- Change `src/` or `public/`, then `python build.py`, `python build.py --check`; commit when green.
- Push to `development` → CI + deploy to `/test/`. Promote to `acceptatie` only after green CI
  (fast-forward: `git push origin development:acceptatie`).
- The user tests on https://hansderooijprive.github.io/Prive-Reizen-Schotland/acceptatie/.
- **Release gate:** `main` (production) only after an explicit "go ahead" from the user in chat.

## Conventions
- `src/index.template.html` is still the whole app in one file (onboarded functionally unchanged,
  2026-09-13). Splitting into `src/app/*.js` + `src/styles.css` is allowed later, as app work.
- `public/` is copied next to `index.html` per environment; placeholders are filled in text files.
- Service worker (`public/sw.js`): cache names start with `{{STORAGE_KEY}}-`, so environments never
  share caches; the production worker ignores `/acceptatie/` and `/test/`; only production cleans up
  the pre-platform caches (`shell-v…`, `data-v…`, `tiles-v…`). Bump `VERSION` on every release.
- Icons: `src/icons/icon.<prod|acc|test>.png`, must differ (platform rule); colours are this app's choice.
- `.gitattributes`: PNGs are binary — never remove that, or Git corrupts the icons.
- Shared build/deploy changes belong in `OTAP-CI`, not here.

## Known leftovers (not changed during onboarding)
- `<meta name="description">` still mentions "zeilen in Griekenland" (from before the split).
