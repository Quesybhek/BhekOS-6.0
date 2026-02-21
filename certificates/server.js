// HTTPS Test Server for BhekOS
// Run with: node server.js
// Then visit: https://localhost:3443

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const config = {
    httpPort: 3080,
    httpsPort: 3443,
    certPath: path.join(__dirname, 'localhost.crt'),
    keyPath: path.join(__dirname, 'localhost.key'),
    webRoot: path.join(__dirname, '..') // Serve from parent directory (bhekos root)
};

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.wasm': 'application/wasm'
};

// Check if certificates exist
if (!fs.existsSync(config.keyPath) || !fs.existsSync(config.certPath)) {
    console.error('\x1b[31m❌ SSL certificates not found!\x1b[0m');
    console.log('\nPlease generate certificates first:');
    console.log('  Windows: run generate-cert.bat');
    console.log('  Mac/Linux: run ./generate-cert.sh\n');
    process.exit(1);
}

// SSL options
const sslOptions = {
    key: fs.readFileSync(config.keyPath),
    cert: fs.readFileSync(config.certPath)
};

// Request handler
function handleRequest(req, res) {
    console.log(`\x1b[36m${new Date().toISOString()} - ${req.method} ${req.url}\x1b[0m`);
    
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Get file path
    const filePath = path.join(config.webRoot, pathname);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 Not Found - BhekOS</title>
                    <style>
                        body { 
                            background: #000; 
                            color: #00ff88; 
                            font-family: monospace; 
                            padding: 50px; 
                            text-align: center;
                        }
                        h1 { font-size: 48px; }
                        .emoji { font-size: 64px; }
                        a { color: #00ff88; }
                    </style>
                </head>
                <body>
                    <div class="emoji">🔍</div>
                    <h1>404 - File Not Found</h1>
                    <p>${pathname}</p>
                    <p><a href="/">Return to BhekOS</a></p>
                </body>
                </html>
            `);
            return;
        }
        
        // Read file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>500 Server Error - BhekOS</title>
                        <style>
                            body { 
                                background: #000; 
                                color: #ff5252; 
                                font-family: monospace; 
                                padding: 50px; 
                                text-align: center;
                            }
                            h1 { font-size: 48px; }
                            .emoji { font-size: 64px; }
                        </style>
                    </head>
                    <body>
                        <div class="emoji">💥</div>
                        <h1>500 - Server Error</h1>
                        <p>${err.message}</p>
                    </body>
                    </html>
                `);
                return;
            }
            
            // Determine content type
            const ext = path.parse(filePath).ext;
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            // Send response
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(data);
        });
    });
}

// Create HTTP server (redirect to HTTPS)
const httpServer = http.createServer((req, res) => {
    const host = req.headers.host?.split(':')[0] || 'localhost';
    res.writeHead(301, { Location: `https://${host}:${config.httpsPort}${req.url}` });
    res.end();
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, handleRequest);

// Start servers
httpServer.listen(config.httpPort, () => {
    console.log('\x1b[32m✅ HTTP Server running (redirects to HTTPS)\x1b[0m');
    console.log(`   http://localhost:${config.httpPort} → https://localhost:${config.httpsPort}`);
});

httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[32m✅ HTTPS Server running\x1b[0m');
    console.log(`   https://localhost:${config.httpsPort}`);
    console.log(`   https://127.0.0.1:${config.httpsPort}`);
    console.log('');
    console.log('\x1b[33m🌐 Open in browser:\x1b[0m');
    console.log(`   \x1b[36mhttps://localhost:${config.httpsPort}\x1b[0m`);
    console.log('');
    console.log('\x1b[33m🔐 Certificate Info:\x1b[0m');
    console.log(`   Subject: CN=localhost`);
    console.log(`   Expires: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}`);
    console.log('');
    console.log('\x1b[33m📁 Serving from:\x1b[0m');
    console.log(`   ${config.webRoot}`);
    console.log('');
    console.log('\x1b[90mPress Ctrl+C to stop\x1b[0m');
});

// Handle server errors
httpsServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\x1b[31m❌ Port ${config.httpsPort} is already in use\x1b[0m`);
    } else {
        console.error('\x1b[31m❌ Server error:\x1b[0m', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\x1b[33m🛑 Shutting down servers...\x1b[0m');
    httpServer.close();
    httpsServer.close();
    process.exit(0);
});
