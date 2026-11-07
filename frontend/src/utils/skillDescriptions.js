/**
 * Human-friendly descriptions and industry context for canonical skills.
 * Ensures all recommendations in the UI make direct, practical sense.
 */

export const SKILL_INFO = {
  // Languages
  Python: {
    tagline: 'Versatile scripting and backend language',
    purpose: 'Used for writing backend server logic, automated data pipelines, and REST APIs.',
    whyPaired: 'Powers backend microservices and data queries alongside SQL and Docker.',
  },
  JavaScript: {
    tagline: 'Universal language of the web',
    purpose: 'Powers client-side interactivity, DOM manipulation, and dynamic single-page web applications.',
    whyPaired: 'Foundational language required by virtually all frontend frameworks like React and Vue.',
  },
  TypeScript: {
    tagline: 'Type-safe JavaScript for robust applications',
    purpose: 'Catches runtime errors during compilation and makes large codebases maintainable.',
    whyPaired: 'Industry standard for production React and Node.js enterprise codebases.',
  },
  Java: {
    tagline: 'Enterprise object-oriented powerhouse',
    purpose: 'Builds high-throughput corporate banking systems, backend microservices, and large-scale APIs.',
    whyPaired: 'Universally paired with Spring Boot, SQL, and Docker in enterprise backend engineering.',
  },
  SQL: {
    tagline: 'Relational database query language',
    purpose: 'Retrieves, updates, joins, and aggregates data stored in relational database tables.',
    whyPaired: 'Essential companion across every IT role—backend developers and data analysts must query databases.',
  },
  HTML: {
    tagline: 'Semantic backbone of web pages',
    purpose: 'Defines the content structure, forms, tables, and document hierarchy of web applications.',
    whyPaired: 'Inseparable pairing with CSS and JavaScript for building any visual web interface.',
  },
  CSS: {
    tagline: 'Visual presentation and responsive styling',
    purpose: 'Controls layouts, colors, flexbox grids, animations, and mobile responsiveness.',
    whyPaired: 'Always required alongside HTML and modern frameworks to produce polished user experiences.',
  },
  'HTML/CSS': {
    tagline: 'Frontend markup and styling fundamentals',
    purpose: 'Constructs accessible, responsive layouts and visual design for web interfaces.',
    whyPaired: 'Core prerequisite before learning component-driven frontend frameworks like React.',
  },

  // Frameworks & Libraries
  React: {
    tagline: 'Industry-standard UI component library',
    purpose: 'Builds fast, interactive single-page applications using declarative reusable components and hooks.',
    whyPaired: 'Top frontend framework demanded by recruiters; always accompanied by JavaScript, HTML/CSS, and Git.',
  },
  'Node.js': {
    tagline: 'Server-side JavaScript runtime environment',
    purpose: 'Enables developers to write backend APIs and asynchronous event-driven services in JavaScript.',
    whyPaired: 'Allows full-stack developers to use a single language across client and server.',
  },
  'Spring Boot': {
    tagline: 'Enterprise Java microservice framework',
    purpose: 'Accelerates Java API development with auto-configuration, dependency injection, and security.',
    whyPaired: 'Co-occurs in over 85% of Java backend postings as the de facto microservice framework.',
  },
  FastAPI: {
    tagline: 'High-performance modern Python API framework',
    purpose: 'Builds lightweight, auto-documented async REST APIs with type-hints and OpenAPI schemas.',
    whyPaired: 'Modern companion for Python microservices, database interaction, and machine learning endpoints.',
  },
  Django: {
    tagline: 'Batteries-included Python web framework',
    purpose: 'Provides built-in ORM, admin dashboard, user authentication, and CSRF security.',
    whyPaired: 'Standard framework for rapid Python backend web development backed by PostgreSQL or MySQL.',
  },
  Pandas: {
    tagline: 'Data manipulation and analysis library',
    purpose: 'Transforms, cleans, merges, and aggregates structured tabular data in Python.',
    whyPaired: 'The core Python data science library paired with SQL and visualization tools in data roles.',
  },

  // Databases & Storage
  PostgreSQL: {
    tagline: 'Advanced open-source relational database',
    purpose: 'Stores structured transactional application data with strict ACID compliance and JSON support.',
    whyPaired: 'De facto production database paired with Python, Java, and Node.js backend servers.',
  },
  MySQL: {
    tagline: 'Popular open-source relational database',
    purpose: 'Reliable, widely deployed database engine for web applications and CMS platforms.',
    whyPaired: 'Standard backend relational database used across web applications.',
  },
  MongoDB: {
    tagline: 'Flexible document-based NoSQL database',
    purpose: 'Stores unstructured or semi-structured JSON-like documents without strict schemas.',
    whyPaired: 'Common companion with Node.js and Express in the MERN stack.',
  },
  Redis: {
    tagline: 'In-memory caching and session store',
    purpose: 'Speeds up API response times by caching frequently queried database records and managing sessions.',
    whyPaired: 'Heavily required in backend roles to handle caching, message queuing, and rate limiting.',
  },

  // DevOps & Cloud
  Docker: {
    tagline: 'Application containerization platform',
    purpose: 'Packages applications with all their dependencies so they run reliably across any machine or cloud server.',
    whyPaired: 'Essential companion: 93% of backend postings requiring Python/Java also demand Docker for deployment.',
  },
  AWS: {
    tagline: 'Market-leading cloud infrastructure platform',
    purpose: 'Hosts databases, serverless compute, microservices, and storage in the cloud.',
    whyPaired: 'Co-occurs in modern backend job specs requiring cloud-native deployments.',
  },
  Git: {
    tagline: 'Distributed version control system',
    purpose: 'Tracks code changes, coordinates branching, and enables multi-developer team collaboration.',
    whyPaired: 'Universal baseline tool required in 100% of professional software engineering environments.',
  },
  'REST APIs': {
    tagline: 'Standard HTTP client-server architecture',
    purpose: 'Defines how frontend and backend exchange JSON data via GET, POST, PUT, and DELETE methods.',
    whyPaired: 'The communicative bridge connecting frontend interfaces and backend databases.',
  },

  // Business Intelligence & Analytics
  Tableau: {
    tagline: 'Interactive business intelligence dashboard platform',
    purpose: 'Creates visual charts, geographical maps, and interactive KPI dashboards for decision-makers.',
    whyPaired: 'Top visualization requirement for Data Analysts alongside SQL data queries.',
  },
  'Power BI': {
    tagline: 'Microsoft enterprise reporting and BI suite',
    purpose: 'Connects to enterprise databases to build automated reports, dashboards, and metrics.',
    whyPaired: 'Heavily demanded in corporate business analyst and data specialist job postings.',
  },
  Excel: {
    tagline: 'Spreadsheet modeling and data organization',
    purpose: 'Performs pivot tables, VLOOKUPs, ad-hoc calculations, and quick exploratory data checks.',
    whyPaired: 'Fundamental data tool paired with SQL in entry-level analyst postings.',
  },
};

/**
 * Returns a human-friendly description for any technical skill.
 */
export function getSkillDescription(skillName) {
  if (SKILL_INFO[skillName]) {
    return SKILL_INFO[skillName].purpose;
  }
  return `Essential industry technology used in ${skillName} development workflows.`;
}

/**
 * Returns why a skill is paired with existing skills.
 */
export function getSkillPairingReason(skillName, knownSkills = []) {
  if (SKILL_INFO[skillName]?.whyPaired) {
    return SKILL_INFO[skillName].whyPaired;
  }
  if (knownSkills.length > 0) {
    return `Co-occurs with ${knownSkills.slice(0, 2).join(' & ')} to complete production application workflows.`;
  }
  return 'Core requirement frequently bundled in job postings for this specialization.';
}
