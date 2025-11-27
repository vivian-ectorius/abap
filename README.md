# ABAP Visual Blueprints

A minimal, black-and-white Next.js prototype that visualizes ABAP program flow using blueprint-style nodes.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 to view the canvas.

## Overview

- Add nodes from the toolbar (START-OF-SELECTION, SELECT, LOOP AT, IF/ELSE, WRITE).
- Connect an output port to an input port to draw a link and update the ABAP outline.
- Drag nodes to rearrange the visual flow; use "Clear links" or "Reset canvas" to start fresh.

The monochrome palette keeps the focus on ABAP program flow over UI chrome.
