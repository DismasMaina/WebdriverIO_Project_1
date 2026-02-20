// login.page.js
class LoginPage {
  get usernameTextbox() {
    return $('#username');
  }
  get passwordTextbox() {
    return $('#password');
  }
  get loginButton() {
    return $('button[type="submit"]');
  }
  get loginMessage() {
    return $('#flash');
  }

  async login(username, password) {
    await this.usernameTextbox.setValue(username);
    await this.passwordTextbox.setValue(password);
    await this.loginButton.click();
  }
  async getMessage(msg) {
    const text = await this.loginMessage.getText();
    if (!text.includes(msg)) {
      throw new Error(`Expected login message to contain "${msg}", got "${text}"`);
    }
  }
}
module.exports = new LoginPage();
