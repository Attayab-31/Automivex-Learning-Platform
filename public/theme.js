(function () {
  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    var validTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", validTheme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", validTheme === "light" ? "#f8fafc" : "#090d16");
    }
    document.documentElement.style.colorScheme = validTheme;
    var nextTheme = validTheme === "light" ? "dark" : "light";
    var label = "Switch to " + nextTheme + " mode";
    var toggles = document.querySelectorAll(".theme-toggle");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute("aria-label", label);
      toggles[i].setAttribute("title", label);
      toggles[i].setAttribute("aria-pressed", validTheme === "dark" ? "true" : "false");
    }
  }

  window.__automivexTheme = {
    get: function () {
      return document.documentElement.getAttribute("data-theme") || getPreferredTheme();
    },
    set: function (theme) {
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {}
      applyTheme(theme);
    },
    toggle: function () {
      var current = window.__automivexTheme.get();
      var next = current === "light" ? "dark" : "light";
      window.__automivexTheme.set(next);
      return next;
    },
    refresh: function () {
      applyTheme(window.__automivexTheme.get());
    }
  };

  // Immediate zero-flicker application
  applyTheme(getPreferredTheme());

  // Listen to OS preference changes when user has not saved an explicit choice
  if (window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        var hasSaved = false;
        try {
          hasSaved = !!localStorage.getItem("theme");
        } catch (err) {}
        if (!hasSaved) {
          applyTheme(e.matches ? "dark" : "light");
        }
      });
    } catch (e) {}
  }

  // Global click delegate for theme toggle buttons
  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest && e.target.closest(".theme-toggle, [data-action='toggle-theme']");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    window.__automivexTheme.toggle();
  }, true);
})();
