/**
 * RemoteOK Adapter
 * Public JSON API — no authentication required.
 * Source: https://remoteok.com/api
 */

const API_URL = 'https://remoteok.com/api';

export default {
  name: 'remoteok',
  displayName: 'RemoteOK',
  requiresAuth: false,

  async fetchJobs(query, options = {}) {
    try {
      const url = `${API_URL}?tag=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PersonalJobFinder/1.0 (personal project)',
        },
      });

      if (!response.ok) {
        console.warn(`RemoteOK: HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();

      // First item is metadata, skip it
      const jobs = Array.isArray(data) ? data.slice(1) : [];

      return jobs.slice(0, 50).map(job => ({
        sourceId: `remoteok-${job.id || job.slug}`,
        source: 'remoteok',
        title: job.position || job.title || '',
        company: job.company || '',
        description: (job.description || '').replace(/<[^>]+>/g, ' ').substring(0, 5000),
        location: job.location || 'Remote',
        remote: 'remote_worldwide',
        applicationUrl: job.url || job.apply_url || `https://remoteok.com/remote-jobs/${job.slug}`,
        skills: Array.isArray(job.tags) ? job.tags : [],
        postedDate: job.date ? new Date(job.date) : new Date(),
        salaryMin: job.salary_min ? parseInt(job.salary_min) : null,
        salaryMax: job.salary_max ? parseInt(job.salary_max) : null,
        salaryCurrency: 'USD',
        employmentType: 'full-time',
        companyLogo: job.company_logo || null,
      }));
    } catch (error) {
      console.error('RemoteOK adapter error:', error.message);
      return [];
    }
  },
};
