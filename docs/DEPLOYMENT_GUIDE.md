# Automivex learning website — setup checklist

Use this file alongside the root README. Follow the stages in order; do not change the main website's DNS while connecting the learning subdomain.

## Stage 1 — Prepare accounts

- Create or sign in to Cloudflare.
- Confirm the `support@automivex.com` mailbox is active in Hostinger.
- Verify that you can access the DNS zone for `automivex.com`.
- Decide the exact email address that will be the single initial platform admin.

## Stage 2 — Cloudflare and D1

```bash
npm install
npx wrangler login
npm run db:create
```

Copy the returned D1 database ID into `wrangler.jsonc`. Then:

```bash
npm run db:remote
```

Do not commit `.dev.vars`, `.env` or API keys.

## Stage 3 — Secrets and non-secret configuration

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put RESEND_API_KEY
```

Create a long random session secret (at least 32 characters). Create a Resend API key with sending access and store it as the `RESEND_API_KEY` Worker secret. Keep the key private. The verified `automivex.com` domain allows the app to send as `Automivex <support@automivex.com>`; replies continue to the Hostinger mailbox. Also set the app URL, production environment, admin email, LinkedIn, YouTube and TikTok profile URLs, and optional WhatsApp invite URL. All three social profile URLs must be configured for capstone submission.

## Stage 4 — Deploy preview

```bash
npm run deploy
```

Use the generated `workers.dev` URL to smoke-test the first deployment before connecting the custom domain. Test health, landing page, static styles, registration email, code verification, enroll, lesson progress, quiz grading, GitHub project check, admin view and certificate verification. If a feature fails, stop and fix it before public launch.

## Stage 5 — Custom domain

In the Worker settings, add `learn.automivex.com` as a Custom Domain. If Cloudflare asks you to onboard the parent zone, export and reproduce the full DNS zone first. Record the current apex and `www` destinations and confirm that Hostinger email MX records remain present. Copy all verification, mail and DNS records exactly. Do not change nameservers from a partial/incomplete DNS import.

## Stage 6 — Email

OTP messages are sent through Resend's HTTPS API, not Hostinger SMTP. Keep Hostinger's existing MX records so `support@automivex.com` can continue receiving email. The verified Resend domain authorizes sending with this address. After deployment, test OTP delivery to an external mailbox and confirm replies reach the Hostinger inbox.

## Stage 7 — Production readiness

- Confirm `ENVIRONMENT=production`.
- Remove all development debug settings.
- Set the real admin address.
- Set the public `LINKEDIN_URL`, `YOUTUBE_URL`, and `TIKTOK_URL` values. Learner follow/subscription confirmations are self-attested and are not independently verified by social platform APIs.
- Publish accurate privacy and terms notices.
- Configure a WhatsApp community only if you want it; keep joining optional.
- Run the full smoke-test sequence from README.
- Announce only after the above checks pass.
