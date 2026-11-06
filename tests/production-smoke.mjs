const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8787";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const health = await request("/api/health");
assert(health.response.status === 200 && health.body.ok === true, "Health endpoint failed");

const course = await request("/api/course");
assert(course.response.status === 200, "Course endpoint failed");
const serializedCourse = JSON.stringify(course.body.course);
assert(!serializedCourse.includes("correctChoice"), "Public course leaked correct lesson choices");

const protectedRequest = await request("/api/enroll", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{}"
});
assert(protectedRequest.response.status === 401, "Protected route did not reject an unauthenticated request");

const protectedQuiz = await request("/api/quiz");
assert(protectedQuiz.response.status === 401, "Assessment route did not reject an unauthenticated request");

const missingCertificate = await request("/api/certificates/AVX-NOT-FOUND");
assert(missingCertificate.response.status === 404 && missingCertificate.body.valid === false, "Certificate verification failed");

const securityHeaders = health.response.headers;
assert(securityHeaders.get("x-content-type-options") === "nosniff", "Missing nosniff header");
assert(securityHeaders.get("content-security-policy")?.includes("frame-ancestors 'none'"), "Missing CSP frame restriction");
assert(securityHeaders.get("cache-control") === "no-store", "API responses are cacheable");

console.log("Production smoke tests passed");
