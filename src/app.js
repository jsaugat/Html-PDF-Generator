// backend/src/app.js
import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdfRoutes.js';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.get('/', (req, res) => {
  res.send('Server is running, send a POST request to /pdf/generate-pdf to generate a PDF');
});
app.use('/pdf', pdfRoutes);  // Add the PDF route here
app.use(express.static('public')); // Serve static files from the "public" folder

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});