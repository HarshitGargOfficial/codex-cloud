# Codex Cloud

A Node.js application using Express and EJS views.

## Getting started

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

The application listens on port 3000. Set the `PORT` environment variable to use another port.

Use `npm start` to run without automatic restarts.

## Files

- `app.js`: Express server and routes.
- `views/`: EJS templates.
- `public/`: Static styles and assets.

Edit `views/index.ejs` to change the home page. The development command restarts when JavaScript files change; refresh the browser after template or stylesheet edits.

## Deploy to Render

This repository includes a `render.yaml` Blueprint for a free Node.js web service.

1. Sign in to Render and select **New > Blueprint**.
2. Connect your GitHub account and select `HarshitGargOfficial/codex-cloud`.
3. Select the `main` branch, review the Blueprint, and deploy.

Render installs dependencies with `npm ci` and starts the app with `npm start`.
The server uses Render's provided `PORT`; the `/` route is the health check.
Future pushes to `main` deploy automatically with Render's default auto-deploy setting.
Free services may sleep when idle.
