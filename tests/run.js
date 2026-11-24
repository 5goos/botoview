import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist', 'client');

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.js': 'application/javascript',
    '.css': 'text/css'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    let filePath;

    if (reqUrl === '/404/' || reqUrl === '/404') {
        filePath = path.join(distDir, '404.html');
        if (fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(fs.readFileSync(filePath));
        }
    }

    if (reqUrl.endsWith('/')) {
        filePath = path.join(distDir, reqUrl, 'index.html');
    } else {
        const directPath = path.join(distDir, reqUrl);
        if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
            filePath = directPath;
        } else if (fs.existsSync(path.join(distDir, reqUrl, 'index.html'))) {
            filePath = path.join(distDir, reqUrl, 'index.html');
        } else {
            filePath = directPath;
        }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        return res.end(fs.readFileSync(filePath));
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

server.listen(4322, () => {
    console.log('Test server listening on http://localhost:4322');
    const child = spawn('node', [path.join(__dirname, 'qa.test.js')], { stdio: 'inherit' });
    child.on('close', (code) => {
        server.close(() => {
            process.exit(code);
        });
    });
});
