import { login } from '../helpers/AuthHelper.js';

describe('AMS Login', () => {
  it('should login', async () => {
    await login();
    // After login, just check that 5 seconds passed and we're not on login page
    const stillOnLogin = await $('[name="username"]')
      .isDisplayed()
      .catch(() => false);
    if (stillOnLogin) {
      throw new Error('Still on login page - login failed');
    }
  });
});
