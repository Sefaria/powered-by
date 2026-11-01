/**
 * Language names that can appear in a project's free-form tags. Tags are
 * matched case-insensitively and shown in this canonical spelling.
 */
/** Each language's name in its own script. Omitted when it matches the English name. */
const NATIVE_NAMES: Readonly<Record<string, string>> = {
  Amharic: 'አማርኛ',
  Arabic: 'العربية',
  Aramaic: 'ארמית',
  Bengali: 'বাংলা',
  Bulgarian: 'Български',
  Catalan: 'Català',
  Chinese: '中文',
  Croatian: 'Hrvatski',
  Czech: 'Čeština',
  Danish: 'Dansk',
  Dutch: 'Nederlands',
  Finnish: 'Suomi',
  French: 'Français',
  German: 'Deutsch',
  Greek: 'Ελληνικά',
  Hebrew: 'עברית',
  Hindi: 'हिन्दी',
  Hungarian: 'Magyar',
  Indonesian: 'Bahasa Indonesia',
  Italian: 'Italiano',
  Japanese: '日本語',
  Korean: '한국어',
  Ladino: 'לאדינו',
  Latin: 'Latina',
  Norwegian: 'Norsk',
  Persian: 'فارسی',
  Polish: 'Polski',
  Portuguese: 'Português',
  Romanian: 'Română',
  Russian: 'Русский',
  Serbian: 'Српски',
  Spanish: 'Español',
  Swahili: 'Kiswahili',
  Swedish: 'Svenska',
  Thai: 'ไทย',
  Turkish: 'Türkçe',
  Ukrainian: 'Українська',
  Urdu: 'اردو',
  Vietnamese: 'Tiếng Việt',
  Yiddish: 'ייִדיש',
}

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

/** The language's name in its own script (e.g. עברית), or null when none is shown. */
export function nativeLanguageName(name: string): string | null {
  return NATIVE_NAMES[name] ?? null
}
