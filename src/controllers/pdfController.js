import { mkdtempSync } from 'fs';
import { join } from 'path';
import os from 'os';

export const generatePDF = async (req, res) => {
  let browser = null;
  let tempDir = null;

  try {
    // Create temporary directory
    tempDir = mkdtempSync(join(os.tmpdir(), 'pdf-'));
    const pdfPath = join(tempDir, 'invoice.pdf');

    const { htmlContent } = req.body;
    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);

    await page.pdf({
      format: 'A4',
      path: pdfPath
    });

    const pdfBuffer = fs.readFileSync(pdfPath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename=output.pdf'
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) {
      await browser.close();
    }
    // Clean up temporary directory
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}