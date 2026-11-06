import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
const errors = [];

if (config.vars?.ENVIRONMENT !== "production") errors.push("Set vars.ENVIRONMENT to production.");
if (config.vars?.APP_URL !== "https://learn.automivex.com") errors.push("Set vars.APP_URL to https://learn.automivex.com.");

const database = config.d1_databases?.find(item => item.binding === "DB");
if (!database || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(database.database_id || "")) {
  errors.push("Replace the D1 database ID placeholder with the UUID returned by wrangler d1 create.");
}

const adminEmails = String(config.vars?.ADMIN_EMAILS || "").split(",").map(value => value.trim()).filter(Boolean);
if (!adminEmails.length || adminEmails.some(email => /replace|example\.com/i.test(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
  errors.push("Set vars.ADMIN_EMAILS to the exact, verified administrator email address or addresses.");
}

const sender = String(config.vars?.EMAIL_FROM || "");
const senderEmail = sender.match(/<([^<>\s]+@[^<>\s]+)>/)?.[1] || "";
if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
  errors.push("Set vars.EMAIL_FROM to a valid address belonging to your Hostinger mailbox.");
}
if (config.vars?.SMTP_HOST !== "smtp.hostinger.com") errors.push("Set vars.SMTP_HOST to smtp.hostinger.com.");
if (String(config.vars?.SMTP_PORT) !== "465") errors.push("Set vars.SMTP_PORT to 465 (implicit TLS).");

for (const name of ["LINKEDIN_URL", "YOUTUBE_URL", "TIKTOK_URL"]) {
  const value = String(config.vars?.[name] || "");
  let valid = false;
  try {
    const url = new URL(value);
    valid = url.protocol === "https:" && !url.username && !url.password;
  } catch {
    valid = false;
  }
  if (!valid) errors.push(`Set vars.${name} to the official public HTTPS profile URL.`);
}

if (errors.length) {
  console.error("Production deploy preflight failed:");
  for (const error of errors) console.error(`- ${error}`);
  console.error("After configuration, also verify the SESSION_SECRET, SMTP_USER and SMTP_PASSWORD Worker secrets in Cloudflare.");
  process.exitCode = 1;
} else {
  console.log("Production deploy configuration checks passed.");
  console.log("Confirm SESSION_SECRET, SMTP_USER and SMTP_PASSWORD are present as Cloudflare Worker secrets before deployment.");
}
