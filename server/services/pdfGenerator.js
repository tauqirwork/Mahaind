const puppeteer = require('puppeteer');

async function generatePDFFromHTML(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  // We set the HTML content directly
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.emulateMediaType('print');

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '6mm', bottom: '14mm', left: '6mm', right: '6mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>', // empty header
    footerTemplate: `
      <div style="font-size: 8px; color: #5a6478; width: 100%; padding: 0 6mm; display: flex; justify-content: space-between; font-family: sans-serif;">
        <div>MahaIND ERP System</div>
        <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </div>
    `
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generatePDFFromHTML };
