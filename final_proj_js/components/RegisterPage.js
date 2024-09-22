const RegisterPage = () => {
  return /*html*/ `
      <h1 class="heading">Register</h1>
      <div class="login-form">
      <div class="input-container">
      <input id="name" type="text" placeholder="Name" required>
      <input id="email" type="email" placeholder="Email" required>
      <input id="pass" type="password" placeholder="Password" required>
      </div>
      <div class="button-container">
      <button class="back-btn">Back</button>
      <button class="register-btn-2">Register</button>
      </div>
      </div>
      `;
};

export default RegisterPage;
