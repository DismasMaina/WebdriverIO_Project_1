describe('Demo Tests', function () {
  it('My First Test', async () => {
    // Open Google
    await browser.url('http://google.com');

    // Type in search box
    const searchBox = await $('[name="q"]');
    await searchBox.setValue('WebdriverIO');

    // Press Enter to search (better than clicking the button sometimes)
    await browser.keys('Enter');

    // Pause 1 seconds to see results
    await browser.pause(10000);
  });
});
