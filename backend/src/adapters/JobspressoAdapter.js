/**
 * Jobspresso Adapter
 * Public RSS feed — no authentication required.
 * Source: https://jobspresso.co/feed/?post_type=job_listing
 */

const RSS_URL = 'https://jobspresso.co/feed/?post_type=job_listing';

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractAllItems(xml) {
  const items = [];
  const pattern = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = pattern.exec(xml)) !== null) {
    items.push(m[1]);
  }
  return items;
}

export default {
  name: 'jobspresso',
  displayName: 'Jobspresso',
  requiresAuth: false,

  async fetchJobs(query, options = {}) {
    try {
      const response = await fetch(RSS_URL, {
        headers: { 'User-Agent': 'PersonalJobFinder/1.0 (personal project)' },
      });

      if (!response.ok) {
        console.warn(`Jobspresso: HTTP ${response.status}`);
        return [];
      }

      const xml = await response.text();
      const items = extractAllItems(xml);
      const queryLower = (query || '').toLowerCase();

      return items
        .map((item, i) => {
          const title = extractTag(item, 'title');
          const link = extractTag(item, 'link');
          const description = extractTag(item, 'description').replace(/<[^>]+>/g, ' ').substring(0, 5000);
          const pubDate = extractTag(item, 'pubDate');
          const categories = [];
          const catPattern = /<category[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/gi;
          let cm;
          while ((cm = catPattern.exec(item)) !== null) {
            categories.push(cm[1].trim());
          }

          return {
            sourceId: `jobspresso-${i}-${title.substring(0, 30).replace(/\s+/g, '-')}`,
            source: 'jobspresso',
            title: title,
            company: '',
            description,
            location: 'Remote',
            remote: 'remote_worldwide',
            applicationUrl: link,
            skills: categories.filter(c => !['Jobs', 'Remote Jobs'].includes(c)),
            postedDate: pubDate ? new Date(pubDate) : new Date(),
            employmentType: 'full-time',
            _searchText: `${title} ${description} ${categories.join(' ')}`.toLowerCase(),
          };
        })
        .filter(job => {
          if (!queryLower) return true;
          return job._searchText.includes(queryLower);
        })
        .map(({ _searchText, ...job }) => job)
        .slice(0, 40);
    } catch (error) {
      console.error('Jobspresso adapter error:', error.message);
      return [];
    }
  },
};
