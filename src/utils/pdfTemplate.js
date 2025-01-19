export const generateHTMLTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .content {
            padding: 20px;
          }
          .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            background-color: #f5f5f5;
          }
          /* Ensure all fonts are loaded before printing */
          @media print {
            body {
              -webkit-print-color-adjust: exact;
            }
            .page-break {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title || 'Document'}</h1>
        </div>
        <div class="content">
          ${data.content}
        </div>
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()}
          <div class="page-number"></div>
        </div>
      </body>
    </html>
  `;
};
