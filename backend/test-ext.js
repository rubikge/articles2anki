const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');

(async () => {
  try {
    const extensionPath = path.resolve('/home/sergei-privalov/projects/mine/articles2anki/extension');
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
    
    console.log("Waiting for extension service worker...");
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker' || target.type() === 'background_page'
    );
    const worker = await workerTarget.worker() || await workerTarget.page();

    console.log("Triggering extension with backend running...");
    await worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await globalThis.testHandleAction(tab);
    });
    
    // Give it a moment to complete
    await new Promise(r => setTimeout(r, 2000));
    console.log("Backend should have received the payload.");

    console.log("Stopping the backend server...");
    try {
      execSync('pkill -f "node server.js"');
      console.log("Backend stopped.");
    } catch(e) {
      console.log("Failed to kill backend (might already be stopped):", e.message);
    }

    // Wait a bit for port to free/close properly
    await new Promise(r => setTimeout(r, 2000));

    console.log("Triggering extension again with backend stopped...");
    await worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await globalThis.testHandleAction(tab);
    });

    console.log("Verifying toast injection...");
    await page.waitForSelector('.terms-logger-error-toast', { timeout: 10000 });
    
    const toastText = await page.evaluate(() => {
      return document.querySelector('.terms-logger-error-toast').textContent;
    });
    
    console.log("SUCCESS: Toast injected with text:", toastText);

    await browser.close();
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
})();
