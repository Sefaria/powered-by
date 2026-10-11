import { parseCategories, type CategoryId } from './categories'
import { parseExperience, type ExperienceLevel } from './experience'
import { parseReach, type ReachBucket } from './reach'
import { parseTech } from './tech'

export type ProjectStatus = 'unknown' | 'live' | 'dead'

/** One row of `GET /api/powered-by`, as the server sends it. */
export interface RawProject {
  id: number
  project_name: string
  project_desc: string | null
  project_why: string | null
  project_link: string | null
  project_source_code: string | null
  project_category: string | null
  tags: string[]
  sefaria_tools_used: unknown[]
  tech_used_raw: string | null
  technical_experience: string | null
  project_reach: string | null
  vibe_coded: boolean
  is_buggy: boolean
  status: ProjectStatus
  featured: boolean
  submission_source: 'formstack' | 'manual' | 'in_the_wild'
  submission_date: string | null
  created_at: string
  image_url: string | null
  has_pbs_logo: boolean
  is_published: boolean
  consent_to_display: boolean
}

export interface Project {
  id: number
  name: string
  description: string
  backstory: string | null
  /** Safe http(s) only. */
  url: string | null
  /** Hostname without "www.". */
  domain: string | null
  /** Safe http(s) only. */
  sourceUrl: string | null
  categories: CategoryId[]
  /** Cleaned tags. May include "English", see {@link visibleTopics}. */
  topics: string[]
  resources: string[]
  builtWith: string | null
  reach: ReachBucket | null
  submittedAt: Date | null
  // Analytics only: never rendered in the project UI.
  experience: ExperienceLevel | null
  vibeCoded: boolean
  techMentions: string[]
}

export function safeUrl(value: string | null | undefined): URL | null {
  if (typeof value !== 'string') return null
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null
  } catch {
    return null
  }
}

const MONTH_YEAR =
  /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/i
const META_TAGS = new Set(['not vibe-coded', 'no experience', 'experience unspecified'])
const ALIASES: Record<string, string> = { kaballah: 'Kabbalah' }

export const LANGUAGE_TAG = 'English'

/** Trim, dedupe case-insensitively, alias typos, drop dates and meta tags. */
export function cleanTopics(tags: readonly string[] | null | undefined): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const tag of tags ?? []) {
    if (typeof tag !== 'string') continue
    const trimmed = tag.trim()
    if (!trimmed || MONTH_YEAR.test(trimmed) || META_TAGS.has(trimmed.toLowerCase())) continue
    const topic = ALIASES[trimmed.toLowerCase()] ?? trimmed
    const key = topic.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(topic)
  }
  return out
}

/** Strings only, trimmed, deduped, trailing "/" removed. */
export function cleanResources(tools: readonly unknown[] | null | undefined): string[] {
  const out = new Set<string>()
  for (const tool of tools ?? []) {
    if (typeof tool !== 'string') continue
    let value = tool.trim()
    while (value.length > 1 && value.endsWith('/')) value = value.slice(0, -1)
    if (value) out.add(value)
  }
  return [...out]
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function normalizeProject(raw: RawProject): Project {
  const url = safeUrl(raw.project_link)
  return {
    id: raw.id,
    name: raw.project_name.trim(),
    description: raw.project_desc?.trim() ?? '',
    backstory: textOrNull(raw.project_why),
    url: url?.href ?? null,
    domain: url ? url.hostname.replace(/^www\./, '') : null,
    sourceUrl: safeUrl(raw.project_source_code)?.href ?? null,
    categories: parseCategories(raw.project_category),
    topics: cleanTopics(raw.tags),
    resources: cleanResources(raw.sefaria_tools_used),
    builtWith: textOrNull(raw.tech_used_raw),
    reach: parseReach(raw.project_reach),
    submittedAt: parseDate(raw.submission_date),
    experience: parseExperience(raw.technical_experience),
    vibeCoded: raw.vibe_coded === true,
    techMentions: parseTech(raw.tech_used_raw),
  }
}

/** Only published projects whose owners consented to display are ever shown. */
export function normalizeProjects(raw: readonly RawProject[]): Project[] {
  return raw.filter((p) => p.is_published && p.consent_to_display).map(normalizeProject)
}

/** Topics for cards and list rows: the language tag is not a topic. */
export function visibleTopics(project: Project): string[] {
  return project.topics.filter((t) => t !== LANGUAGE_TAG)
}

/** Topics for the detail view: "English" appears only when it is the sole topic. */
export function detailTopics(project: Project): string[] {
  const topics = visibleTopics(project)
  return topics.length > 0 ? topics : project.topics
}
