/**
 * External Job Sources Directory
 * 
 * Curated list of ALL job sites organized by category.
 * Sites without public APIs are listed here as direct links.
 * Sites WITH adapters are marked with `hasAdapter: true`.
 */

export const EXTERNAL_SOURCES = [
  // ─── 🇮🇳 India — General ──────────────────────────
  {
    category: '🇮🇳 India — General',
    sites: [
      { name: 'Naukri', url: 'https://www.naukri.com/', description: 'India\'s #1 job portal', region: 'india' },
      { name: 'Indeed India', url: 'https://in.indeed.com/', description: 'India job search engine', region: 'india' },
      { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/', description: 'Professional network jobs', region: 'global' },
      { name: 'Foundit (Monster India)', url: 'https://www.foundit.in/', description: 'Formerly Monster India', region: 'india' },
      { name: 'Shine', url: 'https://www.shine.com/', description: 'HT Media job portal', region: 'india' },
      { name: 'TimesJobs', url: 'https://www.timesjobs.com/', description: 'Times Group job board', region: 'india' },
      { name: 'Apna', url: 'https://apna.co/', description: 'India jobs & professional network', region: 'india' },
      { name: 'Internshala', url: 'https://internshala.com/', description: 'Internships & fresher jobs', region: 'india' },
      { name: 'FreshersWorld', url: 'https://www.freshersworld.com/', description: 'Jobs for freshers', region: 'india' },
      { name: 'Quikr Jobs', url: 'https://www.quikr.com/jobs', description: 'Classifieds-based job listings', region: 'india' },
    ],
  },

  // ─── 🚀 India — Startups / Tech ───────────────────
  {
    category: '🚀 India — Startups / Tech',
    sites: [
      { name: 'CutShort', url: 'https://cutshort.io/', description: 'AI-powered startup hiring', region: 'india' },
      { name: 'Wellfound (AngelList)', url: 'https://wellfound.com/', description: 'Startup jobs worldwide', region: 'global' },
      { name: 'Hirist', url: 'https://www.hirist.tech/', description: 'Premium tech jobs India', region: 'india' },
      { name: 'Instahyre', url: 'https://www.instahyre.com/', description: 'AI-matched tech hiring', region: 'india' },
      { name: 'Work at a Startup (YC)', url: 'https://www.workatastartup.com/', description: 'Y Combinator startup jobs', region: 'global' },
      { name: 'YC Jobs', url: 'https://www.ycombinator.com/jobs', description: 'YC company job board', region: 'global' },
      { name: 'VentureLoop', url: 'https://www.ventureloop.com/', description: 'VC-backed startup jobs', region: 'global' },
      { name: 'Startup.jobs', url: 'https://startup.jobs/', description: 'Global startup job board', region: 'global' },
    ],
  },

  // ─── 🤖 AI / ML / Data ────────────────────────────
  {
    category: '🤖 AI / ML / Data',
    sites: [
      { name: 'AI Jobs', url: 'https://aijobs.net/', description: 'AI-specific job board', region: 'global' },
      { name: 'AI-Jobs.net', url: 'https://ai-jobs.net/', description: 'AI & ML positions', region: 'global' },
      { name: 'ML-Jobs', url: 'https://www.ml-jobs.com/', description: 'Machine learning focused', region: 'global' },
      { name: 'DataJobs', url: 'https://datajobs.com/', description: 'Data science & analytics', region: 'global' },
      { name: 'DataScienceJobs', url: 'https://www.datasciencejobs.com/', description: 'Data science positions', region: 'global' },
      { name: 'KDnuggets Jobs', url: 'https://www.kdnuggets.com/jobs', description: 'ML/DS community board', region: 'global' },
      { name: 'AI Career Hub', url: 'https://aicareerhub.com/', description: 'AI career listings', region: 'global' },
      { name: 'Built In', url: 'https://builtin.com/jobs', description: 'Tech startup jobs + salaries', region: 'global' },
      { name: 'Welcome to the Jungle', url: 'https://www.welcometothejungle.com/', description: 'EU tech jobs with culture profiles', region: 'global' },
    ],
  },

  // ─── 🌎 International Remote ──────────────────────
  {
    category: '🌎 International Remote',
    sites: [
      { name: 'WeWorkRemotely', url: 'https://weworkremotely.com/', description: 'Largest remote work community', region: 'remote', hasAdapter: true },
      { name: 'RemoteOK', url: 'https://remoteok.com/', description: 'Remote jobs with salary data', region: 'remote', hasAdapter: true },
      { name: 'Himalayas', url: 'https://himalayas.app/', description: 'Remote jobs + company profiles', region: 'remote', hasAdapter: true },
      { name: 'Remotive', url: 'https://remotive.com/', description: 'Curated remote jobs', region: 'remote', hasAdapter: true },
      { name: 'Remote.co', url: 'https://remote.co/', description: 'Remote job listings', region: 'remote' },
      { name: 'Working Nomads', url: 'https://www.workingnomads.com/', description: 'Digital nomad jobs', region: 'remote' },
      { name: 'Nodesk', url: 'https://nodesk.co/remote-jobs/', description: 'Remote work resources', region: 'remote' },
      { name: 'Jobspresso', url: 'https://jobspresso.co/', description: 'Curated remote positions', region: 'remote', hasAdapter: true },
      { name: 'Dynamite Jobs', url: 'https://dynamitejobs.com/', description: 'Remote-first companies', region: 'remote' },
      { name: 'Jobgether', url: 'https://jobgether.com/', description: 'Flexible & remote roles', region: 'remote' },
      { name: 'Pangian', url: 'https://pangian.com/', description: 'Remote work community', region: 'remote' },
      { name: 'Remote Finder', url: 'https://remotefinder.io/', description: 'Remote job search engine', region: 'remote' },
      { name: 'Remote4Me', url: 'https://remote4me.com/', description: 'Remote job aggregator', region: 'remote' },
      { name: '4 Day Week', url: 'https://4dayweek.io/', description: 'Jobs with 4-day work weeks', region: 'remote', hasAdapter: true },
      { name: 'Europe Remotely', url: 'https://europeremotely.com/', description: 'EU-timezone remote jobs', region: 'remote' },
      { name: 'Get on Board', url: 'https://www.getonbrd.com/', description: 'LATAM & global tech jobs', region: 'global' },
    ],
  },

  // ─── 🌍 International Startups ────────────────────
  {
    category: '🌍 International Startups',
    sites: [
      { name: 'Otta', url: 'https://otta.com/', description: 'UK/EU startup matching', region: 'global' },
      { name: 'EU-Startups Jobs', url: 'https://www.eu-startups.com/', description: 'European startup scene', region: 'global' },
    ],
  },

  // ─── 🏢 MNC / Company Career Pages ───────────────
  {
    category: '🏢 MNC Career Pages',
    sites: [
      { name: 'Microsoft Careers', url: 'https://jobs.careers.microsoft.com/', description: 'Microsoft global jobs', region: 'global' },
      { name: 'Google Careers', url: 'https://www.google.com/about/careers/applications/', description: 'Alphabet/Google jobs', region: 'global' },
      { name: 'Amazon Jobs', url: 'https://www.amazon.jobs/', description: 'Amazon worldwide', region: 'global' },
      { name: 'IBM Careers', url: 'https://www.ibm.com/careers/', description: 'IBM global positions', region: 'global' },
      { name: 'Oracle Careers', url: 'https://www.oracle.com/careers/', description: 'Oracle worldwide', region: 'global' },
      { name: 'SAP Careers', url: 'https://www.sap.com/about/careers.html', description: 'SAP global jobs', region: 'global' },
      { name: 'Cisco Jobs', url: 'https://jobs.cisco.com/', description: 'Cisco networking & tech', region: 'global' },
      { name: 'Adobe Careers', url: 'https://careers.adobe.com/', description: 'Adobe creative & tech', region: 'global' },
      { name: 'NVIDIA Careers', url: 'https://www.nvidia.com/en-us/about-nvidia/careers/', description: 'NVIDIA AI/GPU jobs', region: 'global' },
      { name: 'Intel Jobs', url: 'https://jobs.intel.com/', description: 'Intel semiconductor', region: 'global' },
      { name: 'Dell Careers', url: 'https://jobs.dell.com/', description: 'Dell Technologies', region: 'global' },
      { name: 'Qualcomm Careers', url: 'https://www.qualcomm.com/company/careers', description: 'Qualcomm chipset', region: 'global' },
      { name: 'Accenture Careers', url: 'https://www.accenture.com/in-en/careers', description: 'Accenture India', region: 'india' },
      { name: 'Deloitte Jobs', url: 'https://jobs.deloitte.com/', description: 'Deloitte consulting', region: 'global' },
      { name: 'EY Careers', url: 'https://www.ey.com/en_gl/careers', description: 'Ernst & Young', region: 'global' },
      { name: 'PwC Careers', url: 'https://www.pwc.com/gx/en/careers.html', description: 'PricewaterhouseCoopers', region: 'global' },
      { name: 'KPMG Careers', url: 'https://kpmg.com/xx/en/home/careers.html', description: 'KPMG global', region: 'global' },
    ],
  },

  // ─── 🧪 QA / Software ─────────────────────────────
  {
    category: '🧪 QA / Software Testing',
    sites: [
      { name: 'SDET Jobs', url: 'https://sdetjobs.com/', description: 'SDET-specific positions', region: 'global' },
      { name: 'Testing Jobs', url: 'https://www.testingjobs.com/', description: 'QA & testing roles', region: 'global' },
      { name: 'Dice', url: 'https://www.dice.com/', description: 'US tech job board', region: 'global' },
      { name: 'Hired', url: 'https://hired.com/', description: 'Salary-transparent tech hiring', region: 'global' },
      { name: 'Arc.dev', url: 'https://arc.dev/', description: 'Remote developer jobs', region: 'remote' },
    ],
  },

  // ─── 🧑‍💼 General / Non-Technical ───────────────────
  {
    category: '🧑‍💼 General / Non-Technical',
    sites: [
      { name: 'Indeed', url: 'https://www.indeed.com/', description: 'World\'s largest job search engine', region: 'global' },
      { name: 'Glassdoor India', url: 'https://www.glassdoor.co.in/Job/index.htm', description: 'Jobs + company reviews', region: 'india' },
      { name: 'Monster', url: 'https://www.monster.com/', description: 'Global job board', region: 'global' },
      { name: 'ZipRecruiter', url: 'https://www.ziprecruiter.com/', description: 'AI-powered job matching', region: 'global' },
    ],
  },

  // ─── 💰 Freelance / Contract ──────────────────────
  {
    category: '💰 Freelance / Contract',
    sites: [
      { name: 'Turing', url: 'https://www.turing.com/', description: 'Remote developer jobs at US companies', region: 'remote' },
      { name: 'Upwork', url: 'https://www.upwork.com/', description: 'Freelance marketplace', region: 'global' },
      { name: 'Freelancer', url: 'https://www.freelancer.com/', description: 'Freelance projects', region: 'global' },
      { name: 'Fiverr', url: 'https://www.fiverr.com/', description: 'Service marketplace', region: 'global' },
      { name: 'Toptal', url: 'https://www.toptal.com/', description: 'Top 3% freelancers', region: 'global' },
    ],
  },

  // ─── ⚙️ ATS Platforms ─────────────────────────────
  {
    category: '⚙️ ATS Platforms (Company Career Pages)',
    sites: [
      { name: 'Greenhouse', url: 'https://www.greenhouse.io/', description: 'Used by Airbnb, Stripe, Cloudflare...', region: 'global', hasAdapter: true },
      { name: 'Lever', url: 'https://www.lever.co/', description: 'Used by Netflix, Atlassian, Vercel...', region: 'global', hasAdapter: true },
      { name: 'Workday', url: 'https://www.workday.com/', description: 'Enterprise ATS', region: 'global' },
      { name: 'Ashby', url: 'https://www.ashbyhq.com/', description: 'Modern startup ATS', region: 'global' },
      { name: 'SmartRecruiters', url: 'https://www.smartrecruiters.com/', description: 'Enterprise hiring platform', region: 'global' },
      { name: 'iCIMS', url: 'https://www.icims.com/', description: 'Talent cloud platform', region: 'global' },
      { name: 'Jobvite', url: 'https://www.jobvite.com/', description: 'Recruiting software', region: 'global' },
      { name: 'BambooHR', url: 'https://www.bamboohr.com/', description: 'HR & ATS platform', region: 'global' },
    ],
  },
];

/**
 * Get the total number of external sources
 */
export function getSourceCount() {
  return EXTERNAL_SOURCES.reduce((sum, cat) => sum + cat.sites.length, 0);
}

/**
 * Get sources by category
 */
export function getSourcesByCategory(category) {
  return EXTERNAL_SOURCES.find(c => c.category === category)?.sites || [];
}

/**
 * Get all sources with adapters
 */
export function getIntegratedSources() {
  return EXTERNAL_SOURCES
    .flatMap(c => c.sites)
    .filter(s => s.hasAdapter);
}
