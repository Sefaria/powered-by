// tech_used_raw is free-text prose (not tags), so matching is done via
// case-insensitive substring search rather than exact lookup. "Claude Code"
// is checked and stripped first so a mention of the CLI tool doesn't also
// get counted toward the generic Claude/Anthropic API bucket.
const CLAUDE_CODE_PATTERN = 'claude code'

export const KNOWN_TECHNOLOGIES = [
  { label: 'Claude/Anthropic API', patterns: ['claude', 'anthropic'] },
  { label: 'React', patterns: ['react'] },
  { label: 'Next.js', patterns: ['next.js', 'nextjs'] },
  { label: 'Vercel', patterns: ['vercel'] },
  { label: 'Python', patterns: ['python'] },
  { label: 'MCP', patterns: ['mcp'] },
  { label: 'Supabase', patterns: ['supabase'] },
  { label: 'Deepgram', patterns: ['deepgram'] },
  { label: '.NET', patterns: ['.net'] },
  { label: 'C#', patterns: ['c#'] },
  { label: 'Avalonia', patterns: ['avalonia'] },
  { label: 'LiteDB', patterns: ['litedb'] },
  { label: 'GitHub', patterns: ['github'] },
  { label: 'ChatGPT', patterns: ['chatgpt'] },
  { label: 'Gemini', patterns: ['gemini'] },
  { label: 'Base44', patterns: ['base44'] },
  { label: 'Discord', patterns: ['discord'] },
  { label: 'Spring Boot', patterns: ['springboot', 'spring boot'] },
  { label: 'GCP', patterns: ['gcp'] },
  { label: 'Lovable', patterns: ['lovable'] },
  { label: 'Llama Index', patterns: ['llama index', 'llamaindex'] },
  { label: 'Gradio', patterns: ['gradio'] },
  { label: 'OpenAI', patterns: ['openai'] },
  { label: 'Google Colab', patterns: ['colab'] },
  { label: 'Flask', patterns: ['flask'] },
  { label: 'PostgreSQL', patterns: ['postgres'] },
  { label: 'Drizzle ORM', patterns: ['drizzle'] },
  { label: 'Tiptap', patterns: ['tiptap'] },
  { label: 'Google Sheets API', patterns: ['google sheets'] },
  { label: 'Umami', patterns: ['umami'] },
  { label: 'Hebcal', patterns: ['hebcal'] },
]

const TOP_TECH_LIMIT = 8

export function getTechCounts(projects) {
  const counts = new Map()

  for (const project of projects) {
    const raw = (project.tech_used_raw ?? '').toLowerCase()
    if (!raw.trim()) continue

    let working = raw
    if (working.includes(CLAUDE_CODE_PATTERN)) {
      counts.set('Claude Code', (counts.get('Claude Code') ?? 0) + 1)
      working = working.replaceAll(CLAUDE_CODE_PATTERN, '')
    }

    for (const { label, patterns } of KNOWN_TECHNOLOGIES) {
      if (patterns.some((pattern) => working.includes(pattern))) {
        counts.set(label, (counts.get(label) ?? 0) + 1)
      }
    }
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_TECH_LIMIT)
}
