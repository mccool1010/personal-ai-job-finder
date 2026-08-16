/**
 * Resume Parser
 * Extracts structured data from PDF and DOCX resume files.
 * Uses pdf-parse and mammoth for text extraction,
 * then regex/keyword-based section detection.
 * Optional LLM enhancement when API key is available.
 */

import fs from 'fs/promises';
import { extractSkillsFromText } from './normalizer.js';

// Lazy-load pdf-parse and mammoth since they're heavy
let pdfParse = null;
let mammoth = null;

async function loadPdfParse() {
  if (!pdfParse) {
    const module = await import('pdf-parse');
    pdfParse = module.default;
  }
  return pdfParse;
}

async function loadMammoth() {
  if (!mammoth) {
    const module = await import('mammoth');
    mammoth = module.default;
  }
  return mammoth;
}

/**
 * Parse a resume file and return structured profile data
 * @param {string} filePath - Absolute path to PDF or DOCX file
 * @param {string} profileType - 'ai_ml', 'software_qa', or 'general'
 */
export async function parseResume(filePath, profileType = 'ai_ml') {
  const ext = filePath.toLowerCase().split('.').pop();
  let rawText = '';

  if (ext === 'pdf') {
    rawText = await extractTextFromPDF(filePath);
  } else if (ext === 'docx') {
    rawText = await extractTextFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file format: .${ext}. Only PDF and DOCX are supported.`);
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new Error('Could not extract meaningful text from the resume. The file might be scanned/image-based.');
  }

  // Parse sections from raw text
  const parsed = parseSections(rawText);
  parsed.rawText = rawText;
  parsed.profileType = profileType;

  return parsed;
}

/**
 * Extract text from PDF
 */
async function extractTextFromPDF(filePath) {
  const pdf = await loadPdfParse();
  const buffer = await fs.readFile(filePath);
  const data = await pdf(buffer);
  return data.text || '';
}

/**
 * Extract text from DOCX
 */
async function extractTextFromDOCX(filePath) {
  const mam = await loadMammoth();
  const result = await mam.extractRawText({ path: filePath });
  return result.value || '';
}

/**
 * Parse sections from resume text using regex and keyword detection
 */
function parseSections(text) {
  const result = {
    name: extractName(text),
    skills: extractSkillsFromText(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    projects: extractProjects(text),
    certifications: extractCertifications(text),
    achievements: extractAchievements(text),
    internships: extractInternships(text),
    technologies: [],
    preferredLocations: [],
    preferredRoles: [],
    experienceLevel: 'fresher',
  };

  // Technologies is a superset of skills for now
  result.technologies = [...result.skills];

  // Determine experience level
  result.experienceLevel = determineExperienceLevel(text, result.experience);

  return result;
}

/**
 * Extract candidate name (usually first line or two of resume)
 */
function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';

  // First non-empty line that looks like a name (not a section header, not too long)
  for (const line of lines.slice(0, 5)) {
    if (line.length > 5 && line.length < 60 && !isSectionHeader(line)) {
      // Names typically don't have lots of numbers or special chars
      if (!/\d{4}/.test(line) && !/[@|•·]/.test(line)) {
        return line;
      }
    }
  }
  return lines[0] || '';
}

/**
 * Extract experience entries
 */
function extractExperience(text) {
  const section = extractSection(text, ['experience', 'work experience', 'professional experience', 'employment']);
  if (!section) return [];

  const entries = [];
  const lines = section.split('\n').filter(l => l.trim());

  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for company/role patterns
    if (isLikelyJobEntry(trimmed)) {
      if (current) entries.push(current);
      current = { title: trimmed, company: '', duration: '', description: '' };
    } else if (current) {
      if (!current.company && trimmed.length < 100) {
        current.company = trimmed;
      } else {
        current.description += (current.description ? ' ' : '') + trimmed;
      }
    }
  }
  if (current) entries.push(current);

  return entries.slice(0, 10); // Cap at 10 entries
}

/**
 * Extract education entries
 */
function extractEducation(text) {
  const section = extractSection(text, ['education', 'academic', 'qualifications']);
  if (!section) return [];

  const entries = [];
  const lines = section.split('\n').filter(l => l.trim());

  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/\b(b\.?tech|b\.?e|b\.?sc|m\.?tech|m\.?sc|m\.?ca|mba|phd|diploma|bachelor|master|degree|bca|12th|10th)\b/i.test(trimmed)) {
      if (current) entries.push(current);
      current = { degree: trimmed, institution: '', year: '', field: '' };
      // Try to extract year
      const yearMatch = trimmed.match(/(20\d{2}|19\d{2})/);
      if (yearMatch) current.year = yearMatch[1];
    } else if (current && !current.institution && trimmed.length < 150) {
      current.institution = trimmed;
      const yearMatch = trimmed.match(/(20\d{2}|19\d{2})/);
      if (yearMatch && !current.year) current.year = yearMatch[1];
    }
  }
  if (current) entries.push(current);

  return entries.slice(0, 5);
}

/**
 * Extract project entries
 */
function extractProjects(text) {
  const section = extractSection(text, ['projects', 'personal projects', 'academic projects', 'key projects']);
  if (!section) return [];

  const entries = [];
  const lines = section.split('\n').filter(l => l.trim());

  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    // Project names are typically short, might have bullets
    if (trimmed.length < 100 && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('●') || /^[A-Z]/.test(trimmed))) {
      if (current) entries.push(current);
      const name = trimmed.replace(/^[•\-●\*]\s*/, '');
      current = { name, description: '', technologies: extractSkillsFromText(name) };
    } else if (current) {
      current.description += (current.description ? ' ' : '') + trimmed;
      const techs = extractSkillsFromText(trimmed);
      current.technologies = [...new Set([...current.technologies, ...techs])];
    }
  }
  if (current) entries.push(current);

  return entries.slice(0, 10);
}

/**
 * Extract certifications
 */
function extractCertifications(text) {
  const section = extractSection(text, ['certifications', 'certificates', 'certified']);
  if (!section) return [];

  return section.split('\n')
    .map(l => l.trim().replace(/^[•\-●\*]\s*/, ''))
    .filter(l => l.length > 3 && l.length < 200)
    .slice(0, 10);
}

/**
 * Extract achievements
 */
function extractAchievements(text) {
  const section = extractSection(text, ['achievements', 'accomplishments', 'awards', 'honors']);
  if (!section) return [];

  return section.split('\n')
    .map(l => l.trim().replace(/^[•\-●\*]\s*/, ''))
    .filter(l => l.length > 3 && l.length < 200)
    .slice(0, 10);
}

/**
 * Extract internships
 */
function extractInternships(text) {
  const section = extractSection(text, ['internships', 'internship experience']);
  if (!section) return [];

  const entries = [];
  const lines = section.split('\n').filter(l => l.trim());

  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (isLikelyJobEntry(trimmed)) {
      if (current) entries.push(current);
      current = { title: trimmed, company: '', duration: '', description: '' };
    } else if (current) {
      current.description += (current.description ? ' ' : '') + trimmed;
    }
  }
  if (current) entries.push(current);

  return entries.slice(0, 5);
}

/**
 * Extract a section from the resume text
 */
function extractSection(text, headers) {
  const lines = text.split('\n');
  let capturing = false;
  let content = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();

    if (!capturing) {
      // Check if this line matches a section header
      for (const header of headers) {
        if (line.includes(header) && line.length < header.length + 30) {
          capturing = true;
          break;
        }
      }
    } else {
      // Stop capturing at the next section header
      if (isSectionHeader(lines[i].trim()) && content.length > 0) {
        break;
      }
      content.push(lines[i]);
    }
  }

  return content.join('\n').trim();
}

/**
 * Check if a line looks like a section header
 */
function isSectionHeader(line) {
  const commonHeaders = [
    'education', 'experience', 'skills', 'projects', 'certifications',
    'achievements', 'internships', 'objective', 'summary', 'contact',
    'references', 'languages', 'hobbies', 'interests', 'awards',
    'publications', 'technical skills', 'work experience', 'professional',
  ];

  const lower = line.toLowerCase().trim();
  return commonHeaders.some(h => lower === h || lower === h + ':' || lower.startsWith(h + ' '));
}

/**
 * Check if a line looks like a job/role entry
 */
function isLikelyJobEntry(line) {
  // Contains common job title words or date patterns
  return /\b(engineer|developer|analyst|intern|associate|manager|lead|designer|coordinator|specialist)\b/i.test(line) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.*\d{4}/i.test(line) ||
    /\d{4}\s*[-–]\s*(present|\d{4})/i.test(line);
}

/**
 * Determine experience level from text and parsed experience
 */
function determineExperienceLevel(text, experiences) {
  const lower = text.toLowerCase();

  // Check for explicit mentions
  if (/fresher|fresh graduate|recent graduate|entry[\s-]level|0[\s-]years?/i.test(lower)) {
    return 'fresher';
  }

  // Count years from experience entries
  const yearMatches = lower.match(/(\d+)\+?\s*years?\s*(of\s+)?experience/i);
  if (yearMatches) {
    const years = parseInt(yearMatches[1], 10);
    if (years === 0) return 'fresher';
    if (years <= 2) return '0-2';
    if (years <= 3) return '1-3';
    if (years <= 5) return '3-5';
    return '5+';
  }

  // Default based on number of experience entries
  if (experiences.length === 0) return 'fresher';
  if (experiences.length <= 2) return '0-2';
  if (experiences.length <= 4) return '1-3';
  return '3-5';
}
