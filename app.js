const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection setup
mongoose.connect('mongodb://localhost/document_upload', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create a MongoDB model for file details
const fileSchema = new mongoose.Schema({
    name: String,
    type: String,
    data: Buffer
});
const File = mongoose.model('File', fileSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Enable CORS for API requests (if needed)
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Handle file upload as an API endpoint
app.post('/api/upload', upload.array('documents'), async (req, res) => {
    try {
        const files = req.files;
        const savedFileDetails = [];
        for (const file of files) {
            // Save file details to MongoDB
            const newFile = new File({
                name: file.originalname,
                type: file.mimetype,
                data: file.buffer
            });
            await newFile.save();
            savedFileDetails.push({
                name: file.originalname,
                type: file.mimetype,
            });
        }
        res.json({ message: 'Files uploaded successfully', files: savedFileDetails });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading files' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
