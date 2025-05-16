const express = require('express');
const https = require('https'); // Добавляем модуль https
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const PORT = process.env.PORT || 8081;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Загрузка сертификатов из папки certs
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem'))
};

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/products', (req, res) => {
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(JSON.parse(data));
        }
    });
});

const readProducts = (callback) => {
    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            try {
                const products = JSON.parse(data);
                callback(null, products);
            } catch (parseErr) {
                callback(parseErr, null);
            }
        }
    });
};

const writeProducts = (products, callback) => {
    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8', (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

app.post('/api/products', (req, res) => {
    console.log("добавляю");
    const newProducts = req.body;

    readProducts((err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read products' });
        }

        products = Array.isArray(products) ? products : [];

        const generateId = () => {
            const maxId = products.length > 0 
                ? Math.max(...products.map(p => p.id || 0)) 
                : 0;
            return maxId + 1;
        };

        if (!Array.isArray(newProducts)) {
            const newProductWithId = { ...newProducts, id: generateId() };
            products.push(newProductWithId);
        } else {
            const newProductsWithIds = newProducts.map(product => ({
                ...product,
                id: generateId()
            }));
            products = products.concat(newProductsWithIds);
        }

        writeProducts(products, (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).json({ error: 'Failed to write products' });
            }
            res.status(201).json({ message: 'Products added successfully', products });
        });
    });
});

app.put('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            let products = JSON.parse(data);
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index] = { ...products[index], ...updatedProduct };
                fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
                    if (err) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        res.status(200).json(products[index]);
                    }
                });
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        }
    });
});

app.delete('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            let products = JSON.parse(data);
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products.splice(index, 1);
                fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
                    if (err) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        res.status(200).json({ message: 'Product deleted' });
                    }
                });
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        }
    });
});

// Заменяем app.listen на https.createServer
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Admin server is running on https://localhost:${PORT}`);
    console.log(`Swagger API Docs: https://localhost:${PORT}/api-docs`);
});