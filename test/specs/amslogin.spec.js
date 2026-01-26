
describe("Ams Login", function () {
  it("First Test", async () => {
    // Open Google
    await browser.url("http://192.168.4.39:9000/");

    // Type in field box
    const usernameInput = await $('[name="username"]');
    await usernameInput.setValue("bennie")
    const passwordInput = await $('[name="password"]');
    await passwordInput.setValue("Bennie@2025!");

    // --- Debug / Visual confirmation: log values and take a screenshot ---
    const usernameValue = await usernameInput.getValue();
    console.log("username entered:", usernameValue);
    const passwordValue = await passwordInput.getValue();
    console.log("password entered:", passwordValue);

    // OPTIONAL: briefly reveal the password field in the UI so you can visually confirm
    try {
      await browser.execute((sel) => {
        const el = document.querySelector(sel);
        if (el) el.type = 'text';
      }, '[name="password"]');
      // small pause so human can see revealed value in the browser screenshot
      await browser.pause(5000);
      // save screenshot to workspace root (also appears in test output)
      await browser.saveScreenshot('./username_pin_preview.png');
      // revert the input type back to password
      await browser.execute((sel) => {
        const el = document.querySelector(sel);
        if (el) el.type = 'password';
      }, '[name="password"]');
    } catch (err) {
      // ignore visual reveal errors in case page prevents modifying input type
    }

    // Press Sign in button
    // Try several strategies to submit the form: common selectors, XPath by text, or press Enter
    const submitSelectors = [
      '[name="submit"]',
      'button[type="submit"]',
      '//button[contains(., "Sign in")]',
      '//input[@type="submit"]'
    ];

    let submitted = false;
    for (const sel of submitSelectors) {
      try {
        const btn = await $(sel);
        if (await btn.isExisting()) {
          await btn.click();
          submitted = true;
          break;
        }
      } catch (err) {
        // ignore and try next selector
      }
    }

    // Fallback: press Enter (works if focus is on an input)
    if (!submitted) {
      await browser.keys("Enter")
    }

    // Pause 10 seconds to see results
    await browser.pause(10000)
  })
})
