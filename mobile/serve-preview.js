const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8080;
const PREVIEW_FILE = path.join(__dirname, 'preview', 'index.html');

const server = http.createServer((req, res) => {
  fs.readFile(PREVIEW_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading mobile preview simulator.');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log('==========================================================');
  console.log('  GraminVikas 360 v2.0 - Cross-Platform Mobile Runner');
  console.log('==========================================================');
  console.log(`  📱 Mobile App Preview Live at: ${url}`);
  console.log('  Press Ctrl+C to stop the simulator server.');
  console.log('==========================================================');

  // Open default browser on macOS, Windows or Linux
  const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${startCmd} ${url}`);
});
