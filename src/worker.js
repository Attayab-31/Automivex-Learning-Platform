import { verifyGithubRepository } from "./github.js";

const COURSE_ID = "python-api-2026";
const CERTIFICATE_CODE_PATTERN = /^AVX-\d{4}-(?:[23456789A-HJ-NP-Z]{8}|[23456789A-HJ-NP-Z]{26})$/;
const COURSE = {
  id: COURSE_ID,
  title: "Python API Development",
  subtitle: "Build production-minded REST APIs with Python and FastAPI",
  level: "Beginner to intermediate",
  estimatedHours: 22,
  language: "English",
  videoUrl: "https://www.youtube.com/watch?v=0sOvCWFmrtA",
  videoId: "0sOvCWFmrtA",
  videoProvider: "freeCodeCamp.org",
  description: "A self-paced learning path using a free, publicly available long-form course, supported by Automivex learning notes, assessments and an independent capstone project.",
  modules: [
    { id: "m1", title: "API and FastAPI foundations", description: "Understand HTTP, REST, request/response cycles and the FastAPI application structure.", lessons: [
      { id: "l1", title: "How web APIs work", detail: "Understand HTTP methods, status codes, JSON, REST concepts and API clients." },
      { id: "l2", title: "FastAPI project setup", detail: "Create a virtual environment, install dependencies and start a small FastAPI application." }
    ]},
    { id: "m2", title: "Routes, validation and CRUD", description: "Create API endpoints and validate incoming data with typed schemas.", lessons: [
      { id: "l3", title: "Path operations and request models", detail: "Build GET, POST, PUT, PATCH and DELETE endpoints with Pydantic models." },
      { id: "l4", title: "CRUD patterns and error handling", detail: "Use response models, status codes, filtering and clear error responses." }
    ]},
    { id: "m3", title: "Databases and persistence", description: "Connect a relational database and model persistent application data.", lessons: [
      { id: "l5", title: "SQL and relational data", detail: "Review tables, primary keys, foreign keys, indexes and transactions." },
      { id: "l6", title: "SQLAlchemy and migrations", detail: "Work with ORM models, sessions and database schema migrations." }
    ]},
    { id: "m4", title: "Authentication and security", description: "Protect APIs and keep users' data separate.", lessons: [
      { id: "l7", title: "Authentication and password storage", detail: "Understand password hashing, token-based authentication and login flows." },
      { id: "l8", title: "Authorization and secure APIs", detail: "Apply role checks, ownership checks, validation and safe configuration." }
    ]},
    { id: "m5", title: "Testing and deployment fundamentals", description: "Test your API and prepare it for repeatable development and deployment.", lessons: [
      { id: "l9", title: "Automated API testing", detail: "Write pytest tests for successful requests, invalid input and authorization boundaries." },
      { id: "l10", title: "Docker, CI and documentation", detail: "Document setup, containerize the application and add a GitHub Actions test workflow." }
    ]}
  ],
  capstone: {
    title: "2026 Capstone: HelpFlow — Multi-tenant Customer Support SaaS API",
    summary: "Build the backend for a small customer-support platform used by multiple organizations. Each organization has its own workspace, agents, tickets, comments and knowledge-base articles. The project demonstrates practical API engineering, access control, data modelling, testing and delivery practices.",
    required: [
      "FastAPI application with documented REST endpoints",
      "PostgreSQL persistence using SQLAlchemy 2.x and migrations",
      "Workspace / tenant isolation: users must never access another workspace's records",
      "Authentication with securely hashed passwords and access tokens",
      "Role-based permissions for owner, admin and agent roles",
      "Ticket creation, assignment, status changes, priority and comments",
      "Knowledge-base articles with searchable title/body fields",
      "Audit log for important ticket and membership changes",
      "Input validation, pagination, filtering and consistent error responses",
      "Automated tests for CRUD, authentication, roles and cross-tenant isolation",
      "Docker Compose development setup and environment-variable configuration",
      "GitHub Actions workflow that runs the test suite"
    ],
    optional: [
      "Rule-based ticket triage that suggests category and priority with an explanation",
      "CSV export for workspace ticket reports",
      "SLA due-date tracking and overdue-ticket filters",
      "Rate limiting and structured application logging"
    ],
    submissionChecks: [
      "Public GitHub repository with a useful README",
      "Application entry point and dependency manifest",
      "Automated tests directory",
      "GitHub Actions CI workflow",
      "Database migrations directory",
      "Docker Compose configuration",
      "Project documentation or API usage examples"
    ]
  }
};

// Video clip boundaries follow the published chapter timestamps in the course video description.
const LESSON_STUDIES = {
  l1: {
    overview: "An API is a contract between a client and a server. HTTP carries requests, and JSON commonly carries structured data.",
    objectives: ["Identify the parts of an HTTP request and response", "Choose status codes based on intended outcomes", "Explain the difference between REST resources and RPC-style actions"],
    practice: "Describe GET /tickets/42, POST /tickets, and DELETE /tickets/42. Write the expected status codes for success and an unauthorized request.",
    video: { start: 0, end: 682, title: "Intro and project overview" },
    resources: [
      { title: "MDN: HTTP overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview" },
      { title: "FastAPI: First steps", url: "https://fastapi.tiangolo.com/tutorial/first-steps/" }
    ],
    checkQuestion: "Which answer explains GET /tickets/42 most accurately?",
    checkChoices: ["It creates a ticket with ID 42", "It retrieves ticket 42 without changing server state", "It deletes ticket 42", "It updates only the ticket description"],
    correctChoice: 1
  },
  l2: {
    overview: "A FastAPI application combines an ASGI app, typed routes, schemas, dependencies and configuration into a testable service.",
    objectives: ["Create a virtual environment and install dependencies reproducibly", "Define a FastAPI app and health route", "Run and document a local development server"],
    practice: "Create a main.py module exposing a FastAPI app. Add a health route and run it with uvicorn before extending it with POST routes.",
    video: { start: 682, end: 2363, title: "Python installation, virtual environments and FastAPI setup" },
    resources: [
      { title: "FastAPI: Project setup", url: "https://fastapi.tiangolo.com/" },
      { title: "Python: Virtual environments", url: "https://docs.python.org/3/tutorial/venv.html" }
    ],
    checkQuestion: "Why is a virtual environment useful in a Python API project?",
    checkChoices: ["It removes the need for dependencies", "It isolates project packages and versions", "It automatically deploys the API", "It replaces the database"],
    correctChoice: 1
  },
  l3: {
    overview: "Pydantic models define the expected shape, types and validation constraints for API request bodies.",
    objectives: ["Map path parameters and query parameters", "Define typed request and response models", "Use validation errors to reject malformed data"],
    practice: "Design POST /tickets and PATCH /tickets/{ticket_id}. Decide which fields are required, optional, and constrained.",
    video: { start: 2363, end: 4965, title: "Path operations, Postman, requests, validation and CRUD" },
    resources: [
      { title: "FastAPI: Path parameters", url: "https://fastapi.tiangolo.com/tutorial/path-params/" },
      { title: "Pydantic: Models", url: "https://docs.pydantic.dev/latest/concepts/models/" }
    ],
    checkQuestion: "Which reason best supports using a Pydantic request model?",
    checkChoices: ["It guarantees the database is fast", "It validates and parses input before business logic runs", "It replaces authentication", "It generates frontend HTML"],
    correctChoice: 1
  },
  l4: {
    overview: "A predictable CRUD API uses consistent status codes, response models, validation errors and well-defined resource lifecycles.",
    objectives: ["Implement create, read, update and delete operations", "Return appropriate status codes and structured errors", "Avoid exposing internal exceptions"],
    practice: "Sketch status-code behavior for 201 created, 404 missing, 409 conflict, and 422 invalid input. Keep error shapes consistent.",
    video: { start: 4965, end: 8651, title: "CRUD operations, response codes and automatic documentation" },
    resources: [
      { title: "FastAPI: Handling errors", url: "https://fastapi.tiangolo.com/tutorial/handling-errors/" },
      { title: "MDN: HTTP response status codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status" }
    ],
    checkQuestion: "What should a missing API resource normally return?",
    checkChoices: ["201", "204 only", "404", "500"],
    correctChoice: 2
  },
  l5: {
    overview: "Relational databases store connected records with keys, constraints, transactions and indexes.",
    objectives: ["Model entities and relationships", "Explain primary and foreign keys", "Choose indexes for common query filters"],
    practice: "Draw tables for users, workspaces, memberships and tickets. Mark keys, uniqueness rules, and the tenant relationship.",
    video: { start: 8651, end: 14028, title: "PostgreSQL installation, tables and SQL fundamentals" },
    resources: [
      { title: "PostgreSQL: Documentation", url: "https://www.postgresql.org/docs/current/" },
      { title: "SQLAlchemy: Unified Tutorial", url: "https://docs.sqlalchemy.org/en/20/tutorial/" }
    ],
    checkQuestion: "What does a foreign key enforce?",
    checkChoices: ["A relationship to a valid key in another table", "A password hash", "A random API route", "A JSON response format"],
    correctChoice: 0
  },
  l6: {
    overview: "SQLAlchemy maps Python classes to database records; migrations make schema changes versioned and repeatable.",
    objectives: ["Configure SQLAlchemy sessions safely", "Define relationships and constraints", "Create and apply an Alembic migration"],
    practice: "Create the initial migration, add an indexed workspace_id column, and verify downgrade/upgrade behavior in a clean database.",
    video: { title: "Database persistence, SQLAlchemy and migrations", clips: [
      { start: 14028, end: 21008, title: "Python database access, raw SQL and ORM" },
      { start: 33680, end: 37818, title: "Votes, SQL joins and related records" },
      { start: 37818, end: 40468, title: "Alembic setup and database migrations" }
    ] },
    resources: [
      { title: "SQLAlchemy 2.0 tutorial", url: "https://docs.sqlalchemy.org/en/20/tutorial/" },
      { title: "Alembic tutorial", url: "https://alembic.sqlalchemy.org/en/latest/tutorial.html" }
    ],
    checkQuestion: "Why use migrations instead of editing tables manually?",
    checkChoices: ["They make environment changes reviewable and repeatable", "They disable database constraints", "They encrypt all passwords automatically", "They replace application tests"],
    correctChoice: 0
  },
  l7: {
    overview: "Authentication establishes identity. Passwords must be stored with a dedicated adaptive hash, never reversible encryption.",
    objectives: ["Explain login and token flows", "Use Argon2, bcrypt or scrypt through a maintained library", "Keep secrets and credentials out of code and logs"],
    practice: "Add password hashing, login verification, and secure environment-based token configuration. Never return password fields.",
    video: { start: 21008, end: 28233, title: "User registration, password hashing, JWT and protected routes" },
    resources: [
      { title: "OWASP: Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
      { title: "FastAPI security tutorial", url: "https://fastapi.tiangolo.com/tutorial/security/" }
    ],
    checkQuestion: "Which password storage approach is appropriate for an API?",
    checkChoices: ["Plaintext", "A reversible encrypted password column", "An adaptive password-hashing algorithm", "A Base64-encoded password"],
    correctChoice: 2
  },
  l8: {
    overview: "Authorization checks what an authenticated identity can do. Tenant isolation must be enforced on every workspace-scoped query.",
    objectives: ["Use membership-based role checks", "Enforce tenant ownership in service queries", "Reject authorization failures consistently"],
    practice: "Add tests where Workspace A users try guessed IDs from Workspace B and requesters attempt agent-only actions.",
    video: { start: 28233, end: 33680, title: "Database relationships, ownership checks and query parameters" },
    resources: [
      { title: "OWASP: Authorization Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" },
      { title: "OWASP: Access Control", url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/Testing_for_Vulnerable_Function_Level_Authorization" }
    ],
    checkQuestion: "Which is a sound tenant-isolation rule?",
    checkChoices: ["Hide records only in the frontend", "Trust a workspace_id supplied by the client", "Authorize membership and scope database queries by workspace and record ownership", "Use one shared account for every workspace"],
    correctChoice: 2
  },
  l9: {
    overview: "Automated tests are executable specifications. They should cover successful paths, invalid input and authorization boundaries.",
    objectives: ["Write API tests with isolated fixtures", "Cover authentication and role checks", "Test cross-tenant isolation with guessed IDs"],
    practice: "Write pytest tests for create/read/update/forbidden paths. Run the suite against a temporary PostgreSQL test database.",
    video: { start: 51291, end: 63255, title: "Testing with pytest, fixtures and FastAPI TestClient" },
    resources: [
      { title: "Pytest documentation", url: "https://docs.pytest.org/en/stable/" },
      { title: "FastAPI: Testing", url: "https://fastapi.tiangolo.com/tutorial/testing/" }
    ],
    checkQuestion: "What makes a security test valuable?",
    checkChoices: ["It verifies UI colors", "It confirms protected behavior denies unauthorized cross-tenant access", "It only checks that the server starts", "It automatically deploys to production"],
    correctChoice: 1
  },
  l10: {
    overview: "Delivery fundamentals include reproducible environments, migration automation, documentation, CI and safe configuration.",
    objectives: ["Containerize the API and database", "Add a CI workflow that runs tests and checks", "Document setup, limitations and deployment assumptions"],
    practice: "Run the API through Docker Compose, start from a clean volume, apply migrations, and run the complete test suite in CI.",
    video: { title: "Deployment, Docker and CI/CD", clips: [
      { start: 40468, end: 48369, title: "Git prerequisites, Heroku and Ubuntu deployment" },
      { start: 48369, end: 51291, title: "Dockerfile, Compose and production vs development" },
      { start: 63255, end: 68427, title: "GitHub Actions, CI/CD and deployment workflow" }
    ] },
    resources: [
      { title: "Docker: Compose documentation", url: "https://docs.docker.com/compose/" },
      { title: "GitHub Actions documentation", url: "https://docs.github.com/en/actions" }
    ],
    checkQuestion: "What should a CI workflow do for an API project?",
    checkChoices: ["Only print repository metadata", "Install dependencies and run meaningful automated checks", "Skip tests for pull requests", "Store production secrets in the repository"],
    correctChoice: 1
  }
};

const QUESTIONS = [
  { id: 1, q: "Which HTTP method is normally used to retrieve a resource without changing it?", a: ["POST", "GET", "PATCH", "DELETE"], correct: 1 },
  { id: 2, q: "What is the main purpose of a Pydantic model in a FastAPI application?", a: ["Run database backups", "Validate and parse data", "Host static images", "Replace HTTP"], correct: 1 },
  { id: 3, q: "Which status code normally indicates that a resource was successfully created?", a: ["200", "201", "401", "500"], correct: 1 },
  { id: 4, q: "What does a database foreign key represent?", a: ["A password hash", "A relationship to a key in another or the same table", "An API route", "A cache entry"], correct: 1 },
  { id: 5, q: "Why should passwords be hashed with a password-hashing algorithm?", a: ["To make them reversible", "To avoid storing plaintext passwords", "To make login optional", "To compress the database"], correct: 1 },
  { id: 6, q: "What is authorization concerned with?", a: ["Who the user claims to be", "What an authenticated user is allowed to do", "How a server is deployed", "How JSON is formatted"], correct: 1 },
  { id: 7, q: "What is the purpose of automated tests?", a: ["Guarantee no bugs can ever exist", "Check expected behaviour repeatedly", "Replace documentation", "Make APIs public"], correct: 1 },
  { id: 8, q: "In a multi-tenant application, what is tenant isolation intended to prevent?", a: ["Users viewing another tenant's data", "Users creating records", "API documentation", "Database indexing"], correct: 0 },
  { id: 9, q: "What is a database migration used for?", a: ["Changing schema in a versioned, repeatable way", "Sending marketing emails", "Encrypting video", "Managing Git branches"], correct: 0 },
  { id: 10, q: "What is a CI workflow commonly used to do after a code change?", a: ["Run automated checks and tests", "Change the domain owner", "Issue a certificate automatically", "Delete old commits"], correct: 0 },
  { id: 11, q: "Which status code best represents invalid request data?", a: ["422", "301", "204", "503"], correct: 0 },
  { id: 12, q: "Which approach best protects a password at rest?", a: ["Base64 encoding", "AES encryption with no key rotation", "A maintained adaptive password hash", "A reversible XOR transform"], correct: 2 },
  { id: 13, q: "What should tenant-scoped queries include?", a: ["Only a client-provided display name", "The authenticated user's current workspace membership", "Every workspace ID in the database", "No workspace filter when filtering by ID"], correct: 1 },
  { id: 14, q: "What is a useful test for a protected endpoint?", a: ["An unauthenticated request is rejected", "The OpenAPI page always loads", "A password appears in the response", "The frontend button changes color"], correct: 0 },
  { id: 15, q: "What is SQLAlchemy normally responsible for in a FastAPI service?", a: ["Map Python models and sessions to relational database operations", "Render CSS", "Send SMS messages", "Create GitHub accounts"], correct: 0 },
  { id: 16, q: "Why should API exceptions not expose stack traces to clients?", a: ["Stack traces reveal implementation and secrets while providing poor stable responses", "Stack traces improve response caching", "They validate request bodies", "They enable tenant isolation"], correct: 0 },
  { id: 17, q: "What does pagination help prevent?", a: ["Large unbounded result sets consuming server and client resources", "Input validation", "Password hashing", "Database migrations"], correct: 0 },
  { id: 18, q: "Where should role checks for workspace actions be enforced?", a: ["Only in JavaScript", "At the server-side authorization layer for every protected route", "Only in CSS", "After returning secret records"], correct: 1 },
  { id: 19, q: "What is the benefit of isolated automated test fixtures?", a: ["Tests do not depend unpredictably on existing database state", "Tests require production credentials", "Tests disable constraints", "Tests need no assertions"], correct: 0 },
  { id: 20, q: "What belongs in environment-based configuration?", a: ["Database URLs and application secrets supplied outside source control", "Every user's password in Git", "The certificate private key in frontend JavaScript", "Hard-coded production tokens in README files"], correct: 0 }
];

const ASSESSMENT_PROMPTS = [
  { id: "architecture", prompt: "Describe one architecture decision in your project and explain why it fits the data and tenant boundaries you need." },
  { id: "debugging", prompt: "Explain a bug or failure you found during development and the evidence or test you used to verify the fix." },
  { id: "revision", prompt: "Name one implementation you would revise for production and explain the risk it currently presents." }
];

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
});
const html = (body, status = 200) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; object-src 'none'", "x-content-type-options": "nosniff" } });
const now = () => Math.floor(Date.now() / 1000);
const uuid = () => crypto.randomUUID();
const randomCode = (len = 6) => {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join("");
};
function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint8Array(1))[0] % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
const enc = new TextEncoder();
async function sha(value) {
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function hmacSha256(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return [...new Uint8Array(signature)].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function audit(env, event) {
  await env.DB.prepare(`INSERT INTO audit_events(id,user_id,event_type,entity_type,entity_id,course_id,details_json)
    VALUES(?,?,?,?,?,?,?)`).bind(
      uuid(),
      event.userId || null,
      event.type,
      event.entityType,
      event.entityId || null,
      event.courseId || COURSE_ID,
      JSON.stringify(event.details || {})
    ).run();
}
function cookieValue(request, name) {
  const raw = request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}
function setCookie(token, maxAge) {
  return `avx_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
function clearCookie() { return "avx_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"; }
function cleanEmail(value) { return String(value || "").trim().toLowerCase().slice(0, 254); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function cleanDisplayName(value) {
  if (typeof value !== "string") return "";
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function adminEmails(env) { return String(env.ADMIN_EMAILS || "").split(",").map(cleanEmail).filter(Boolean); }
function socialProfileLinks(env) {
  const links = {
    linkedin: env.LINKEDIN_URL || null,
    youtube: env.YOUTUBE_URL || null,
    tiktok: env.TIKTOK_URL || null
  };
  for (const [key, value] of Object.entries(links)) {
    if (!value) continue;
    try {
      const url = new URL(String(value));
      links[key] = url.protocol === "https:" && !url.username && !url.password ? url.href : null;
    } catch {
      links[key] = null;
    }
  }
  return links;
}
function hasSocialAttestations(value) {
  return ["linkedin", "youtube", "tiktok"].every(key => value?.[key] === true);
}
function appUrl(env, request) { return (env.APP_URL || new URL(request.url).origin).replace(/\/$/, ""); }
function originOkay(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
async function bodyJson(request) {
  const text = await request.text();
  if (text.length > 20000) throw new Error("Request too large.");
  try { return JSON.parse(text || "{}"); }
  catch { throw Object.assign(new Error("Invalid JSON request."), { status: 400 }); }
}
async function rateLimit(env, key, limit, windowSeconds) {
  const n = now();
  const row = await env.DB.prepare("SELECT window_start, hits FROM rate_limits WHERE key = ?").bind(key).first();
  if (!row || n - row.window_start >= windowSeconds) {
    await env.DB.prepare("INSERT INTO rate_limits(key,window_start,hits) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET window_start=excluded.window_start,hits=1").bind(key, n).run();
    return true;
  }
  if (row.hits >= limit) return false;
  await env.DB.prepare("UPDATE rate_limits SET hits = hits + 1 WHERE key = ?").bind(key).run();
  return true;
}
async function sendEmail(env, to, subject, textBody, htmlBody) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    if (env.ENVIRONMENT === "development") return { delivered: false, development: true };
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
  }

  const sender = env.EMAIL_FROM.match(/<([^<>\s]+)>/)?.[1] || env.EMAIL_FROM;
  const cleanRecipient = String(to);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(sender) ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(cleanRecipient) ||
      /[\r\n]/.test(env.EMAIL_FROM + subject + cleanRecipient)) {
    throw new Error("Email sender, recipient, or subject is invalid.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [cleanRecipient],
      subject,
      text: textBody,
      html: htmlBody
    })
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Resend API returned an invalid response (${response.status}).`);
  }
  if (!response.ok) {
    const detail = typeof result?.message === "string" ? result.message : "request rejected";
    throw new Error(`Resend API rejected email (${response.status}): ${detail}`);
  }
  if (typeof result?.id !== "string" || !result.id) {
    throw new Error("Resend API accepted the request without returning an email ID.");
  }
  return { delivered: true, id: result.id };
}
async function sendCertificateEmail(user, certificate, request, env, actorId = null) {
  const verifyUrl = `${appUrl(env, request)}/verify/${encodeURIComponent(certificate.code)}`;
  const issuedDate = new Date(certificate.issuedAt.replace(" ", "T") + "Z").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const subject = "Your Automivex certificate is ready";
  const text = `Hello ${user.fullName},\n\nYour certificate for ${certificate.courseTitle} has been issued.\n\nCertificate ID: ${certificate.code}\nIssued: ${issuedDate}\nVerify and share your certificate: ${verifyUrl}\n\nYou can use this link to share your certificate on LinkedIn or add it to your Licenses & Certifications profile section.\n\nAutomivex Learning`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><h1 style="font-size:22px">Your certificate is ready</h1><p>Hello ${escapeHtml(user.fullName)},</p><p>Your certificate for <strong>${escapeHtml(certificate.courseTitle)}</strong> has been issued.</p><p><strong>Certificate ID:</strong> ${escapeHtml(certificate.code)}<br><strong>Issued:</strong> ${escapeHtml(issuedDate)}</p><p><a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:12px 18px;background:#0284c7;color:#fff;text-decoration:none;border-radius:6px">Verify and share certificate</a></p><p>You can share this verification link on LinkedIn or add it to your Licenses &amp; Certifications profile section.</p><p>Automivex Learning</p></div>`;
  try {
    const delivery = await sendEmail(env, user.email, subject, text, html);
    if (!delivery.delivered) {
      await audit(env, { userId: user.id, type: "certificate_email_not_sent", entityType: "certificate", entityId: certificate.code, details: { adminId: actorId, development: !!delivery.development } });
      return { sent: false, message: delivery.development ? "Certificate created, but development mode did not send email." : "Certificate created, but email was not sent." };
    }
    await audit(env, { userId: user.id, type: "certificate_email_sent", entityType: "certificate", entityId: certificate.code, details: { adminId: actorId, emailId: delivery.id } });
    return { sent: true, message: "Certificate notification email sent." };
  } catch (error) {
    console.error("Certificate notification email failed", error?.message || error);
    await audit(env, { userId: user.id, type: "certificate_email_failed", entityType: "certificate", entityId: certificate.code, details: { adminId: actorId, reason: String(error?.message || error).slice(0, 300) } });
    return { sent: false, message: "Certificate created, but email delivery failed. An administrator can retry the email." };
  }
}
async function issueCertificateForUser(user, request, env, actorId = null) {
  const progress = await getProgress(user.id, env);
  if (!progress.enrolled || progress.completedLessons < progress.totalLessons || !progress.quizPassed || !progress.project?.passed) {
    return { issued: false, message: "Certificate is not ready: the learner must enroll, complete every lesson, pass the assessment, and submit a passing capstone." };
  }
  if (!hasSocialAttestations(progress.project.socialAttestations)) {
    return { issued: false, message: "Certificate is not ready: all required social-account attestations must be recorded with the capstone." };
  }
  if (progress.project.humanReviewStatus !== "approved") {
    return { issued: false, message: "Certificate is not ready: the capstone must be approved by an administrator." };
  }
  try {
    const rechecked = await verifyGithubRepository(progress.project.githubUrl);
    const legacyTreeSha = progress.project.treeSha === progress.project.commitSha;
    if (!rechecked.passed || rechecked.repositoryId !== progress.project.repositoryId ||
        rechecked.commitSha !== progress.project.commitSha ||
        (rechecked.treeSha !== progress.project.treeSha && !legacyTreeSha)) {
      return { issued: false, message: "Certificate is not ready: the repository changed after review or no longer passes. The learner must resubmit the capstone." };
    }
    progress.project.verifiedTreeSha = rechecked.treeSha;
  } catch (error) {
    return { issued: false, message: `Certificate is not ready: ${error.message || "the repository could not be revalidated."}` };
  }

  let cert = await env.DB.prepare("SELECT certificate_code,recipient_name,course_title,issued_at FROM certificates WHERE user_id=? AND course_id=?").bind(user.id, COURSE_ID).first();
  let created = false;
  if (!cert) {
    const code = `AVX-${new Date().getFullYear()}-${randomCode(26)}`;
    const evidence = {
      courseId: COURSE_ID,
      courseVersion: "2026.1",
      recipientName: user.fullName,
      lessons: progress.completedLessons,
      quizPassed: progress.quizPassed,
      project: progress.project ? { repositoryId: progress.project.repositoryId, commitSha: progress.project.commitSha, treeSha: progress.project.verifiedTreeSha || progress.project.treeSha, score: progress.project.score } : null,
      issuedAt: new Date().toISOString(),
      criteria: "Enrollment, all lesson knowledge checks, 80% final assessment, passed automated capstone checklist, learner self-attestation of required social account follows/subscription, and administrator approval"
    };
    const evidenceJson = JSON.stringify(evidence);
    const signature = await hmacSha256(evidenceJson, env.SESSION_SECRET || "");
    const insertion = await env.DB.prepare(`INSERT OR IGNORE INTO certificates(id,certificate_code,user_id,course_id,recipient_name,course_title,evidence_json,signature)
      VALUES(?,?,?,?,?,?,?,?)`).bind(uuid(), code, user.id, COURSE_ID, user.fullName, COURSE.title, evidenceJson, signature).run();
    created = insertion.meta?.changes === 1;
    cert = await env.DB.prepare("SELECT certificate_code,recipient_name,course_title,issued_at FROM certificates WHERE user_id=? AND course_id=?").bind(user.id, COURSE_ID).first();
    if (!cert) throw new Error("Certificate creation did not produce a readable certificate record.");
    if (created) await audit(env, { userId: user.id, type: "certificate_issued", entityType: "certificate", entityId: cert.certificate_code, details: { courseId: COURSE_ID, courseVersion: "2026.1", adminId: actorId } });
  }
  const result = {
    issued: true,
    created,
    code: cert.certificate_code,
    recipientName: cert.recipient_name,
    verifyUrl: `${appUrl(env, request)}/verify/${encodeURIComponent(cert.certificate_code)}`
  };
  if (created) result.email = await sendCertificateEmail(user, {
    code: cert.certificate_code,
    courseTitle: cert.course_title,
    issuedAt: cert.issued_at
  }, request, env, actorId);
  return result;
}
async function getUser(request, env) {
  const token = cookieValue(request, "avx_session");
  if (!token) return null;
  const hash = await sha(token);
  const row = await env.DB.prepare(`SELECT u.id,u.full_name,u.email,u.role,u.marketing_opt_in,u.created_at,s.expires_at
    FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`).bind(hash, now()).first();
  if (!row) return null;
  return { id: row.id, fullName: row.full_name, email: row.email, role: adminEmails(env).includes(cleanEmail(row.email)) ? "admin" : "student", marketingOptIn: !!row.marketing_opt_in, createdAt: row.created_at };
}
async function requireUser(request, env) {
  const user = await getUser(request, env);
  if (!user) throw Object.assign(new Error("Please sign in to continue."), { status: 401 });
  return user;
}
async function requireAdmin(request, env) {
  const user = await requireUser(request, env);
  if (user.role !== "admin") throw Object.assign(new Error("Administrator access required."), { status: 403 });
  return user;
}
function publicCourse() {
  const lessonIds = COURSE.modules.flatMap(module => module.lessons.map(lesson => lesson.id));
  if (lessonIds.length !== 10 || new Set(lessonIds).size !== lessonIds.length) {
    throw new Error("Invalid course lesson configuration.");
  }
  const videoSections = [];
  for (const id of lessonIds) {
    const video = LESSON_STUDIES[id]?.video;
    const clips = video?.clips?.length ? video.clips : video ? [video] : [];
    if (!clips.length) throw new Error(`Missing video timeline for lesson ${id}.`);
    for (const clip of clips) {
      if (!Number.isInteger(clip.start) || !Number.isInteger(clip.end) || clip.start < 0 || clip.end <= clip.start || !String(clip.title || "").trim()) {
        throw new Error(`Invalid video timeline for lesson ${id}.`);
      }
      videoSections.push({ ...clip, lessonId: id });
    }
  }
  videoSections.sort((a, b) => a.start - b.start);
  for (let index = 1; index < videoSections.length; index++) {
    if (videoSections[index].start !== videoSections[index - 1].end) {
      throw new Error(`Video timeline gap or overlap between lessons ${videoSections[index - 1].lessonId} and ${videoSections[index].lessonId}.`);
    }
  }
  const publicCourse = {
    ...COURSE,
    videoUrl: undefined,
    modules: COURSE.modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => {
        const study = { ...LESSON_STUDIES[l.id] };
        delete study.correctChoice;
        return { ...l, study };
      })
    }))
  };
  delete publicCourse.videoUrl;
  return publicCourse;
}
async function getProgress(userId, env) {
  const completed = await env.DB.prepare("SELECT lesson_id FROM lesson_progress WHERE user_id=? AND course_id=?").bind(userId, COURSE_ID).all();
  const attempts = await env.DB.prepare("SELECT score,total,passed,attempted_at FROM quiz_attempts WHERE user_id=? AND course_id=? ORDER BY attempted_at DESC LIMIT 5").bind(userId, COURSE_ID).all();
  const project = await env.DB.prepare("SELECT github_url,demo_url,score,checks_json,passed,submitted_at,repository_id,commit_sha,tree_sha,verified_branch,human_review_status,review_notes,social_attestations_json FROM project_submissions WHERE user_id=? AND course_id=?").bind(userId, COURSE_ID).first();
  const cert = await env.DB.prepare("SELECT certificate_code,recipient_name,course_title,issued_at,revoked_at FROM certificates WHERE user_id=? AND course_id=?").bind(userId, COURSE_ID).first();
  const enrolled = await env.DB.prepare("SELECT id,enrolled_at FROM enrollments WHERE user_id=? AND course_id=?").bind(userId, COURSE_ID).first();
  const completedIds = (completed.results || []).map(r => r.lesson_id);
  const latestPassed = (attempts.results || []).some(a => a.passed === 1);
  return {
    enrolled: !!enrolled,
    enrolledAt: enrolled?.enrolled_at || null,
    completedLessonIds: completedIds,
    completedLessons: completedIds.length,
    totalLessons: COURSE.modules.reduce((n,m)=>n+m.lessons.length,0),
    quizAttempts: (attempts.results || []).map(a => ({ score: a.score, total: a.total, passed: !!a.passed, attemptedAt: a.attempted_at })),
    quizPassed: latestPassed,
    project: project ? { githubUrl: project.github_url, demoUrl: project.demo_url, score: project.score, checks: JSON.parse(project.checks_json), passed: !!project.passed, submittedAt: project.submitted_at, repositoryId: project.repository_id, commitSha: project.commit_sha, treeSha: project.tree_sha, verifiedBranch: project.verified_branch, humanReviewStatus: project.human_review_status || "pending", reviewNotes: project.review_notes || null, socialAttestations: JSON.parse(project.social_attestations_json || "{}") } : null,
    certificate: cert ? { code: cert.certificate_code, recipientName: cert.recipient_name, courseTitle: cert.course_title, issuedAt: cert.issued_at, revoked: !!cert.revoked_at } : null
  };
}
async function api(request, env) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const path = url.pathname;
  if (!originOkay(request) && method !== "GET" && method !== "HEAD") return json({ error: "Cross-origin request rejected." }, 403);
  try {
    if (path === "/api/health" && method === "GET") return json({ ok: true, service: "Automivex Learning", timestamp: new Date().toISOString() });
    if (path === "/api/course" && method === "GET") return json({ course: publicCourse() });
    if (path === "/api/config" && method === "GET") return json({ links: {
      ...socialProfileLinks(env),
      github: env.GITHUB_ORG_URL || null,
      whatsapp: env.WHATSAPP_COMMUNITY_URL || null,
      company: "https://www.automivex.com"
    }});

    if (path === "/api/auth/start" && method === "POST") {
      if (!env.SESSION_SECRET || String(env.SESSION_SECRET).length < 32) return json({ error: "Platform authentication is not configured. Please contact Automivex." }, 503);
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      if (!(await rateLimit(env, `otp-ip:${ip}`, 5, 3600))) return json({ error: "Too many sign-in requests. Try again in an hour." }, 429);
      const b = await bodyJson(request);
      const email = cleanEmail(b.email);
      const intent = b.intent === "signup" ? "signup" : "signin";
      const fullName = cleanDisplayName(b.fullName).slice(0, 100);
      if (!validEmail(email)) return json({ error: "Enter a valid email address." }, 400);
      if (intent === "signup" && fullName.length < 1) return json({ error: "Enter the name you want shown on your learner account and certificate." }, 400);
      if (intent === "signup" && b.acceptTerms !== true) return json({ error: "Accept the programme terms and privacy notice before creating an account." }, 400);
      if (!(await rateLimit(env, `otp-email:${email}`, 3, 3600))) return json({ error: "Too many codes requested for this email. Try again later." }, 429);
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
      const codeHash = await sha(`${email}:${code}:${env.SESSION_SECRET}`);
      const timestamp = now();
      await env.DB.prepare(`INSERT INTO email_codes(email,code_hash,full_name,marketing_opt_in,expires_at,sent_at,attempts)
        VALUES(?,?,?,?,?,?,0) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,full_name=excluded.full_name,marketing_opt_in=excluded.marketing_opt_in,expires_at=excluded.expires_at,sent_at=excluded.sent_at,attempts=0`)
        .bind(email, codeHash, intent === "signup" ? fullName : null, b.marketingOptIn ? 1 : 0, timestamp + 600, timestamp).run();
      const sent = await sendEmail(env, email, "Your Automivex sign-in code", `Your one-time code is ${code}. It expires in 10 minutes. If you did not request it, ignore this email.`, `<div style="font-family:Arial,sans-serif"><h2>Automivex sign-in</h2><p>Your one-time code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>`);
      const response = { ok: true, message: "If email delivery is configured, a one-time code has been sent. Codes expire in 10 minutes; only your latest code works." };
      if (sent.development) response.debugCode = code;
      return json(response);
    }

    if (path === "/api/auth/verify" && method === "POST") {
      const b = await bodyJson(request);
      const email = cleanEmail(b.email);
      const code = String(b.code || "").trim();
      if (!validEmail(email) || !/^\d{6}$/.test(code)) return json({ error: "Enter the email address and six-digit code." }, 400);
      const row = await env.DB.prepare("SELECT * FROM email_codes WHERE email=?").bind(email).first();
      if (!row || row.expires_at < now() || row.attempts >= 5) return json({ error: "Code expired or unavailable. Request a new code." }, 400);
      const submittedHash = await sha(`${email}:${code}:${env.SESSION_SECRET}`);
      if (submittedHash !== row.code_hash) {
        await env.DB.prepare("UPDATE email_codes SET attempts=attempts+1 WHERE email=?").bind(email).run();
        return json({ error: "Incorrect code. Check your email and try again." }, 400);
      }
      let user = await env.DB.prepare("SELECT id,full_name,email,role,marketing_opt_in FROM users WHERE email=?").bind(email).first();
      if (!user && !row.full_name) {
        await env.DB.prepare("DELETE FROM email_codes WHERE email=?").bind(email).run();
        return json({ error: "No learner account was found for this email. Choose Create account to register." }, 404);
      }
      const role = adminEmails(env).includes(email) ? "admin" : "student";
      if (!user) {
        user = { id: uuid(), full_name: row.full_name, email, role, marketing_opt_in: row.marketing_opt_in };
        await env.DB.prepare(`INSERT INTO users(id,full_name,email,role,marketing_opt_in,terms_accepted_at,terms_version,privacy_version)
          VALUES(?,?,?,?,?,datetime('now'),'2026-11','2026-11')`).bind(user.id,user.full_name,email,role,row.marketing_opt_in).run();
      } else if (user.role !== "admin" && role === "admin") {
        await env.DB.prepare("UPDATE users SET role='admin',updated_at=datetime('now') WHERE id=?").bind(user.id).run();
        user.role = "admin";
      }
      await env.DB.prepare("DELETE FROM email_codes WHERE email=?").bind(email).run();
      const token = randomCode(48) + randomCode(48);
      const tokenHash = await sha(token);
      await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(tokenHash,user.id,now()+60*60*24*14).run();
      return json({ ok: true, user: { id:user.id, fullName:user.full_name, email:user.email, role:user.role } }, 200, { "set-cookie": setCookie(token, 60*60*24*14) });
    }

    if (path === "/api/auth/logout" && method === "POST") {
      const token = cookieValue(request, "avx_session");
      if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha(token)).run();
      return json({ ok: true }, 200, { "set-cookie": clearCookie() });
    }

    if (path === "/api/account" && method === "DELETE") {
      const user = await requireUser(request, env);
      await env.DB.prepare("DELETE FROM users WHERE id=?").bind(user.id).run();
      return json({ ok: true, message: "Your learning account and associated learning records have been deleted." }, 200, { "set-cookie": clearCookie() });
    }

    if (path === "/api/me" && method === "GET") {
      const user = await getUser(request, env);
      if (!user) return json({ user: null });
      const progress = await getProgress(user.id, env);
      return json({ user, progress });
    }

    if (path === "/api/profile" && method === "PUT") {
      const user = await requireUser(request, env);
      const b = await bodyJson(request);
      const fullName = cleanDisplayName(b.fullName);
      if (fullName.length < 1 || fullName.length > 100 || /[\u0000-\u001f\u007f]/.test(fullName)) {
        return json({ error: "Enter the name you want displayed, using 1 to 100 characters." }, 400);
      }
      const certificate = await env.DB.prepare("SELECT certificate_code FROM certificates WHERE user_id=? AND course_id=? LIMIT 1").bind(user.id,COURSE_ID).first();
      if (certificate) return json({ error: "Your certificate name is locked after issuance. Contact support if the issued name needs correction." }, 409);
      await env.DB.prepare("UPDATE users SET full_name=?,updated_at=datetime('now') WHERE id=?").bind(fullName,user.id).run();
      const updatedUser = await getUser(request, env);
      return json({ ok: true, user: updatedUser });
    }

    if (path === "/api/enroll" && method === "POST") {
      const user = await requireUser(request, env);
      await env.DB.prepare("INSERT OR IGNORE INTO enrollments(id,user_id,course_id) VALUES(?,?,?)").bind(uuid(),user.id,COURSE_ID).run();
      return json({ ok: true, progress: await getProgress(user.id, env) });
    }

    if (path.startsWith("/api/lessons/") && path.endsWith("/complete") && method === "POST") {
      const user = await requireUser(request, env);
      const lessonId = path.split("/")[3];
      const allLessons = COURSE.modules.flatMap(m=>m.lessons);
      if (!allLessons.some(l=>l.id===lessonId)) return json({ error: "Lesson not found." }, 404);
      const enrolled = await env.DB.prepare("SELECT id FROM enrollments WHERE user_id=? AND course_id=?").bind(user.id,COURSE_ID).first();
      if (!enrolled) return json({ error: "Enroll in the course first." }, 400);
      const study = LESSON_STUDIES[lessonId];
      const b = await bodyJson(request);
      const selectedChoice = Number(b.choice);
      const reflection = String(b.reflection || "").trim().replace(/\s+/g, " ").slice(0, 1000);
      if (!study?.checkChoices || !Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice >= study.checkChoices.length) {
        return json({ error: "Choose an answer before completing the lesson." }, 400);
      }
      if (reflection.length < 40) {
        return json({ error: "Write at least 40 characters explaining how you would apply this concept." }, 400);
      }
      const passed = selectedChoice === study.correctChoice;
      const reflectionHash = await sha(reflection);
      await env.DB.prepare(`INSERT INTO lesson_check_attempts(id,user_id,course_id,lesson_id,passed,reflection_length,reflection_sha256,choice_value,policy_version)
        VALUES(?,?,?,?,?,?,?,?,?)`).bind(uuid(), user.id, COURSE_ID, lessonId, passed ? 1 : 0, reflection.length, reflectionHash, selectedChoice, "2026.1").run();
      if (!passed) {
        await audit(env, { userId: user.id, type: "lesson_check_failed", entityType: "lesson", entityId: lessonId, details: { reflectionLength: reflection.length } });
        return json({ ok: false, passed: false, error: "That answer is not correct. Review the concept and try again." }, 400, { "retry-after": "30" });
      }
      const lessonIndex = allLessons.findIndex(l=>l.id===lessonId);
      if (lessonIndex > 0) {
        const previousId = allLessons[lessonIndex-1].id;
        const previous = await env.DB.prepare("SELECT id FROM lesson_progress WHERE user_id=? AND course_id=? AND lesson_id=?")
          .bind(user.id, COURSE_ID, previousId).first();
        if (!previous) return json({ error: "Complete the previous lesson before starting this section." }, 400);
      }
      await env.DB.prepare("INSERT OR IGNORE INTO lesson_progress(id,user_id,course_id,lesson_id) VALUES(?,?,?,?)").bind(uuid(),user.id,COURSE_ID,lessonId).run();
      await audit(env, { userId: user.id, type: "lesson_completed", entityType: "lesson", entityId: lessonId, details: { reflectionLength: reflection.length } });
      return json({ ok: true, progress: await getProgress(user.id, env) });
    }

    if (path === "/api/quiz" && method === "GET") {
      const user = await requireUser(request, env);
      const progress = await getProgress(user.id, env);
      if (!progress.enrolled) return json({ error: "Enroll in the course first." }, 400);
      if (progress.completedLessons < progress.totalLessons) return json({ error: "Complete every learning milestone before starting the final assessment." }, 400);
      const nonce = uuid();
      const nonceHash = await sha(nonce);
      const variant = shuffled(QUESTIONS).map(q => {
        const choices = shuffled(q.a.map((text, originalIndex) => ({ text, originalIndex })));
        return { id: q.id, question: q.q, choices: choices.map(choice => choice.text), correct: choices.findIndex(choice => choice.originalIndex === q.correct) };
      });
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19);
      await env.DB.prepare(`INSERT INTO assessment_sessions(id,user_id,course_id,nonce_hash,variant_json,expires_at)
        VALUES(?,?,?,?,?,?)`).bind(uuid(), user.id, COURSE_ID, nonceHash, JSON.stringify(variant), expiresAt).run();
      return json({
        nonce,
        questions: variant.map(q=>({ id:q.id, question:q.question, choices:q.choices })),
        prompts: ASSESSMENT_PROMPTS
      });
    }

    if (path === "/api/quiz/submit" && method === "POST") {
      const user = await requireUser(request, env);
      if (!(await rateLimit(env, `quiz:${user.id}`, 12, 3600))) return json({ error: "Assessment retry limit reached for this hour. Review the material and try later." }, 429);
      const b = await bodyJson(request);
      const enrolled = await env.DB.prepare("SELECT id FROM enrollments WHERE user_id=? AND course_id=?").bind(user.id,COURSE_ID).first();
      if (!enrolled) return json({ error: "Enroll in the course first." }, 400);
      const progress = await getProgress(user.id, env);
      if (progress.completedLessons < progress.totalLessons) return json({ error: "Complete every learning milestone before starting the final assessment." }, 400);
      const answers = b.answers || {};
      if (!b.nonce || typeof b.nonce !== "string") return json({ error: "Start the assessment before submitting it." }, 400);
      const nonceHash = await sha(b.nonce);
      const session = await env.DB.prepare(`SELECT id,variant_json,started_at,expires_at,submitted_at FROM assessment_sessions
        WHERE nonce_hash=? AND user_id=? AND course_id=?`).bind(nonceHash, user.id, COURSE_ID).first();
      if (!session) return json({ error: "This assessment session is invalid." }, 400);
      if (session.submitted_at) return json({ error: "This assessment attempt has already been submitted." }, 400);
      const nowIso = new Date().toISOString().replace("T", " ").slice(0, 19);
      if (session.expires_at < nowIso) return json({ error: "This assessment session has expired. Start a new attempt." }, 400);
      const integrity = b.integrity || {};
      const elapsedSeconds = Number(integrity.elapsedSeconds || 0);
      if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 30) return json({ error: "Spend at least 30 seconds completing the assessment." }, 400);
      const serverStartedAt = new Date(`${session.started_at.replace(" ", "T")}Z`).getTime();
      if (!Number.isFinite(serverStartedAt) || Date.now() - serverStartedAt < 30_000) {
        return json({ error: "Spend at least 30 seconds completing the assessment before submitting." }, 400);
      }
      if (Number(integrity.visibilityHiddenCount || 0) > 0 || Number(integrity.focusLossCount || 0) > 0) {
        await env.DB.prepare("UPDATE assessment_sessions SET invalid_reason=?, submitted_at=datetime('now') WHERE id=?")
          .bind("focus_or_tab_integrity_event", session.id).run();
        await audit(env, { userId: user.id, type: "quiz_integrity_rejected", entityType: "assessment", details: { visibilityHiddenCount: Number(integrity.visibilityHiddenCount || 0), focusLossCount: Number(integrity.focusLossCount || 0) } });
        return json({ error: "The assessment session detected a focus change or hidden tab. Restart and complete it without switching applications or browser tabs." }, 400);
      }
      if (Number(integrity.pasteAttempts || 0) > 0 || Number(integrity.copyAttempts || 0) > 0) {
        await env.DB.prepare("UPDATE assessment_sessions SET invalid_reason=?, submitted_at=datetime('now') WHERE id=?")
          .bind("copy_or_paste_integrity_event", session.id).run();
        await audit(env, { userId: user.id, type: "quiz_integrity_rejected", entityType: "assessment", details: { pasteAttempts: Number(integrity.pasteAttempts || 0), copyAttempts: Number(integrity.copyAttempts || 0) } });
        return json({ error: "Copying or pasting was detected. Restart the assessment and write the evidence in your own words." }, 400);
      }
      if (Number(integrity.fullscreenExitedCount || 0) > 0) {
        await env.DB.prepare("UPDATE assessment_sessions SET invalid_reason=?, submitted_at=datetime('now') WHERE id=?")
          .bind("fullscreen_exited", session.id).run();
        await audit(env, { userId: user.id, type: "quiz_integrity_rejected", entityType: "assessment", details: { fullscreenExitedCount: Number(integrity.fullscreenExitedCount || 0) } });
        return json({ error: "The assessment session detected an exit from fullscreen mode. Restart and keep the assessment fullscreen." }, 400);
      }
      const variant = JSON.parse(session.variant_json);
      let score = 0;
      for (const q of variant) if (Number(answers[q.id]) === q.correct) score++;
      const writtenEvidence = {};
      for (const prompt of ASSESSMENT_PROMPTS) {
        const text = String(b.evidence?.[prompt.id] || "").trim().replace(/\s+/g, " ");
        if (text.length < 120) return json({ error: `Complete the written evidence: “${prompt.prompt}” Use at least 120 characters.` }, 400);
        writtenEvidence[prompt.id] = text.slice(0, 3000);
      }
      if (!b.aiDeclaration) return json({ error: "Confirm the AI-use declaration before submitting the assessment." }, 400);
      const knowledgePassed = score / QUESTIONS.length >= 0.8;
      const passed = knowledgePassed && Object.values(writtenEvidence).every(text => text.length >= 120);
      const normalizedAnswers = Object.keys(answers).sort().reduce((v,k)=>{v[k]=answers[k];return v;}, {});
      const evidenceHash = await sha(JSON.stringify({ score, answers: normalizedAnswers, evidence: writtenEvidence, aiDeclaration: true }));
      await env.DB.prepare("INSERT INTO quiz_attempts(id,user_id,course_id,score,total,passed,evidence_sha256,policy_version) VALUES(?,?,?,?,?,?,?,?)").bind(uuid(),user.id,COURSE_ID,score,QUESTIONS.length,passed?1:0,evidenceHash,"2026.2").run();
      await env.DB.prepare("UPDATE assessment_sessions SET submitted_at=datetime('now') WHERE id=?").bind(session.id).run();
      await audit(env, { userId: user.id, type: "quiz_submitted", entityType: "assessment", details: { score, total: QUESTIONS.length, passed, elapsedSeconds, fullscreenEntered: !!integrity.fullscreenEntered } });
      return json({ ok: true, score, total: QUESTIONS.length, percentage: Math.round(score/QUESTIONS.length*100), passed, message: passed ? "Assessment passed: knowledge and written evidence recorded." : "You need at least 80% and complete written evidence. Review the course and try again." });
    }

    if (path === "/api/project/submit" && method === "POST") {
      const user = await requireUser(request, env);
      if (!(await rateLimit(env, `project:${user.id}`, 5, 3600))) return json({ error: "Too many repository checks. Please wait before submitting again." }, 429);
      const b = await bodyJson(request);
      const progress = await getProgress(user.id, env);
      if (!progress.enrolled) return json({ error: "Enroll in the course first." }, 400);
      if (progress.completedLessons < progress.totalLessons) return json({ error: "Complete all learning milestones before submitting your capstone." }, 400);
      if (!progress.quizPassed) return json({ error: "Pass the final assessment before submitting your capstone." }, 400);
      if (!b.declaration) return json({ error: "Confirm that this is your own work and that you have permission to publish the repository." }, 400);
      const links = socialProfileLinks(env);
      if (Object.values(links).some(link => !link)) return json({ error: "LinkedIn, YouTube and TikTok profile URLs must be configured before capstone submission is available." }, 503);
      if (!hasSocialAttestations(b.socialAttestations)) return json({ error: "Confirm that you followed the configured LinkedIn and TikTok accounts and subscribed to the YouTube channel." }, 400);
      if (b.demoUrl) {
        let demo;
        try { demo = new URL(String(b.demoUrl)); } catch { return json({ error: "Enter a valid HTTPS demo URL or leave it blank." }, 400); }
        if (demo.protocol !== "https:") return json({ error: "Demo links must use HTTPS." }, 400);
      }
      const checked = await verifyGithubRepository(String(b.githubUrl || ""));
      await env.DB.prepare(`INSERT INTO project_submissions(id,user_id,course_id,github_url,demo_url,repo_owner,repo_name,score,checks_json,passed,repository_id,commit_sha,tree_sha,verified_branch,verification_json,human_review_status,social_attestations_json)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,course_id) DO UPDATE SET github_url=excluded.github_url,demo_url=excluded.demo_url,repo_owner=excluded.repo_owner,repo_name=excluded.repo_name,score=excluded.score,checks_json=excluded.checks_json,passed=excluded.passed,repository_id=excluded.repository_id,commit_sha=excluded.commit_sha,tree_sha=excluded.tree_sha,verified_branch=excluded.verified_branch,verification_json=excluded.verification_json,human_review_status='pending',reviewer_id=NULL,review_notes=NULL,reviewed_at=NULL,submitted_at=datetime('now'),social_attestations_json=excluded.social_attestations_json`)
        .bind(uuid(),user.id,COURSE_ID,checked.url,String(b.demoUrl||"").slice(0,500)||null,checked.owner,checked.repo,checked.score,JSON.stringify(checked.checks),checked.passed?1:0,checked.repositoryId,checked.commitSha,checked.treeSha,checked.defaultBranch,JSON.stringify({ checkedAt: checked.checkedAt, commitSha: checked.commitSha, treeSha: checked.treeSha }),"pending",JSON.stringify({ linkedin:true, youtube:true, tiktok:true })).run();
      await audit(env, { userId: user.id, type: "project_checked", entityType: "project_submission", details: { repositoryId: checked.repositoryId, commitSha: checked.commitSha, passed: checked.passed, score: checked.score, socialAttestations: true } });
      return json({ ok: true, result: checked, progress: await getProgress(user.id, env) });
    }

    if (path === "/api/admin/projects/review" && method === "POST") {
      const admin = await requireAdmin(request, env);
      const b = await bodyJson(request);
      const status = String(b.status || "");
      if (!["approved", "rejected"].includes(status)) return json({ error: "Review status must be approved or rejected." }, 400);
      const submissionId = String(b.submissionId || "").slice(0,100);
      const submission = await env.DB.prepare("SELECT id,user_id,passed,social_attestations_json FROM project_submissions WHERE id=?").bind(submissionId).first();
      if (!submission) return json({ error: "Project submission not found." }, 404);
      if (status === "approved" && (!submission.passed || !hasSocialAttestations(JSON.parse(submission.social_attestations_json || "{}")))) {
        return json({ error: "A passing capstone check and all learner social-account attestations are required before approval." }, 400);
      }
      const notes = String(b.notes || "").trim().slice(0,2000);
      await env.DB.prepare("UPDATE project_submissions SET human_review_status=?,reviewer_id=?,review_notes=?,reviewed_at=datetime('now') WHERE id=?")
        .bind(status, admin.id, notes || null, submissionId).run();
      await audit(env, { userId: submission.user_id, type: "project_reviewed", entityType: "project_submission", entityId: submissionId, details: { status, reviewerId: admin.id, notesLength: notes.length } });
      let certificate = null;
      if (status === "approved") {
        const learner = await env.DB.prepare("SELECT id,full_name,email FROM users WHERE id=?").bind(submission.user_id).first();
        if (learner) {
          try {
            certificate = await issueCertificateForUser({ id: learner.id, fullName: learner.full_name, email: learner.email }, request, env, admin.id);
          } catch (error) {
            console.error("Certificate generation after capstone approval failed", error?.message || error);
            certificate = { issued: false, message: "Capstone approval was saved, but certificate generation failed. Use Issue certificate to retry." };
          }
        } else {
          certificate = { issued: false, message: "Capstone approval was saved, but the learner account could not be found." };
        }
      }
      return json({ ok: true, certificate });
    }

    if (path === "/api/admin/certificate/issue" && method === "POST") {
      const admin = await requireAdmin(request, env);
      const b = await bodyJson(request);
      const submissionId = String(b.submissionId || "").slice(0, 100);
      const submission = await env.DB.prepare(`SELECT p.id,p.user_id,p.human_review_status,u.full_name,u.email
        FROM project_submissions p JOIN users u ON u.id=p.user_id WHERE p.id=? AND p.course_id=?`)
        .bind(submissionId, COURSE_ID).first();
      if (!submission) return json({ error: "Capstone submission not found." }, 404);
      if (submission.human_review_status !== "approved") return json({ error: "Approve the capstone before issuing its certificate." }, 409);
      const certificate = await issueCertificateForUser({
        id: submission.user_id,
        fullName: submission.full_name,
        email: submission.email
      }, request, env, admin.id);
      if (!certificate.issued) return json({ error: certificate.message }, 409);
      return json({ ok: true, ...certificate });
    }

    if (path === "/api/admin/certificates/email" && method === "POST") {
      const admin = await requireAdmin(request, env);
      const b = await bodyJson(request);
      const code = String(b.code || "").trim().slice(0, 100);
      const certificate = await env.DB.prepare(`SELECT c.certificate_code,c.course_title,c.issued_at,c.revoked_at,c.recipient_name,c.evidence_json,c.signature,u.id AS user_id,u.full_name,u.email
        FROM certificates c JOIN users u ON u.id=c.user_id WHERE c.certificate_code=?`).bind(code).first();
      if (!certificate) return json({ error: "Certificate not found." }, 404);
      if (certificate.revoked_at) return json({ error: "A revoked certificate email cannot be resent." }, 409);
      let evidence;
      try {
        evidence = JSON.parse(certificate.evidence_json || "null");
      } catch {
        return json({ error: "The certificate evidence is invalid; its email cannot be resent." }, 409);
      }
      if (!certificate.signature || !evidence || typeof evidence !== "object" || Array.isArray(evidence) ||
          (evidence.recipientName !== undefined && evidence.recipientName !== certificate.recipient_name) ||
          await hmacSha256(certificate.evidence_json, env.SESSION_SECRET || "") !== certificate.signature) {
        return json({ error: "The certificate signature is invalid; its email cannot be resent." }, 409);
      }
      const email = await sendCertificateEmail({
        id: certificate.user_id,
        fullName: certificate.full_name,
        email: certificate.email
      }, {
        code: certificate.certificate_code,
        courseTitle: certificate.course_title,
        issuedAt: certificate.issued_at
      }, request, env, admin.id);
      if (!email.sent) return json({ error: email.message, emailSent: false }, 503);
      return json({ ok: true, code, emailSent: true, message: email.message });
    }

    if (path === "/api/admin/certificates" && method === "GET") {
      await requireAdmin(request, env);
      const search = String(url.searchParams.get("q") || "").trim().slice(0, 254);
      const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      const certificates = await env.DB.prepare(`SELECT c.certificate_code,c.recipient_name,c.course_title,c.issued_at,c.revoked_at,c.evidence_json,c.signature,u.full_name,u.email
        FROM certificates c JOIN users u ON u.id=c.user_id
        WHERE ?='' OR c.certificate_code LIKE ? ESCAPE '\\' COLLATE NOCASE
          OR c.recipient_name LIKE ? ESCAPE '\\' COLLATE NOCASE
          OR u.full_name LIKE ? ESCAPE '\\' COLLATE NOCASE
          OR u.email LIKE ? ESCAPE '\\' COLLATE NOCASE
        ORDER BY c.issued_at DESC LIMIT 100`).bind(search, pattern, pattern, pattern, pattern).all();
      const listedCertificates = await Promise.all((certificates.results || []).map(async certificate => {
        let evidence = null;
        try { evidence = certificate.evidence_json ? JSON.parse(certificate.evidence_json) : null; }
        catch { evidence = null; }
        const validEvidence = !!evidence && typeof evidence === "object" && !Array.isArray(evidence);
        const nameMatches = validEvidence && (evidence.recipientName === undefined || evidence.recipientName === certificate.recipient_name);
        const integrityValid = validEvidence && !!certificate.signature && nameMatches &&
          await hmacSha256(certificate.evidence_json, env.SESSION_SECRET || "") === certificate.signature;
        return {
          code: certificate.certificate_code,
          recipientName: certificate.recipient_name,
          courseTitle: certificate.course_title,
          issuedAt: certificate.issued_at,
          revoked: !!certificate.revoked_at,
          corrected: !!evidence?.nameCorrection,
          integrityValid,
          learnerName: certificate.full_name,
          email: certificate.email
        };
      }));
      return json({ certificates: listedCertificates });
    }

    if (path === "/api/admin/certificates/name" && method === "POST") {
      const admin = await requireAdmin(request, env);
      const b = await bodyJson(request);
      const code = String(b.code || "").trim().slice(0, 100);
      const fullName = cleanDisplayName(b.fullName);
      const reason = String(b.reason || "").trim().replace(/\s+/g, " ").slice(0, 500);
      if (!code || fullName.length < 1 || fullName.length > 100 || /[\u0000-\u001f\u007f]/.test(fullName)) {
        return json({ error: "Enter a valid certificate ID and recipient name (1 to 100 characters)." }, 400);
      }
      if (reason.length < 10) return json({ error: "Enter a correction reason of at least 10 characters." }, 400);
      const certificate = await env.DB.prepare(`SELECT id,user_id,recipient_name,course_id,evidence_json,signature,revoked_at
        FROM certificates WHERE certificate_code=?`).bind(code).first();
      if (!certificate) return json({ error: "Certificate not found." }, 404);
      if (certificate.revoked_at) return json({ error: "A revoked certificate cannot be corrected." }, 409);
      if (certificate.recipient_name === fullName) return json({ error: "The certificate already has this recipient name." }, 400);
      if (!certificate.evidence_json || !certificate.signature ||
          await hmacSha256(certificate.evidence_json, env.SESSION_SECRET || "") !== certificate.signature) {
        return json({ error: "The certificate signature is invalid. It cannot be corrected safely." }, 409);
      }
      let evidence;
      try {
        evidence = JSON.parse(certificate.evidence_json);
      } catch {
        return json({ error: "The certificate evidence is invalid. It cannot be corrected safely." }, 409);
      }
      if (!evidence || typeof evidence !== "object" || Array.isArray(evidence) ||
          (evidence.recipientName !== undefined && evidence.recipientName !== certificate.recipient_name)) {
        return json({ error: "The signed recipient name does not match this certificate. It cannot be corrected safely." }, 409);
      }
      const previousName = certificate.recipient_name;
      const revision = Number(evidence.nameCorrection?.revision || 0) + 1;
      evidence.recipientName = fullName;
      evidence.nameCorrection = { revision, correctedAt: new Date().toISOString() };
      const evidenceJson = JSON.stringify(evidence);
      const signature = await hmacSha256(evidenceJson, env.SESSION_SECRET || "");
      const auditId = uuid();
      const details = JSON.stringify({ adminId: admin.id, previousName, correctedName: fullName, reason, revision });
      const results = await env.DB.batch([
        env.DB.prepare(`UPDATE certificates SET recipient_name=?,evidence_json=?,signature=?
          WHERE certificate_code=? AND recipient_name=? AND signature=? AND revoked_at IS NULL`)
          .bind(fullName, evidenceJson, signature, code, previousName, certificate.signature),
        env.DB.prepare(`INSERT INTO audit_events(id,user_id,event_type,entity_type,entity_id,course_id,details_json)
          SELECT ?,?,'certificate_name_corrected','certificate',?,?,?
          WHERE changes()=1 AND EXISTS(SELECT 1 FROM certificates WHERE certificate_code=? AND recipient_name=? AND signature=?)`)
          .bind(auditId, certificate.user_id, code, certificate.course_id, details, code, fullName, signature)
      ]);
      if (results[0]?.meta?.changes !== 1 || results[1]?.meta?.changes !== 1) {
        return json({ error: "The certificate changed while this correction was being saved. Reload and try again." }, 409);
      }
      return json({ ok: true, code, recipientName: fullName, corrected: true, revision });
    }

    if (path === "/api/certificate/issue" && method === "POST") {
      const user = await requireUser(request, env);
      const certificate = await issueCertificateForUser(user, request, env);
      if (!certificate.issued) return json({ error: certificate.message }, 409);
      return json({ ok: true, ...certificate });
    }

    if (path.startsWith("/api/certificates/") && method === "GET") {
      const match = path.match(/^\/api\/certificates\/([^/]+)$/);
      const code = match?.[1] || "";
      if (!CERTIFICATE_CODE_PATTERN.test(code)) return json({ valid: false, status: "not_found" }, 404);
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      if (!(await rateLimit(env, `certificate-verify:${ip}`, 60, 60))) {
        return json({ valid: false, status: "rate_limited" }, 429, { "retry-after": "60" });
      }
      const cert = await env.DB.prepare(`SELECT certificate_code,recipient_name,course_title,issued_at,revoked_at,evidence_json,signature
        FROM certificates WHERE certificate_code=?`).bind(code).first();
      if (!cert) return json({ valid: false, status: "not_found" }, 404);
      let evidence = null;
      try { evidence = cert.evidence_json ? JSON.parse(cert.evidence_json) : null; }
      catch { evidence = null; }
      let signatureValid = false;
      if (cert.evidence_json && cert.signature && evidence && typeof evidence === "object" && !Array.isArray(evidence)) {
        const signedNameMatches = evidence.recipientName === undefined || evidence.recipientName === cert.recipient_name;
        signatureValid = signedNameMatches && await hmacSha256(cert.evidence_json, env.SESSION_SECRET || "") === cert.signature;
      }
      return json({ valid: !cert.revoked_at && signatureValid, code: cert.certificate_code, recipientName: cert.recipient_name, courseTitle: cert.course_title, issuedAt: cert.issued_at, issuer: "Automivex", status: cert.revoked_at ? "revoked" : signatureValid ? "valid" : "invalid_signature" });
    }

    if (path === "/api/admin/overview" && method === "GET") {
      await requireAdmin(request, env);
      const [users,enrollments,projects,certificates] = await Promise.all([
        env.DB.prepare("SELECT COUNT(*) AS n FROM users").first(), env.DB.prepare("SELECT COUNT(*) AS n FROM enrollments").first(),
        env.DB.prepare("SELECT COUNT(*) AS n FROM project_submissions").first(), env.DB.prepare("SELECT COUNT(*) AS n FROM certificates WHERE revoked_at IS NULL").first()
      ]);
      const submissions = await env.DB.prepare(`SELECT p.id,p.github_url,p.score,p.passed,p.submitted_at,p.human_review_status,p.review_notes,p.social_attestations_json,u.full_name,u.email
        FROM project_submissions p JOIN users u ON u.id=p.user_id ORDER BY p.submitted_at DESC LIMIT 100`).all();
      return json({ counts: { users:users.n, enrollments:enrollments.n, projects:projects.n, certificates:certificates.n }, submissions: (submissions.results || []).map(submission=>({...submission,social_attestations:JSON.parse(submission.social_attestations_json||"{}")})) });
    }

    return json({ error: "Not found." }, 404);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error("API error", err?.message || err);
    return json({ error: status >= 500 ? (env.ENVIRONMENT === "development" ? err.message : "Something went wrong. Please try again later.") : err.message }, status);
  }
}

async function verificationPageThemed(request, env) {
  const match = new URL(request.url).pathname.match(/^\/verify\/([^/]+)$/);
  const code = match?.[1] || "";
  const head = (title, description, canonical) => `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#090d16"><meta property="og:type" content="website"><meta property="og:site_name" content="Automivex Learning"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta name="twitter:card" content="summary"><link rel="canonical" href="${escapeHtml(canonical)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><script src="/theme.js"></script><link rel="stylesheet" href="/styles.css"><title>${escapeHtml(title)}</title></head>`;
  const notFound = () => {
    const notFoundUrl = `${appUrl(env, request)}/verify/`;
    return html(`<!doctype html><html lang="en">${head("Certificate not found","This certificate ID could not be verified.",notFoundUrl)}<body><main class="verification-page"><div class="verification-container"><button class="theme-toggle verification-theme" type="button" aria-label="Switch theme" title="Switch theme">Switch theme</button><section class="verification-card"><div class="eyebrow">AUTOMIVEX VERIFICATION</div><h1>Certificate not found</h1><p>This certificate ID could not be verified.</p><a class="btn outline" href="/">Return to Automivex</a></section></div></main></body></html>`,404);
  };
  if (!CERTIFICATE_CODE_PATTERN.test(code)) return notFound();
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await rateLimit(env, `certificate-verify:${ip}`, 60, 60))) {
    return html(`<!doctype html><html lang="en">${head("Try again later","Certificate verification is temporarily rate limited.",new URL(request.url).href)}<body><main class="verification-page"><div class="verification-container"><section class="verification-card"><div class="eyebrow">AUTOMIVEX VERIFICATION</div><h1>Try again later</h1><p>Too many verification requests. Please wait a minute and try again.</p></section></div></main></body></html>`,429);
  }
  const cert = await env.DB.prepare(`SELECT certificate_code,recipient_name,course_title,issued_at,revoked_at,evidence_json,signature
    FROM certificates WHERE certificate_code=?`).bind(code).first();
  if (!cert) return notFound();
  const verifyUrl = `${appUrl(env, request)}/verify/${encodeURIComponent(cert.certificate_code)}`;
  let evidence = null;
  try { evidence = cert.evidence_json ? JSON.parse(cert.evidence_json) : null; }
  catch { evidence = null; }
  const validEvidence = !!evidence && typeof evidence === "object" && !Array.isArray(evidence);
  const signedNameMatches = validEvidence && (evidence.recipientName === undefined || evidence.recipientName === cert.recipient_name);
  const signatureValid = !!cert.evidence_json && !!cert.signature && signedNameMatches &&
    await hmacSha256(cert.evidence_json, env.SESSION_SECRET || "") === cert.signature;
  const valid = !cert.revoked_at && signatureValid;
  const date = new Date(cert.issued_at.replace(" ","T")+"Z").toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
  const status = valid ? "VALID CERTIFICATE" : cert.revoked_at ? "REVOKED CERTIFICATE" : "INVALID SIGNATURE";
  const statusClass = valid ? "valid" : "invalid";
  const title = `${cert.recipient_name} — ${cert.course_title} certificate`;
  const description = valid
    ? `Verify ${cert.recipient_name}'s Automivex certificate for ${cert.course_title}. Certificate ID ${cert.certificate_code}.`
    : `Automivex certificate status: ${status.toLowerCase()}. Certificate ID ${cert.certificate_code}.`;
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
  return html(`<!doctype html><html lang="en">${head(title, description, verifyUrl)}<body><main class="verification-page"><div class="verification-container"><button class="theme-toggle verification-theme" type="button" aria-label="Switch theme" title="Switch theme">Switch theme</button><section class="verification-card"><div class="eyebrow">AUTOMIVEX VERIFICATION</div><h1>Certificate verification</h1><span class="verification-status ${statusClass}">${status}</span><p class="verification-intro">This confirms that</p><h2>${escapeHtml(cert.recipient_name)}</h2><p>completed the practical learning programme</p><h3>${escapeHtml(cert.course_title)}</h3><p class="verification-date">Issued ${escapeHtml(date)}</p><hr><p class="verification-id-label">CERTIFICATE ID</p><strong class="verification-id">${escapeHtml(cert.certificate_code)}</strong>${valid?`<div class="verification-share-actions"><a class="btn primary" href="${escapeHtml(shareUrl)}" target="_blank" rel="noopener noreferrer">Share on LinkedIn</a><button class="btn outline" type="button" data-copy-link="${escapeHtml(verifyUrl)}">Copy verification link</button></div><p class="verification-copy-status" data-copy-status role="status" aria-live="polite"></p>${evidence?.nameCorrection?`<p class="verification-correction-note">Recipient-name correction recorded by the issuer (revision ${Number(evidence.nameCorrection.revision)||1}).</p>`:""}`:""}<p class="verification-home"><a href="/">Automivex learning</a></p><p class="verification-disclaimer">This is a course-completion credential recording milestone requirements and repository checks, not an accredited qualification.</p></section></div><script src="/verify.js" defer></script></main></body></html>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;
    if (url.pathname.startsWith("/api/")) {
      response = await api(request, env);
    } else if (url.pathname.startsWith("/verify/") && request.method === "GET") {
      try {
        response = await verificationPageThemed(request, env);
      } catch (error) {
        console.error("Certificate verification page failed", error?.message || error);
        response = html(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verification unavailable</title><link rel="stylesheet" href="/styles.css"></head><body><main class="verification-page"><div class="verification-container"><section class="verification-card"><div class="eyebrow">AUTOMIVEX VERIFICATION</div><h1>Verification temporarily unavailable</h1><p>Please try again shortly.</p><a class="btn outline" href="/">Return to Automivex</a></section></div></main></body></html>`, 503);
      }
    } else {
      response = await env.ASSETS.fetch(request);
    }
    const headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("x-frame-options", "DENY");
    headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
    headers.set("content-security-policy", "default-src 'self'; script-src 'self' https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; connect-src 'self' https://api.github.com https://www.youtube-nocookie.com; frame-src https://www.youtube-nocookie.com; form-action 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'");
    if (url.pathname.startsWith("/api/") && !headers.has("cache-control")) headers.set("cache-control","no-store");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
