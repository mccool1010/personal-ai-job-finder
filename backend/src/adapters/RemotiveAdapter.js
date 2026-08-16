/**
 * Remotive Job Source Adapter
 * API docs: https://github.com/remotiveio/remotive-api
 * Free, no API key needed.
 * Rate limit: max 4 requests/day, max 2/minute.
 * Attribution required: link back to Remotive.
 */

const BASE_URL = 'https://remotive.com/api/remote-jobs';

// Remotive category slugs
const CATEGORY_MAP = {
  ai_ml: 'data',
  software_qa: 'software-dev',
  general: 'all-others',
};

export class RemotiveAdapter {
  constructor() {
    this.sourceName = 'Remotive';
    this.cache = new Map();
    this.cacheTTL = 6 * 60 * 60 * 1000; // 6 hours (only 4 requests/day allowed)
    this.lastRequestTime = 0;
    this.minRequestInterval = 30 * 1000; // 30 seconds between requests
  }

  get isAvailable() {
    return true; // Always available, no API key needed
  }

  /**
   * Fetch remote jobs from Remotive
   * @param {string} query - Search keywords
   * @param {object} options - { profileType, limit }
   */
  async fetchJobs(query, options = {}) {
    const { profileType = 'ai_ml', limit = 100 } = options;

    const category = CATEGORY_MAP[profileType] || 'software-dev';
    const cacheKey = `${category}:${query}:${limit}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    // Rate limit check
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const cached2 = this.cache.get(cacheKey);
      if (cached2) return cached2.data;
      console.log('⚠️  Remotive rate limit — using cached data');
      return [];
    }

    try {
      const params = new URLSearchParams({
        category,
        limit: String(limit),
      });
      if (query) {
        params.set('search', query);
      }

      const url = `${BASE_URL}?${params.toString()}`;
      this.lastRequestTime = Date.now();

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Remotive API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const jobs = (data.jobs || []).map(job => this._normalize(job));

      // Cache results
      this.cache.set(cacheKey, { data: jobs, timestamp: Date.now() });

      return jobs;
    } catch (error) {
      console.error('Remotive fetch error:', error.message);
      return [];
    }
  }

  _normalize(raw) {
    const salary = this._parseSalary(raw.salary || '');

    return {
      title: raw.title || '',
      company: raw.company_name || 'Unknown',
      description: this._stripHtml(raw.description || ''),
      location: raw.candidate_required_location || 'Remote',
      country: this._detectCountry(raw.candidate_required_location || ''),
      remote: 'remote_worldwide', // Will be refined by classifier
      employmentType: this._parseJobType(raw.job_type),
      experienceMin: null,
      experienceMax: null,
      salaryMin: salary.min,
      salaryMax: salary.max,
      salaryCurrency: salary.currency,
      skills: this._extractTags(raw.tags || []),
      postedDate: raw.publication_date ? new Date(raw.publication_date) : new Date(),
      source: this.sourceName,
      sourceUrl: raw.url || '',
      applicationUrl: raw.url || '',
      rawData: raw,
    };
  }

  _parseJobType(jobType) {
    if (!jobType) return 'unknown';
    const jt = jobType.toLowerCase();
    if (jt.includes('full')) return 'full-time';
    if (jt.includes('part')) return 'part-time';
    if (jt.includes('contract') || jt.includes('freelance')) return 'contract';
    if (jt.includes('intern')) return 'internship';
    return 'unknown';
  }

  _parseSalary(salaryStr) {
    if (!salaryStr) return { min: null, max: null, currency: null };

    // Try to extract numbers
    const numbers = salaryStr.match(/[\d,]+/g);
    if (!numbers) return { min: null, max: null, currency: null };

    const values = numbers.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
    const currency = salaryStr.includes('$') ? 'USD' : salaryStr.includes('€') ? 'EUR' : salaryStr.includes('£') ? 'GBP' : 'USD';

    return {
      min: values[0] || null,
      max: values[1] || values[0] || null,
      currency,
    };
  }

  _detectCountry(location) {
    if (!location) return 'Unknown';
    const loc = location.toLowerCase();
    if (loc.includes('worldwide') || loc.includes('anywhere')) return 'Worldwide';
    if (loc.includes('usa') || loc.includes('united states') || loc.includes('us only')) return 'US';
    if (loc.includes('europe') || loc.includes('eu')) return 'EU';
    if (loc.includes('india')) return 'India';
    if (loc.includes('uk') || loc.includes('united kingdom')) return 'UK';
    if (loc.includes('canada')) return 'Canada';
    return location;
  }

  _extractTags(tags) {
    return tags.map(t => t.toLowerCase().trim()).filter(Boolean);
  }

  _stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
