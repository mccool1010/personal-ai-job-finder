/**
 * Arbeitnow Job Source Adapter
 * Free, no API key needed.
 * Good for EU + international remote jobs.
 * Has visa_sponsorship and remote fields.
 */

const BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

export class ArbeitnowAdapter {
  constructor() {
    this.sourceName = 'Arbeitnow';
    this.cache = new Map();
    this.cacheTTL = 6 * 60 * 60 * 1000; // 6 hours
  }

  get isAvailable() {
    return true; // No API key needed
  }

  /**
   * Fetch jobs from Arbeitnow
   * @param {string} query - Search keywords (filtered locally since API has limited search)
   * @param {object} options - { page }
   */
  async fetchJobs(query, options = {}) {
    const { page = 1 } = options;
    const cacheKey = `page:${page}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return this._filterByQuery(cached.data, query);
    }

    try {
      const url = `${BASE_URL}?page=${page}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Arbeitnow API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const allJobs = (data.data || []).map(job => this._normalize(job));

      // Cache all jobs, filter locally
      this.cache.set(cacheKey, { data: allJobs, timestamp: Date.now() });

      return this._filterByQuery(allJobs, query);
    } catch (error) {
      console.error('Arbeitnow fetch error:', error.message);
      return [];
    }
  }

  _normalize(raw) {
    return {
      title: raw.title || '',
      company: raw.company_name || 'Unknown',
      description: this._stripHtml(raw.description || ''),
      location: raw.location || '',
      country: this._detectCountry(raw.location || ''),
      remote: raw.remote ? 'remote_worldwide' : 'onsite',
      employmentType: 'full-time', // Arbeitnow mostly lists full-time
      experienceMin: null,
      experienceMax: null,
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      skills: this._extractTags(raw.tags || []),
      postedDate: raw.created_at ? new Date(raw.created_at * 1000) : new Date(),
      source: this.sourceName,
      sourceUrl: raw.url || '',
      applicationUrl: raw.url || '',
      visaSponsorship: raw.visa_sponsorship || false,
      rawData: raw,
    };
  }

  _filterByQuery(jobs, query) {
    if (!query) return jobs;
    const terms = query.toLowerCase().split(/\s+/);
    return jobs.filter(job => {
      const searchText = `${job.title} ${job.company} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
      return terms.some(term => searchText.includes(term));
    });
  }

  _detectCountry(location) {
    if (!location) return 'Unknown';
    const loc = location.toLowerCase();
    if (loc.includes('india')) return 'India';
    if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich')) return 'Germany';
    if (loc.includes('uk') || loc.includes('london') || loc.includes('united kingdom')) return 'UK';
    if (loc.includes('usa') || loc.includes('united states')) return 'US';
    if (loc.includes('france') || loc.includes('paris')) return 'France';
    if (loc.includes('remote')) return 'Remote';
    return 'International';
  }

  _extractTags(tags) {
    return tags.map(t => typeof t === 'string' ? t.toLowerCase().trim() : '').filter(Boolean);
  }

  _stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
