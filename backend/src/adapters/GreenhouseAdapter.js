/**
 * Greenhouse ATS Adapter
 * Public board API — no authentication required for reading.
 * Source: https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs
 * 
 * Fetches jobs from a curated list of companies that use Greenhouse.
 * Each company's board_token is typically visible on their careers page.
 */

const BASE_URL = 'https://boards-api.greenhouse.io/v1/boards';

// Curated list of companies using Greenhouse (tech-focused)
const COMPANY_BOARDS = [
  { token: 'airbnb', name: 'Airbnb' },
  { token: 'cloudflare', name: 'Cloudflare' },
  { token: 'figma', name: 'Figma' },
  { token: 'notion', name: 'Notion' },
  { token: 'stripe', name: 'Stripe' },
  { token: 'twitch', name: 'Twitch' },
  { token: 'pinterest', name: 'Pinterest' },
  { token: 'lyft', name: 'Lyft' },
  { token: 'discord', name: 'Discord' },
  { token: 'coinbase', name: 'Coinbase' },
  { token: 'doordash', name: 'DoorDash' },
  { token: 'gitlab', name: 'GitLab' },
  { token: 'hashicorp', name: 'HashiCorp' },
  { token: 'airtable', name: 'Airtable' },
  { token: 'plaid', name: 'Plaid' },
  { token: 'brex', name: 'Brex' },
  { token: 'databricks', name: 'Databricks' },
  { token: 'flexport', name: 'Flexport' },
  { token: 'postman', name: 'Postman' },
  { token: 'razorpay', name: 'Razorpay' },
];

export default {
  name: 'greenhouse',
  displayName: 'Greenhouse ATS',
  requiresAuth: false,

  async fetchJobs(query, options = {}) {
    const queryLower = (query || '').toLowerCase();
    const allJobs = [];

    // Fetch from a subset of companies to stay within rate limits
    const companies = COMPANY_BOARDS.slice(0, 8); // Max 8 companies per search

    const promises = companies.map(async (company) => {
      try {
        const url = `${BASE_URL}/${company.token}/jobs?content=true`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'PersonalJobFinder/1.0 (personal project)' },
        });

        if (!response.ok) return [];

        const data = await response.json();
        const jobs = data.jobs || [];

        return jobs
          .filter(job => {
            const text = `${job.title} ${job.content || ''}`.toLowerCase();
            return !queryLower || text.includes(queryLower);
          })
          .slice(0, 5) // Max 5 per company
          .map(job => ({
            sourceId: `greenhouse-${company.token}-${job.id}`,
            source: 'greenhouse',
            title: job.title || '',
            company: company.name,
            description: (job.content || '').replace(/<[^>]+>/g, ' ').substring(0, 5000),
            location: job.location?.name || '',
            remote: detectRemote(job),
            applicationUrl: job.absolute_url || `https://boards.greenhouse.io/${company.token}/jobs/${job.id}`,
            skills: [],
            postedDate: job.updated_at ? new Date(job.updated_at) : new Date(),
            employmentType: 'full-time',
            departments: (job.departments || []).map(d => d.name),
          }));
      } catch (error) {
        console.warn(`Greenhouse/${company.token} error:`, error.message);
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
  const loc = (job.location?.name || '').toLowerCase();
  if (loc.includes('remote')) {
    if (loc.includes('india')) return 'remote_india';
    if (loc.includes('us') || loc.includes('united states')) return 'remote_us_only';
    return 'remote_worldwide';
  }
  return 'onsite';
}
