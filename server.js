const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' && file.originalname.match(/^(image_\d+|flashka)\.png$/)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG files named image_1.png to image_10.png or flashka.png are allowed'), false);
        }
    }
});

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Serve static files from the 'public' directory
console.log('Serving static files from:', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle image uploads
app.post('/upload-images', upload.any(), (req, res) => {
    console.log('Handling /upload-images request');
    if (req.files && req.files.length > 0) {
        res.send('Images uploaded successfully!');
    } else {
        res.status(400).send('No valid images were uploaded.');
    }
});

// Explicit route for /admin
app.get('/admin', (req, res) => {
    const adminPath = path.join(__dirname, 'public', 'admin.html');
    console.log('Handling /admin request, serving file:', adminPath);
    res.sendFile(adminPath, (err) => {
        if (err) {
            console.error('Error serving admin.html:', err);
            res.status(404).send('Admin page not found');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});