const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8787";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
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

const protectedCertificateList = await request("/api/admin/certificates");
assert(protectedCertificateList.response.status === 401, "Admin certificate search did not reject an unauthenticated request");

const protectedCertificateCorrection = await request("/api/admin/certificates/name", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ code: "AVX-2026-TEST", fullName: "Test Name", reason: "Smoke test correction" })
});
assert(protectedCertificateCorrection.response.status === 401, "Certificate-name correction did not reject an unauthenticated request");

const protectedCertificateIssue = await request("/api/admin/certificate/issue", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ submissionId: "smoke-test-submission" })
});
assert(protectedCertificateIssue.response.status === 401, "Admin certificate issuance did not reject an unauthenticated request");

const protectedCertificateEmail = await request("/api/admin/certificates/email", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ code: "AVX-2026-TEST" })
});
assert(protectedCertificateEmail.response.status === 401, "Certificate email resend did not reject an unauthenticated request");

const missingCertificate = await request("/api/certificates/AVX-NOT-FOUND");
assert(missingCertificate.response.status === 404 && missingCertificate.body.valid === false &&
  missingCertificate.body.status === "not_found", "Malformed certificate ID did not return a generic not-found response");
assert(!("recipientName" in missingCertificate.body) && !("evidence" in missingCertificate.body) &&
  !("email" in missingCertificate.body), "Malformed certificate lookup exposed certificate or learner data");

const unknownCertificate = await request("/api/certificates/AVX-2026-ABCDEFGH");
assert(unknownCertificate.response.status === 404 && unknownCertificate.body.valid === false &&
  unknownCertificate.body.status === "not_found", "Unknown certificate ID did not return a generic not-found response");
assert(Object.keys(unknownCertificate.body).sort().join(",") === "status,valid",
  "Unknown certificate lookup exposed unexpected data");

const unknownLongCertificate = await request("/api/certificates/AVX-2026-ABCDEFGHJKLMNPQRSTUVWXYZ23");
assert(unknownLongCertificate.response.status === 404 && unknownLongCertificate.body.status === "not_found",
  "Unknown long-format certificate ID did not return a generic not-found response");
assert(!("evidence" in unknownLongCertificate.body) && !("recipientName" in unknownLongCertificate.body),
  "Unknown long-format lookup exposed certificate claims");

const invalidLengthCertificate = await request("/api/certificates/AVX-2026-ABCDEFGHI");
assert(invalidLengthCertificate.response.status === 404 && invalidLengthCertificate.body.status === "not_found",
  "Certificate IDs with unsupported lengths were not rejected");

const nestedCertificatePath = await request("/api/certificates/unrelated/AVX-2026-ABCDEFGH");
assert(nestedCertificatePath.response.status === 404 && nestedCertificatePath.body.status === "not_found",
  "Nested certificate lookup path was not rejected as not found");

const missingVerificationPage = await request("/verify/AVX-NOT-FOUND");
assert(missingVerificationPage.response.status === 404, "Unknown public certificate URL did not return 404");
assert(typeof missingVerificationPage.body === "string" && missingVerificationPage.body.includes("Certificate not found"), "Unknown certificate page did not render the not-found view");
assert(!missingVerificationPage.body.includes("evidence_json") && !missingVerificationPage.body.includes("email"),
  "Unknown certificate page exposed internal or learner data");

const nestedVerificationPath = await request("/verify/unrelated/AVX-2026-ABCDEFGH");
assert(nestedVerificationPath.response.status === 404 && nestedVerificationPath.body.includes("Certificate not found"),
  "Nested public certificate path did not render the generic not-found view");

const verificationScript = await request("/verify.js");
assert(verificationScript.response.status === 200 && verificationScript.body.includes("data-copy-link"), "Certificate share-link helper was not served");

const securityHeaders = health.response.headers;
assert(securityHeaders.get("x-content-type-options") === "nosniff", "Missing nosniff header");
assert(securityHeaders.get("content-security-policy")?.includes("frame-ancestors 'none'"), "Missing CSP frame restriction");
assert(securityHeaders.get("cache-control") === "no-store", "API responses are cacheable");

const verificationIp = `test-${Date.now()}-${process.pid}`;
for (let attempt = 0; attempt < 60; attempt++) {
  const result = await request("/api/certificates/AVX-2026-ABCDEFGHJKLMNPQRSTUVWXYZ23", {
    headers: { "CF-Connecting-IP": verificationIp }
  });
  assert(result.response.status === 404, `Certificate verification was unexpectedly throttled at request ${attempt + 1}`);
}
const throttledVerification = await request("/api/certificates/AVX-2026-ABCDEFGHJKLMNPQRSTUVWXYZ23", {
  headers: { "CF-Connecting-IP": verificationIp }
});
assert(throttledVerification.response.status === 429 &&
  throttledVerification.response.headers.get("retry-after") === "60",
  "Certificate verification did not enforce its per-IP rate limit");

console.log("Production smoke tests passed");
