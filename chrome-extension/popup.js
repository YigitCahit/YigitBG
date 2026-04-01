const STORAGE_KEY = "yigitbgThemeSettings";

const DEFAULT_SETTINGS = {
  backgroundUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920",
  backgroundDataUrl: "",
  position: "center",
  size: "cover",
  blur: 0,
  opacity: 0.5
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const form = document.getElementById("theme-form");
const statusText = document.getElementById("status");
const blurInput = document.getElementById("blur");
const opacityInput = document.getElementById("opacity");
const blurValue = document.getElementById("blurValue");
const opacityValue = document.getElementById("opacityValue");
const resetButton = document.getElementById("resetButton");
const saveButton = form.querySelector('button[type="submit"]');

let currentSettings = { ...DEFAULT_SETTINGS };
let isSaving = false;

function updateLiveLabels() {
  blurValue.textContent = String(blurInput.value);
  opacityValue.textContent = Number(opacityInput.value).toFixed(2);
}

function fillForm(settings) {
  currentSettings = { ...DEFAULT_SETTINGS, ...settings };

  form.backgroundUrl.value = currentSettings.backgroundUrl;
  form.position.value = currentSettings.position;
  form.size.value = currentSettings.size;
  form.blur.value = currentSettings.blur;
  form.opacity.value = currentSettings.opacity;
  updateLiveLabels();
}

function readForm() {
  return {
    backgroundUrl: form.backgroundUrl.value.trim() || DEFAULT_SETTINGS.backgroundUrl,
    backgroundDataUrl: "",
    position: form.position.value.trim() || DEFAULT_SETTINGS.position,
    size: form.size.value.trim() || DEFAULT_SETTINGS.size,
    blur: Number(form.blur.value),
    opacity: Number(form.opacity.value)
  };
}

function setSavingState(value) {
  saveButton.disabled = value;
  resetButton.disabled = value;
  saveButton.textContent = value ? "Isleniyor..." : "Kaydet";
}

function showStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#ffc0c0" : "";
  window.clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = window.setTimeout(() => {
    statusText.textContent = "";
  }, 1800);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

async function convertUrlToDataUrl(imageUrl) {
  const response = await fetch(imageUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("download-failed");
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("not-image");
  }

  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error("too-large");
  }

  return blobToDataUrl(blob);
}

async function prepareSettingsForSave(formSettings) {
  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...currentSettings,
    ...formSettings,
    backgroundDataUrl: ""
  };

  const rawBackground = nextSettings.backgroundUrl.trim();

  if (!rawBackground) {
    nextSettings.backgroundUrl = DEFAULT_SETTINGS.backgroundUrl;
    return nextSettings;
  }

  if (/^data:image\//i.test(rawBackground)) {
    nextSettings.backgroundDataUrl = rawBackground;
    return nextSettings;
  }

  if (/^url\(/i.test(rawBackground)) {
    return nextSettings;
  }

  nextSettings.backgroundDataUrl = await convertUrlToDataUrl(rawBackground);
  return nextSettings;
}

function loadSettings() {
  chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }, (result) => {
    fillForm({ ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] });
  });
}

function saveSettings(settings, message, isError = false) {
  chrome.storage.local.set({ [STORAGE_KEY]: settings }, () => {
    if (chrome.runtime.lastError) {
      showStatus(`Kayit hatasi: ${chrome.runtime.lastError.message}`, true);
      return;
    }

    currentSettings = { ...DEFAULT_SETTINGS, ...settings };
    showStatus(message, isError);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSaving) {
    return;
  }

  isSaving = true;
  setSavingState(true);
  showStatus("Resim URL'i isleniyor...");

  const formSettings = readForm();

  try {
    const preparedSettings = await prepareSettingsForSave(formSettings);
    saveSettings(preparedSettings, "Kaydedildi.");
  } catch (error) {
    const fallbackSettings = {
      ...DEFAULT_SETTINGS,
      ...currentSettings,
      ...formSettings,
      backgroundDataUrl: ""
    };

    saveSettings(
      fallbackSettings,
      "Kaydedildi, fakat URL donusturulemedi. Discord CSP bu adresi engelleyebilir.",
      true
    );
  } finally {
    isSaving = false;
    setSavingState(false);
  }
});

blurInput.addEventListener("input", updateLiveLabels);
opacityInput.addEventListener("input", updateLiveLabels);

resetButton.addEventListener("click", () => {
  fillForm(DEFAULT_SETTINGS);
  saveSettings(DEFAULT_SETTINGS, "Varsayilanlara donuldu.");
});

loadSettings();
