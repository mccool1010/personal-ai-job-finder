/**
 * Job Deduplicator
 * Detects duplicate job listings from different sources.
 * Uses normalized hash of company + title + location.
 */

import crypto from 'crypto';

/**
 * Generate a deduplication hash for a job
 */
export function generateDeduplicationHash(job) {
  const normalizedCompany = normalizeForHash(job.company);
  const normalizedTitle = normalizeForHash(job.title);
  const normalizedLocation = normalizeForHash(job.location);

  const input = `${normalizedCompany}|${normalizedTitle}|${normalizedLocation}`;
  return crypto.createHash('md5').update(input).digest('hex');
}

/**
 * Deduplicate an array of jobs.
 * When duplicates are found, merge their source information.
 * @param {Array} jobs - Array of normalized jobs
 * @returns {Array} Deduplicated jobs
 */
export function deduplicateJobs(jobs) {
  const hashMap = new Map();

  for (const job of jobs) {
    const hash = generateDeduplicationHash(job);
    job.deduplicationHash = hash;

    if (hashMap.has(hash)) {
      const existing = hashMap.get(hash);
      // Merge sources
      const newSource = { source: job.source, url: job.applicationUrl || job.sourceUrl };
      const alreadyHasSource = existing.allSources.some(
        s => s.source === newSource.source
      );
      if (!alreadyHasSource) {
        existing.allSources.push(newSource);
      }
      // Keep the richer description
      if (job.description.length > existing.description.length) {
        existing.description = job.description;
      }
      // Merge skills
      const mergedSkills = new Set([...existing.skills, ...job.skills]);
      existing.skills = [...mergedSkills];
      // Keep salary if existing doesn't have it
      if (!existing.salaryMin && job.salaryMin) {
        existing.salaryMin = job.salaryMin;
        existing.salaryMax = job.salaryMax;
        existing.salaryCurrency = job.salaryCurrency;
      }
    } else {
      hashMap.set(hash, { ...job });
    }
  }

  const deduplicated = Array.from(hashMap.values());
  const removedCount = jobs.length - deduplicated.length;
  if (removedCount > 0) {
    console.log(`🔄 Deduplication: ${jobs.length} → ${deduplicated.length} (${removedCount} duplicates merged)`);
  }

  return deduplicated;
}

/**
 * Normalize a string for hashing — lowercase, remove special chars, collapse whitespace
 */
function normalizeForHash(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
