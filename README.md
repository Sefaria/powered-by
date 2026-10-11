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
- `npm run e2e`: Playwright (desktop 1440x900 and mobile 390x844). It builds and serves the app itself and runs against a snapshot of the API in `src/lib/__fixtures__/projects.json`, never the live API. First time only: `npx playwright install chromium`.
- `npm run screenshots`: writes screenshots of every screen at 360, 390, 768, 1024 and 1440px into `screenshots/`

### Data

All data comes from one request to `https://www.sefaria.org/api/powered-by`, made by `src/lib/api.ts` and exposed to components only through the `useProjects` hook. Everything else (filtering, sorting, the charts) happens client-side on the ~150 rows. Only projects that are published _and_ consented to display are ever shown.

## Routes and hosting

| Route     | Purpose                                                                              |
| --------- | ------------------------------------------------------------------------------------ |
| `/`       | Browse projects. `?project=<id>` opens a project's dialog (shareable).               |
| `/charts` | "Powered by Sefaria in numbers". Unlisted: `noindex, nofollow`, not linked anywhere. |

The build is a static single-page app, so the host **must serve `index.html` for any unknown path** (otherwise `/charts` and deep links 404 on refresh). On Coolify, enable the SPA fallback, or use nginx:

```nginx
location / {
  try_files $uri /index.html;
}
```

## Troubleshooting

**`Cannot find native binding` / `Cannot find module '@rolldown/binding-darwin-arm64'`**

This is usually caused by running an unsupported Node version (see Prerequisites above) and/or the [npm optional-dependencies bug](https://github.com/npm/cli/issues/4828) leaving the platform-specific rolldown binary uninstalled. Fix it with a clean reinstall on a supported Node version:

```bash
nvm use                    # or otherwise switch to Node 20.19+ / 22.12+
rm -rf node_modules package-lock.json
npm install
```

> **Note:** ESLint 10 requests Node 22.13+, so on Node 22.12 you may see a harmless `EBADENGINE` warning during install. It doesn't affect `npm run dev`. To clear it, install a newer Node 22 (e.g. `nvm install 22.13`).
