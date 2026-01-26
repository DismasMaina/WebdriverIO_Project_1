const LoginPage = require("../pages/login.pages")

describe('Demo Tests', () => {

  it('Login Test', async () => {
    
    browser.url('https://the-internet.herokuapp.com/login');
    await LoginPage.login('tomsmith', 'SuperSecretPassword!')
    await LoginPage.getMessage('You logged into a secure area!')

    // await $('[name="username"]').setValue('tomsmith')
    // await $('[name="password"]').setValue('SuperSecretPassword!')
    // await $('button[type="submit"]').click()
    // await expect($('#flash')).toHaveTextContaining(
    // 'You logged into a secure area!')
  })
})
