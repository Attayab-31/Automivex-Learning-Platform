document.addEventListener("click", async event => {
  const button = event.target.closest("[data-copy-link]");
  if (!button) return;
  const status = document.querySelector("[data-copy-status]");
  try {
    await navigator.clipboard.writeText(button.dataset.copyLink);
    button.textContent = "Copied";
    if (status) status.textContent = "Verification link copied.";
    setTimeout(() => { button.textContent = "Copy verification link"; }, 1800);
  } catch (error) {
    if (status) status.textContent = "Could not copy the link. Copy it from your browser address bar instead.";
    console.error("Certificate verification link copy failed", error);
  }
});
