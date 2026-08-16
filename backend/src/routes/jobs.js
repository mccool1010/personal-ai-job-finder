/**
 * Job Routes
 * Search, fetch, match, and manage jobs.
 */

import { Router } from 'express';
import { fetchFromAllSources } from '../adapters/index.js';
import { normalizeJob } from '../services/normalizer.js';
import { deduplicateJobs } from '../services/deduplicator.js';
import { classifyJob } from '../services/classifier.js';
import { calculateMatch, recommendProfile } from '../services/matchingEngine.js';
import { normalizeSalaryFromJob } from '../services/salaryNormalizer.js';
import { getJobModel } from '../models/Job.js';
import { getResumeProfileModel } from '../models/ResumeProfile.js';
import { getSearchHistoryModel } from '../models/SearchHistory.js';
import { PROFILE_TARGET_ROLES } from '../data/companyLists.js';

const router = Router();

// In-memory job cache for fast repeat searches
let cachedJobs = [];
let lastFetchTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/jobs/search — Main job search endpoint
 * Query params: profileType, location, remote, companyType, experienceLevel, minSalary, salaryCurrency, employmentType
 */
router.get('/search', async (req, res) => {
  try {
    const {
      profileType = 'ai_ml',
      location,
      remote,
      companyType,
      experienceLevel,
      minSalary,
      salaryCurrency,
      employmentType,
      page = 1,
      limit = 50,
    } = req.query;

    // Get or create profile
    const ProfileModel = getResumeProfileModel();
    let profile = await ProfileModel.findOne({ profileType });

    // If no profile exists, create a default one based on target roles
    if (!profile) {
      profile = {
        profileType,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        preferredRoles: PROFILE_TARGET_ROLES[profileType] || [],
        preferredLocations: [],
        experienceLevel: 'fresher',
      };
    }

    // Build search queries from profile's target roles
    const targetRoles = PROFILE_TARGET_ROLES[profileType] || [];
    const searchQueries = buildSearchQueries(profileType, targetRoles);

    // Fetch jobs (use cache if recent)
    let allJobs;
    if (Date.now() - lastFetchTime < CACHE_TTL && cachedJobs.length > 0) {
      console.log('📦 Using cached jobs');
      allJobs = cachedJobs;
    } else {
      console.log('🔍 Fetching fresh jobs...');
      allJobs = [];

      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to stay in API limits
        const results = await fetchFromAllSources(query, {
          country: location || 'india',
          profileType,
        });
        allJobs.push(...results);
      }

      // Normalize all jobs
      allJobs = allJobs.map(normalizeJob);

      // Deduplicate
      allJobs = deduplicateJobs(allJobs);

      // Classify all jobs
      allJobs = allJobs.map(classifyJob);

      // Add salary display
      allJobs = allJobs.map(job => ({
        ...job,
        salary: normalizeSalaryFromJob(job),
      }));

      // Cache
      cachedJobs = allJobs;
      lastFetchTime = Date.now();

      // Persist to DB (non-blocking)
      persistJobs(allJobs).catch(err => console.error('Job persist error:', err.message));
    }

    // Apply filters
    let filteredJobs = applyFilters(allJobs, {
      location,
      remote,
      companyType,
      experienceLevel,
      minSalary: minSalary ? parseFloat(minSalary) : null,
      salaryCurrency,
      employmentType,
    });

    // Calculate match scores
    const matchedJobs = filteredJobs.map(job => {
      const match = calculateMatch(profile, job);
      return { ...job, match };
    });

    // Sort by match score (descending)
    matchedJobs.sort((a, b) => b.match.score - a.match.score);

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedJobs = matchedJobs.slice(startIndex, startIndex + parseInt(limit));

    // Calculate summary counts
    const summary = {
      total: matchedJobs.length,
      excellent: matchedJobs.filter(j => j.match.category === 'excellent').length,
      good: matchedJobs.filter(j => j.match.category === 'good').length,
      stretch: matchedJobs.filter(j => j.match.category === 'stretch').length,
      poor: matchedJobs.filter(j => j.match.category === 'poor').length,
    };

    // Save search history
    const SearchHistory = getSearchHistoryModel();
    SearchHistory.create({
      profileType,
      filters: { location, remote, companyType, experienceLevel, minSalary, employmentType },
      resultCount: matchedJobs.length,
      topMatchCount: summary.excellent + summary.good,
      searchedAt: new Date(),
    }).catch(err => console.error('Search history error:', err.message));

    res.json({
      success: true,
      summary,
      jobs: paginatedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: matchedJobs.length,
        totalPages: Math.ceil(matchedJobs.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/:id — Get job details with match breakdown
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { profileType = 'ai_ml' } = req.query;

    // Find job in cache or DB
    let job = cachedJobs.find(j => j.jobId === id);

    if (!job) {
      const JobModel = getJobModel();
      job = await JobModel.findOne({ jobId: id });
    }

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Get profile — fall back to default if none uploaded
    const ProfileModel = getResumeProfileModel();
    let profile = await ProfileModel.findOne({ profileType });

    if (!profile) {
      // Use default profile based on target roles
      profile = {
        profileType,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        preferredRoles: PROFILE_TARGET_ROLES[profileType] || [],
        preferredLocations: [],
        experienceLevel: 'fresher',
      };
    }

    const match = calculateMatch(profile, job);

    // Compare all profiles if available
    let profileComparison = null;
    let allProfiles = await ProfileModel.find({});
    if (allProfiles && typeof allProfiles.lean === 'function') {
      allProfiles = await allProfiles.lean();
    } else if (allProfiles && typeof allProfiles.then === 'function') {
      allProfiles = await allProfiles;
    }
    const profilesArray = Array.isArray(allProfiles) ? allProfiles : [];

    if (profilesArray && profilesArray.length > 1) {
      profileComparison = recommendProfile(profilesArray, job);
    }

    res.json({
      success: true,
      job: { ...job, salary: normalizeSalaryFromJob(job) },
      match,
      profileComparison,
    });
  } catch (error) {
    console.error('Job detail error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/refresh — Force refresh jobs from sources
 */
router.post('/refresh', async (req, res) => {
  try {
    lastFetchTime = 0; // Invalidate cache
    cachedJobs = [];
    res.json({ success: true, message: 'Job cache cleared. Next search will fetch fresh data.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Build search queries based on profile type
 */
function buildSearchQueries(profileType, targetRoles) {
  const queryMap = {
    ai_ml: ['AI Engineer', 'Machine Learning', 'GenAI Developer'],
    software_qa: ['Software Engineer', 'QA Engineer', 'SDET'],
    general: ['Technical Support', 'Business Analyst', 'Application Support'],
  };

  return queryMap[profileType] || targetRoles.slice(0, 3);
}

/**
 * Apply filters to job list
 */
function applyFilters(jobs, filters) {
  return jobs.filter(job => {
    // Location filter
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      if (loc === 'india') {
        if (!job.indiaEligible && job.remote !== 'remote_india' && job.country?.toLowerCase() !== 'india') {
          return false;
        }
      } else if (loc === 'remote') {
        if (!job.remote?.includes('remote')) return false;
      } else if (loc === 'international') {
        if (job.country?.toLowerCase() === 'india' && !job.remote?.includes('remote_worldwide')) return false;
      }
    }

    // Remote filter
    if (filters.remote && filters.remote !== 'any') {
      if (filters.remote === 'remote' && !job.remote?.includes('remote')) return false;
      if (filters.remote === 'onsite' && job.remote !== 'onsite') return false;
      if (filters.remote === 'hybrid' && job.remote !== 'hybrid') return false;
    }

    // Company type filter
    if (filters.companyType && filters.companyType !== 'all') {
      if (job.companyType !== filters.companyType) return false;
    }

    // Experience filter
    if (filters.experienceLevel) {
      const filterExp = parseExperienceFilter(filters.experienceLevel);
      if (filterExp !== null && job.experienceMin !== null && job.experienceMin > filterExp.max) {
        return false;
      }
    }

    // Salary filter
    if (filters.minSalary && job.salaryMax) {
      // Convert if needed (basic: only compare same currency)
      if (filters.salaryCurrency && job.salaryCurrency === filters.salaryCurrency) {
        if (job.salaryMax < filters.minSalary) return false;
      }
    }

    // Employment type filter
    if (filters.employmentType && filters.employmentType !== 'all') {
      if (job.employmentType !== filters.employmentType) return false;
    }

    return true;
  });
}

function parseExperienceFilter(level) {
  const map = {
    'fresher': { min: 0, max: 0 },
    '0-2': { min: 0, max: 2 },
    '1-3': { min: 1, max: 3 },
    '3-5': { min: 3, max: 5 },
    '5+': { min: 5, max: 99 },
  };
  return map[level] || null;
}

async function persistJobs(jobs) {
  const JobModel = getJobModel();
  for (const job of jobs.slice(0, 200)) { // Limit to 200 for free DB tier
    try {
      await JobModel.findOneAndUpdate(
        { deduplicationHash: job.deduplicationHash },
        job,
        { upsert: true, new: true }
      );
    } catch (err) {
      // Skip individual persist errors
    }
  }
}

export default router;
