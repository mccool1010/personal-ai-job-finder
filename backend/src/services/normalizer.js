/**
 * Job Normalizer
 * Transforms raw adapter output into the canonical Job schema.
 * Extracts skills, parses experience, normalizes salary.
 */

import { v4 as uuidv4 } from 'uuid';
import { SKILLS_DICTIONARY, EXPERIENCE_PATTERNS } from '../data/companyLists.js';

/**
 * Normalize a raw job object into the canonical schema
 */
export function normalizeJob(raw) {
  const description = (raw.description || '').toLowerCase();
  const title = (raw.title || '').toLowerCase();
  const combinedText = `${title} ${description}`;

  // Extract skills from description if not already extracted
  const extractedSkills = raw.skills && raw.skills.length > 0
    ? raw.skills
    : extractSkillsFromText(combinedText);

  // Parse experience from description
  const experience = parseExperience(combinedText);

  return {
    jobId: uuidv4(),
    title: cleanTitle(raw.title || ''),
    company: (raw.company || 'Unknown').trim(),
    description: (raw.description || '').slice(0, 5000), // Cap description length
    location: (raw.location || '').trim(),
    country: (raw.country || '').trim(),
    remote: raw.remote || 'unknown',
    employmentType: raw.employmentType || 'unknown',
    experienceMin: experience.min !== null ? experience.min : (raw.experienceMin || null),
    experienceMax: experience.max !== null ? experience.max : (raw.experienceMax || null),
    salaryMin: raw.salaryMin || null,
    salaryMax: raw.salaryMax || null,
    salaryCurrency: raw.salaryCurrency || null,
    skills: [...new Set(extractedSkills.map(s => s.toLowerCase().trim()))],
    postedDate: raw.postedDate || new Date(),
    source: raw.source || 'Unknown',
    sourceUrl: raw.sourceUrl || '',
    applicationUrl: raw.applicationUrl || raw.sourceUrl || '',
    visaSponsorship: raw.visaSponsorship || false,
    allSources: [{ source: raw.source, url: raw.sourceUrl || raw.applicationUrl || '' }],
    fetchedAt: new Date(),
  };
}

/**
 * Extract skills from text using the skills dictionary
 */
export function extractSkillsFromText(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = [];

  for (const skill of SKILLS_DICTIONARY) {
    // Use word boundary check for short skills to avoid false positives
    if (skill.length <= 2) {
      // For very short skills (e.g., "r", "c#"), require word boundaries
      const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
      if (regex.test(lowerText)) {
        found.push(skill);
      }
    } else {
      if (lowerText.includes(skill.toLowerCase())) {
        found.push(skill);
      }
    }
  }

  return [...new Set(found)];
}

/**
 * Parse experience requirements from text
 */
export function parseExperience(text) {
  if (!text) return { min: null, max: null };

  for (const pattern of EXPERIENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const min = parseInt(match[1], 10);
      const max = match[2] ? parseInt(match[2], 10) : null;
      if (!isNaN(min) && min >= 0 && min <= 30) {
        return { min, max: max !== null && !isNaN(max) ? max : null };
      }
    }
  }

  return { min: null, max: null };
}

/**
 * Clean up job title — remove HTML, excessive whitespace, etc.
 */
function cleanTitle(title) {
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
