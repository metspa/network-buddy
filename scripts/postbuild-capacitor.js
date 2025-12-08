#!/usr/bin/env node
// Creates the 'out' directory for Capacitor builds
// Since the app loads from Vercel (server.url in capacitor.config),
// we just need a minimal placeholder for the Appflow build process

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const indexPath = path.join(outDir, 'index.html');

// Create out directory if it doesn't exist
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Created out directory');
}

// Create a minimal index.html that redirects to Vercel
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Network Buddy</title>
  <meta http-equiv="refresh" content="0;url=https://network-buddy-app.vercel.app">
</head>
<body>
  <p>Redirecting to <a href="https://network-buddy-app.vercel.app">Network Buddy</a>...</p>
</body>
</html>`;

fs.writeFileSync(indexPath, html);
console.log('Created out/index.html');
