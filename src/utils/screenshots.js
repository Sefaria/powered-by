import manifest from '../data/screenshotManifest.json' with { type: 'json' }

export function getScreenshotUrl(id) {
  return manifest[id] ? `/screenshots/${id}.jpg` : null
}
