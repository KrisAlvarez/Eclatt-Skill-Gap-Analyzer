/**
 * Simple, human descriptions for skills.
 * Plain English without buzzwords.
 */

export const SKILL_INFO = {
  Python: {
    purpose: 'Used for writing backend server code, scripts, and working with data.',
  },
  JavaScript: {
    purpose: 'The language that runs in web browsers to make pages interactive.',
  },
  TypeScript: {
    purpose: 'JavaScript with type checking to prevent bugs in larger apps.',
  },
  Java: {
    purpose: 'A popular language for building reliable enterprise backends and APIs.',
  },
  SQL: {
    purpose: 'Used to save, update, and search data in databases.',
  },
  'HTML/CSS': {
    purpose: 'The building blocks for creating and styling web pages.',
  },
  HTML: {
    purpose: 'Defines the structure and content of a web page.',
  },
  CSS: {
    purpose: 'Styles layouts, fonts, colors, and mobile responsiveness.',
  },
  React: {
    purpose: 'A popular library for building reusable web page components.',
  },
  'Node.js': {
    purpose: 'Lets you run JavaScript on the server to build APIs.',
  },
  'Spring Boot': {
    purpose: 'A framework that makes building Java APIs much faster.',
  },
  FastAPI: {
    purpose: 'A fast and simple Python framework for building REST APIs.',
  },
  Django: {
    purpose: 'A complete Python web framework with built-in database tools and login.',
  },
  Pandas: {
    purpose: 'A Python library used to clean, filter, and inspect data tables.',
  },
  PostgreSQL: {
    purpose: 'A reliable open-source database used by most tech startups and companies.',
  },
  MySQL: {
    purpose: 'A widely used open-source relational database.',
  },
  MongoDB: {
    purpose: 'A database that stores data in flexible JSON-like documents.',
  },
  Redis: {
    purpose: 'A very fast in-memory store used for caching and sessions.',
  },
  Docker: {
    purpose: 'Packages an app and its settings so it runs the same on any computer or cloud server.',
  },
  AWS: {
    purpose: 'Amazon cloud platform used to host websites, databases, and servers.',
  },
  Git: {
    purpose: 'Tracks code changes and lets teams collaborate without overwriting each other.',
  },
  'REST APIs': {
    purpose: 'The standard way frontend apps and backend servers talk to each other.',
  },
  Tableau: {
    purpose: 'Turns data into visual charts and dashboards for business teams.',
  },
  'Power BI': {
    purpose: 'Microsoft dashboard tool for reports and business metrics.',
  },
  Excel: {
    purpose: 'Spreadsheets for quick calculations, pivot tables, and sorting data.',
  },
};

export function getSkillPurpose(name) {
  return SKILL_INFO[name]?.purpose || `Used in modern ${name} workflows.`;
}

export function getSkillReason(name, known = []) {
  const context = known.length > 0
    ? ` alongside ${known.slice(0, 2).join(' and ')}`
    : '';
  return `${name} appears${context} in patterns from the analyzed postings. This is an observation about the dataset, not a requirement.`;
}
