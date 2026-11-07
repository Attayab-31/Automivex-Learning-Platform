const app = document.querySelector("#app");
const toastEl = document.querySelector("#toast");
const state = { user: null, progress: null, course: null, config: { links: {} }, view: "home", authEmail: "", debugCode: null, quiz: null, quizNonce: null, quizIntegrity: null, lastQuizResult: null, admin: null, adminError: null };
let assessmentIntegrityListenersReady = false;
const SOCIAL_REQUIREMENTS = [
  { key:"linkedin", label:"LinkedIn", action:"follow" },
  { key:"youtube", label:"YouTube", action:"subscribe" },
  { key:"tiktok", label:"TikTok", action:"follow" }
];

const $ = (s, root=document) => root.querySelector(s);
const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pct = (n,d) => d ? Math.round(n/d*100) : 0;
function socialAttestationFields(links) {
  const configured = SOCIAL_REQUIREMENTS.every(({key}) => links[key]);
  return `<fieldset class="social-attestation-list"><legend>Required social-account confirmations</legend><p>These are your self-attestations; Automivex does not verify follows or subscriptions through social-platform APIs.</p>${SOCIAL_REQUIREMENTS.map(({key,label,action})=>`<div class="social-attestation-row"><label><input type="checkbox" name="socialAttestations" value="${key}" required ${links[key]?"":"disabled"}><span>I confirm that I ${action === "subscribe" ? "subscribed to" : "follow"} the Automivex ${label} account.</span></label>${links[key]?`<a href="${esc(links[key])}" target="_blank" rel="noopener">Open ${label} ↗</a>`:`<span class="social-link-missing">${label} profile is not configured</span>`}</div>`).join("")}</fieldset>${configured?"":`<div class="notice"><b>Submission unavailable</b><p>The LinkedIn, YouTube and TikTok profile URLs have not all been configured yet.</p></div>`}`;
}
function toast(message, kind="") {
  toastEl.textContent = message; toastEl.className = `toast show ${kind}`;
  clearTimeout(toast._t); toast._t = setTimeout(()=>toastEl.className="toast", 3600);
}
async function api(path, options={}) {
  const res = await fetch(path, { credentials:"same-origin", ...options, headers:{ ...(options.body ? {"Content-Type":"application/json"} : {}), ...(options.headers||{}) } });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
function beginButtonLoading(button, label="Loading…") {
  if (!(button instanceof HTMLButtonElement) || button.disabled) return null;
  const original = {
    content: button.innerHTML,
    width: button.style.width,
    ariaLabel: button.getAttribute("aria-label"),
    ariaBusy: button.getAttribute("aria-busy")
  };
  button.style.width = `${button.getBoundingClientRect().width}px`;
  button.disabled = true;
  button.classList.add("is-loading");
  button.setAttribute("aria-busy", "true");
  button.setAttribute("aria-label", label);
  button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>${esc(label)}</span>`;
  return () => {
    if (!button.isConnected) return;
    button.innerHTML = original.content;
    button.style.width = original.width;
    button.disabled = false;
    button.classList.remove("is-loading");
    if (original.ariaLabel === null) button.removeAttribute("aria-label");
    else button.setAttribute("aria-label", original.ariaLabel);
    if (original.ariaBusy === null) button.removeAttribute("aria-busy");
    else button.setAttribute("aria-busy", original.ariaBusy);
  };
}
function buttonLoadingLabel(action) {
  return ({
    enroll: "Enrolling…",
    quiz: "Loading assessment…",
    "issue-certificate": "Issuing certificate…",
    logout: "Signing out…"
  })[action] || "Loading…";
}
function btn(label, action, cls="btn primary", extra="") { return `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`; }
function brand() { return `<a class="brand" href="#home" data-action="home"><img class="brand-logo brand-logo-light" src="/logo.svg" width="2244" height="498" alt="Automivex"><img class="brand-logo brand-logo-dark" src="/logo-dark.svg" width="2244" height="498" alt="Automivex"></a>`; }
function themeToggle() {
  return `<button class="theme-toggle" type="button" data-action="toggle-theme" aria-label="Switch theme" title="Switch theme">
    <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path>
    </svg>
    <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>`;
}
function header() {
  const isAdmin = state.user?.role === "admin";
  const mobileCtas = state.user
    ? `<div class="mobile-cta">${btn(isAdmin?"Administration":"Dashboard",isAdmin?"admin":"dashboard","btn small primary full")}${btn("Sign out","logout","btn small outline full")}</div>`
    : `<div class="mobile-cta">${btn("Sign in","auth","btn small soft full")}<button class="btn small primary full" data-action="auth">Get started</button></div>`;
  const primaryLinks = isAdmin
    ? `<nav class="nav-links" aria-label="Administration navigation"><a href="#admin" data-action="admin">Administration</a></nav>`
    : `<nav class="nav-links" aria-label="Primary navigation"><a href="#program" data-action="program">Programme</a><a href="#capstone" data-action="capstone">Capstone</a><a href="#certificates" data-action="certificates">Certificates</a></nav>`;
  const mobileLinks = isAdmin
    ? `<a href="#admin" data-action="admin">Administration</a>`
    : `<a href="#program" data-action="program">Programme</a><a href="#capstone" data-action="capstone">Capstone project</a><a href="#certificates" data-action="certificates">Certificates</a><a href="https://www.automivex.com" target="_blank" rel="noopener">Company website ↗</a>`;
  const brandLink = isAdmin
    ? `<a class="brand" href="#admin" data-action="admin"><img class="brand-logo brand-logo-light" src="/logo.svg" width="2244" height="498" alt="Automivex"><img class="brand-logo brand-logo-dark" src="/logo-dark.svg" width="2244" height="498" alt="Automivex"></a>`
    : brand();
  return `<header class="topbar"><div class="container nav">${brandLink}${primaryLinks}<div class="nav-cta">${state.user?`<span class="nav-user">${esc(state.user.fullName)}</span>${btn(isAdmin?"Administration":"Dashboard",isAdmin?"admin":"dashboard","btn small soft")}${btn("Sign out","logout","btn small ghost")}`:`${btn("Sign in","auth","btn small ghost")}<button class="btn small primary" data-action="auth">Get started</button>`}${themeToggle()}</div><div class="mobile-nav-group">${themeToggle()}<button class="mobile-menu" type="button" data-action="menu" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-links"><span aria-hidden="true">☰</span></button></div></div><nav class="mobile-links" id="mobile-links" aria-label="${isAdmin?"Administration":"Primary"} navigation">${mobileLinks}${isAdmin?"":`<a href="https://www.automivex.com" target="_blank" rel="noopener">Company website ↗</a>`}${mobileCtas}</nav></header>`;
}
function footer() {
  const l=state.config.links||{};
  const isAdmin=state.user?.role==="admin";
  const learningLinks=isAdmin?"":`<nav class="footer-link-group" aria-label="Learning links"><b>Learning</b><a href="#program" data-action="program">Programme</a><a href="#capstone" data-action="capstone">Capstone project</a><a href="#certificates" data-action="certificates">Certificates</a></nav>`;
  return `<footer class="footer"><div class="container footer-inner"><div class="footer-main"><div class="footer-brand">${brand()}<p>${isAdmin?"Administrative workspace for Automivex.":"Independent, practical technology learning from Automivex."}</p></div>${learningLinks}<nav class="footer-link-group" aria-label="Company links"><b>Company</b><a href="https://www.automivex.com" target="_blank" rel="noopener">Automivex ↗</a><a href="mailto:hello@automivex.com">Contact</a><a href="${esc(l.linkedin||"https://www.linkedin.com/company/automivex/")}" target="_blank" rel="noopener">LinkedIn ↗</a></nav><nav class="footer-link-group" aria-label="Legal links"><b>Legal</b><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></nav></div><div class="footer-bottom"><small>© ${new Date().getFullYear()} Automivex. All rights reserved.</small><small>${isAdmin?"Secure administration for Automivex.":"Built for learning at your own pace."}</small></div></div></footer>`;
}
function courseCard() {
  return `<article class="course-card"><div class="course-cover"><span class="cover-tag">FREE LEARNING PATH</span><div class="cover-title">PYTHON<br><em>API DEVELOPMENT</em></div><div class="cover-code">{ fastapi · postgresql · testing }</div></div><div class="course-card-body"><div class="course-meta"><span>BEGINNER → INTERMEDIATE</span><span>≈ ${state.course?.estimatedHours || 22} HOURS</span></div><h3>Python API Development</h3><p>Learn the fundamentals, practise API engineering and apply your knowledge in an independent production-minded capstone.</p><div class="tag-row"><span>FastAPI</span><span>SQL</span><span>PostgreSQL</span><span>Pytest</span></div><div class="course-card-foot"><span class="free-label"><i></i> Always free</span>${btn("View learning path","program","btn text-btn")}</div></div></article>`;
}
function homeView() {
  return `${header()}<main><section class="hero"><div class="container hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> A FREE LEARNING INITIATIVE BY AUTOMIVEX</div><h1>Learn the craft.<br><span>Build something real.</span></h1><p class="hero-lead">Practical, self-paced technology learning with structured assessments and portfolio projects. Open to learners who want to build skills through doing.</p><div class="hero-actions">${btn("Explore the free programme","program","btn primary large")}<a href="#capstone" class="btn outline large" data-action="capstone">See the capstone <span>↗</span></a></div><div class="hero-proof"><div class="proof-avatars"><span>A</span><span>Py</span><span>API</span></div><div><strong>Learn at your own pace</strong><small>No course fee · No certificate fee · No social-follow requirement</small></div></div></div><div class="hero-visual"><div class="code-window"><div class="window-bar"><span></span><span></span><span></span><b>main.py</b></div><pre><code><i>from</i> fastapi <i>import</i> FastAPI
<i>from</i> pydantic <i>import</i> BaseModel

app = FastAPI(
    title=<em>"Support Desk API"</em>,
    version=<em>"1.0.0"</em>
)

<span class="code-comment"># Build. Test. Improve.</span>
@app.get(<em>"/health"</em>)
<span class="code-key">async def</span> health():
    <span class="code-key">return</span> {
        <em>"status"</em>: <em>"healthy"</em>
    }</code></pre><div class="code-status"><span></span> Ready for your first API · GET /health 200 OK</div></div></div></div></section><section class="trust-strip"><div class="container trust-inner"><span>AN INITIATIVE BY</span><strong>AUTOMIVEX</strong><i></i><span>PYTHON</span><i></i><span>BACKEND ENGINEERING</span><i></i><span>PORTFOLIO PROJECTS</span><i></i><span>FREE CERTIFICATE</span></div></section><section class="section" id="program"><div class="container"><div class="section-heading"><div><div class="eyebrow">THE LEARNING PROGRAMME</div><h2>One focused path.<br><span>Practical outcomes.</span></h2></div><p>Start with a carefully structured Python API learning path, then demonstrate your learning through a capstone built independently.</p></div><div class="program-grid">${courseCard()}<div class="programme-info"><div class="info-block"><span class="info-number">01</span><div><h3>Study the fundamentals</h3><p>Follow a free, publicly available course and use our milestones to organise your learning.</p></div></div><div class="info-block"><span class="info-number">02</span><div><h3>Check your understanding</h3><p>Complete short quizzes and knowledge checks as you move through the modules.</p></div></div><div class="info-block"><span class="info-number">03</span><div><h3>Build independently</h3><p>Develop a practical backend project and submit your public repository for structural checks.</p></div></div><div class="info-block"><span class="info-number">04</span><div><h3>Verify your completion</h3><p>Meet the published criteria to generate a certificate with a public verification page.</p></div></div>${btn("Create your free learning account","auth","btn primary full")}</div></div></div></section><section class="section dark-section" id="capstone"><div class="container capstone-grid"><div><div class="eyebrow light">THE FINAL PROJECT</div><h2>Build a product,<br><span>not just a tutorial clone.</span></h2><p class="dark-lead">Your capstone is a multi-tenant customer support SaaS API: a backend system where different organisations manage agents, support tickets, comments and knowledge articles while keeping their data isolated.</p><div class="capstone-tags"><span>FastAPI</span><span>PostgreSQL</span><span>SQLAlchemy 2.x</span><span>JWT</span><span>Pytest</span><span>Docker</span><span>GitHub Actions</span></div>${btn("Explore project requirements","capstone-details","btn light-btn")}</div><div class="architecture-card"><div class="arch-label">REFERENCE ARCHITECTURE</div><div class="arch-node main-node"><b>Client applications</b><small>Web / API clients</small></div><div class="arch-connector">↓</div><div class="arch-node api-node"><b>FastAPI application</b><small>Authentication · Validation · RBAC</small></div><div class="arch-connector">↓</div><div class="arch-row"><div class="arch-node"><b>Workspace</b><small>Tenant isolation</small></div><div class="arch-node"><b>Ticket service</b><small>Workflow & comments</small></div></div><div class="arch-connector">↓</div><div class="arch-node db-node"><b>PostgreSQL</b><small>Users · Tickets · Audit logs · Knowledge base</small></div><div class="arch-foot"><span>✓ Automated tests</span><span>✓ CI pipeline</span></div></div></div></section><section class="section"><div class="container"><div class="section-heading"><div><div class="eyebrow">HOW IT WORKS</div><h2>A clear path from<br><span>learning to evidence.</span></h2></div><p>There are no hidden steps. Requirements are published before you begin, and certificates require course progress, assessment results, a passing repository checklist, social-account self-attestations and administrator approval.</p></div><div class="steps-grid"><div class="step-card"><span>01</span><h3>Register</h3><p>Create your learner account using an email verification code.</p></div><div class="step-card"><span>02</span><h3>Learn</h3><p>Use the free course and mark each learning milestone when completed.</p></div><div class="step-card"><span>03</span><h3>Assess</h3><p>Pass the knowledge assessment and build your independent capstone.</p></div><div class="step-card"><span>04</span><h3>Demonstrate</h3><p>Submit your public GitHub repository and required social-account self-attestations for the automated checklist, then wait for an administrator review.</p></div><div class="step-card"><span>05</span><h3>Receive</h3><p>Issue and share your completion certificate with a verifiable ID.</p></div></div></div></section><section class="section faq-section"><div class="container faq-grid"><div><div class="eyebrow">GOOD TO KNOW</div><h2>Clear expectations.<br><span>No surprises.</span></h2><p>Read the programme rules before registering. The learning initiative is educational and does not create an employment or internship relationship.</p></div><div class="faq-list"><details><summary>Is the programme really free?</summary><p>Yes. There is no application, tuition, assessment or certificate fee. You need your own computer and internet connection. Third-party platforms such as GitHub and email providers have their own terms and limits.</p></details><details><summary>Is this an internship or job?</summary><p>No. This is an independent educational learning initiative. It does not offer employment, an internship, paid work or guaranteed recruitment.</p></details><details><summary>Will I get a certificate automatically?</summary><p>Only after the published requirements are met: course milestones, a passing knowledge assessment, a passing capstone checklist, social-account self-attestations and administrator approval. The certificate confirms course completion; it is not an accredited qualification or a substitute for a professional code review.</p></details><details><summary>Do I need to follow Automivex on social media?</summary><p>To submit your capstone and qualify for a certificate, confirm that you followed Automivex on LinkedIn and TikTok and subscribed on YouTube. These confirmations are self-attested and not independently verified. Joining WhatsApp is optional.</p></details><details><summary>Do I need to pay for hosting or an AI API?</summary><p>No paid AI API is required. The capstone can be built with open-source Python tools and local development services. Optional deployment providers may impose their own free-tier restrictions.</p></details><details><summary>Who owns my capstone?</summary><p>You retain ownership of your original project. By submitting a public GitHub repository, you allow the platform to inspect its public file structure for the stated assessment checklist. Automivex does not receive ownership of your code.</p></details></div></div></section><section class="cta-section"><div class="container cta-inner"><div><div class="eyebrow light">START BUILDING</div><h2>Your next project<br>starts here.</h2><p>Learn the fundamentals, apply them independently and create something you can show.</p></div><div class="cta-actions">${btn("Create free account","auth","btn light-btn large")}<a class="btn outline large" href="${esc(state.config.links?.linkedin||'https://www.linkedin.com/company/automivex/')}" target="_blank" rel="noopener">Follow Automivex on LinkedIn ↗</a></div></div></section></main>${footer()}`;
}
function authView() {
  return `${header()}<main class="auth-wrap"><div class="auth-card"><div class="auth-side"><div class="eyebrow light">AUTOMIVEX LEARNING</div><h2>Start building<br>your next skill.</h2><p>One account for learning milestones, assessments, project submissions and certificates.</p><div class="auth-side-note">No fee. No social-follow requirement. No employment promise.</div></div><div class="auth-form-side"><button class="back-link" data-action="home">← Back to website</button><div class="eyebrow">LEARNER ACCOUNT</div><h1>${state.authEmail ? "Check your inbox" : "Welcome to Automivex"}</h1><p class="muted">${state.authEmail ? `We sent a six-digit sign-in code to ${esc(state.authEmail)}.` : "Sign in or create an account using your email address."}</p>${state.authEmail ? `<form id="verify-form" class="form"><label>Six-digit verification code<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required placeholder="000000" autocomplete="one-time-code"></label>${state.debugCode ? `<div class="dev-code">Local development code: <b>${esc(state.debugCode)}</b></div>` : ""}<button class="btn primary full" type="submit">Verify and continue</button><button class="btn ghost full" type="button" data-action="change-email">Use a different email</button></form>` : `<form id="start-form" class="form"><label>Your name<input name="fullName" minlength="2" maxlength="100" required placeholder="Your full name"></label><label>Email address<input type="email" name="email" required maxlength="254" placeholder="you@example.com"></label><label class="check-label"><input type="checkbox" name="acceptTerms" required><span>I have read and accept the <a href="/terms.html" target="_blank">programme terms</a> and <a href="/privacy.html" target="_blank">privacy notice</a>.</span></label><button class="btn primary full" type="submit">Send sign-in code</button></form>`}<div class="auth-foot">Your email is used for account access and essential programme messages. We do not sell learner information.</div></div></div></main>${footer()}`;
}
function videoTimeText(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours ? `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}` : `${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

function workspaceNav(active="dashboard") {
  const items = state.user?.role === "admin" ? [
    ["admin", "Administration", "⚙"]
  ] : [
    ["dashboard", "Overview", "⌂"],
    ["learning", "My learning", "▦"],
    ["assessment", "Assessment", "✓"],
    ["capstone", "Capstone", "⌘"],
    ["certificates", "Certificates", "◆"]
  ];
  return `<nav class="workspace-nav" aria-label="${state.user?.role==="admin"?"Administration":"Learner"} pages">${items.map(([view,label,icon])=>`<a href="#${view}" class="${active===view?"active":""}" aria-current="${active===view?"page":"false"}" data-action="${view}"><span aria-hidden="true">${icon}</span>${label}</a>`).join("")}</nav>`;
}

let youtubeApiPromise=null;
function loadYouTubeIframeApi() {
  if(window.YT?.Player)return Promise.resolve();
  if(youtubeApiPromise)return youtubeApiPromise;
  youtubeApiPromise=new Promise((resolve,reject)=>{
    const previous=window.onYouTubeIframeAPIReady;
    const timeout=setTimeout(()=>reject(new Error("The video player took too long to load.")),15000);
    window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);previous?.();resolve();};
    const script=document.createElement("script");
    script.src="https://www.youtube.com/iframe_api";
    script.async=true;
    script.onerror=()=>{clearTimeout(timeout);reject(new Error("The course video player could not load."));};
    document.head.appendChild(script);
  });
  return youtubeApiPromise;
}
function setClipDisplay(card,clip,offset=0) {
  const duration=Math.max(1,Number(clip.end)-Number(clip.start));
  const bounded=Math.max(0,Math.min(duration,Math.floor(offset)));
  card.dataset.chapterOffset=String(bounded);
  card.dataset.start=String(clip.start);
  card.dataset.end=String(clip.end);
  const seek=card.querySelector('[data-player="seek"]');
  const elapsed=card.querySelector('[data-player="elapsed"]');
  const total=card.querySelector('[data-player="duration"]');
  if(seek){seek.max=String(duration);seek.value=String(bounded);seek.style.setProperty("--played",`${bounded/duration*100}%`);seek.setAttribute("aria-valuetext",`${videoTimeText(bounded)} of ${videoTimeText(duration)}`);}
  if(elapsed)elapsed.textContent=videoTimeText(bounded);
  if(total)total.textContent=videoTimeText(duration);
}
function setLessonPlayerStatus(card,message="",isError=false) {
  const status=card.querySelector('[data-player="status"]');
  if(!status)return;
  status.textContent=message;
  status.classList.toggle("has-error",isError);
}
function updateClipPlayback(card,absoluteTime) {
  if(card._seeking)return;
  const start=Number(card.dataset.start),end=Number(card.dataset.end),duration=end-start;
  if(!Number.isFinite(absoluteTime)||!Number.isFinite(start)||!Number.isFinite(end)||duration<=0)return;
  if(absoluteTime<start-1){
    if(card._youtubePlayer?.getPlayerState()===window.YT?.PlayerState?.PLAYING)card._youtubePlayer.seekTo(start,true);
    return;
  }
  if(absoluteTime>=end-0.25){
    clearInterval(card._youtubeTimer);card._youtubeTimer=null;
    card._youtubePlayer?.pauseVideo();setClipDisplay(card,{start,end},duration);
    const button=card.querySelector('[data-player="toggle"]');
    if(button){button.textContent="▶";button.setAttribute("aria-label","Replay video");button.title="Replay";}
    return;
  }
  setClipDisplay(card,{start,end},absoluteTime-start);
}
function bindLessonPlayerControls(card) {
  if(card._controlsBound)return;card._controlsBound=true;
  const player=()=>card._youtubePlayer;
  const seek=card.querySelector('[data-player="seek"]');
  const volume=card.querySelector('[data-player="volume"]');
  let controlsTimer=null;
  let pointerOnControls=false;
  const scheduleControlsHide=()=>{
    clearTimeout(controlsTimer);
    if(player()?.getPlayerState()!==window.YT?.PlayerState?.PLAYING||pointerOnControls)return;
    controlsTimer=setTimeout(()=>{
      if(document.fullscreenElement===card&&player()?.getPlayerState()===window.YT?.PlayerState?.PLAYING&&!pointerOnControls)card.classList.add("ui-hidden");
    },1600);
  };
  const showFullscreenControls=(event)=>{
    if(!document.fullscreenElement||document.fullscreenElement!==card)return;
    card.classList.remove("ui-hidden");
    const controls=card.querySelector(".lesson-video-controls");
    const bounds=controls?.getBoundingClientRect();
    pointerOnControls=Boolean(bounds&&event&&event.clientX>=bounds.left&&event.clientX<=bounds.right&&event.clientY>=bounds.top&&event.clientY<=bounds.bottom);
    scheduleControlsHide();
  };
  card._syncFullscreenControls=(playing)=>{
    if(document.fullscreenElement!==card)return;
    if(!playing){
      clearTimeout(controlsTimer);
      card.classList.remove("ui-hidden");
      return;
    }
    scheduleControlsHide();
  };
  card.addEventListener("pointermove",showFullscreenControls);
  card.addEventListener("pointerdown",showFullscreenControls);
  card.addEventListener("pointerleave",()=>{
    pointerOnControls=false;
    scheduleControlsHide();
  });
  document.addEventListener("fullscreenchange",()=>{
    clearTimeout(controlsTimer);
    pointerOnControls=false;
    card.classList.remove("ui-hidden");
    const button=card.querySelector('[data-player="toggle"]');
    if(button){
      const playing=player()?.getPlayerState()===window.YT?.PlayerState?.PLAYING;
      button.textContent=playing?"⏸":"▶";
      button.setAttribute("aria-label",playing?"Pause video":"Play video");
      button.title=playing?"Pause":"Play";
    }
    if(document.fullscreenElement===card)card._syncFullscreenControls(player()?.getPlayerState()===window.YT?.PlayerState?.PLAYING);
  });
  const commitSeek=(seconds)=>{
    if(!player())return;
    const start=Number(card.dataset.start);
    const end=Number(card.dataset.end);
    const absolute=Math.max(start,Math.min(end,seconds));
    player().seekTo(absolute,true);
    setClipDisplay(card,{start,end},absolute-start);
  };
  const seekBy=(delta)=>{
    if(!seek||seek.disabled||!player())return;
    const next=Math.max(0,Math.min(Number(seek.max),Number(seek.value)+delta));
    seek.value=String(next);
    seek.dispatchEvent(new Event("input",{bubbles:true}));
    seek.dispatchEvent(new Event("change",{bubbles:true}));
  };
  card.querySelector('[data-player="toggle"]')?.addEventListener("click",()=>{
    if(!player())return;
    const state=player().getPlayerState();
    if(state===window.YT?.PlayerState?.PLAYING){player().pauseVideo();return;}
    if(Number(card.dataset.chapterOffset)>=Number(card.dataset.end)-Number(card.dataset.start)){
      player().seekTo(Number(card.dataset.start),true);
      setClipDisplay(card,{start:Number(card.dataset.start),end:Number(card.dataset.end)},0);
    }
    player().playVideo();
  });
  seek?.addEventListener("input",()=>{
    card._seeking=true;
    seek.style.setProperty("--played",`${Number(seek.value)/Math.max(1,Number(seek.max))*100}%`);
    seek.setAttribute("aria-valuetext",`${videoTimeText(seek.value)} of ${videoTimeText(seek.max)}`);
    const elapsed=card.querySelector('[data-player="elapsed"]');if(elapsed)elapsed.textContent=videoTimeText(seek.value);
    if(card._seekFrame)cancelAnimationFrame(card._seekFrame);
    const offset=Number(seek.value);
    card._seekFrame=requestAnimationFrame(()=>{
      card._seekFrame=null;
      commitSeek(Number(card.dataset.start)+offset);
    });
  });
  seek?.addEventListener("change",()=>{
    if(card._seekFrame){cancelAnimationFrame(card._seekFrame);card._seekFrame=null;}
    commitSeek(Number(card.dataset.start)+Number(seek.value));
    card._seeking=false;
  });
  seek?.addEventListener("pointerdown",()=>{card._seeking=true;});
  seek?.addEventListener("pointerup",()=>{card._seeking=false;});
  seek?.addEventListener("pointercancel",()=>{card._seeking=false;});
  seek?.addEventListener("blur",()=>{card._seeking=false;});
  card.querySelector('[data-player="rewind"]')?.addEventListener("click",()=>seekBy(-10));
  card.querySelector('[data-player="forward"]')?.addEventListener("click",()=>seekBy(10));
  volume?.addEventListener("input",()=>player()?.setVolume(Number(volume.value)));
  const toggleFullscreen=async()=>{
    try{if(!document.fullscreenElement)await card.requestFullscreen();else await document.exitFullscreen();}
    catch{setLessonPlayerStatus(card,"Fullscreen is unavailable in this browser.",true);}
  };
  card.querySelector('[data-player="fullscreen"]')?.addEventListener("click",toggleFullscreen);
  card.addEventListener("keydown",event=>{
    if(event.target!==card||event.altKey||event.ctrlKey||event.metaKey)return;
    const key=event.key.toLowerCase();
    if(key===" "||key==="k"){
      event.preventDefault();card.querySelector('[data-player="toggle"]')?.click();
    }else if(key==="arrowleft"||key==="arrowright"){
      event.preventDefault();
      const range=card.querySelector('[data-player="seek"]');
      if(!range||range.disabled)return;
      range.value=String(Math.max(0,Math.min(Number(range.max),Number(range.value)+(key==="arrowright"?5:-5))));
      range.dispatchEvent(new Event("input",{bubbles:true}));
      range.dispatchEvent(new Event("change",{bubbles:true}));
    }else if(key==="f"){
      event.preventDefault();toggleFullscreen();
    }
  });
  card._setClipDisplay=(clip,offset=0)=>setClipDisplay(card,clip,offset);
}
function initializeYouTubeCard(card) {
  if(card._youtubePlayer||!window.YT?.Player)return;
  const target=card.querySelector("[data-youtube-target]");
  const start=Number(card.dataset.start),end=Number(card.dataset.end);
  const player=new window.YT.Player(target,{host:"https://www.youtube-nocookie.com",width:"100%",height:"100%",videoId:state.course.videoId,playerVars:{autoplay:0,controls:0,disablekb:1,enablejsapi:1,end,fs:1,origin:location.origin,playsinline:1,rel:0,start},events:{
    onReady:event=>{card._youtubePlayer=event.target;card._youtubeReady=true;setLessonPlayerStatus(card);card.querySelectorAll("[data-player]").forEach(control=>control.disabled=false);event.target.cueVideoById({videoId:state.course.videoId,startSeconds:Number(card.dataset.start),endSeconds:Number(card.dataset.end)});},
    onStateChange:event=>{
      const button=card.querySelector('[data-player="toggle"]');
      const playing=event.data===window.YT.PlayerState.PLAYING;
      card._syncFullscreenControls?.(playing);
      if(button){
        button.textContent=playing?"⏸":"▶";
        button.setAttribute("aria-label",playing?"Pause video":"Play video");
        button.title=playing?"Pause":"Play";
      }
      if(playing&&!card._youtubeTimer)card._youtubeTimer=setInterval(()=>{const current=card._youtubePlayer?.getCurrentTime();if(Number.isFinite(current))updateClipPlayback(card,current);},300);
      if(!playing&&card._youtubeTimer){clearInterval(card._youtubeTimer);card._youtubeTimer=null;}
      if(event.data===window.YT.PlayerState.PAUSED){
        const pausedTime=card._youtubePlayer?.getCurrentTime();
        if(Number.isFinite(pausedTime))updateClipPlayback(card,pausedTime);
      }
      if(event.data===window.YT.PlayerState.ENDED){setClipDisplay(card,{start:Number(card.dataset.start),end:Number(card.dataset.end)},Number(card.dataset.end)-Number(card.dataset.start));}
    },
    onError:()=>setLessonPlayerStatus(card,"YouTube could not play this course section.",true)
  }});
  if(!card._youtubePlayer)card._youtubePlayer=player;
}
async function initLessonPlayers(root=document) {
  const details=root.matches?.("details.lesson-study")?[root]:[...root.querySelectorAll("details.lesson-study")];
  details.forEach(detail=>{
    if(detail._playerToggleBound)return;
    detail._playerToggleBound=true;
    detail.addEventListener("toggle",()=>{
      if(detail.open){
        document.querySelectorAll("details.lesson-study[open]").forEach(other=>{
          if(other!==detail)other.open=false;
        });
        initLessonPlayers(detail);
      }else detail.querySelector(".lesson-video-card")?._youtubePlayer?.pauseVideo();
    });
  });
  const cards=[...root.querySelectorAll(".lesson-video-card")].filter(card=>card.closest("details")?.open);
  cards.forEach(card=>{bindLessonPlayerControls(card);setClipDisplay(card,{start:Number(card.dataset.start),end:Number(card.dataset.end)},Number(card.dataset.chapterOffset)||0);});
  if(!cards.some(card=>!card._youtubePlayer))return;
  try{await loadYouTubeIframeApi();cards.forEach(initializeYouTubeCard);}
  catch(error){cards.forEach(card=>setLessonPlayerStatus(card,error.message,true));}
}
function destroyLessonPlayers() {
  document.querySelectorAll(".lesson-video-card").forEach(card=>{
    clearInterval(card._youtubeTimer);card._youtubeTimer=null;
    try{card._youtubePlayer?.destroy();}catch{}
    card._youtubePlayer=null;card._youtubeReady=false;
  });
}
function switchLessonVideoSegment(button) {
  const lessonId=button.dataset.lessonId;
  const lesson=state.course?.modules?.flatMap(module=>module.lessons).find(item=>item.id===lessonId);
  const clips=lesson?.study?.video?.clips||[];
  const clip=clips[Number(button.dataset.segmentIndex)];
  const card=button.closest(".lesson-video-card");
  if(!clip||!card||!state.course?.videoId)return;
  card.dataset.chapterOffset="0";setClipDisplay(card,clip,0);
  card.querySelectorAll(".lesson-video-chapter").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});
  if(card._youtubePlayer&&card._youtubeReady){setLessonPlayerStatus(card);card._youtubePlayer.cueVideoById({videoId:state.course.videoId,startSeconds:clip.start,endSeconds:clip.end});}
  else initLessonPlayers(card.closest("details"));
}

function learningView() {
  const p = state.progress || { enrolled:false, completedLessonIds:[], completedLessons:0,totalLessons:10 };
  const modules = state.course.modules.map((m,moduleIndex)=>{
    const completed = m.lessons.filter(l=>p.completedLessonIds.includes(l.id)).length;
    return `<section class="learning-module-card"><button id="learning-module-toggle-${moduleIndex}" class="learning-module-head" type="button" data-action="open-module" data-module="${moduleIndex}" aria-expanded="${moduleIndex===0?"true":"false"}" aria-controls="learning-module-body-${moduleIndex}"><span class="learning-step">${String(moduleIndex+1).padStart(2,"0")}</span><span><small>MODULE</small><b>${esc(m.title)}</b></span><span class="learning-module-progress">${completed}/${m.lessons.length}</span><span class="learning-chevron" aria-hidden="true">⌄</span></button><div id="learning-module-body-${moduleIndex}" class="learning-module-body ${moduleIndex===0?"open":""}" data-module-body="${moduleIndex}" role="region" aria-labelledby="learning-module-toggle-${moduleIndex}" aria-hidden="${moduleIndex!==0}">${m.lessons.map(l=>{
      const done=p.completedLessonIds.includes(l.id);
      const study=l.study||{};
      const studyBody=done?"Review completed milestone":`<form class="lesson-check" data-lesson-check="${l.id}"><div class="lesson-check-question"><b>${esc(study.checkQuestion||"Knowledge check")}</b><div class="lesson-choice-list">${(study.checkChoices||[]).map((choice,index)=>`<label><input type="radio" name="choice" value="${index}" required><span>${esc(choice)}</span></label>`).join("")}</div></div><label class="form-field"><span>How would you apply this concept? (40+ characters)</span><textarea name="reflection" minlength="40" maxlength="1000" required></textarea></label><button class="btn primary small" type="submit">Complete milestone</button></form>`;
      const video=study.video;
      const videoClips=video?.clips?.length?video.clips:(Number.isFinite(Number(video?.start))&&Number.isFinite(Number(video?.end))?[video]:[]);
      const firstVideoClip=videoClips[0];
      const player=firstVideoClip&&state.course.videoId?`<section class="lesson-video-card" data-lesson-id="${esc(l.id)}" data-start="${firstVideoClip.start}" data-end="${firstVideoClip.end}" data-video-player tabindex="0" aria-label="Course video player. Focus here for keyboard shortcuts."><div class="lesson-video-frame"><div id="youtube-player-${esc(l.id)}" class="lesson-youtube-target" data-youtube-target></div></div><div class="lesson-video-caption" aria-live="polite" aria-atomic="true"><div><b>${esc(firstVideoClip.title||l.title)}</b><p>${videoTimeText(firstVideoClip.start)}–${videoTimeText(firstVideoClip.end)} · YouTube · ${esc(state.course.videoProvider||"Course video")}</p></div></div><div class="lesson-video-controls"><button class="lesson-clip-rewind" type="button" data-player="rewind" aria-label="Go back 10 seconds" title="Back 10 seconds" disabled>−10</button><button class="lesson-clip-play" type="button" data-player="toggle" aria-label="Play video" title="Play" disabled>▶</button><button class="lesson-clip-forward" type="button" data-player="forward" aria-label="Go forward 10 seconds" title="Forward 10 seconds" disabled>+10</button><span class="lesson-clip-time" data-player="elapsed">00:00</span><input class="lesson-clip-seek" type="range" data-player="seek" min="0" max="${Math.max(1,firstVideoClip.end-firstVideoClip.start)}" value="0" aria-label="Current time within this course section" disabled><span class="lesson-clip-time" data-player="duration">${videoTimeText(firstVideoClip.end-firstVideoClip.start)}</span><label class="lesson-clip-volume">Volume<input type="range" data-player="volume" min="0" max="100" value="100" aria-label="Video volume" disabled></label><button class="lesson-clip-fullscreen" type="button" data-player="fullscreen" aria-label="Toggle fullscreen" title="Toggle fullscreen" disabled>⛶</button></div><p class="lesson-player-status" data-player="status" role="status" aria-live="polite">Loading video controls…</p><p class="lesson-player-hint">Keyboard: Space play or pause · ←/→ seek 5 seconds · F toggle fullscreen · Esc exit</p>${videoClips.length>1?`<div class="lesson-video-chapters" role="group" aria-label="More course sections">${videoClips.map((clip,index)=>`<button type="button" class="lesson-video-chapter ${index===0?"active":""}" data-action="video-segment" data-lesson-id="${esc(l.id)}" data-segment-index="${index}" aria-pressed="${index===0?"true":"false"}"><span>${esc(clip.title)}</span><small>${videoTimeText(clip.start)}–${videoTimeText(clip.end)}</small></button>`).join("")}</div>`:""}</section>`:"";
      return `<article class="learning-lesson-row"><span class="lesson-status ${done?"done":""}" aria-hidden="true">${done?"✓":""}</span><div class="learning-lesson-copy"><b>${esc(l.title)}</b><p>${esc(l.detail)}</p></div><div class="lesson-row-actions" role="group" aria-label="${done?"Completed lesson":"Lesson"} actions for ${esc(l.title)}">${done?`<span class="completed-label">Completed</span>${btn("Review lesson",`lesson:${l.id}`,"btn small soft")}`:btn("Open lesson",`lesson:${l.id}`,"btn small soft",!p.enrolled?"disabled":"")}</div></article><details class="lesson-study" name="lesson-study" data-lesson-details="${l.id}"><summary><b>Study notes & knowledge check</b><small>${esc(study.video?.title||"Lesson material")}</small></summary><div class="lesson-study-body"><div class="lesson-study-content">${player}<h3>Overview</h3><p>${esc(study.overview||l.detail)}</p><h3>Learning objectives</h3><ul>${(study.objectives||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h3>Practice</h3><p>${esc(study.practice||"Review the concept and apply it in a small example.")}</p>${(study.resources||[]).length?`<div class="lesson-resources"><h3>Resources</h3>${study.resources.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a>`).join("")}</div>`:""}</div>${studyBody}</div></details>`;
    }).join("")}</div></section>`;
  }).join("");
  return `${header()}<main class="workspace-main"><div class="workspace-shell"><aside>${workspaceNav("learning")}<div class="workspace-course-summary"><small>CURRENT PROGRAMME</small><b>Python API Development</b><span>${p.completedLessons}/${p.totalLessons} milestones</span></div></aside><section class="workspace-content"><div class="workspace-page-heading"><div><div class="eyebrow">MY LEARNING</div><h1>Learning path</h1><p>Open each course chapter, review the notes and pass the recorded knowledge check.</p></div><span class="workspace-progress">${pct(p.completedLessons,p.totalLessons)}% complete</span></div>${p.enrolled?`<div class="learning-progress-line"><span style="width:${pct(p.completedLessons,p.totalLessons)}%"></span></div>${modules}`:`<div class="empty-state"><div class="empty-icon">▦</div><h2>Begin your learning path</h2><p>Enroll once to unlock all lessons, progress tracking and assessments.</p>${btn("Enroll for free","enroll","btn primary")}</div>`}</section></div></main>${footer()}`;
}

function assessmentView() {
  const p = state.progress || { quizPassed:false, quizAttempts:[] };
  return `${header()}<main class="workspace-main"><div class="workspace-shell"><aside>${workspaceNav("quiz")}<div class="workspace-course-summary"><small>ASSESSMENT</small><b>Python API Development</b><span>${p.quizPassed?"Status: Passed":"Status: Not passed"}</span></div></aside><section class="workspace-content"><div class="workspace-page-heading"><div><div class="eyebrow">FINAL ASSESSMENT</div><h1>Applied knowledge assessment</h1><p>Combine course knowledge with evidence from your own work.</p></div><span class="status-pill ${p.quizPassed?"good":""}">${p.quizPassed?"Passed":"80% required"}</span></div><section class="assessment-hero panel"><div class="assessment-score"><strong>${p.quizAttempts?.[0]?.score ?? "—"}<small>${p.quizAttempts?.length?` / ${p.quizAttempts[0].total}`:" / 20"}</small></strong><span>Latest knowledge score</span></div><div><h2>${p.quizPassed?"Assessment passed":"Ready to test your understanding?"}</h2><p class="panel-intro">${p.quizAttempts?.length?`Your most recent attempt was ${p.quizAttempts[0].score}/${p.quizAttempts[0].total}.`:"Complete 20 knowledge questions and three 120-character evidence reflections. Retake the assessment after reviewing the course."}</p><div class="assessment-meta"><span>20 knowledge questions</span><span>3 written evidence prompts</span><span>80% pass mark</span></div>${btn(p.quizPassed?"Retake assessment":"Start assessment","quiz","btn primary",!state.progress?.enrolled?"disabled":"")}</div></section></section></div></main>${footer()}`;
}

function certificatesView() {
  const p = state.progress || { certificate:null, project:null, quizPassed:false, completedLessons:0, totalLessons:10 };
  const cert = p.certificate;
  const project = p.project;
  const reviewApproved = project?.humanReviewStatus === "approved";
  const reviewText = !project?.passed ? "Passing repository check required" : reviewApproved ? "Approved" : project.humanReviewStatus === "rejected" ? "Changes requested" : "Administrator review pending";
  const socialDone = SOCIAL_REQUIREMENTS.every(({key}) => project?.socialAttestations?.[key] === true);
  const steps = [
    { done:p.completedLessons===p.totalLessons, title:"Learning milestones", detail:`${p.completedLessons||0}/${p.totalLessons||10} completed` },
    { done:!!p.quizPassed, title:"Final assessment", detail:p.quizPassed?"Passed":"80% required" },
    { done:socialDone, title:"Social-account self-attestation", detail:socialDone?"All three confirmations recorded":"Required at capstone submission" },
    { done:!!project?.passed, title:"Automated capstone check", detail:project?.passed?`Passed · ${project.score}/7`:"Repository submission required" },
    { done:reviewApproved, title:"Administrator review", detail:reviewText }
  ];
  return `${header()}<main class="workspace-main"><div class="workspace-shell"><aside>${workspaceNav("certificates")}<div class="workspace-course-summary"><small>ACHIEVEMENTS</small><b>Certificate centre</b><span>${cert?"1 certificate issued":"No certificate yet"}</span></div></aside><section class="workspace-content"><div class="workspace-page-heading"><div><div class="eyebrow">CERTIFICATE CENTRE</div><h1>Your certificates</h1><p>Review completion eligibility and access your verifiable course credential.</p></div></div>${cert?`<article class="certificate-feature"><div class="certificate-mini-preview"><div class="mini-kicker">AUTOMIVEX</div><div class="mini-seal">A</div><small>CERTIFICATE OF COMPLETION</small><b>${esc(cert.recipientName||state.user.fullName)}</b><span>Python API Development</span></div><div class="certificate-feature-details"><span class="status-pill good">Verified certificate</span><h2>Python API Development</h2><p><small>Certificate ID</small><b>${esc(cert.code)}</b></p><p><small>Issued</small><b>${new Date(cert.issuedAt.replace(" ","T")+"Z").toLocaleDateString()}</b></p><div class="certificate-feature-actions"><a class="btn primary" href="/certificate.html?code=${encodeURIComponent(cert.code)}">View & print certificate</a><a class="btn outline" href="/verify/${encodeURIComponent(cert.code)}">Open verification page ↗</a></div></div></article>`:`<section class="certificate-empty"><div class="certificate-progress-art"><div class="progress-disc">${pct(p.completedLessons,p.totalLessons)}%</div></div><div><span class="status-pill">Not yet issued</span><h2>Complete the programme to earn your certificate</h2><p class="panel-intro">The certificate unlocks after all five requirements below are complete, including administrator approval of a passing capstone.</p><div class="certificate-steps">${steps.map((step,index)=>`<div class="${step.done?"complete":""}"><span>${step.done?"✓":String(index+1)}</span><b>${step.title}</b><small>${esc(step.detail)}</small></div>`).join("")}</div>${project?.reviewNotes?`<div class="notice"><b>Review feedback</b><p>${esc(project.reviewNotes)}</p></div>`:""}<div class="certificate-empty-actions">${btn(p.completedLessons<p.totalLessons?"Continue learning":!p.quizPassed?"Start assessment":"Open capstone",p.completedLessons<p.totalLessons?"learning":!p.quizPassed?"quiz":"capstone","btn primary")}${btn("View programme requirements","capstone-details","btn outline")}</div></div></section>`}</section></div></main>${footer()}`;
}
function submittedProjectCard(project, reviewLabel) {
  const review = project.humanReviewStatus || "pending";
  const reviewMessage = review === "approved"
    ? "An administrator approved this submission."
    : review === "rejected"
      ? project.reviewNotes
        ? `An administrator requested changes: ${project.reviewNotes}`
        : "An administrator requested changes. Update the repository and submit it again for review."
      : "Your submission is waiting for administrator review. Any resubmission starts a new review.";
  const submittedAt = String(project.submittedAt || "");
  const parsedDate = new Date(submittedAt.includes("T") ? submittedAt : `${submittedAt.replace(" ", "T")}Z`);
  const submittedDate = Number.isNaN(parsedDate.getTime()) ? "Date unavailable" : parsedDate.toLocaleString();
  const repositoryUrl = String(project.githubUrl || "").replace(/\/+$/, "");
  return `<section class="capstone-submission-review" aria-labelledby="submitted-project-heading">
    <div class="capstone-submission-review-heading">
      <div>
        <div class="eyebrow">YOUR SUBMISSION</div>
        <h3 id="submitted-project-heading">Review your capstone submission</h3>
        <p>Submitted ${esc(submittedDate)}</p>
      </div>
      <span class="status-pill ${project.passed?"good":""}">Automated check ${project.passed?"passed":"needs work"} · ${project.score}/7</span>
    </div>
    <div class="capstone-submission-review-grid">
      <div class="capstone-submission-review-detail">
        <small>PUBLIC REPOSITORY</small>
        <a class="capstone-repository-url" href="${esc(repositoryUrl)}" target="_blank" rel="noopener">${esc(project.githubUrl)} ↗</a>
        <div class="capstone-review-links">
          <a class="btn outline small" href="${esc(repositoryUrl)}" target="_blank" rel="noopener">Review repository ↗</a>
          ${project.commitSha?`<a class="btn outline small" href="${esc(repositoryUrl)}/commit/${encodeURIComponent(project.commitSha)}" target="_blank" rel="noopener">View checked commit ↗</a>`:""}
        </div>
      </div>
      <div class="capstone-submission-review-detail">
        <small>ADMINISTRATOR REVIEW</small>
        <span class="status-pill ${review==="approved"?"good":""}">${esc(reviewLabel)}</span>
        <p>${esc(reviewMessage)}</p>
      </div>
    </div>
    ${project.reviewNotes && review !== "rejected"?`<div class="notice"><b>Administrator feedback</b><p>${esc(project.reviewNotes)}</p></div>`:""}
    <div class="capstone-checks-heading"><h4>Automated structure checks</h4><p>These checks inspect repository files; they do not run or review your code.</p></div>
    <ul class="repo-check-list">${(project.checks||[]).map(check=>`<li class="${check.passed?"passed":"missing"}"><span aria-hidden="true">${check.passed?"✓":"·"}</span>${esc(check.label)}</li>`).join("")}</ul>
  </section>`;
}
function dashboardView() {
  if (state.user?.role === "admin") return adminView();
  const p = state.progress || { enrolled:false, completedLessonIds:[], completedLessons:0,totalLessons:10,quizPassed:false,project:null,certificate:null };
  const overall = pct(p.completedLessons,p.totalLessons);
  const accountMenu=`<div class="dash-account"><button class="dash-avatar" type="button" data-action="account" aria-label="Account menu" aria-expanded="false">${esc(state.user.fullName.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase())}</button><div class="dash-account-menu" id="dash-account-menu"><b>${esc(state.user.fullName)}</b><span>${esc(state.user.email||"")}</span><button type="button" data-action="change-email">Change email</button><button type="button" class="danger" data-action="delete-account">Delete account</button></div></div>`;
  return `${header()}<main class="workspace-main"><div class="workspace-shell"><aside>${workspaceNav("dashboard")}<div class="workspace-course-summary"><small>CURRENT PROGRAMME</small><b>Python API Development</b><span>${p.completedLessons}/${p.totalLessons} milestones</span></div></aside><section class="workspace-content"><div class="workspace-page-heading"><div><div class="eyebrow">LEARNER WORKSPACE</div><h1>Welcome, ${esc(state.user.fullName.split(" ")[0])}</h1><p>Your learning progress and next actions are all in one place.</p></div>${accountMenu}</div><section class="overview-progress-card"><div><span class="module-kicker">PROGRAMME PROGRESS</span><h2>${overall}% complete</h2><p>${p.completedLessons} of ${p.totalLessons} learning milestones completed</p><div class="progress-track" role="progressbar" aria-label="Programme progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${overall}" aria-valuetext="${overall}% complete"><span style="width:${overall}%"></span></div></div><div class="overview-ring" style="--progress:${overall*3.6}deg"><b>${overall}%</b></div></section><div class="overview-grid"><article class="overview-action-card"><span class="overview-card-icon blue">▦</span><div><small>CONTINUE LEARNING</small><h2>${p.completedLessons?"Next milestone":"Start the programme"}</h2><p>${p.completedLessons?p.completedLessons+" milestones completed":"Explore the curriculum and complete your first lesson."}</p></div>${btn(p.enrolled?"Open my learning":"Enroll now",p.enrolled?"learning":"enroll","btn soft")}</article><article class="overview-action-card"><span class="overview-card-icon green">✓</span><div><small>KNOWLEDGE ASSESSMENT</small><h2>${p.quizPassed?"Assessment passed":"Final assessment"}</h2>  <p>${p.quizPassed?"Your latest passed result is recorded.":"Complete the knowledge and written-evidence assessment."}</p></div>${btn("Open assessment","quiz","btn soft",!p.enrolled?"disabled":"")}</article><article class="overview-action-card"><span class="overview-card-icon purple">⌘</span><div><small>CAPSTONE PROJECT</small><h2>${p.project?.passed?"Checklist passed":"Build your project"}</h2><p>${p.project?"Latest repository check: "+p.project.score+"/7":"Submit a public repository for structural checks."}</p></div>${btn("Open capstone","capstone","btn soft",!p.enrolled?"disabled":"")}</article><article class="overview-action-card"><span class="overview-card-icon gold">◆</span><div><small>CERTIFICATE</small><h2>${p.certificate?"Certificate issued":"Certificate status"}</h2><p>${p.certificate?"View, print or share your credential.":"Complete all programme requirements to unlock it."}</p></div>${btn("Certificate centre","certificates","btn soft")}</article></div></section></div></main>${footer()}`;
}


function quizView() {
  const prompts = state.quiz?.prompts || [];
  const sessionLabel=String(state.quizNonce||"").slice(0,8).toUpperCase();
  const identity=esc(state.user?.email || state.user?.fullName || "Automivex learner");
  return `${header()}<main class="dashboard-main assessment-lockdown"><div class="assessment-watermark">${identity} · ${sessionLabel}</div><div class="container narrow"><button class="back-link" data-action="dashboard">← Exit assessment</button><div class="eyebrow">APPLIED KNOWLEDGE ASSESSMENT</div><h1>Python API Development</h1><p class="muted">20 randomized knowledge questions plus 3 written evidence prompts. Keep this tab visible until submission. If you enter fullscreen, leaving it will invalidate the attempt; browsers that block fullscreen can still complete the assessment.</p><div class="notice"><b>Integrity controls</b><p>Copying, pasting, switching tabs or applications, exiting fullscreen, and starting another assessment session can invalidate the attempt. These controls discourage external assistance but cannot technically prove that someone is not using an AI assistant outside the browser.</p></div><div class="notice"><b>AI-use policy</b><p>Write the evidence in your own words from your project, tests and course work. AI assistance must not replace the evidence or reasoning you submit.</p></div><form id="quiz-form" class="panel quiz-form">${state.quiz.questions.map((q,i)=>`<fieldset class="question"><legend><span>QUESTION ${String(i+1).padStart(2,"0")}</span>${esc(q.question)}</legend><div class="choice-list">${q.choices.map((c,j)=>`<label class="choice"><input type="radio" name="q${q.id}" value="${j}" required><span>${esc(c)}</span></label>`).join("")}</div></fieldset>`).join("")}<section class="written-evidence"><div class="eyebrow">WRITTEN EVIDENCE</div><h2>Explain your own decisions and implementation</h2><p class="panel-intro">Each response must contain at least 120 characters. Type each answer yourself; automated paste is blocked and recorded.</p>${prompts.map((p,i)=>`<label class="form-field"><span>Evidence ${i+1} · at least 120 characters</span><textarea name="evidence_${esc(p.id)}" minlength="120" maxlength="3000" required placeholder="${esc(p.prompt)}"></textarea></label>`).join("")}<label class="choice declaration"><input type="checkbox" name="aiDeclaration" required><span>I confirm that these responses describe my own work and reasoning, and that I did not submit AI-generated answers as my own.</span></label></section><button class="btn primary full" type="submit">Submit final assessment</button></form></div></main>${footer()}`;
}
function capstoneView() {
  const c = state.course.capstone;
  const p = state.progress || { enrolled:false, completedLessons:0, totalLessons:10, quizPassed:false, project:null };
  const project = p.project;
  const canSubmit = p.enrolled && p.completedLessons >= p.totalLessons && p.quizPassed;
  const blocker = !p.enrolled ? "Enroll in the course first." : p.completedLessons < p.totalLessons ? "Complete all learning milestones before submitting your capstone." : !p.quizPassed ? "Pass the final assessment before submitting your capstone." : "";
  const review = project?.humanReviewStatus || "pending";
  const reviewLabel = review === "approved" ? "Administrator approved" : review === "rejected" ? "Changes requested" : "Administrator review pending";
  return `${header()}<main class="dashboard-main"><div class="container narrow"><button class="back-link" data-action="dashboard">← Back to dashboard</button><div class="eyebrow">INDEPENDENT PORTFOLIO PROJECT · 2026</div><h1>${esc(c.title)}</h1><p class="lead">${esc(c.summary)}</p><div class="panel"><div class="eyebrow">CORE REQUIREMENTS</div><h2>What your application must demonstrate</h2><ol class="requirement-list">${c.required.map(r=>`<li>${esc(r)}</li>`).join("")}</ol></div><div class="panel"><div class="eyebrow">OPTIONAL EXTENSIONS</div><h2>Go beyond the minimum</h2><ul class="requirement-list">${c.optional.map(r=>`<li>${esc(r)}</li>`).join("")}</ul></div><div class="panel"><div class="eyebrow">SUBMISSION CHECKLIST</div><h2>Repository structure</h2><p class="panel-intro">The automated checker verifies the following public repository items. Core checks must all pass and at least one additional item must be present.</p><ul class="requirement-list">${c.submissionChecks.map(r=>`<li>${esc(r)}</li>`).join("")}</ul><div class="notice"><b>Assessment transparency</b><p>The checker verifies public repository metadata and file presence; it does not execute code or provide a human code review. A passing automated check is followed by an administrator review before certificate issuance.</p></div></div><div class="panel"><div class="eyebrow">RECOMMENDED STACK</div><h2>Build with current, established tools</h2><div class="stack-grid">${["Python 3.11+","FastAPI","Pydantic v2","PostgreSQL","SQLAlchemy 2.x","Alembic","Pytest","Docker Compose","GitHub Actions"].map(x=>`<span>${x}</span>`).join("")}</div><div class="notice"><b>Version note</b><p>The linked freeCodeCamp recording is an older long-form course. Use the current official documentation when package commands or APIs differ: <a href="https://fastapi.tiangolo.com/" target="_blank" rel="noopener">FastAPI</a> · <a href="https://docs.pydantic.dev/latest/" target="_blank" rel="noopener">Pydantic</a> · <a href="https://docs.sqlalchemy.org/en/20/" target="_blank" rel="noopener">SQLAlchemy 2.x</a> · <a href="https://alembic.sqlalchemy.org/" target="_blank" rel="noopener">Alembic</a> · <a href="https://docs.pytest.org/en/stable/" target="_blank" rel="noopener">pytest</a> · <a href="https://docs.github.com/en/actions" target="_blank" rel="noopener">GitHub Actions</a>.</p></div></div><section class="panel project-submission" id="project-submission"><div class="eyebrow">CAPSTONE SUBMISSION</div><h2>${project ? "Repository submission" : "Submit your public repository"}</h2><p class="panel-intro">We check repository file structure only. Keep secrets and personal data out of public repositories. Your project stays yours; this platform stores the repository URL and check results.</p>${project ? `<div class="project-review-status"><span class="status-pill ${project.passed?"good":""}">Automated check ${project.passed?"passed":"needs work"} · ${project.score}/7</span><span class="status-pill ${review==="approved"?"good":""}">${reviewLabel}</span><a href="${esc(project.githubUrl)}" target="_blank" rel="noopener">${esc(project.githubUrl)} ↗</a>${project.reviewNotes?`<p class="notice">Administrator feedback: ${esc(project.reviewNotes)}</p>`:""}</div><ul class="repo-check-list">${(project.checks||[]).map(check=>`<li class="${check.passed?"passed":"missing"}"><span aria-hidden="true">${check.passed?"✓":"·"}</span>${esc(check.label)}</li>`).join("")}</ul>`:""}${blocker?`<div class="notice"><b>Before you submit</b><p>${blocker}</p>${!p.enrolled?btn("Enroll for free","enroll","btn soft"):p.completedLessons<p.totalLessons?btn("Continue learning","learning","btn soft"):btn("Open assessment","assessment","btn soft")}</div>`:""}<form id="project-form" class="form project-submission-form"><label>Public GitHub repository URL<input type="url" name="githubUrl" required maxlength="500" placeholder="https://github.com/username/project" value="${esc(project?.githubUrl||"")}" autocomplete="url"></label><label>Live demo URL <span class="muted-inline">Optional</span><input type="url" name="demoUrl" maxlength="500" placeholder="https://example.com" value="${esc(project?.demoUrl||"")}" autocomplete="url"></label><label class="check-label"><input type="checkbox" name="declaration" required><span>This is my work, I have permission to publish it, and the repository is public. I have removed passwords, API keys and private data.</span></label><button class="btn primary full" type="submit" ${canSubmit?"":"disabled"}>${project?"Update and recheck repository":"Check repository and submit"}</button></form><p class="submission-help">A passing checklist is followed by an administrator review. Approval is required before you can issue a certificate. Updating the repository after approval starts a new review.</p></section>${btn("Return to my learning dashboard","dashboard","btn primary")}</div></main>${footer()}`;
}
function adminView() {
  if (!state.admin) return `${header()}<main class="dashboard-main"><div class="container"><div class="eyebrow">COMPANY ADMINISTRATION</div><h1>Administration dashboard</h1><div class="empty-state" role="${state.adminError?"alert":"status"}">${state.adminError?`${esc(state.adminError)} ${btn("Try again","admin","btn primary")}`:"Loading administrator overview…"}</div></div></main>${footer()}`;
  const a = state.admin;
  const rows = a.submissions.map(s => {
    const review = s.human_review_status || "pending";
    const label = review === "approved" ? "Approved" : review === "rejected" ? "Needs changes" : "Pending";
    const statusClass = review === "approved" ? "good" : review === "pending" ? "pending" : "";
    const socialAttestations = s.social_attestations || {};
    const socialComplete = SOCIAL_REQUIREMENTS.every(({key}) => socialAttestations[key] === true);
    const socialSummary = SOCIAL_REQUIREMENTS.map(({key,label})=>`${label}: ${socialAttestations[key]===true?"Attested":"Missing"}`).join(" · ");
    return `<tr>
      <td>${esc(s.full_name)}<small>${esc(s.email)}</small></td>
      <td><a href="${esc(s.github_url)}" target="_blank" rel="noopener">Open repo ↗</a></td>
      <td><span class="status-pill ${s.passed ? "good" : ""}">${s.score}/7 · ${s.passed ? "Passed" : "Needs work"}</span></td>
      <td><small class="social-review-summary">${esc(socialSummary)}</small><small class="social-review-disclaimer">Learner self-attestation; not independently verified</small></td>
      <td><span class="status-pill ${statusClass}">${label}</span>${s.review_notes ? `<small class="review-note">${esc(s.review_notes)}</small>` : ""}</td>
      <td>${new Date(s.submitted_at).toLocaleDateString()}</td>
      <td><div class="review-actions">${s.passed && socialComplete ? `<button class="btn tiny primary" type="button" data-action="review-project" data-submission-id="${esc(s.id)}" data-review-status="approved">Approve</button>` : ""}<button class="btn tiny outline" type="button" data-action="review-project" data-submission-id="${esc(s.id)}" data-review-status="rejected">Request changes</button></div></td>
    </tr>`;
  }).join("");
  return `${header()}<main class="dashboard-main"><div class="container"><div class="eyebrow">COMPANY ADMINISTRATION</div><h1>Administration dashboard</h1><p class="muted">Private operational metrics and submitted repository checks.</p><div class="admin-stats"><div><small>Learner accounts</small><b>${a.counts.users}</b></div><div><small>Enrollments</small><b>${a.counts.enrollments}</b></div><div><small>Project submissions</small><b>${a.counts.projects}</b></div><div><small>Certificates issued</small><b>${a.counts.certificates}</b></div></div><section class="panel"><h2>Recent project submissions</h2><p class="panel-intro">Review the public repository checklist and recorded commit before approving a capstone. Social confirmations are learner self-attestations, not independently verified. Approval unlocks certificate issuance only while the repository still matches the verified commit.</p><div class="table-wrap"><table><thead><tr><th>Student</th><th>Repository</th><th>Checklist</th><th>Social confirmations</th><th>Review</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>${rows || `<tr><td colspan="7">No submissions yet.</td></tr>`}</tbody></table></div></section></div></main>${footer()}`;
}
function render() {
  destroyLessonPlayers();
  if (state.view === "auth") app.innerHTML = authView();
  else if (state.view === "dashboard") app.innerHTML = dashboardView();
  else if (state.view === "learning") app.innerHTML = learningView();
  else if (state.view === "assessment") app.innerHTML = assessmentView();
  else if (state.view === "quiz") app.innerHTML = quizView();
  else if (state.view === "capstone") app.innerHTML = capstoneView();
  else if (state.view === "certificates") app.innerHTML = certificatesView();
  else if (state.view === "admin") app.innerHTML = adminView();
  else app.innerHTML = homeView();
  if (state.view === "capstone") {
    const form = $("#project-form");
    const declaration = form?.querySelector(".check-label");
    if (declaration) declaration.insertAdjacentHTML("beforebegin", socialAttestationFields(state.config.links || {}));
    const socialConfigured = SOCIAL_REQUIREMENTS.every(({key}) => state.config.links?.[key]);
    const submitButton = form?.querySelector('button[type="submit"]');
    if (submitButton && !socialConfigured) submitButton.disabled = true;
    const project = state.progress?.project;
    let reviewStatus = $(".project-review-status");
    if (project && reviewStatus) {
      const review = project.humanReviewStatus || "pending";
      const reviewLabel = review === "approved" ? "Administrator approved" : review === "rejected" ? "Changes requested" : "Administrator review pending";
      const existingChecks = reviewStatus.nextElementSibling;
      const replacement = document.createElement("template");
      replacement.innerHTML = submittedProjectCard(project, reviewLabel);
      reviewStatus.replaceWith(replacement.content.firstElementChild);
      if (existingChecks?.classList.contains("repo-check-list")) existingChecks.remove();
      reviewStatus = $(".project-review-status");
    }
    if (project && reviewStatus) {
      const attestationStatus = document.createElement("small");
      attestationStatus.className = "social-attestation-status";
      attestationStatus.textContent = SOCIAL_REQUIREMENTS.map(({key,label})=>`${label}: ${project.socialAttestations?.[key]===true?"Attested":"Not attested"}`).join(" · ");
      reviewStatus.append(attestationStatus);
    }
  }
  if (window.__automivexTheme) window.__automivexTheme.refresh();
  if (state.view === "learning") requestAnimationFrame(() => initLessonPlayers());
  if (state.view === "quiz") window.scrollTo(0,0);
}
async function refresh() {
  const me = await api("/api/me");
  state.user = me.user; state.progress = me.progress;
  if (state.view === "dashboard" && !state.user) state.view="home";
}
async function loadAdminOverview() {
  try {
    state.admin = await api("/api/admin/overview");
    state.adminError = null;
  } catch (error) {
    state.admin = null;
    state.adminError = "Administrator overview could not be loaded.";
    console.error(error);
    if (state.view === "admin") render();
    throw error;
  }
}
async function go(view) {
  if (state.view === "quiz" && view !== "quiz") await exitAssessmentFullscreen();
  if (["dashboard","learning","assessment","quiz","capstone","certificates","admin"].includes(view)) {
    if (!state.user) { state.view="auth"; render(); return; }
    await refresh();
    if (state.user?.role === "admin") {
      view = "admin";
      state.view = "admin";
      history.replaceState(null,"","#admin");
    }
    if (view === "admin") {
      if (state.user.role !== "admin") {
        toast("Administrator access required.","error");
        state.view="dashboard";
        history.replaceState(null,"","#dashboard");
        render();
        return;
      }
      await loadAdminOverview();
    }
  } else if (state.user?.role === "admin") {
    view = "admin";
    state.view = "admin";
    history.replaceState(null,"","#admin");
    await loadAdminOverview();
  }
  state.view=view;
  if (view === "home") history.replaceState(null,"",location.pathname);
  else history.replaceState(null,"",`#${view}`);
  render(); window.scrollTo(0,0);
}
async function startAuth(form) {
  const data = new FormData(form);
  const result = await api("/api/auth/start",{method:"POST",body:JSON.stringify({fullName:data.get("fullName"),email:data.get("email"),acceptTerms:data.get("acceptTerms")==="on",marketingOptIn:false})});
  state.authEmail=String(data.get("email")).trim().toLowerCase(); state.debugCode=result.debugCode||null; render(); toast("Check your email for the six-digit code.");
}
async function verifyAuth(form) {
  const code = new FormData(form).get("code");
  await api("/api/auth/verify",{method:"POST",body:JSON.stringify({email:state.authEmail,code})});
  state.authEmail=""; state.debugCode=null; await refresh();
  state.view=state.user?.role==="admin"?"admin":"dashboard";
  if (state.view==="admin") {
    state.admin=null;
    history.replaceState(null,"","#admin");
    render();
    await loadAdminOverview();
  }
  history.replaceState(null,"",`#${state.view}`); render(); toast("You are signed in.");
}
async function enroll() { const d=await api("/api/enroll",{method:"POST",body:"{}"}); state.progress=d.progress; render(); toast("You are enrolled. Your learning path is ready."); }
async function submitLessonCheck(form, id) {
  const data = new FormData(form);
  const choice = Number(data.get("choice"));
  const reflection = String(data.get("reflection") || "").trim();
  const d = await api(`/api/lessons/${id}/complete`, { method:"POST", body: JSON.stringify({ choice, reflection }) });
  state.progress = d.progress;
  render();
  toast("Learning check passed. Milestone complete.","success");
}
async function loadQuiz() {
  const fullscreenRequest = document.documentElement.requestFullscreen
    ? document.documentElement.requestFullscreen().then(() => true).catch(() => false)
    : Promise.resolve(false);
  let d;
  try {
    d = await api("/api/quiz");
  } catch (error) {
    await fullscreenRequest;
    await exitAssessmentFullscreen();
    throw error;
  }
  state.quiz=d; state.quizNonce=d.nonce; state.view="quiz";
  state.quizIntegrity={startedAt:Date.now(),visibilityHiddenCount:0,focusLossCount:0,copyAttempts:0,pasteAttempts:0,fullscreenExitedCount:0,fullscreenEntered:false};
  setupAssessmentIntegrity();
  render();
  state.quizIntegrity.fullscreenEntered = await fullscreenRequest && !!document.fullscreenElement;
}
function setupAssessmentIntegrity() {
  if (assessmentIntegrityListenersReady) return;
  assessmentIntegrityListenersReady = true;
  document.addEventListener("fullscreenchange", () => {
    const integrity = state.quizIntegrity;
    if (!integrity) return;
    if (state.view==="quiz" && document.fullscreenElement) integrity.fullscreenEntered=true;
    else if (state.view==="quiz" && integrity.fullscreenEntered) integrity.fullscreenExitedCount++;
  });
  document.addEventListener("visibilitychange", () => {
    if (state.view==="quiz" && document.hidden && state.quizIntegrity) state.quizIntegrity.visibilityHiddenCount++;
  });
  window.addEventListener("blur", () => {
    if (state.view==="quiz" && state.quizIntegrity) state.quizIntegrity.focusLossCount++;
  });
  document.addEventListener("copy", e => { if (state.view==="quiz" && state.quizIntegrity) { state.quizIntegrity.copyAttempts++; e.preventDefault(); } });
  document.addEventListener("cut", e => { if (state.view==="quiz") e.preventDefault(); });
  document.addEventListener("paste", e => { if (state.view==="quiz" && state.quizIntegrity) { state.quizIntegrity.pasteAttempts++; e.preventDefault(); } });
  document.addEventListener("contextmenu", e => { if (state.view==="quiz") e.preventDefault(); });
  document.addEventListener("dragstart", e => { if (state.view==="quiz") e.preventDefault(); });
  document.addEventListener("keydown", e => {
    if (state.view !== "quiz") return;
    const key=e.key.toLowerCase();
    const blocked = e.key==="F12" || (e.ctrlKey && ["u","s","p"].includes(key)) || (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(key));
    if (blocked) e.preventDefault();
  });
}
async function submitQuiz(form) {
  const f=new FormData(form), answers={};
  for (const q of state.quiz.questions) answers[q.id]=Number(f.get(`q${q.id}`));
  const evidence={};
  for (const prompt of state.quiz.prompts || []) evidence[prompt.id]=String(f.get(`evidence_${prompt.id}`)||"");
  const integrity=state.quizIntegrity ? {...state.quizIntegrity,elapsedSeconds:Math.max(0,Math.round((Date.now()-state.quizIntegrity.startedAt)/1000))} : {};
  const d=await api("/api/quiz/submit",{method:"POST",body:JSON.stringify({nonce:state.quizNonce,answers,evidence,aiDeclaration:f.get("aiDeclaration")==="on",integrity})});
  await exitAssessmentFullscreen();
  await refresh(); state.view="dashboard"; render(); toast(`Assessment: ${d.score}/${d.total} (${d.percentage}%). ${d.message}`,d.passed?"success":"error");
}
async function exitAssessmentFullscreen() {
  if (!document.fullscreenElement || !document.exitFullscreen) return;
  try { await document.exitFullscreen(); } catch {}
}
async function submitProject(form) {
  const f=new FormData(form);
  const socialAttestations=Object.fromEntries(SOCIAL_REQUIREMENTS.map(({key})=>[key,f.getAll("socialAttestations").includes(key)]));
  const d=await api("/api/project/submit",{method:"POST",body:JSON.stringify({githubUrl:f.get("githubUrl"),demoUrl:f.get("demoUrl"),declaration:f.get("declaration")==="on",socialAttestations})});
  await refresh();
  state.view="capstone";
  render();
  document.querySelector("#project-submission")?.scrollIntoView({behavior:"smooth",block:"start"});
  toast(d.result.message,d.result.passed?"success":"error");
}
async function reviewProject(submissionId, status) {
  const note = window.prompt(status === "approved" ? "Optional review note for this approval:" : "Optional feedback for the learner:", "");
  if (note === null) return;
  const button = [...document.querySelectorAll('[data-action="review-project"]')]
    .find(item => item.dataset.submissionId === submissionId && item.dataset.reviewStatus === status);
  const stopLoading = beginButtonLoading(button, status === "approved" ? "Approving…" : "Saving feedback…");
  try {
    await api("/api/admin/projects/review", {
      method:"POST",
      body:JSON.stringify({ submissionId, status, notes:note })
    });
    state.admin = await api("/api/admin/overview");
    render();
    toast(status === "approved" ? "Capstone approved. Certificate eligibility is now unlocked." : "Capstone rejected. Your feedback was saved.", "success");
  } finally {
    stopLoading?.();
  }
}
async function issueCertificate() {
  const d=await api("/api/certificate/issue",{method:"POST",body:"{}"});
  await refresh(); render(); toast("Your certificate has been issued.","success");
  window.location.href=`/certificate.html?code=${encodeURIComponent(d.code)}`;
}
app.addEventListener("click", async e=>{
  const el=e.target.closest("[data-action]"); if(!el) return;
  const action=el.dataset.action;
  if (el instanceof HTMLButtonElement && el.disabled) return;
  const usesLoading = !["menu","account","delete-account","review-project","open-module","video-segment"].includes(action) && !action.startsWith("lesson:");
  const stopLoading = usesLoading ? beginButtonLoading(el, buttonLoadingLabel(action)) : null;
  try {
    if(action !== "menu") {
      $("#mobile-links")?.classList.remove("open");
      const menuButton=$(".mobile-menu");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Open navigation");
    }
    if(action==="home") await go("home");
    else if(action==="program") { await go(state.user?"dashboard":"home"); document.querySelector("#program")?.scrollIntoView({behavior:"smooth"}); }
    else if(action==="capstone") { if(state.user) await go("capstone"); else { await go("home"); document.querySelector("#capstone")?.scrollIntoView({behavior:"smooth"}); } }
    else if(action==="auth") await go("auth");
    else if(action==="dashboard") await go("dashboard");
    else if(action==="learning") await go("learning");
    else if(action==="assessment") await go("assessment");
    else if(action==="certificates") await go("certificates");
    else if(action==="admin") await go("admin");
    else if(action==="enroll") await enroll();
    else if(action==="quiz") await loadQuiz();
    else if(action==="capstone-details") await go("capstone");
    else if(action==="issue-certificate") await issueCertificate();
    else if(action==="review-project") await reviewProject(el.dataset.submissionId, el.dataset.reviewStatus);
    else if(action==="account") {
      const menu=$("#dash-account-menu");
      if (menu) {
        const open=menu.classList.toggle("open");
        el.setAttribute("aria-expanded",String(open));
      }
    }
    else if(action==="change-email") {state.authEmail="";state.debugCode=null;await go("auth");}
    else if(action==="logout") {await api("/api/auth/logout",{method:"POST",body:"{}"});state.user=null;state.progress=null;state.admin=null;state.adminError=null;state.view="home";history.replaceState(null,"",location.pathname);render();toast("You have signed out.");}
    else if(action==="delete-account") { if(confirm("Permanently delete your Automivex learning account, progress, submissions and certificate records? This cannot be undone.")){const stopDeleteLoading=beginButtonLoading(el,"Deleting account…");try{await api("/api/account",{method:"DELETE"});state.user=null;state.progress=null;state.view="home";render();toast("Your learning account and associated records were deleted.","success");}finally{stopDeleteLoading?.();}} }
    else if(action.startsWith("lesson:")) {
      const lessonId = action.split(":")[1];
      const details = document.querySelector(`[data-lesson-details="${lessonId}"]`);
      if (details) { details.open = true; details.scrollIntoView({behavior:"smooth",block:"center"}); }
      else if(state.view==="learning") toast("Lesson selected. Open the module and use the knowledge check after studying this milestone.");
    }
    else if(action==="menu") {
      const open = $("#mobile-links")?.classList.toggle("open") || false;
      el.setAttribute("aria-expanded", String(open));
      el.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    }
    else if(action==="video-segment") switchLessonVideoSegment(el);
    else if(action==="open-module") {
      const body=el.nextElementSibling;
      const isOpen=body?.classList.toggle("open")||false;
      el.setAttribute("aria-expanded",String(isOpen));
      body?.setAttribute("aria-hidden",String(!isOpen));
    }
  } catch(err) { toast(err.message,"error"); }
  finally { stopLoading?.(); }
});
app.addEventListener("submit", async e=>{
  e.preventDefault();
  const form=e.target;
  if (!(form instanceof HTMLFormElement) || form.dataset.submitting === "true") return;
  form.dataset.submitting = "true";
  const submitButton = form.querySelector('button[type="submit"]');
  const loadingLabel = ({
    "start-form": "Sending code…",
    "verify-form": "Verifying code…",
    "quiz-form": "Submitting assessment…",
    "project-form": "Checking repository…"
  })[form.id] || "Saving progress…";
  const stopLoading = beginButtonLoading(submitButton, loadingLabel);
  try {
    if(form.matches("[data-lesson-check]")) await submitLessonCheck(form, form.dataset.lessonCheck);
    else if(form.id==="start-form") await startAuth(form);
    else if(form.id==="verify-form") await verifyAuth(form);
    else if(form.id==="quiz-form") await submitQuiz(form);
    else if(form.id==="project-form") await submitProject(form);
  } catch(err) { toast(err.message,"error"); }
  finally {
    delete form.dataset.submitting;
    stopLoading?.();
  }
});
(async function init(){
  try { const cfg=await api("/api/config"); state.config=cfg; const c=await api("/api/course"); state.course=c.course; const me=await api("/api/me"); state.user=me.user;state.progress=me.progress; }
  catch(err) { console.error(err); }
  const hashView = location.hash.replace(/^#/,"");
  if (state.user?.role === "admin") {
    state.view="admin";
    history.replaceState(null,"","#admin");
    try { await loadAdminOverview(); }
    catch(err) { console.error(err); }
  } else if (state.user && ["dashboard","learning","assessment","quiz","capstone","certificates"].includes(hashView)) state.view=hashView;
  render();
})();
window.addEventListener("hashchange", async ()=>{
  const hash=location.hash.replace(/^#/,"");
  if (!state.user) return;
  const allowed=state.user.role==="admin"
    ? ["dashboard","admin"]
    : ["dashboard","learning","assessment","quiz","capstone","certificates"];
  if (state.user.role==="admin" && !allowed.includes(hash)) {
    history.replaceState(null,"","#admin");
    return;
  }
  if (allowed.includes(hash)) {
    await go(hash);
  }
});
