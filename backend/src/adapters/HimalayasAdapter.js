/**
 * Himalayas Adapter
 * Public JSON API — no authentication required.
 * Source: https://himalayas.app/jobs/api
 * Attribution: Must link back to Himalayas job URLs.
 */

const API_URL = 'https://himalayas.app/jobs/api';

export default {
  name: 'himalayas',
  displayName: 'Himalayas',
  requiresAuth: false,

  async fetchJobs(query, options = {}) {
    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: '0',
      });

      if (query) params.set('q', query);

      const response = await fetch(`${API_URL}?${params}`, {
        headers: { 'User-Agent': 'PersonalJobFinder/1.0 (personal project)' },
      });

      if (!response.ok) {
        console.warn(`Himalayas: HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();
      const jobs = data.jobs || [];

      return jobs.map(job => ({
        sourceId: `himalayas-${job.id || job.slug}`,
        source: 'himalayas',
        title: job.title || '',
        company: job.companyName || job.company_name || '',
        description: (job.description || '').replace(/<[^>]+>/g, ' ').substring(0, 5000),
        location: job.locationRestrictions?.join(', ') || 'Remote',
        remote: categorizeRemote(job),
        applicationUrl: job.applicationLink || job.url || `https://himalayas.app/jobs/${job.slug}`,
        skills: Array.isArray(job.skills) ? job.skills : extractTags(job.categories),
        postedDate: job.pubDate ? new Date(job.pubDate) : new Date(),
        salaryMin: job.minSalary || null,
        salaryMax: job.maxSalary || null,
        salaryCurrency: job.salaryCurrency || 'USD',
        employmentType: mapEmploymentType(job.employmentType),
        companyLogo: job.companyLogo || null,
        seniorityLevel: job.seniority || null,
      }));
    } catch (error) {
      console.error('Himalayas adapter error:', error.message);
      return [];
    }
  },
};

function categorizeRemote(job) {
  const restrictions = job.locationRestrictions || [];
  if (restrictions.length === 0) return 'remote_worldwide';
  const text = restrictions.join(' ').toLowerCase();
  if (text.includes('india')) return 'remote_india';
  if (text.includes('us') || text.includes('united states')) return 'remote_us_only';
  if (text.includes('europe') || text.includes('eu')) return 'remote_eu_only';
  return 'remote_region';
}

function extractTags(categories) {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  if (typeof categories === 'string') return categories.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function mapEmploymentType(type) {
  if (!type) return 'full-time';
  const t = type.toLowerCase();
  if (t.includes('full')) return 'full-time';
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract') || t.includes('freelance')) return 'contract';
  if (t.includes('intern')) return 'internship';
  return 'full-time';
}
