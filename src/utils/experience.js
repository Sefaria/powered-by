export const EXPERIENCE_LEVELS = ['No Experience', 'Beginner', 'Intermediate', 'Advanced']

const RAW_TO_LABEL = {
  None: 'No Experience',
  '<5 years': 'Beginner',
  '5-10 years': 'Intermediate',
  '10+ years': 'Advanced',
}

// Returns null for unspecified/blank/unrecognized experience.
export function getExperienceLevel(rawExperience) {
  return RAW_TO_LABEL[rawExperience] ?? null
}
