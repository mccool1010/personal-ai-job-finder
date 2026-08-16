/**
 * Adzuna Job Source Adapter
 * API docs: https://developer.adzuna.com
 * Free tier: ~1000 calls/month
 * Supports India (country code: 'in')
 */

import config from '../config/index.js';

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

// Country codes supported by Adzuna
const COUNTRY_CODES = {
  india: 'in',
  uk: 'gb',
  us: 'us',
  germany: 'de',
  france: 'fr',
  canada: 'ca',
  australia: 'au',
};

export class AdzunaAdapter {
  constructor() {
    this.sourceName = 'Adzuna';
    this.cache = new Map();
    this.cacheTTL = config.jobCacheTTL;
  }

  get isAvailable() {
    return config.hasAdzuna;
  }

  /**
   * Fetch jobs from Adzuna API
   * @param {string} query - Search keywords
   * @param {object} options - { country, location, page, resultsPerPage }
   */
  async fetchJobs(query, options = {}) {
    if (!this.isAvailable) {
      console.log('⚠️  Adzuna adapter skipped (no API key)');
      return [];
    }

    const {
      country = 'india',
      location = '',
      page = 1,
      resultsPerPage = 50,
    } = options;

    const countryCode = COUNTRY_CODES[country.toLowerCase()] || 'in';
    const cacheKey = `${countryCode}:${query}:${location}:${page}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        app_id: config.adzunaAppId,
        app_key: config.adzunaAppKey,
        what: query,
        results_per_page: String(resultsPerPage),
        'content-type': 'application/json',
      });

      if (location) {
        params.set('where', location);
      }

      const url = `${BASE_URL}/${countryCode}/search/${page}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Adzuna API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const jobs = (data.results || []).map(job => this._normalize(job, countryCode));

      // Cache results
      this.cache.set(cacheKey, { data: jobs, timestamp: Date.now() });

      return jobs;
    } catch (error) {
      console.error('Adzuna fetch error:', error.message);
      return [];
    }
  }

  _normalize(raw, countryCode) {
    return {
      title: raw.title || '',
      company: raw.company?.display_name || 'Unknown',
      description: this._stripHtml(raw.description || ''),
      location: raw.location?.display_name || '',
      country: countryCode === 'in' ? 'India' : countryCode.toUpperCase(),
      remote: 'unknown', // Will be classified later
      employmentType: this._parseEmploymentType(raw.contract_type || raw.contract_time),
      experienceMin: null,
      experienceMax: null,
      salaryMin: raw.salary_min || null,
      salaryMax: raw.salary_max || null,
      salaryCurrency: countryCode === 'in' ? 'INR' : countryCode === 'us' ? 'USD' : countryCode === 'gb' ? 'GBP' : 'EUR',
      skills: [],
      postedDate: raw.created ? new Date(raw.created) : new Date(),
      source: this.sourceName,
      sourceUrl: raw.redirect_url || '',
      applicationUrl: raw.redirect_url || '',
      rawData: raw,
    };
  }

  _parseEmploymentType(contractType) {
    if (!contractType) return 'unknown';
    const ct = contractType.toLowerCase();
    if (ct.includes('full')) return 'full-time';
    if (ct.includes('part')) return 'part-time';
    if (ct.includes('contract') || ct.includes('temp')) return 'contract';
    if (ct.includes('intern')) return 'internship';
    return 'unknown';
  }

  _stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
