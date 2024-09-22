const LoginPage = () => {
  return /*html*/ `
    <h1 class="heading">Login</h1>
    <div class="login-form">
    <div class="input-container">
    <input id="email" type="email" placeholder="Email" required>
    <input id="pass" type="password" placeholder="Password" required>
    </div>
    <div class="button-container">
    <a  class="register-btn">Register</a>
    <button  class="login-btn">Login</button>
    </div>
    </div>
    `;
};

export default LoginPage;
