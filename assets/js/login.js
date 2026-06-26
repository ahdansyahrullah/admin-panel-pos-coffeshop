document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("rememberMe");
  const usernameError = document.getElementById("usernameError");
  const passwordError = document.getElementById("passwordError");
  const messageBox = document.getElementById("loginMessage");
  const togglePassword = document.getElementById("togglePassword");

  function clearErrors(){
    usernameError.textContent = "";
    passwordError.textContent = "";
    messageBox.className = "alert-message";
    messageBox.textContent = "";
  }

  function showMessage(type, text){
    messageBox.className = `alert-message ${type}`;
    messageBox.textContent = text;
  }

  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.innerHTML = isPassword
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    clearErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    let valid = true;

    if(!username){
      usernameError.textContent = "Username wajib diisi.";
      valid = false;
    }

    if(!password){
      passwordError.textContent = "Password wajib diisi.";
      valid = false;
    }

    if(!valid) return;

    const user = AUTH_USERS.find(item => item.username === username && item.password === password);

    if(!user){
      showMessage("error", "Username atau password tidak sesuai.");
      return;
    }

    saveAuth(user, rememberInput.checked);
    showMessage("success", "Login berhasil. Mengalihkan ke halaman POS...");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 650);
  });
});
