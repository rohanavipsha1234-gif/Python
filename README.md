# Pocket Python

A mobile-friendly Python playground built with React and Vite.

## Deploy to Render

1. Extract this ZIP.
2. Upload the project to a GitHub repository.
3. In Render, choose **New + → Static Site** and connect that repository.
4. Use build command: `npm install && npm run build`
5. Use publish directory: `dist`
6. Deploy.

The included `render.yaml` describes the same static-site settings.

## Run locally

Install Node.js, then run:

```bash
npm install
npm run dev
```

Python execution uses Pyodide from its CDN, so the browser needs an internet connection when the runtime first loads. Drafts are saved in browser localStorage; download important `.py` files as backups.
