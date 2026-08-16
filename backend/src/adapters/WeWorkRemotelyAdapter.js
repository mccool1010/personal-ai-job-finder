/**
 * WeWorkRemotely Adapter
 * Public RSS feed — no authentication required.
 * Source: https://weworkremotely.com/remote-jobs.rss
 * Attribution required.
 */

const RSS_URL = 'https://weworkremotely.com/remote-jobs.rss';

// Simple XML tag extractor (avoids adding xml2js dep)
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
  name: 'weworkremotely',
  displayName: 'WeWorkRemotely',
  requiresAuth: false,

  async fetchJobs(query, options = {}) {
    try {
      const response = await fetch(RSS_URL, {
        headers: { 'User-Agent': 'PersonalJobFinder/1.0 (personal project)' },
      });

      if (!response.ok) {
        console.warn(`WeWorkRemotely: HTTP ${response.status}`);
        return [];
      }

      const xml = await response.text();
      const items = extractAllItems(xml);

      // Filter by query keyword
      const queryLower = (query || '').toLowerCase();

      return items
        .map((item, i) => {
          const title = extractTag(item, 'title');
          const link = extractTag(item, 'link');
          const description = extractTag(item, 'description').replace(/<[^>]+>/g, ' ').substring(0, 5000);
          const pubDate = extractTag(item, 'pubDate');
          const category = extractTag(item, 'category');

          // Extract company from title (usually "Company: Job Title")
          const titleParts = title.split(':');
          const company = titleParts.length > 1 ? titleParts[0].trim() : '';
          const jobTitle = titleParts.length > 1 ? titleParts.slice(1).join(':').trim() : title;

          return {
            sourceId: `wwr-${i}-${jobTitle.substring(0, 30).replace(/\s+/g, '-')}`,
            source: 'weworkremotely',
            title: jobTitle,
            company,
            description,
            location: 'Remote',
            remote: 'remote_worldwide',
            applicationUrl: link,
            skills: [],
            postedDate: pubDate ? new Date(pubDate) : new Date(),
            employmentType: 'full-time',
            category: category || '',
            _searchText: `${title} ${description} ${category}`.toLowerCase(),
          };
        })
        .filter(job => {
          if (!queryLower) return true;
          return job._searchText.includes(queryLower);
        })
        .map(({ _searchText, ...job }) => job)
        .slice(0, 50);
    } catch (error) {
      console.error('WeWorkRemotely adapter error:', error.message);
      return [];
    }
  },
};
