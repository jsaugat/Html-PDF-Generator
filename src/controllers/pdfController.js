import puppeteer from 'puppeteer';
import fs from 'fs';

export const generatePDF = async (req, res) => {
  let browser = null;
  try {
    const { htmlContent } = req.body;
    if (!htmlContent) {
      console.error('HTML content is required but not provided');
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Official Boilerplate
    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({ headless: true });
    console.log('Browser launched successfully');

    const page = await browser.newPage();
    console.log('Setting HTML content on the page...');
    await page.setContent(htmlContent);

    // Custom path for the PDF file
    const pdfPath = 'public/invoice.pdf';
    console.log(`Generating PDF at path: ${pdfPath}`);
    await page.pdf({ // Save as PDF
      format: 'A4',
      path: pdfPath
    });
    console.log('PDF generated and saved');

    // Read the file and send it properly

    // 1. read the generated PDF file (pdfPath) into memory as a buffer
    console.log('Reading generated PDF file...');
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('PDF file read successfully');

    // 2. set important HTTP headers (information for the client)
    console.log('Setting HTTP headers for PDF response...');
    res.set({
      'Content-Type': 'application/pdf', // tells the client (Postman) that this is a PDF file
      'Content-Length': pdfBuffer.length, // specifie the exact size of the file, which helps with proper download handling
      'Content-Disposition': 'attachment; filename=output.pdf' // tell the client to treat this as a downloadable file rather than trying to display it directly
    });
    console.log('HTTP headers set successfully');

    console.log('Sending PDF buffer as response...');
    res.send(pdfBuffer); // send the buffer as the response body
    console.log('PDF sent to the client successfully');
  } catch (error) {
    console.error('Error during PDF generation:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message
    });
  } finally {
    if (browser) {
      console.log('Closing Puppeteer browser...');
      await browser.close();
      console.log('Browser closed successfully');
    }
  }
}