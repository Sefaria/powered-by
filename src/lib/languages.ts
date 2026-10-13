/**
 * Language names that can appear in a project's free-form tags. Tags are
 * matched case-insensitively and shown in this canonical spelling.
 */
const LANGUAGE_NAMES = [
  'Amharic',
  'Arabic',
  'Aramaic',
  'Bengali',
  'Bulgarian',
  'Catalan',
  'Chinese',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Esperanto',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Indonesian',
  'Italian',
  'Japanese',
  'Korean',
  'Ladino',
  'Latin',
  'Norwegian',
  'Persian',
  'Polish',
  'Portuguese',
  'Romanian',
  'Russian',
  'Serbian',
  'Spanish',
  'Swahili',
  'Swedish',
  'Tagalog',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Urdu',
  'Vietnamese',
  'Yiddish',
] as const

const BY_LOWER = new Map<string, string>(LANGUAGE_NAMES.map((name) => [name.toLowerCase(), name]))

/** The canonical language name for a tag, or null when the tag is not a language. */
export function languageName(tag: string): string | null {
  return BY_LOWER.get(tag.trim().toLowerCase()) ?? null
}
