/**
 * Job Classifier
 * Classifies jobs by company type, location, remote status, and experience level.
 */

import {
  MNC_COMPANIES, STARTUP_KEYWORDS,
  CITY_ALIAS_MAP, INDIAN_CITIES,
  REMOTE_INDIA_PATTERNS, REMOTE_US_ONLY_PATTERNS, REMOTE_EU_ONLY_PATTERNS,
  WORK_AUTH_PATTERNS, VISA_SPONSOR_PATTERNS, WORLDWIDE_REMOTE_PATTERNS,
  SENIOR_TITLE_PATTERNS,
} from '../data/companyLists.js';

/**
 * Classify a normalized job on all axes
 */
export function classifyJob(job) {
  const classified = { ...job };

  classified.companyType = classifyCompanyType(job.company, job.description);
  classified.classifiedLocation = classifyLocation(job.location, job.country);
  classified.remote = classifyRemote(job);
  classified.requiresAuthorization = detectWorkAuthorization(job.description);
  classified.visaSponsorship = job.visaSponsorship || detectVisaSponsorship(job.description);
  classified.indiaEligible = isIndiaEligible(classified);

  // Parse experience if not already set
  if (classified.experienceMin === null) {
    const exp = parseExperienceFromTitle(job.title);
    classified.experienceMin = exp.min;
    classified.experienceMax = exp.max;
  }

  return classified;
}

/**
 * Classify company type: MNC, Startup, Mid-size, Unknown
 */
function classifyCompanyType(company, description) {
  if (!company) return 'unknown';

  const companyLower = company.toLowerCase().trim();

  // Check against MNC list
  if (MNC_COMPANIES.has(companyLower)) return 'mnc';
  // Also check partial matches (e.g., "Google India" should match "google")
  for (const mnc of MNC_COMPANIES) {
    if (companyLower.includes(mnc) || mnc.includes(companyLower)) return 'mnc';
  }

  // Check for startup indicators in description
  if (description) {
    const descLower = description.toLowerCase();
    for (const keyword of STARTUP_KEYWORDS) {
      if (descLower.includes(keyword)) return 'startup';
    }
  }

  return 'unknown';
}

/**
 * Classify location into canonical Indian city or international
 */
function classifyLocation(location, country) {
  if (!location) return 'Unknown';

  const locLower = location.toLowerCase().trim();

  // Check Indian cities
  for (const [alias, canonical] of Object.entries(CITY_ALIAS_MAP)) {
    if (locLower.includes(alias)) {
      return canonical.charAt(0).toUpperCase() + canonical.slice(1);
    }
  }

  // Check for India
  if (locLower.includes('india') || (country && country.toLowerCase() === 'india')) {
    return 'Other India';
  }

  // Check remote
  if (locLower.includes('remote')) {
    return 'Remote';
  }

  // International
  return 'International';
}

/**
 * Classify remote status with fine-grained detection
 */
function classifyRemote(job) {
  const text = `${job.title} ${job.description} ${job.location}`.toLowerCase();

  // Check specific patterns first
  for (const pattern of REMOTE_US_ONLY_PATTERNS) {
    if (pattern.test(text)) return 'remote_us_only';
  }
  for (const pattern of REMOTE_EU_ONLY_PATTERNS) {
    if (pattern.test(text)) return 'remote_eu_only';
  }
  for (const pattern of REMOTE_INDIA_PATTERNS) {
    if (pattern.test(text)) return 'remote_india';
  }
  for (const pattern of WORLDWIDE_REMOTE_PATTERNS) {
    if (pattern.test(text)) return 'remote_worldwide';
  }

  // Check if location explicitly says "Remote"
  if (job.location && job.location.toLowerCase().includes('remote')) {
    // If the job already has a country set and it's India, it's remote India
    if (job.country && job.country.toLowerCase() === 'india') return 'remote_india';
    return 'remote_worldwide';
  }

  // Check for hybrid
  if (text.includes('hybrid')) return 'hybrid';

  // If remote was already set by the adapter
  if (job.remote && job.remote !== 'unknown') return job.remote;

  return 'onsite';
}

/**
 * Detect if job requires work authorization
 */
function detectWorkAuthorization(description) {
  if (!description) return false;
  for (const pattern of WORK_AUTH_PATTERNS) {
    if (pattern.test(description)) return true;
  }
  return false;
}

/**
 * Detect if job offers visa sponsorship
 */
function detectVisaSponsorship(description) {
  if (!description) return false;
  for (const pattern of VISA_SPONSOR_PATTERNS) {
    if (pattern.test(description)) return true;
  }
  return false;
}

/**
 * Determine if job is eligible for someone in India
 */
function isIndiaEligible(job) {
  // If requires US/EU work authorization, not India eligible
  if (job.requiresAuthorization && !job.visaSponsorship) {
    if (job.remote === 'remote_us_only' || job.remote === 'remote_eu_only') {
      return false;
    }
  }

  // Explicitly India-related jobs are eligible
  if (job.remote === 'remote_india') return true;
  if (job.classifiedLocation !== 'International' && job.classifiedLocation !== 'Remote') return true;

  // Remote worldwide is eligible
  if (job.remote === 'remote_worldwide') return true;

  // US only, EU only — not eligible
  if (job.remote === 'remote_us_only' || job.remote === 'remote_eu_only') return false;

  // Default: eligible unless proven otherwise
  return true;
}

/**
 * Parse basic experience from title (e.g., "Senior", "Junior", "Lead")
 */
function parseExperienceFromTitle(title) {
  if (!title) return { min: null, max: null };
  const titleLower = title.toLowerCase();

  // Check for seniority in title
  if (/\bjunior\b|\bjr\.?\b|\bentry[\s-]level\b|\bfresher\b|\bgraduate\b|\bintern\b/i.test(titleLower)) {
    return { min: 0, max: 2 };
  }

  for (const pattern of SENIOR_TITLE_PATTERNS) {
    if (pattern.test(titleLower)) {
      return { min: 5, max: null };
    }
  }

  if (/\bmid[\s-]?level\b/i.test(titleLower)) {
    return { min: 3, max: 5 };
  }

  return { min: null, max: null };
}
