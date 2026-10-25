// Renders public/og-image.png (1200x630) from the site's own pieces: the brand purple, the
// constellation, the samekh and the hero headline. Needs network for the Google fonts.
//   node scripts/generate-og-image.mjs
import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const root = new URL('..', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

const PURPLE = '#653259' // --brand-devportal
const HEADLINE = 'Apps built on Sefaria’s open Jewish library.'

const constellation = read('src/components/layout/Constellation.tsx')
const nodes = JSON.parse(
  constellation.match(/const NODES[^=]*= (\[[\s\S]*?\n\])/)[1].replace(/,\s*\]/g, ']'),
)
const edges = JSON.parse(
  constellation.match(/const EDGES[^=]*= (\[[\s\S]*?\n\])/)[1].replace(/,\s*\]/g, ']'),
)
const hubs = new Set([2, 8, 13])
const samekh = read('src/components/layout/SamekhLogo.tsx').match(/<path d="([^"]+)"/)[1]
const hebrewFont = new URL('public/fonts/Amiri-Taamey-Frank-merged.ttf', root).href

const lines = edges
  .map(
    ([a, b]) =>
      `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}"/>`,
  )
  .join('')
const dots = nodes
  .map(
    ([x, y], i) =>
      `<circle cx="${x}" cy="${y}" r="${hubs.has(i) ? 7 : 4}" opacity="${hubs.has(i) ? 0.6 : 0.4}"/>`,
  )
  .join('')

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400&family=Roboto:wght@500;600&display=swap">
<style>
  @font-face { font-family: 'Taamey Frank CLM'; src: url('${hebrewFont}'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; position: relative; overflow: hidden; background: ${PURPLE}; color: #fff; font-family: Roboto, sans-serif; }
  svg.net { position: absolute; top: 0; right: 0; width: 770px; height: 630px; }
  svg.net line { stroke: #fff; stroke-opacity: .3; stroke-width: 1.5; }
  svg.net circle { fill: #fff; }
  .brand { position: absolute; left: 80px; top: 70px; display: flex; align-items: center; gap: 20px; font-size: 26px; font-weight: 600; }
  .tile { width: 74px; height: 74px; border-radius: 16px; background: rgba(0,0,0,.22); box-shadow: inset 0 0 0 2px rgba(255,255,255,.25); display: grid; place-items: center; }
  .tile svg { height: 42px; fill: #fff; }
  h1 { position: absolute; left: 80px; top: 200px; max-width: 860px; font: 400 72px/1.1 'EB Garamond', serif; }
  .url { position: absolute; left: 80px; bottom: 56px; font-size: 24px; font-weight: 600; opacity: .85; }
  .he { position: absolute; right: 80px; bottom: 56px; font: 400 32px 'Taamey Frank CLM', serif; direction: rtl; }
</style></head><body>
<svg class="net" viewBox="0 0 760 480" preserveAspectRatio="xMaxYMin slice">${lines}${dots}</svg>
<div class="brand"><span class="tile"><svg viewBox="0 0 117 154"><path d="${samekh}"/></svg></span>Powered by Sefaria</div>
<h1>${HEADLINE}</h1>
<div class="url">powered-by.sefaria.org</div>
<div class="he" lang="he">אי אפשר לבית מדרש בלא חידוש</div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: new URL('public/og-image.png', root).pathname })
await browser.close()
