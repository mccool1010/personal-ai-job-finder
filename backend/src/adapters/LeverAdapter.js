/**
 * Lever ATS Adapter
 * Public postings API — no authentication required for reading.
 * Source: https://api.lever.co/v0/postings/{company_slug}?mode=json
 *
 * Fetches from curated companies that use Lever for hiring.
 */

const BASE_URL = 'https://api.lever.co/v0/postings';

// Curated list of companies using Lever
const COMPANY_SLUGS = [
  { slug: 'netflix', name: 'Netflix' },
  { slug: 'twilio', name: 'Twilio' },
  { slug: 'atlassian', name: 'Atlassian' },
  { slug: 'lever', name: 'Lever' },
  { slug: 'netlify', name: 'Netlify' },
  { slug: 'vercel', name: 'Vercel' },
  { slug: 'supabase', name: 'Supabase' },
  { slug: 'upstash', name: 'Upstash' },
  { slug: 'linear', name: 'Linear' },
  { slug: 'loom', name: 'Loom' },
  { slug: 'retool', name: 'Retool' },
  { slug: 'anduril', name: 'Anduril' },
  { slug: 'navan', name: 'Navan' },
  { slug: 'ramp', name: 'Ramp' },
  { slug: 'webflow', name: 'Webflow' },
];

export default {
  name: 'lever',
  displayName: 'Lever ATS',
  requiresAuth: false,

  async fetchJobs(query, options = {}) {
    const queryLower = (query || '').toLowerCase();
    const allJobs = [];

    // Limit to 6 companies per search to stay fast
    const companies = COMPANY_SLUGS.slice(0, 6);

    const promises = companies.map(async (company) => {
      try {
        const url = `${BASE_URL}/${company.slug}?mode=json`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'PersonalJobFinder/1.0 (personal project)' },
        });

        if (!response.ok) return [];

        const jobs = await response.json();
        if (!Array.isArray(jobs)) return [];

        return jobs
          .filter(job => {
            const text = `${job.text} ${job.descriptionPlain || job.description || ''} ${(job.categories?.team || '')}`.toLowerCase();
            return !queryLower || text.includes(queryLower);
          })
          .slice(0, 5) // Max 5 per company
          .map(job => ({
            sourceId: `lever-${company.slug}-${job.id}`,
            source: 'lever',
            title: job.text || '',
            company: company.name,
            description: (job.descriptionPlain || job.description || '').replace(/<[^>]+>/g, ' ').substring(0, 5000),
            location: job.categories?.location || '',
            remote: detectRemote(job),
            applicationUrl: job.applyUrl || job.hostedUrl || `https://jobs.lever.co/${company.slug}/${job.id}`,
            skills: [],
            postedDate: job.createdAt ? new Date(job.createdAt) : new Date(),
            employmentType: mapCommitment(job.categories?.commitment),
            team: job.categories?.team || '',
          }));
      } catch (error) {
        console.warn(`Lever/${company.slug} error:`, error.message);
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      }
    }

    return allJobs.slice(0, 50);
  },
};

function detectRemote(job) {
  const loc = (job.categories?.location || '').toLowerCase();
  const commitment = (job.categories?.commitment || '').toLowerCase();
  if (loc.includes('remote')) {
    if (loc.includes('india')) return 'remote_india';
    if (loc.includes('us') || loc.includes('usa')) return 'remote_us_only';
    return 'remote_worldwide';
  }
  return 'onsite';
}

function mapCommitment(commitment) {
  if (!commitment) return 'full-time';
  const c = commitment.toLowerCase();
  if (c.includes('full')) return 'full-time';
  if (c.includes('part')) return 'part-time';
  if (c.includes('contract') || c.includes('freelance')) return 'contract';
  if (c.includes('intern')) return 'internship';
  return 'full-time';
}
