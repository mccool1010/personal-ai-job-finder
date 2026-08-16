/**
 * 4DayWeek Adapter
 * Public JSON API — no authentication required.
 * Source: https://4dayweek.io/api/v2/jobs
 * Rate limit: 60 req/min, cached 60s. Attribution required.
 */

const API_URL = 'https://4dayweek.io/api/v2/jobs';

export default {
  name: '4dayweek',
  displayName: '4 Day Week',
  requiresAuth: false,

  async fetchJobs(query, options = {}) {
    try {
      const params = new URLSearchParams({ limit: '25' });

      if (query) params.set('q', query);

      const response = await fetch(`${API_URL}?${params}`, {
        headers: { 'User-Agent': 'PersonalJobFinder/1.0 (personal project)' },
      });

      if (!response.ok) {
        console.warn(`4DayWeek: HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();
      const jobs = data.results || data.jobs || data.data || [];

      if (!Array.isArray(jobs)) return [];

      return jobs.map(job => ({
        sourceId: `4dw-${job.id || job.slug}`,
        source: '4dayweek',
        title: job.title || job.name || '',
        company: job.company?.name || job.company_name || job.company || '',
        description: (job.description || '').replace(/<[^>]+>/g, ' ').substring(0, 5000),
        location: job.location || job.country || 'Remote',
        remote: job.work_arrangement === 'remote' ? 'remote_worldwide' : (job.work_arrangement === 'hybrid' ? 'hybrid' : 'onsite'),
        applicationUrl: job.apply_url || job.url || `https://4dayweek.io/job/${job.slug}`,
        skills: Array.isArray(job.skills) ? job.skills.map(s => s.name || s) : [],
        postedDate: job.published_at ? new Date(job.published_at) : new Date(),
        // Salary in cents
        salaryMin: job.salary_min ? Math.round(job.salary_min / 100) : null,
        salaryMax: job.salary_max ? Math.round(job.salary_max / 100) : null,
        salaryCurrency: job.salary_currency || 'USD',
        employmentType: 'full-time',
        seniorityLevel: job.seniority || null,
      }));
    } catch (error) {
      console.error('4DayWeek adapter error:', error.message);
      return [];
    }
  },
};
