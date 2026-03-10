const puppeteer = require('puppeteer');
(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'srithan06@gmail.com');
    await page.type('input[type="password"]', 'srithan');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => { });

    console.log("Navigated to:", page.url());
    await page.goto('http://localhost:5173/host-dashboard', { waitUntil: 'networkidle0' });
    console.log("Host dashboard URL:", page.url());

    await new Promise(r => setTimeout(r, 2000));
    await page.goto('http://localhost:5173/admin-dashboard', { waitUntil: 'networkidle0' });
    console.log("Admin dashboard URL:", page.url());
    await new Promise(r => setTimeout(r, 2000));

    await browser.close();
    console.log("Done");
})();
