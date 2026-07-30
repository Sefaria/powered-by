# Powered by Sefaria

A data-centric dashboard for the Sefaria developer ecosystem — a single place to search, filter, sort, and count the independent projects built by community members on top of Sefaria's data, API, and other digital assets.

## Why this exists

Sefaria is more than a library. It's also the authoritative data layer powering much of Torah technology, via our API, Sefaria-Export, and more. The most compelling way to tell that story is through [Powered by Sefaria](https://developers.sefaria.org/docs/powered-by-sefaria) — the independent projects the community has built on our data. They're the clearest demonstration of Sefaria's reach beyond the library website.

AI has made it easier than ever to build with our data — this project helps us tell the story.

## Goal

**A visual way to search, filter, sort, and count projects Powered by Sefaria.**

A data-centric home for the developer ecosystem — one place to see the scale and diversity of what's been built on Sefaria's data, enabling deeper understanding of Sefaria as the authoritative data layer for Jewish text development in the age of AI.


## Tech stack

- [React 19](https://react.dev) + [Vite 8](https://vite.dev)
- ESLint 10

## Getting Started

### Prerequisites

This project uses **Vite 8**, which is built on [rolldown](https://rolldown.rs) (a native bundler) and requires **Node.js 20.19+ or 22.12+**. The repo includes an `.nvmrc` pinned to Node 22, so if you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use        # picks up the version in .nvmrc
```

### Install & run

```bash
npm install
npm run dev    # starts the dev server at http://localhost:5173
```

Other scripts:

- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm run screenshots` — regenerate the faint website-screenshot backgrounds shown on project cards. Fetches the current published project list, captures a screenshot of each project's site with headless Chrome, and writes the results to `public/screenshots/` + `src/data/screenshotManifest.json`. Run this manually whenever you want to pick up newly-added projects or refresh existing screenshots — it is **not** run automatically on build or deploy. Takes roughly 1–2 minutes for the current project count; sites that fail to load are skipped and logged, not treated as errors.

## Troubleshooting

**`Cannot find native binding` / `Cannot find module '@rolldown/binding-darwin-arm64'`**

This is usually caused by running an unsupported Node version (see Prerequisites above) and/or the [npm optional-dependencies bug](https://github.com/npm/cli/issues/4828) leaving the platform-specific rolldown binary uninstalled. Fix it with a clean reinstall on a supported Node version:

```bash
nvm use                    # or otherwise switch to Node 20.19+ / 22.12+
rm -rf node_modules package-lock.json
npm install
```

> **Note:** ESLint 10 requests Node 22.13+, so on Node 22.12 you may see a harmless `EBADENGINE` warning during install. It doesn't affect `npm run dev`. To clear it, install a newer Node 22 (e.g. `nvm install 22.13`).
