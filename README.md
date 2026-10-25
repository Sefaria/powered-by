# Powered by Sefaria

A data-centric dashboard for the Sefaria developer ecosystem — a single place to search, filter, sort, and count the independent projects built by community members on top of Sefaria's data, API, and other digital assets.

## Why this exists

Sefaria is more than a library. It's also the authoritative data layer powering much of Torah technology, via our API, Sefaria-Export, and more. The most compelling way to tell that story is through [Powered by Sefaria](https://developers.sefaria.org/docs/powered-by-sefaria) — the independent projects the community has built on our data. They're the clearest demonstration of Sefaria's reach beyond the library website.

AI has made it easier than ever to build with our data — this project helps us tell the story.

## Goal

**A visual way to search, filter, sort, and count projects Powered by Sefaria.**

A data-centric home for the developer ecosystem — one place to see the scale and diversity of what's been built on Sefaria's data, enabling deeper understanding of Sefaria as the authoritative data layer for Jewish text development in the age of AI.

## Tech stack

- TypeScript (strict), [React 19](https://react.dev) + [Vite 8](https://vite.dev), `react-router` v7 (library mode)
- CSS Modules on top of semantic design tokens (`src/styles/tokens.css`), [Lucide](https://lucide.dev) icons
- `recharts` for the unlisted `/charts` page (lazy-loaded, so it is not in the main bundle)
- Vitest + React Testing Library + `vitest-axe` for unit and component tests; Playwright + `@axe-core/playwright` for end to end
- ESLint (typescript-eslint, react-hooks, jsx-a11y) and Prettier

The spec this implements is in [`docs/REDESIGN_SPEC.md`](docs/REDESIGN_SPEC.md).

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

### Scripts

- `npm run dev`: dev server
- `npm run build`: type-check and production build into `dist/`
- `npm run preview`: serve the production build
- `npm run lint` / `npm run format`: ESLint / Prettier
- `npm run typecheck`: `tsc -b`
- `npm test`: unit and component tests (Vitest)
- `npm run e2e`: Playwright (desktop 1440x900 and mobile 390x844; the project-page spec sets its own 1280, 834 and 390 viewports). It builds and serves the app itself and runs against a snapshot of the API in `src/lib/__fixtures__/projects.json`, never the live API. First time only: `npx playwright install chromium`.
- `npm run screenshots`: writes screenshots of every screen at 360, 390, 768, 1024 and 1440px into `screenshots/`

### Data

All data comes from one request to `https://www.sefaria.org/api/powered-by`, made by `src/lib/api.ts` and exposed to components only through the `useProjects` hook. Everything else (filtering, sorting, the charts) happens client-side on the ~150 rows. Every published project is shown (`consent_to_display` is deliberately not checked).

## Routes and hosting

| Route             | Purpose                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `/`               | Browse projects. Search, filters, sort and view live in the URL.                                         |
| `/projects/:slug` | One project. The slug is `${id}-${name}` (`141-torah-mcp`); only the id is used, a stale name redirects. |
| `/charts`         | "Powered by Sefaria in numbers". Unlisted: `noindex, nofollow`, not linked anywhere.                     |

The build is a static single-page app, so the host **must serve `index.html` for any unknown path** (otherwise `/charts` and project links 404 on refresh). On Coolify, enable the SPA fallback, or use nginx. The category images under `/category-art/` never change under the same name, so give them a long cache:

```nginx
location /category-art/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

location / {
  try_files $uri /index.html;
}
```

An unknown project id renders a "Project not found" page and sets `<meta name="prerender-status-code" content="404">` for prerendering services; a plain static host still answers 200 for it.

## Brand purple

The brand purple is `--brand-devportal` (`#653259`, design-system purple-800), with `#4e2544` (purple-900) on hover. The design system's DevPortal theme maps `module-primary` to purple-700 (`#7c416f`), which is lighter than the live Developer Portal, so we use purple-800 until the design system is updated. `#7c416f` stays as the AI & Apps category color only.

## Analytics (off by default)

`src/lib/analytics.ts` is Plausible-compatible and does nothing unless `VITE_ANALYTICS_DOMAIN` is set at build time:

| Variable                | Meaning                                                                                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_ANALYTICS_DOMAIN` | The site's domain in the analytics account. Unset means analytics is off and the footer says nothing.                                                                               |
| `VITE_ANALYTICS_SRC`    | Script URL. Defaults to `https://plausible.io/js/script.manual.js`; it must be a _manual_ variant, because the app sends its own page views on route changes (never for `/charts`). |

Do Not Track and Global Privacy Control switch it off. There are no cookies, storage ids or user ids, and events carry only ids and UI context, never search text. The events are `project_outbound`, `project_source`, `featured_open`, `filter_change` (facet name only), `sort_change`, `view_change` and `search` (`has_query` and a results bucket). When you turn it on, allow the script and API hosts in the site's Content-Security-Policy (`script-src` and `connect-src`); the app sets none itself.

The OG image is regenerated with `node scripts/generate-og-image.mjs` (needs network for the fonts).

## Troubleshooting

**`Cannot find native binding` / `Cannot find module '@rolldown/binding-darwin-arm64'`**

This is usually caused by running an unsupported Node version (see Prerequisites above) and/or the [npm optional-dependencies bug](https://github.com/npm/cli/issues/4828) leaving the platform-specific rolldown binary uninstalled. Fix it with a clean reinstall on a supported Node version:

```bash
nvm use                    # or otherwise switch to Node 20.19+ / 22.12+
rm -rf node_modules package-lock.json
npm install
```

> **Note:** ESLint 10 requests Node 22.13+, so on Node 22.12 you may see a harmless `EBADENGINE` warning during install. It doesn't affect `npm run dev`. To clear it, install a newer Node 22 (e.g. `nvm install 22.13`).
