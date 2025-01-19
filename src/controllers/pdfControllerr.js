import puppeteer from 'puppeteer';
import fs from 'fs';

export const generatePDF = async (req, res) => {
  let browser = null;
  try {
    const { htmlContent } = req.body;
    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Official Boilerplate
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // Custom path for the PDF file
    const pdfPath = 'public/invoice.pdf';
    await page.pdf({ // Save as PDF
      format: 'A4',
      path: pdfPath
    });

    // Read the file and send it properly

    // 1. read the generated PDF file (pdfPath) into memory as a buffer
    const pdfBuffer = fs.readFileSync(pdfPath);
    // 2. set important HTTP headers (information for the client)
    res.set({
      'Content-Type': 'application/pdf', // tells the client (Postman) that this is a PDF file
      'Content-Length': pdfBuffer.length, // specifie the exact size of the file, which helps with proper download handling
      'Content-Disposition': 'attachment; filename=output.pdf' // tell the client to treat this as a downloadable file rather than trying to display it directly
    });
    res.send(pdfBuffer); // send the buffer as the response body
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}