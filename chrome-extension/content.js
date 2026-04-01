const STORAGE_KEY = "yigitbgThemeSettings";

const DEFAULT_SETTINGS = {
  backgroundUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920",
  backgroundDataUrl: "",
  position: "center",
  size: "cover",
  blur: 0,
  opacity: 0.5
};

let latestSettings = { ...DEFAULT_SETTINGS };
let retryTimerId = null;
let observerAttached = false;
let isApplying = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseNumeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toCssBackground(urlValue) {
  const safe = String(urlValue || "").trim();
  const fallback = DEFAULT_SETTINGS.backgroundUrl;

  if (!safe) {
    return `url("${fallback}")`;
  }

  if (/^url\(/i.test(safe)) {
    return safe;
  }

  const escaped = safe.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `url("${escaped}")`;
}

function sanitizeSettings(raw = {}) {
  const blur = clamp(parseNumeric(raw.blur, DEFAULT_SETTINGS.blur), 0, 60);
  const opacity = clamp(parseNumeric(raw.opacity, DEFAULT_SETTINGS.opacity), 0, 1);
  const backgroundDataUrl = String(raw.backgroundDataUrl || "").trim();

  return {
    backgroundUrl: String(raw.backgroundUrl || DEFAULT_SETTINGS.backgroundUrl).trim(),
    backgroundDataUrl,
    position: String(raw.position || DEFAULT_SETTINGS.position).trim() || DEFAULT_SETTINGS.position,
    size: String(raw.size || DEFAULT_SETTINGS.size).trim() || DEFAULT_SETTINGS.size,
    blur,
    opacity
  };
}

function applyThemeVariables(target, settings, backgroundValue) {
  if (!target) {
    return;
  }

  const cssBackground = toCssBackground(backgroundValue);

  target.style.setProperty("--ybg-background", cssBackground, "important");
  target.style.setProperty("--ybg-backgroundposition", settings.position, "important");
  target.style.setProperty("--ybg-backgroundsize", settings.size, "important");
  target.style.setProperty("--ybg-backgroundblur", String(settings.blur), "important");
  target.style.setProperty("--ybg-backgroundopacity", String(settings.opacity), "important");

  // Backward compatibility for existing variable names.
  target.style.setProperty("--background", cssBackground, "important");
  target.style.setProperty("--backgroundposition", settings.position, "important");
  target.style.setProperty("--backgroundsize", settings.size, "important");
  target.style.setProperty("--backgroundblur", String(settings.blur), "important");
  target.style.setProperty("--backgroundopacity", String(settings.opacity), "important");
}

function applySanitizedSettings(settings) {
  const root = document.documentElement;

  if (!root) {
    return false;
  }

  const backgroundValue = settings.backgroundDataUrl || settings.backgroundUrl;
  const appMount = document.getElementById("app-mount");

  isApplying = true;

  try {
    applyThemeVariables(root, settings, backgroundValue);
    applyThemeVariables(document.body, settings, backgroundValue);
    applyThemeVariables(appMount, settings, backgroundValue);
  } finally {
    isApplying = false;
  }

  return true;
}

function ensureObserver() {
  if (observerAttached || !document.documentElement) {
    return;
  }

  observerAttached = true;

  // Discord occasionally rewrites root inline styles; re-apply variables when that happens.
  const observer = new MutationObserver(() => {
    if (isApplying) {
      return;
    }

    applySanitizedSettings(latestSettings);
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style", "class"]
  });
}

function scheduleRetry() {
  if (retryTimerId !== null) {
    return;
  }

  retryTimerId = window.setTimeout(() => {
    retryTimerId = null;
    applyLatestSettings();
  }, 50);
}

function applyLatestSettings() {
  const applied = applySanitizedSettings(latestSettings);

  if (!applied) {
    scheduleRetry();
    return;
  }

  ensureObserver();
}

function applySettings(rawSettings) {
  latestSettings = sanitizeSettings(rawSettings);
  applyLatestSettings();
}

function reloadFromStorageAndApply() {
  chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }, (result) => {
    applySettings(result[STORAGE_KEY]);
  });
}

function loadAndApplyInitialSettings() {
  reloadFromStorageAndApply();
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[STORAGE_KEY]) {
    return;
  }

  applySettings(changes[STORAGE_KEY].newValue);
});

document.addEventListener("DOMContentLoaded", () => {
  applyLatestSettings();
});

window.addEventListener("load", () => {
  reloadFromStorageAndApply();
});

window.addEventListener("pageshow", () => {
  reloadFromStorageAndApply();
});

loadAndApplyInitialSettings();
