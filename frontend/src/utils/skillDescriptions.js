/**
 * Simple, human descriptions for skills.
 * Plain English without buzzwords.
 */

export const SKILL_INFO = {
  Python: {
    purpose: 'Used for writing backend server code, scripts, and working with data.',
    why: 'Most backend and data jobs pairing Python also require a database (SQL) and container tools.',
  },
  JavaScript: {
    purpose: 'The language that runs in web browsers to make pages interactive.',
    why: 'Required by every modern web framework like React, Vue, and Node.',
  },
  TypeScript: {
    purpose: 'JavaScript with type checking to prevent bugs in larger apps.',
    why: 'Companies use this on top of JavaScript and React for production code.',
  },
  Java: {
    purpose: 'A popular language for building reliable enterprise backends and APIs.',
    why: 'Almost always paired with Spring Boot and SQL in job postings.',
  },
  SQL: {
    purpose: 'Used to save, update, and search data in databases.',
    why: 'Every backend service and data analyst role needs to talk to a database.',
  },
  'HTML/CSS': {
    purpose: 'The building blocks for creating and styling web pages.',
    why: 'The starting foundation before building components in React.',
  },
  HTML: {
    purpose: 'Defines the structure and content of a web page.',
    why: 'Paired with CSS and JavaScript for any website.',
  },
  CSS: {
    purpose: 'Styles layouts, fonts, colors, and mobile responsiveness.',
    why: 'Always used with HTML to make interfaces look clean.',
  },
  React: {
    purpose: 'A popular library for building reusable web page components.',
    why: 'The most requested frontend tool in modern job postings.',
  },
  'Node.js': {
    purpose: 'Lets you run JavaScript on the server to build APIs.',
    why: 'Commonly paired with React so you can use one language for front and back.',
  },
  'Spring Boot': {
    purpose: 'A framework that makes building Java APIs much faster.',
    why: 'Over 85% of Java backend listings specifically ask for Spring Boot.',
  },
  FastAPI: {
    purpose: 'A fast and simple Python framework for building REST APIs.',
    why: 'Modern Python backend teams use this to serve APIs and data.',
  },
  Django: {
    purpose: 'A complete Python web framework with built-in database tools and login.',
    why: 'Used by companies to build web services quickly with Python.',
  },
  Pandas: {
    purpose: 'A Python library used to clean, filter, and inspect data tables.',
    why: 'Standard tool for analysts moving beyond spreadsheets.',
  },
  PostgreSQL: {
    purpose: 'A reliable open-source database used by most tech startups and companies.',
    why: 'Standard database paired with Python, Node, and Java servers.',
  },
  MySQL: {
    purpose: 'A widely used open-source relational database.',
    why: 'Common backend storage for web applications.',
  },
  MongoDB: {
    purpose: 'A database that stores data in flexible JSON-like documents.',
    why: 'Popular in JavaScript and Node stacks.',
  },
  Redis: {
    purpose: 'A very fast in-memory store used for caching and sessions.',
    why: 'Backend teams use it so apps load faster without hitting the main database every time.',
  },
  Docker: {
    purpose: 'Packages an app and its settings so it runs the same on any computer or cloud server.',
    why: '93% of backend postings requiring Python or Java also look for Docker.',
  },
  AWS: {
    purpose: 'Amazon cloud platform used to host websites, databases, and servers.',
    why: 'Companies look for developers who know how to deploy their code to the cloud.',
  },
  Git: {
    purpose: 'Tracks code changes and lets teams collaborate without overwriting each other.',
    why: 'Expected for almost every software role so you can work with a team.',
  },
  'REST APIs': {
    purpose: 'The standard way frontend apps and backend servers talk to each other.',
    why: 'Frontend and backend developers both need to understand API endpoints.',
  },
  Tableau: {
    purpose: 'Turns data into visual charts and dashboards for business teams.',
    why: 'Top reporting tool asked for in data analyst postings.',
  },
  'Power BI': {
    purpose: 'Microsoft dashboard tool for reports and business metrics.',
    why: 'Very common in business and corporate data roles.',
  },
  Excel: {
    purpose: 'Spreadsheets for quick calculations, pivot tables, and sorting data.',
    why: 'A baseline tool almost all data analysts use alongside SQL.',
  },
};

export function getSkillPurpose(name) {
  return SKILL_INFO[name]?.purpose || `Used in modern ${name} workflows.`;
}

export function getSkillReason(name, known = []) {
  if (SKILL_INFO[name]?.why) {
    return SKILL_INFO[name].why;
  }
  if (known.length > 0) {
    return `Frequently required alongside ${known.slice(0, 2).join(' and ')} in real jobs.`;
  }
  return 'A common requirement found across postings for this role.';
}
