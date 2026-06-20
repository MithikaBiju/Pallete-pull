const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const dropzoneContent = document.getElementById("dropzoneContent");
const previewImage = document.getElementById("previewImage");
const canvas = document.getElementById("workCanvas");
const ctx = canvas.getContext("2d");
const resultsSection = document.getElementById("results");
const swatchesContainer = document.getElementById("swatches");
const statusMsg = document.getElementById("statusMsg");
const exportBtn = document.getElementById("exportBtn");

// tweak these to change how the algorithm behaves
const MAX_DIMENSION = 200;   // shrink big photos to this before reading pixels
const SAMPLE_STEP = 4;       // only look at every 4th pixel, way faster
const BUCKET_SIZE = 24;      // how close two colors have to be to count as "the same"
const PALETTE_SIZE = 6;

let currentPalette = [];

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

["dragenter", "dragover"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });
});

["dragleave", "drop"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
  });
});

dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

exportBtn.addEventListener("click", handleExport);

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    setStatus("that's not an image — try a jpg, png or webp", true);
    return;
  }

  setStatus("reading image...");
  const reader = new FileReader();
  reader.onload = (e) => loadImage(e.target.result);
  reader.readAsDataURL(file);
}

function loadImage(dataUrl) {
  const img = new Image();

  img.onload = () => {
    showPreview(dataUrl);
    drawToCanvas(img);

    const pixels = samplePixels();
    currentPalette = getPalette(pixels);
    renderSwatches(currentPalette);
    setStatus("");
  };

  img.onerror = () => setStatus("couldn't load that image, try another one", true);
  img.src = dataUrl;
}

function showPreview(dataUrl) {
  previewImage.src = dataUrl;
  previewImage.hidden = false;
  dropzoneContent.hidden = true;
  dropzone.classList.add("has-image");
}

function drawToCanvas(img) {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function samplePixels() {
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixels = [];

  // data is just [r,g,b,a,r,g,b,a,...] one group of 4 per pixel
  for (let i = 0; i < data.length; i += 4 * SAMPLE_STEP) {
    if (data[i + 3] < 125) continue; // skip transparent-ish pixels
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  return pixels;
}

// group similar colors together and count which group shows up the most.
// rounding each channel to the nearest BUCKET_SIZE is what does the grouping -
// without it almost every pixel in a photo is a "unique" color and you don't
// get anything useful back
function getPalette(pixels) {
  const buckets = new Map();

  for (const [r, g, b] of pixels) {
    const key = round(r) + "," + round(g) + "," + round(b);
    const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };

    bucket.count++;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);

  return sorted.slice(0, PALETTE_SIZE).map((bucket) => {
    const r = Math.round(bucket.r / bucket.count);
    const g = Math.round(bucket.g / bucket.count);
    const b = Math.round(bucket.b / bucket.count);
    return { r, g, b, hex: toHex(r, g, b) };
  });

  function round(n) {
    return Math.round(n / BUCKET_SIZE) * BUCKET_SIZE;
  }
}

function toHex(r, g, b) {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// pick black or cream text depending on how bright the color is
function contrastFor(r, g, b) {
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return brightness > 0.6 ? "#1c1b1a" : "#f2ede4";
}

function renderSwatches(palette) {
  swatchesContainer.innerHTML = "";

  palette.forEach((color, i) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.style.setProperty("--chip-color", color.hex);
    chip.style.setProperty("--chip-text", contrastFor(color.r, color.g, color.b));
    chip.style.animationDelay = i * 60 + "ms";
    chip.setAttribute("aria-label", "Copy " + color.hex);
    chip.innerHTML = `<span class="chip-label">${color.hex}</span>`;

    chip.addEventListener("click", () => copyHex(color.hex, chip));
    swatchesContainer.appendChild(chip);
  });

  resultsSection.hidden = false;
}

function copyHex(hex, chipEl) {
  navigator.clipboard.writeText(hex).then(() => {
    const label = chipEl.querySelector(".chip-label");
    const original = label.textContent;

    label.textContent = "Copied!";
    chipEl.classList.add("is-copied");

    setTimeout(() => {
      label.textContent = original;
      chipEl.classList.remove("is-copied");
    }, 900);
  });
}

function handleExport() {
  if (!currentPalette.length) return;

  const lines = currentPalette.map((c, i) => `  --color-${i + 1}: ${c.hex};`);
  const css = ":root {\n" + lines.join("\n") + "\n}";

  navigator.clipboard.writeText(css).then(() => {
    setStatus("CSS variables copied to clipboard");
  });
}

function setStatus(message, isError = false) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle("is-error", isError);
}
