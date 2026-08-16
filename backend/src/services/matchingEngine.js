/**
 * Matching Engine — The Brain
 * Calculates weighted match scores between resume profiles and job listings.
 * Produces detailed skill-by-skill breakdowns and recommendations.
 *
 * Weights (configurable):
 *   Skills:         30%
 *   Experience:     20%
 *   Projects:       15%
 *   Role Similarity:15%
 *   Education:       5%
 *   Location:        5%
 *   Certifications:  5%
 *   Seniority:       5%
 */

import { ROLE_SYNONYMS, PROFILE_TARGET_ROLES, SENIOR_TITLE_PATTERNS } from '../data/companyLists.js';

// Default weights — configurable
const DEFAULT_WEIGHTS = {
  skills: 0.30,
  experience: 0.20,
  projects: 0.15,
  roleSimilarity: 0.15,
  education: 0.05,
  location: 0.05,
  certifications: 0.05,
  seniority: 0.05,
};

/**
 * Calculate match score between a resume profile and a job
 * @param {object} profile - ResumeProfile document
 * @param {object} job - Job document
 * @param {object} weights - Optional custom weights
 * @returns {object} { score, category, label, breakdown, recommendation, shouldApply }
 */
export function calculateMatch(profile, job, weights = DEFAULT_WEIGHTS) {
  const breakdown = {};

  // 1. Skills match (30%)
  const skillsResult = calculateSkillsMatch(profile.skills || [], job.skills || [], job.description || '');
  breakdown.skills = skillsResult;

  // 2. Experience match (20%)
  const experienceResult = calculateExperienceMatch(profile.experienceLevel, job.experienceMin, job.experienceMax);
  breakdown.experience = experienceResult;

  // 3. Projects match (15%)
  const projectsResult = calculateProjectsMatch(profile.projects || [], job.skills || [], job.description || '');
  breakdown.projects = projectsResult;

  // 4. Role similarity (15%)
  const roleResult = calculateRoleSimilarity(profile.preferredRoles || [], profile.profileType, job.title);
  breakdown.roleSimilarity = roleResult;

  // 5. Education (5%)
  const educationResult = calculateEducationMatch(profile.education || [], job.description || '');
  breakdown.education = educationResult;

  // 6. Location (5%)
  const locationResult = calculateLocationMatch(profile.preferredLocations || [], job);
  breakdown.location = locationResult;

  // 7. Certifications (5%)
  const certResult = calculateCertificationsMatch(profile.certifications || [], job.description || '');
  breakdown.certifications = certResult;

  // 8. Seniority (5%)
  const seniorityResult = calculateSeniorityMatch(profile.experienceLevel, job.title);
  breakdown.seniority = seniorityResult;

  // Calculate weighted score
  let score = 0;
  score += skillsResult.score * weights.skills;
  score += experienceResult.score * weights.experience;
  score += projectsResult.score * weights.projects;
  score += roleResult.score * weights.roleSimilarity;
  score += educationResult.score * weights.education;
  score += locationResult.score * weights.location;
  score += certResult.score * weights.certifications;
  score += seniorityResult.score * weights.seniority;

  // Round to integer percentage
  score = Math.round(score * 100);

  // Apply auto-SKIP rules
  const skipCheck = checkAutoSkip(profile, job);
  if (skipCheck.shouldSkip) {
    return {
      score: Math.min(score, 30), // Cap at 30% if auto-skip
      category: 'poor',
      label: 'SKIP',
      emoji: '🔴',
      breakdown,
      recommendation: skipCheck.reason,
      shouldApply: false,
      skipReason: skipCheck.reason,
    };
  }

  // Determine category
  const { category, label, emoji } = getMatchCategory(score);

  // Generate recommendation
  const recommendation = generateRecommendation(score, breakdown, profile, job);

  return {
    score,
    category,
    label,
    emoji,
    breakdown,
    recommendation,
    shouldApply: category === 'excellent' || category === 'good',
  };
}

/**
 * Calculate skills overlap score
 */
function calculateSkillsMatch(profileSkills, jobSkills, jobDescription) {
  if (jobSkills.length === 0) {
    // If job has no explicit skills, try to be generous
    return { score: 0.5, matched: [], partial: [], missing: [], detail: 'No specific skills listed in job' };
  }

  const profileSet = new Set(profileSkills.map(s => s.toLowerCase()));
  const matched = [];
  const partial = [];
  const missing = [];

  for (const skill of jobSkills) {
    const skillLower = skill.toLowerCase();
    if (profileSet.has(skillLower)) {
      matched.push(skill);
    } else {
      // Check for partial/related matches
      const isPartial = isRelatedSkill(skillLower, profileSkills);
      if (isPartial) {
        partial.push(skill);
      } else {
        missing.push(skill);
      }
    }
  }

  // Score: matched = 1.0, partial = 0.5, missing = 0
  const totalSkills = jobSkills.length;
  const score = totalSkills > 0
    ? (matched.length + partial.length * 0.5) / totalSkills
    : 0.5;

  return {
    score: Math.min(score, 1),
    matched,
    partial,
    missing,
  };
}

/**
 * Check if a skill is related to any profile skill
 */
function isRelatedSkill(skill, profileSkills) {
  const profileLower = profileSkills.map(s => s.toLowerCase());

  // Check synonyms and related terms
  const relatedMap = {
    'python': ['python3', 'py'],
    'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
    'machine learning': ['ml', 'deep learning', 'neural networks', 'tensorflow', 'pytorch'],
    'deep learning': ['machine learning', 'neural networks', 'cnn', 'rnn'],
    'react': ['react.js', 'reactjs', 'javascript', 'frontend'],
    'node.js': ['nodejs', 'express', 'javascript'],
    'aws': ['cloud', 'gcp', 'azure'],
    'docker': ['containers', 'kubernetes', 'devops'],
    'kubernetes': ['k8s', 'docker', 'devops'],
    'sql': ['mysql', 'postgresql', 'postgres', 'sqlite', 'database'],
    'mongodb': ['nosql', 'database', 'mongoose'],
    'git': ['github', 'gitlab', 'version control'],
    'api': ['rest', 'rest api', 'graphql', 'fastapi', 'express'],
    'tensorflow': ['deep learning', 'machine learning', 'keras'],
    'pytorch': ['deep learning', 'machine learning'],
    'llm': ['large language model', 'gpt', 'langchain', 'generative ai'],
    'nlp': ['natural language processing', 'text processing'],
    'computer vision': ['opencv', 'image processing', 'cnn', 'yolo'],
    'ci/cd': ['cicd', 'jenkins', 'github actions', 'devops'],
    'testing': ['selenium', 'cypress', 'jest', 'pytest', 'qa'],
    'selenium': ['test automation', 'automation testing', 'qa'],
  };

  // Check if skill has related terms that appear in profile
  for (const [key, related] of Object.entries(relatedMap)) {
    if (skill.includes(key) || key.includes(skill)) {
      if (related.some(r => profileLower.some(p => p.includes(r) || r.includes(p)))) {
        return true;
      }
    }
    if (related.includes(skill)) {
      if (profileLower.some(p => p.includes(key) || key.includes(p))) {
        return true;
      }
    }
  }

  // Check for substring match (e.g., "react" in "react.js")
  return profileLower.some(p => p.includes(skill) || skill.includes(p));
}

/**
 * Calculate experience level match
 */
function calculateExperienceMatch(profileLevel, jobMin, jobMax) {
  const levelMap = { 'fresher': 0, '0-2': 1, '1-3': 2, '3-5': 3, '5+': 5 };
  const profileYears = levelMap[profileLevel] || 0;

  if (jobMin === null && jobMax === null) {
    return { score: 0.7, detail: 'No experience requirement specified' };
  }

  const min = jobMin || 0;
  const max = jobMax || min + 2;

  if (profileYears >= min && profileYears <= max) {
    return { score: 1.0, detail: 'Experience level matches perfectly' };
  }

  const distance = profileYears < min ? min - profileYears : profileYears - max;
  if (distance <= 1) {
    return { score: 0.7, detail: 'Slightly outside experience range' };
  }
  if (distance <= 2) {
    return { score: 0.4, detail: 'Experience gap exists' };
  }
  return { score: 0.1, detail: 'Significant experience mismatch' };
}

/**
 * Calculate projects relevance
 */
function calculateProjectsMatch(projects, jobSkills, jobDescription) {
  if (projects.length === 0) {
    return { score: 0.3, detail: 'No projects listed', overlap: [] };
  }

  // Collect all project technologies
  const projectTechs = new Set();
  for (const project of projects) {
    if (project.technologies) {
      project.technologies.forEach(t => projectTechs.add(t.toLowerCase()));
    }
    // Also extract from description
    if (project.description) {
      const words = project.description.toLowerCase().split(/\s+/);
      words.forEach(w => projectTechs.add(w));
    }
  }

  // Check overlap with job skills
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
  const overlap = jobSkillsLower.filter(skill =>
    [...projectTechs].some(tech => tech.includes(skill) || skill.includes(tech))
  );

  const score = jobSkills.length > 0
    ? Math.min(overlap.length / jobSkills.length + 0.2, 1) // Bonus for having projects at all
    : 0.5;

  return {
    score,
    detail: overlap.length > 0 ? `${overlap.length} project skills match job requirements` : 'Limited project alignment',
    overlap,
  };
}

/**
 * Calculate role title similarity
 */
function calculateRoleSimilarity(preferredRoles, profileType, jobTitle) {
  const jobTitleLower = jobTitle.toLowerCase().trim();
  const targetRoles = PROFILE_TARGET_ROLES[profileType] || [];
  const allRoles = [...new Set([...preferredRoles.map(r => r.toLowerCase()), ...targetRoles])];

  // Direct match
  for (const role of allRoles) {
    if (jobTitleLower.includes(role) || role.includes(jobTitleLower)) {
      return { score: 1.0, detail: `Direct role match: ${role}` };
    }
  }

  // Check synonyms
  for (const role of allRoles) {
    const synonyms = ROLE_SYNONYMS[role] || [];
    for (const syn of synonyms) {
      if (jobTitleLower.includes(syn) || syn.includes(jobTitleLower)) {
        return { score: 0.8, detail: `Similar role: ${syn}` };
      }
    }
  }

  // Partial keyword match
  const roleKeywords = allRoles.flatMap(r => r.split(/\s+/));
  const titleWords = jobTitleLower.split(/\s+/);
  const commonWords = titleWords.filter(w => roleKeywords.includes(w) && w.length > 2);

  if (commonWords.length > 0) {
    return { score: 0.5, detail: `Partial role match: ${commonWords.join(', ')}` };
  }

  return { score: 0.2, detail: 'Low role alignment' };
}

/**
 * Calculate education relevance
 */
function calculateEducationMatch(education, jobDescription) {
  if (education.length === 0) {
    return { score: 0.5, detail: 'No education data available' };
  }

  const descLower = jobDescription.toLowerCase();
  const hasCSRequirement = /\b(computer science|cs|it|information technology|engineering|b\.?tech|b\.?e)\b/i.test(descLower);

  // Check if candidate has relevant education
  const hasRelevantDegree = education.some(e => {
    const degreeLower = (e.degree || '').toLowerCase();
    return /\b(computer|cs|it|engineering|technology|science|mca|bca|b\.?tech|m\.?tech)\b/i.test(degreeLower);
  });

  if (!hasCSRequirement) return { score: 0.8, detail: 'No specific degree requirement' };
  if (hasRelevantDegree) return { score: 1.0, detail: 'Relevant degree matches requirement' };
  return { score: 0.3, detail: 'Degree may not match requirement' };
}

/**
 * Calculate location preference match
 */
function calculateLocationMatch(preferredLocations, job) {
  if (preferredLocations.length === 0) {
    // No preference = any location is fine
    return { score: 0.7, detail: 'No location preference set' };
  }

  // Remote jobs are a bonus
  if (job.remote && job.remote.includes('remote') && job.indiaEligible) {
    return { score: 1.0, detail: 'Remote job, India eligible' };
  }

  const jobLocation = (job.location || '').toLowerCase();
  const jobClassifiedLocation = (job.classifiedLocation || '').toLowerCase();

  for (const pref of preferredLocations) {
    if (jobLocation.includes(pref.toLowerCase()) || jobClassifiedLocation.includes(pref.toLowerCase())) {
      return { score: 1.0, detail: `Location matches preference: ${pref}` };
    }
  }

  return { score: 0.3, detail: 'Location does not match preferences' };
}

/**
 * Calculate certifications overlap
 */
function calculateCertificationsMatch(certifications, jobDescription) {
  if (certifications.length === 0) {
    return { score: 0.5, detail: 'No certifications listed' };
  }

  const descLower = jobDescription.toLowerCase();
  const matchedCerts = certifications.filter(cert =>
    descLower.includes(cert.toLowerCase())
  );

  if (matchedCerts.length > 0) {
    return { score: 1.0, detail: `Matching certifications: ${matchedCerts.join(', ')}` };
  }

  // Having certs is still good even if not explicitly mentioned
  return { score: 0.6, detail: 'Certifications present but not specifically required' };
}

/**
 * Calculate seniority fit
 */
function calculateSeniorityMatch(profileLevel, jobTitle) {
  const isSeniorRole = SENIOR_TITLE_PATTERNS.some(p => p.test(jobTitle));
  const isJuniorProfile = ['fresher', '0-2'].includes(profileLevel);

  if (isSeniorRole && isJuniorProfile) {
    return { score: 0.0, detail: 'Senior role — not suitable for current experience level' };
  }

  if (!isSeniorRole && isJuniorProfile) {
    return { score: 1.0, detail: 'Seniority level appropriate' };
  }

  if (isSeniorRole && !isJuniorProfile) {
    return { score: 0.8, detail: 'May be suitable for senior role' };
  }

  return { score: 0.7, detail: 'Seniority level acceptable' };
}

/**
 * Check auto-SKIP conditions
 */
function checkAutoSkip(profile, job) {
  const isJunior = ['fresher', '0-2'].includes(profile.experienceLevel);
  const title = (job.title || '').toLowerCase();

  // 5+ years required for fresher
  if (isJunior && job.experienceMin && job.experienceMin >= 5) {
    return { shouldSkip: true, reason: 'Requires 5+ years experience — significantly above current level' };
  }

  // Senior/Staff/Lead/Principal with fresher
  if (isJunior && SENIOR_TITLE_PATTERNS.some(p => p.test(title))) {
    return { shouldSkip: true, reason: 'Senior-level role — not suitable for fresher/entry-level candidates' };
  }

  // US work authorization required for India candidate
  if (job.requiresAuthorization && !job.visaSponsorship && !job.indiaEligible) {
    return { shouldSkip: true, reason: 'Requires work authorization not available from India' };
  }

  // US citizenship required
  if (/us citizen|citizenship required/i.test(job.description || '')) {
    return { shouldSkip: true, reason: 'Requires US citizenship' };
  }

  return { shouldSkip: false, reason: '' };
}

/**
 * Get match category from score
 */
function getMatchCategory(score) {
  if (score >= 85) return { category: 'excellent', label: 'APPLY NOW', emoji: '🔥' };
  if (score >= 70) return { category: 'good', label: 'APPLY', emoji: '🟢' };
  if (score >= 50) return { category: 'stretch', label: 'STRETCH', emoji: '🟡' };
  return { category: 'poor', label: 'SKIP', emoji: '🔴' };
}

/**
 * Generate recommendation text
 */
function generateRecommendation(score, breakdown, profile, job) {
  const parts = [];

  if (score >= 85) {
    parts.push('Strong technical and project alignment.');
  } else if (score >= 70) {
    parts.push('Good overall fit with some gaps.');
  } else if (score >= 50) {
    parts.push('Partial alignment — gaps exist but may be bridgeable.');
  } else {
    parts.push('Significant mismatches detected.');
  }

  // Add specific advice
  if (breakdown.skills.missing && breakdown.skills.missing.length > 0) {
    parts.push(`Missing skills: ${breakdown.skills.missing.slice(0, 5).join(', ')}.`);
  }

  if (breakdown.skills.matched && breakdown.skills.matched.length > 0) {
    parts.push(`Strong in: ${breakdown.skills.matched.slice(0, 5).join(', ')}.`);
  }

  if (breakdown.experience.score < 0.5) {
    parts.push('Experience level may be a concern.');
  }

  return parts.join(' ');
}

/**
 * Compare all profiles against a single job and recommend the best one
 */
export function recommendProfile(profiles, job) {
  const results = profiles.map(profile => ({
    profileType: profile.profileType,
    ...calculateMatch(profile, job),
  }));

  results.sort((a, b) => b.score - a.score);

  return {
    recommended: results[0],
    all: results,
  };
}
