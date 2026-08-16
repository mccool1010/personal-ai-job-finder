/**
 * Curated data lists for job classification.
 */

// Major MNCs — used to classify company type
export const MNC_COMPANIES = new Set([
  'google', 'microsoft', 'amazon', 'apple', 'meta', 'facebook', 'netflix',
  'ibm', 'oracle', 'salesforce', 'adobe', 'intel', 'nvidia', 'cisco',
  'samsung', 'qualcomm', 'paypal', 'uber', 'airbnb', 'spotify',
  'twitter', 'x corp', 'linkedin', 'snap', 'pinterest',
  // Indian IT giants
  'tcs', 'tata consultancy services', 'infosys', 'wipro', 'hcl',
  'hcl technologies', 'tech mahindra', 'cognizant', 'capgemini',
  'accenture', 'deloitte', 'kpmg', 'ey', 'ernst & young', 'pwc',
  'ltimindtree', 'lti', 'mindtree', 'mphasis', 'persistent systems',
  'l&t infotech', 'hexaware', 'coforge', 'niit technologies',
  // Banks & Finance
  'jpmorgan', 'jp morgan', 'goldman sachs', 'morgan stanley',
  'bank of america', 'citibank', 'citi', 'hsbc', 'barclays',
  'deutsche bank', 'wells fargo', 'american express',
  // Other large
  'walmart', 'target', 'flipkart', 'myntra', 'swiggy', 'zomato',
  'ola', 'paytm', 'phonepe', 'razorpay', 'cred', 'byju',
  'unacademy', 'freshworks', 'zoho', 'atlassian', 'vmware',
  'broadcom', 'dell', 'hp', 'hewlett packard', 'lenovo',
  'siemens', 'bosch', 'continental', 'honeywell',
  'ge', 'general electric', 'philips', 'schneider electric',
]);

// Startup indicators in job descriptions
export const STARTUP_KEYWORDS = [
  'seed funded', 'series a', 'series b', 'early stage', 'pre-seed',
  'stealth startup', 'backed by', 'ycombinator', 'y combinator',
  'angel funded', 'bootstrap', 'venture backed', 'techstars',
  'founded in 202', 'small team', 'fast-paced startup',
  'startup culture', 'equity', 'esop', 'stock options',
];

// Indian cities with aliases
export const INDIAN_CITIES = {
  'bangalore': ['bangalore', 'bengaluru', 'blr'],
  'hyderabad': ['hyderabad', 'hyd'],
  'kochi': ['kochi', 'cochin'],
  'pune': ['pune'],
  'chennai': ['chennai', 'madras'],
  'mumbai': ['mumbai', 'bombay'],
  'delhi ncr': ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'ncr', 'faridabad', 'ghaziabad'],
  'kolkata': ['kolkata', 'calcutta'],
  'ahmedabad': ['ahmedabad'],
  'jaipur': ['jaipur'],
  'chandigarh': ['chandigarh'],
  'thiruvananthapuram': ['thiruvananthapuram', 'trivandrum'],
  'coimbatore': ['coimbatore'],
  'indore': ['indore'],
  'nagpur': ['nagpur'],
  'lucknow': ['lucknow'],
  'visakhapatnam': ['visakhapatnam', 'vizag'],
};

// Flatten city aliases for quick lookup
export const CITY_ALIAS_MAP = {};
for (const [canonical, aliases] of Object.entries(INDIAN_CITIES)) {
  for (const alias of aliases) {
    CITY_ALIAS_MAP[alias.toLowerCase()] = canonical;
  }
}

// Remote eligibility patterns
export const REMOTE_INDIA_PATTERNS = [
  /remote.*india/i, /india.*remote/i, /work from home.*india/i,
  /wfh.*india/i, /remote.*bengaluru/i, /remote.*bangalore/i,
  /remote.*hyderabad/i, /remote.*mumbai/i, /remote.*pune/i,
  /remote.*chennai/i, /remote.*delhi/i, /remote.*kolkata/i,
];

export const REMOTE_US_ONLY_PATTERNS = [
  /us[\s-]?only/i, /united states only/i, /us[\s-]?based/i,
  /must be (located|based) in (the )?us/i, /us residents? only/i,
  /must reside in (the )?united states/i,
];

export const REMOTE_EU_ONLY_PATTERNS = [
  /eu[\s-]?only/i, /europe[\s-]?only/i, /eu[\s-]?based/i,
  /european union only/i, /must be (located|based) in (the )?eu/i,
];

export const WORK_AUTH_PATTERNS = [
  /work authorization required/i, /authorized to work in/i,
  /must be authorized/i, /us work authorization/i,
  /right to work/i, /work permit required/i,
  /us citizen/i, /citizenship required/i,
  /permanent resident/i, /green card/i,
  /cannot sponsor/i, /no sponsorship/i, /not able to sponsor/i,
];

export const VISA_SPONSOR_PATTERNS = [
  /visa sponsorship (available|offered|provided)/i,
  /we sponsor visa/i, /h1b sponsor/i, /willing to sponsor/i,
  /sponsorship available/i, /open to sponsoring/i,
];

export const WORLDWIDE_REMOTE_PATTERNS = [
  /remote[\s-]?worldwide/i, /remote[\s-]?global/i,
  /work from anywhere/i, /location[\s-]?independent/i,
  /fully remote/i, /100% remote/i,
  /remote[\s-]?friendly/i, /globally distributed/i,
  /remote[\s-]?\(anywhere\)/i,
];

// Skills dictionary — for extracting skills from text
export const SKILLS_DICTIONARY = [
  // Programming languages
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'golang',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
  'perl', 'shell', 'bash', 'powershell', 'sql', 'html', 'css',
  // ML/AI
  'machine learning', 'deep learning', 'natural language processing', 'nlp',
  'computer vision', 'reinforcement learning', 'neural networks',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
  'hugging face', 'transformers', 'llm', 'large language model',
  'gpt', 'bert', 'rag', 'langchain', 'langgraph', 'llamaindex',
  'openai', 'gemini', 'claude', 'generative ai', 'gen ai', 'genai',
  'stable diffusion', 'midjourney', 'prompt engineering',
  'opencv', 'yolo', 'cnn', 'rnn', 'lstm', 'gan',
  'data science', 'data analysis', 'data engineering',
  'feature engineering', 'model deployment', 'mlops',
  'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
  'jupyter', 'notebook', 'colab',
  // Web & APIs
  'react', 'react.js', 'reactjs', 'angular', 'vue', 'vue.js', 'vuejs',
  'next.js', 'nextjs', 'nuxt', 'svelte', 'node.js', 'nodejs',
  'express', 'express.js', 'fastapi', 'flask', 'django',
  'spring', 'spring boot', '.net', 'asp.net',
  'rest', 'rest api', 'graphql', 'grpc', 'websocket',
  'html5', 'css3', 'sass', 'less', 'tailwind', 'bootstrap',
  // Databases
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite',
  'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'neo4j',
  'firebase', 'supabase', 'prisma', 'mongoose',
  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud',
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
  'jenkins', 'github actions', 'ci/cd', 'cicd',
  'nginx', 'apache', 'linux', 'unix',
  'heroku', 'vercel', 'netlify', 'digitalocean',
  // Testing
  'selenium', 'cypress', 'jest', 'mocha', 'pytest', 'junit',
  'postman', 'swagger', 'api testing', 'load testing',
  'manual testing', 'automation testing', 'test automation',
  'performance testing', 'regression testing', 'unit testing',
  'integration testing', 'e2e testing', 'end to end testing',
  'jira', 'bugzilla', 'testng', 'cucumber', 'appium',
  'robot framework', 'playwright',
  // Tools & Misc
  'git', 'github', 'gitlab', 'bitbucket', 'svn',
  'agile', 'scrum', 'kanban', 'jira', 'confluence',
  'figma', 'sketch', 'adobe xd',
  'microservices', 'monolith', 'event-driven',
  'kafka', 'rabbitmq', 'celery',
  'oauth', 'jwt', 'authentication', 'authorization',
  'blockchain', 'web3', 'solidity',
  'power bi', 'tableau', 'excel', 'vba',
];

// Seniority keywords that indicate senior roles
export const SENIOR_TITLE_PATTERNS = [
  /\bsenior\b/i, /\bsr\.?\b/i, /\bstaff\b/i, /\blead\b/i,
  /\bprincipal\b/i, /\barchitect\b/i, /\bdirector\b/i,
  /\bmanager\b/i, /\bhead of\b/i, /\bvp\b/i,
  /\bchief\b/i, /\bcto\b/i, /\bcio\b/i,
];

// Experience parsing patterns
export const EXPERIENCE_PATTERNS = [
  /(\d+)\s*\+?\s*years?/i,
  /(\d+)\s*-\s*(\d+)\s*years?/i,
  /(\d+)\s*to\s*(\d+)\s*years?/i,
  /experience:\s*(\d+)/i,
  /minimum\s+(\d+)\s*years?/i,
  /at least\s+(\d+)\s*years?/i,
];

// Profile target roles
export const PROFILE_TARGET_ROLES = {
  ai_ml: [
    'ai engineer', 'ml engineer', 'machine learning engineer',
    'junior ai engineer', 'applied ai engineer', 'genai developer',
    'generative ai engineer', 'computer vision engineer',
    'ai/ml intern', 'ai ml intern', 'llm engineer', 'nlp engineer',
    'data scientist', 'junior data scientist', 'ai researcher',
    'deep learning engineer', 'ml ops engineer', 'mlops engineer',
  ],
  software_qa: [
    'software engineer', 'software developer', 'junior software engineer',
    'python developer', 'java developer', 'full stack developer',
    'fullstack developer', 'frontend developer', 'backend developer',
    'qa engineer', 'qa automation engineer', 'software tester',
    'sdet', 'junior sdet', 'test engineer', 'quality assurance',
    'application support engineer', 'test analyst',
    'automation engineer', 'manual tester',
  ],
  general: [
    'technical support', 'it support', 'application support',
    'implementation associate', 'implementation engineer',
    'technical customer support', 'customer success',
    'operations analyst', 'business analyst', 'junior business analyst',
    'data analyst', 'reporting analyst', 'project coordinator',
    'program coordinator', 'technical recruiter',
    'recruiting coordinator', 'business development',
    'sales development', 'graduate', 'fresher', 'trainee',
    'associate', 'coordinator', 'executive',
  ],
};

// Role similarity synonyms
export const ROLE_SYNONYMS = {
  'ai engineer': ['ml engineer', 'machine learning engineer', 'applied ai engineer'],
  'ml engineer': ['ai engineer', 'machine learning engineer', 'deep learning engineer'],
  'data scientist': ['ml engineer', 'data analyst', 'research scientist'],
  'software engineer': ['software developer', 'sde', 'programmer'],
  'full stack developer': ['fullstack developer', 'web developer'],
  'qa engineer': ['quality assurance engineer', 'test engineer', 'sdet'],
  'sdet': ['qa automation engineer', 'test automation engineer'],
  'devops engineer': ['sre', 'site reliability engineer', 'platform engineer'],
  'frontend developer': ['front-end developer', 'ui developer', 'react developer'],
  'backend developer': ['back-end developer', 'server-side developer', 'api developer'],
  'data analyst': ['business analyst', 'reporting analyst', 'data associate'],
};
