# VR Meditation Space

A WebXR application built with Three.js for guided meditation in virtual reality.

## Features

- VR-enabled 3D environment
- Headset gaze cursor
- Simple meditation room setup
- WebXR support

## Prerequisites

- Node.js (v14 or higher)
- A WebXR-capable browser (Chrome, Firefox, or Edge)
- A VR headset (Oculus Quest, HTC Vive, etc.)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173)

4. Click the "Enter VR" button to start the VR experience

## Development

- The main application code is in `src/main.js`
- The HTML entry point is `index.html`
- Styles are included in the HTML file

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. 