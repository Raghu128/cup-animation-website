const scene = document.getElementById("scene");
const canvas = document.getElementById("video-canvas");
const meterFill = document.getElementById("meter-fill");
const loading = document.getElementById("loading");
const ctx = canvas.getContext("2d", { alpha: false });

const frameCount = 192;
const frames = new Array(frameCount);

// Crop source frame edges to hide watermark from the exported footage.
const crop = {
  top: 0.00,
  bottom: 0.0,
  right: 0.0,
  left: 0.0,
};

let loadedFrames = 0;
let smoothFrame = 0;
let lastDrawnFrame = -1;

function frameSrc(index) {
  return `frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
}

function drawCoverFrame(image) {
  if (!image) {
    return;
  }

  const activeRightCrop = window.innerWidth > 728 ? 0.12 : crop.right;

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;

  const sx = Math.floor(iw * crop.left);
  const sy = Math.floor(ih * crop.top);
  const sw = Math.floor(iw * (1 - crop.left - activeRightCrop));
  const sh = Math.floor(ih * (1 - crop.top - crop.bottom));

  if (sw <= 0 || sh <= 0) {
    return;
  }

  const scale = Math.max(cw / sw, ch / sh);
  const drawW = sw * scale;
  const drawH = sh * scale;
  const x = (cw - drawW) / 2;
  const y = (ch - drawH) / 2;

  ctx.drawImage(image, sx, sy, sw, sh, x, y, drawW, drawH);
}

function getScrollProgress() {
  const rect = scene.getBoundingClientRect();
  const total = scene.offsetHeight - window.innerHeight;
  if (total <= 0) {
    return 0;
  }
  const walked = Math.min(Math.max(-rect.top, 0), total);
  return walked / total;
}

function findClosestLoaded(index) {
  if (frames[index]) {
    return frames[index];
  }

  for (let offset = 1; offset < frameCount; offset += 1) {
    const left = index - offset;
    const right = index + offset;

    if (left >= 0 && frames[left]) {
      return frames[left];
    }

    if (right < frameCount && frames[right]) {
      return frames[right];
    }
  }

  return null;
}

function tick() {
  const progress = getScrollProgress();

  const targetFrame = progress * (frameCount - 1);
  smoothFrame += (targetFrame - smoothFrame) * 0.18;

  const frameIndex = Math.min(
    frameCount - 1,
    Math.max(0, Math.round(smoothFrame))
  );

  if (frameIndex !== lastDrawnFrame) {
    const frameImage = findClosestLoaded(frameIndex);
    if (frameImage) {
      drawCoverFrame(frameImage);
      lastDrawnFrame = frameIndex;
    }
  }

  meterFill.style.width = `${Math.round(progress * 100)}%`;
  requestAnimationFrame(tick);
}

function preloadFrames() {
  for (let i = 0; i < frameCount; i += 1) {
    const img = new Image();
    img.decoding = "async";
    img.src = frameSrc(i);

    img.onload = () => {
      frames[i] = img;
      loadedFrames += 1;

      const percent = Math.round((loadedFrames / frameCount) * 100);
      loading.textContent = `Loading frame sequence... ${percent}%`;

      // Draw as soon as the first frame is available.
      if (i === 0 && lastDrawnFrame === -1) {
        drawCoverFrame(img);
        lastDrawnFrame = 0;
      }

      if (loadedFrames === frameCount) {
        loading.style.display = "none";
      }
    };

    img.onerror = () => {
      loadedFrames += 1;
      if (loadedFrames === frameCount) {
        loading.textContent = "Some frames failed to load.";
      }
    };
  }
}

window.addEventListener("resize", () => {
  resizeCanvas();
  const fallback = findClosestLoaded(lastDrawnFrame < 0 ? 0 : lastDrawnFrame);
  drawCoverFrame(fallback);
});

resizeCanvas();
preloadFrames();
requestAnimationFrame(tick);
