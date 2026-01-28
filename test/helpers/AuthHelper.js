// Just your original working code wrapped in a function
export async function login(username = "bennie", password = "Bennie@2025!") {
  // Open the application
  await browser.url("http://192.168.4.39:9000/");
  console.log("Navigated to application");

  // Type in username field (with typing effect)
  const usernameInput = await $('[name="username"]');
  for (let i = 0; i < username.length; i++) {
    await usernameInput.addValue(username[i]);
    await browser.pause(120);
  }
  await browser.pause(2000);

  // Type in password field (with typing effect)
  const passwordInput = await $('[name="password"]');
  for (let i = 0; i < password.length; i++) {
    await passwordInput.addValue(password[i]);
    await browser.pause(60);
  }

  // Show password briefly
  try {
    await browser.execute((sel) => {
      const el = document.querySelector(sel);
      if (el) el.type = 'text';
    }, '[name="password"]');
    await browser.pause(2000);
    await browser.execute((sel) => {
      const el = document.querySelector(sel);
      if (el) el.type = 'password';
    }, '[name="password"]');
  } catch (err) {
    // ignore
  }

  // Press Sign in button
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
        console.log("Clicked submit button");
        break;
      }
    } catch (err) {
      // ignore
    }
  }

  if (!submitted) {
    await browser.keys("Enter");
    console.log("Pressed Enter to submit");
  }

  await browser.pause(5000);
  console.log("Login completed");
}