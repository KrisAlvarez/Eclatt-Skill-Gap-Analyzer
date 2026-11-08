"""Canonical IT Skill Taxonomy, Alias Normalization, and Category Hierarchy.

Provides vetted technical skills across 5 core domains, alias mapping,
and substitute vs complement category grouping to prevent taxonomy pollution.
Aligned with ESCO/O*NET IT taxonomies and the asaniczka 1.3M LinkedIn dataset.
"""

from typing import Dict, List, Set, Tuple
import re

# Category Enums / Groups
CAT_LANGUAGE = "Programming Languages"
CAT_FRAMEWORK = "Frameworks & Libraries"
CAT_DATABASE = "Databases & Storage"
CAT_CLOUD_DEVOPS = "Cloud & DevOps"
CAT_DEV_TOOLS = "Architecture & Developer Tools"

# Canonical Skills Taxonomy with Assigned Category (~100+ vetted technical skills)
SKILL_TAXONOMY: Dict[str, str] = {
    # 1. Programming Languages
    "Python": CAT_LANGUAGE,
    "JavaScript": CAT_LANGUAGE,
    "TypeScript": CAT_LANGUAGE,
    "Java": CAT_LANGUAGE,
    "C++": CAT_LANGUAGE,
    "C#": CAT_LANGUAGE,
    "Go": CAT_LANGUAGE,
    "Rust": CAT_LANGUAGE,
    "PHP": CAT_LANGUAGE,
    "Ruby": CAT_LANGUAGE,
    "SQL": CAT_LANGUAGE,
    "HTML": CAT_LANGUAGE,
    "CSS": CAT_LANGUAGE,
    "Kotlin": CAT_LANGUAGE,
    "Swift": CAT_LANGUAGE,
    "Scala": CAT_LANGUAGE,
    "R": CAT_LANGUAGE,
    "Bash": CAT_LANGUAGE,
    "PowerShell": CAT_LANGUAGE,
    "Dart": CAT_LANGUAGE,
    "Perl": CAT_LANGUAGE,
    "Lua": CAT_LANGUAGE,

    # 2. Frameworks & Libraries
    "React": CAT_FRAMEWORK,
    "Angular": CAT_FRAMEWORK,
    "Vue.js": CAT_FRAMEWORK,
    "Next.js": CAT_FRAMEWORK,
    "Nuxt.js": CAT_FRAMEWORK,
    "Svelte": CAT_FRAMEWORK,
    "Node.js": CAT_FRAMEWORK,
    "Express.js": CAT_FRAMEWORK,
    "NestJS": CAT_FRAMEWORK,
    "Django": CAT_FRAMEWORK,
    "FastAPI": CAT_FRAMEWORK,
    "Flask": CAT_FRAMEWORK,
    "Spring Boot": CAT_FRAMEWORK,
    "ASP.NET": CAT_FRAMEWORK,
    "Laravel": CAT_FRAMEWORK,
    "Ruby on Rails": CAT_FRAMEWORK,
    "Tailwind CSS": CAT_FRAMEWORK,
    "Bootstrap": CAT_FRAMEWORK,
    "Redux": CAT_FRAMEWORK,
    "jQuery": CAT_FRAMEWORK,
    "React Native": CAT_FRAMEWORK,
    "Flutter": CAT_FRAMEWORK,
    "Electron": CAT_FRAMEWORK,
    "Pandas": CAT_FRAMEWORK,
    "NumPy": CAT_FRAMEWORK,
    "Scikit-learn": CAT_FRAMEWORK,
    "PyTorch": CAT_FRAMEWORK,
    "TensorFlow": CAT_FRAMEWORK,
    "Keras": CAT_FRAMEWORK,

    # 3. Databases & Storage
    "PostgreSQL": CAT_DATABASE,
    "MySQL": CAT_DATABASE,
    "MongoDB": CAT_DATABASE,
    "Redis": CAT_DATABASE,
    "SQLite": CAT_DATABASE,
    "Oracle": CAT_DATABASE,
    "Microsoft SQL Server": CAT_DATABASE,
    "Cassandra": CAT_DATABASE,
    "Elasticsearch": CAT_DATABASE,
    "DynamoDB": CAT_DATABASE,
    "Snowflake": CAT_DATABASE,
    "BigQuery": CAT_DATABASE,
    "NoSQL": CAT_DATABASE,
    "Firebase": CAT_DATABASE,
    "MariaDB": CAT_DATABASE,
    "Neo4j": CAT_DATABASE,
    "Supabase": CAT_DATABASE,

    # 4. Cloud & DevOps
    "Docker": CAT_CLOUD_DEVOPS,
    "Kubernetes": CAT_CLOUD_DEVOPS,
    "AWS": CAT_CLOUD_DEVOPS,
    "Azure": CAT_CLOUD_DEVOPS,
    "GCP": CAT_CLOUD_DEVOPS,
    "CI/CD": CAT_CLOUD_DEVOPS,
    "Git": CAT_CLOUD_DEVOPS,
    "GitHub Actions": CAT_CLOUD_DEVOPS,
    "GitLab CI": CAT_CLOUD_DEVOPS,
    "Linux": CAT_CLOUD_DEVOPS,
    "Terraform": CAT_CLOUD_DEVOPS,
    "Ansible": CAT_CLOUD_DEVOPS,
    "Jenkins": CAT_CLOUD_DEVOPS,
    "Nginx": CAT_CLOUD_DEVOPS,
    "Apache": CAT_CLOUD_DEVOPS,
    "Helm": CAT_CLOUD_DEVOPS,
    "DevOps": CAT_CLOUD_DEVOPS,
    "Cloud Computing": CAT_CLOUD_DEVOPS,
    "OpenShift": CAT_CLOUD_DEVOPS,
    "Prometheus": CAT_CLOUD_DEVOPS,
    "Grafana": CAT_CLOUD_DEVOPS,

    # 5. Architecture, BI & Developer Tooling
    "REST API": CAT_DEV_TOOLS,
    "GraphQL": CAT_DEV_TOOLS,
    "Microservices": CAT_DEV_TOOLS,
    "Kafka": CAT_DEV_TOOLS,
    "RabbitMQ": CAT_DEV_TOOLS,
    "Celery": CAT_DEV_TOOLS,
    "WebSockets": CAT_DEV_TOOLS,
    "Postman": CAT_DEV_TOOLS,
    "Swagger": CAT_DEV_TOOLS,
    "Power BI": CAT_DEV_TOOLS,
    "Tableau": CAT_DEV_TOOLS,
    "Excel": CAT_DEV_TOOLS,
    "Airflow": CAT_DEV_TOOLS,
    "Spark": CAT_DEV_TOOLS,
    "Hadoop": CAT_DEV_TOOLS,
    "Machine Learning": CAT_DEV_TOOLS,
    "Data Visualization": CAT_DEV_TOOLS,
    "Testing & QA": CAT_DEV_TOOLS,
    "Automation": CAT_DEV_TOOLS,
    "Jira": CAT_DEV_TOOLS,
    "Agile": CAT_DEV_TOOLS,
    "Cybersecurity": CAT_DEV_TOOLS,
    "Networking": CAT_DEV_TOOLS,
}

# Alias / Variant Mapping to Canonical Key
ALIAS_MAP: Dict[str, str] = {
    # Languages
    "python": "Python",
    "python3": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "php": "PHP",
    "ruby": "Ruby",
    "sql": "SQL",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "bash": "Bash",
    "shell": "Bash",
    "powershell": "PowerShell",
    "dart": "Dart",
    "perl": "Perl",
    "lua": "Lua",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "scala": "Scala",
    "r": "R",
    
    # Frameworks & Libraries
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "angular": "Angular",
    "angularjs": "Angular",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "next": "Next.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "nuxt": "Nuxt.js",
    "nuxt.js": "Nuxt.js",
    "svelte": "Svelte",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "nestjs": "NestJS",
    "django": "Django",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "asp.net": "ASP.NET",
    ".net": "ASP.NET",
    "dotnet": "ASP.NET",
    "laravel": "Laravel",
    "rails": "Ruby on Rails",
    "ruby on rails": "Ruby on Rails",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "redux": "Redux",
    "jquery": "jQuery",
    "react native": "React Native",
    "flutter": "Flutter",
    "electron": "Electron",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "keras": "Keras",

    # Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "oracle": "Oracle",
    "sql server": "Microsoft SQL Server",
    "mssql": "Microsoft SQL Server",
    "microsoft sql server": "Microsoft SQL Server",
    "cassandra": "Cassandra",
    "elasticsearch": "Elasticsearch",
    "dynamodb": "DynamoDB",
    "snowflake": "Snowflake",
    "bigquery": "BigQuery",
    "google bigquery": "BigQuery",
    "nosql": "NoSQL",
    "firebase": "Firebase",
    "mariadb": "MariaDB",
    "neo4j": "Neo4j",
    "supabase": "Supabase",

    # Cloud & DevOps
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "gcp": "GCP",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "continuous integration": "CI/CD",
    "git": "Git",
    "github actions": "GitHub Actions",
    "gitlab": "GitLab CI",
    "gitlab ci": "GitLab CI",
    "linux": "Linux",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "jenkins": "Jenkins",
    "nginx": "Nginx",
    "apache": "Apache",
    "helm": "Helm",
    "devops": "DevOps",
    "cloud computing": "Cloud Computing",
    "cloud": "Cloud Computing",
    "openshift": "OpenShift",
    "prometheus": "Prometheus",
    "grafana": "Grafana",

    # Architecture, BI & Developer Tools
    "rest": "REST API",
    "rest api": "REST API",
    "rest apis": "REST API",
    "restful": "REST API",
    "graphql": "GraphQL",
    "microservices": "Microservices",
    "kafka": "Kafka",
    "apache kafka": "Kafka",
    "rabbitmq": "RabbitMQ",
    "celery": "Celery",
    "websocket": "WebSockets",
    "websockets": "WebSockets",
    "postman": "Postman",
    "swagger": "Swagger",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "microsoft excel": "Excel",
    "airflow": "Airflow",
    "spark": "Spark",
    "apache spark": "Spark",
    "pyspark": "Spark",
    "hadoop": "Hadoop",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "data visualization": "Data Visualization",
    "data analysis": "Data Visualization",
    "testing": "Testing & QA",
    "software testing": "Testing & QA",
    "quality assurance": "Testing & QA",
    "qa": "Testing & QA",
    "automation": "Automation",
    "jira": "Jira",
    "agile": "Agile",
    "scrum": "Agile",
    "cybersecurity": "Cybersecurity",
    "security": "Cybersecurity",
    "information security": "Cybersecurity",
    "networking": "Networking",
}


def normalize_skill(value: str) -> str:
    """Return the canonical taxonomy label for a user or dataset skill."""
    if not isinstance(value, str):
        return ""
    normalized = re.sub(r"\s+", " ", value.strip().lower())
    if normalized in ALIAS_MAP:
        return ALIAS_MAP[normalized]
    for skill in SKILL_TAXONOMY:
        if skill.lower() == normalized:
            return skill
    return ""

# Compile regex patterns for word-boundary matching
_COMPILED_PATTERNS: List[Tuple[re.Pattern, str]] = []
for raw_token, canonical in sorted(ALIAS_MAP.items(), key=lambda x: -len(x[0])):
    escaped = re.escape(raw_token)
    if raw_token in ["c++", "c#", "ci/cd", ".net"]:
        pattern = re.compile(rf"(?:^|[\s,;:(/]){escaped}(?:$|[\s,;:!)/])", re.IGNORECASE)
    else:
        pattern = re.compile(rf"\b{escaped}\b", re.IGNORECASE)
    _COMPILED_PATTERNS.append((pattern, canonical))


def extract_skills(text: str) -> List[str]:
    """Extract and normalize canonical skills from unstructured job description text."""
    if not isinstance(text, str) or not text.strip():
        return []
    
    found: Set[str] = set()
    for pattern, canonical in _COMPILED_PATTERNS:
        if pattern.search(text):
            found.add(canonical)
            
    return sorted(found)


def get_category(skill: str) -> str:
    """Return the functional category for a canonical skill."""
    return SKILL_TAXONOMY.get(skill, "Architecture & Developer Tools")
