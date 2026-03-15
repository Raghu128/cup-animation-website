# Cup Animation Website

An Apple-style, scroll-driven animation website built from a coffee/juice video sequence.

The hero section renders extracted video frames on a canvas and scrubs through them based on scroll position for a cinematic frame-by-frame feel.

## Features

- Scroll-driven frame-by-frame animation using HTML canvas.
- Frame sequence generated from MP4 (`frames/frame_0001.jpg` ... `frames/frame_0192.jpg`).
- Smooth interpolation between target and current frame index.
- Responsive crop support to hide watermark area on larger screens.
- Cinematic themed UI with responsive sections for desktop/mobile.

## Project Structure

```text
.
├── Coffee_cup_with_juice_animation_delpmaspu_.mp4
├── frames/
│   ├── frame_0001.jpg
│   ├── ...
│   └── frame_0192.jpg
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How It Works

1. The source video is converted into individual frames.
2. `script.js` preloads the frames.
3. On scroll, progress is mapped to frame index.
4. The selected frame is drawn to canvas using cover-style scaling.
5. A right-side crop of `0.12` is automatically applied when viewport width is greater than `728px`.

## Local Run

This is a static site, so you can open `index.html` directly.

For best compatibility, run with a local server:

```bash
# Python
python3 -m http.server 5500

# then open
http://localhost:5500
```

## Generate Frames (FFmpeg)

If you need to regenerate frames from the source video:

```bash
ffmpeg -y -i Coffee_cup_with_juice_animation_delpmaspu_.mp4 -vf "fps=24" -q:v 2 frames/frame_%04d.jpg
```

## Customization

- Theme and layout: edit `styles.css`.
- Animation behavior and crop values: edit `script.js`.
- Content and section copy: edit `index.html`.

## Credits

- Built by Raghu with GitHub Copilot.
