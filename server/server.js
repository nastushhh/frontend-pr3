const https = require('https'); // Заменяем http на https
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Загрузка сертификатов из папки certs
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem'))
};

const server = https.createServer(sslOptions, (req, res) => { // Заменяем http.createServer на https.createServer
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === '/products' && req.method === 'GET') {
        fs.readFile(PRODUCTS_FILE, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Catalog server is running on https://localhost:${PORT}`);
});