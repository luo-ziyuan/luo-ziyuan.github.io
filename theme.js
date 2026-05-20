(function () {
  var storageKey = "theme-preference";
  var root = document.documentElement;
  var mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var icons = {
    light: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>',
    dark: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/></svg>'
  };

  function readStoredMode() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function writeStoredMode(mode) {
    try {
      if (!mode || mode === "auto") {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, mode);
      }
    } catch (error) {}
  }

  function currentMode() {
    return readStoredMode() || "auto";
  }

  function resolveTheme(mode) {
    if (mode === "light" || mode === "dark") {
      return mode;
    }
    return mediaQuery && mediaQuery.matches ? "dark" : "light";
  }

  function applyTheme(mode) {
    var resolvedTheme = resolveTheme(mode);
    root.setAttribute("data-theme", resolvedTheme);
    root.setAttribute("data-theme-mode", mode);
  }

  function updateControl(container) {
    var mode = currentMode();
    var resolvedTheme = resolveTheme(mode);
    var input = container.querySelector(".theme-switch-input");
    var label = container.querySelector(".theme-switch-label");
    var icon = container.querySelector(".theme-switch-mode-icon");
    if (!input || !label || !icon) {
      return;
    }

    container.setAttribute("data-resolved-theme", resolvedTheme);
    container.setAttribute("data-theme-mode", mode);
    input.checked = resolvedTheme === "dark";
    input.setAttribute("aria-checked", resolvedTheme === "dark" ? "true" : "false");
    icon.setAttribute("data-mode", resolvedTheme);
    icon.innerHTML = icons[resolvedTheme];

    if (mode === "auto") {
      label.setAttribute("title", "Following system preference. Click to lock the theme.");
    } else if (resolvedTheme === "dark") {
      label.setAttribute("title", "Switch to light mode");
    } else {
      label.setAttribute("title", "Switch to dark mode");
    }
  }

  function setMode(mode, container) {
    if (mode !== "light" && mode !== "dark" && mode !== "auto") {
      mode = "auto";
    }
    writeStoredMode(mode);
    applyTheme(mode);
    if (container) {
      updateControl(container);
    }
  }

  function toggleMode(container) {
    var nextMode = resolveTheme(currentMode()) === "dark" ? "light" : "dark";
    setMode(nextMode, container);
  }

  function handleSystemChange() {
    if (currentMode() !== "auto") {
      return;
    }
    applyTheme("auto");
    var container = document.querySelector(".theme-control");
    if (container) {
      updateControl(container);
    }
  }

  function initThemeControl() {
    if (document.querySelector(".theme-control")) {
      return;
    }

    var menu = document.getElementById("layout-menu");
    if (!menu) {
      return;
    }

    var container = document.createElement("div");
    container.className = "theme-control";

    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "theme-switch-input";
    input.id = "theme-switch-toggle";
    input.setAttribute("role", "switch");
    input.setAttribute("aria-label", "Toggle between light and dark mode");
    input.addEventListener("change", function () {
      setMode(input.checked ? "dark" : "light", container);
    });

    var label = document.createElement("label");
    label.className = "theme-switch-label";
    label.setAttribute("for", input.id);

    var thumb = document.createElement("span");
    thumb.className = "theme-switch-thumb";

    var icon = document.createElement("span");
    icon.className = "theme-switch-mode-icon";
    icon.setAttribute("aria-hidden", "true");

    label.appendChild(thumb);
    label.appendChild(icon);
    container.appendChild(input);
    container.appendChild(label);
    menu.appendChild(container);
    updateControl(container);
  }

  applyTheme(currentMode());

  if (mediaQuery) {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeControl);
  } else {
    initThemeControl();
  }
})();
