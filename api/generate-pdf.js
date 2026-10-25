const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
    // केवल POST रिक्वेस्ट स्वीकार करें
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let browser = null;
    try {
        const { html, fileName } = req.body;
        if (!html) {
            return res.status(400).json({ error: 'HTML content required' });
        }

        // Vercel Serverless पर Headless Chromium चालू करें
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        // पूरे कोटेशन HTML और CSS को लोड करें
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 🌟 100% TRUE VECTOR PDF (0.25 INCH MARGINS ON ALL PAGES)
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.25in',
                right: '0.25in',
                bottom: '0.25in',
                left: '0.25in'
            }
        });

        await browser.close();

        // ब्राउज़र/ऐप को सीधी PDF फ़ाइल भेजें
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'Quotation.pdf'}"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        if (browser !== null) {
            await browser.close();
        }
        console.error('PDF Generation Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
