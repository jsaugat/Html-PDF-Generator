import puppeteer from 'puppeteer-core'; // Changed to puppeteer-core for Docker setup
import fs from 'fs';

export const generatePDF = async (req, res) => {
  let browser = null;
  try {
    const { htmlContent } = req.body;
    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Launch browser with Docker-specific configuration
    // We use specific settings here because we're running in a containerized environment
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome', // Points to Chrome binary installed in our Docker container
      args: [
        '--no-sandbox',         // Required for running Chrome in Docker
        '--disable-setuid-sandbox', // Additional security flag for Docker
        '--disable-dev-shm-usage'   // Prevents memory issues in containerized environments
      ],
      headless: true
    });

    // Create a new page and set its content
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // Custom path for the PDF file
    // Note: In Docker, this will be relative to the container's filesystem
    const pdfPath = 'public/invoice.pdf';

    // Ensure the public directory exists in the container
    // This prevents errors if the directory doesn't exist
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }

    // Generate PDF with specified format
    await page.pdf({
      format: 'A4',
      path: pdfPath,
      printBackground: true, // Added to ensure backgrounds are included in the PDF
      margin: {             // Optional: Add margins to make the PDF more readable
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    // Read the generated PDF file into memory
    // We use synchronous reading here since we're already in an async function
    // and we need the file content before proceeding
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Set HTTP headers for proper PDF download
    // These headers tell the client how to handle the response
    res.set({
      'Content-Type': 'application/pdf',         // Identifies the content as PDF
      'Content-Length': pdfBuffer.length,        // Helps client handle download progress
      'Content-Disposition': 'attachment; filename=output.pdf', // Suggests downloading rather than displaying
      'Cache-Control': 'no-cache'                // Prevents caching of generated PDFs
    });

    // Send the PDF buffer as the response
    res.send(pdfBuffer);

    // Clean up: Remove the temporary PDF file
    // This prevents filling up the container's storage with temporary files
    fs.unlinkSync(pdfPath);

  } catch (error) {
    // Log the full error for debugging in container logs
    console.error('PDF Generation Error:', error);

    // Send a user-friendly error response
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message // Include error message for debugging
    });
  } finally {
    // Always close the browser to free up resources
    // This is especially important in a container environment
    if (browser) {
      await browser.close();
    }
  }
}