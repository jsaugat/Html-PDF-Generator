import puppeteer from 'puppeteer';
import fs from 'fs';
import { mkdtempSync } from 'fs';
import { join } from 'path';
import os from 'os';

export const generatePDF = async (req, res) => {
  let browser = null;
  let tempDir = null;

  try {
    console.log('Starting PDF generation process...');
    // Create temporary directory for PDF storage
    tempDir = mkdtempSync(join(os.tmpdir(), 'pdf-'));
    console.log(`Temporary directory created at: ${tempDir}`);
    const pdfPath = join(tempDir, 'invoice.pdf');

    const { htmlContent } = req.body;
    if (!htmlContent) {
      console.error('HTML content is required but not provided');
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Launch browser with specific Chrome configuration for Render
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome-stable',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log('Browser launched successfully');

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    console.log('HTML content set on the page');

    // Generate PDF with specific settings
    await page.pdf({
      format: 'A4',
      path: pdfPath,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    console.log(`PDF generated and saved at: ${pdfPath}`);

    // Read and send the PDF
    const pdfBuffer = fs.readFileSync(pdfPath);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename=output.pdf'
    });

    res.send(pdfBuffer);
    console.log('PDF sent to the client');
  } catch (error) {
    console.error('Error during PDF generation:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message
    });
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`Temporary directory removed: ${tempDir}`);
    }
  }
};