import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateCalculationPdf(payload: {
    title: string;
    createdAt: string;
    body: Record<string, unknown>;
  }): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(`
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <h1>${payload.title}</h1>
          <p>Created at: ${payload.createdAt}</p>
          <pre>${JSON.stringify(payload.body, null, 2)}</pre>
        </body>
      </html>
    `);
    const data = await page.pdf({ format: 'A4' });
    await browser.close();
    return Buffer.from(data);
  }
}
