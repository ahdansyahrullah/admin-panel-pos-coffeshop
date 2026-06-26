const AUTH_KEY = "kopiKitaAuth";

function getAuthData() {
  try {
    const rawData = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    return rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    return null;
  }
}

function isLoggedIn() {
  const auth = getAuthData();
  return Boolean(auth && auth.username && auth.loginAt);
}

function isInPagesFolder() {
  return window.location.pathname.includes("/pages/");
}

function isLoginPage() {
  return window.location.pathname.toLowerCase().endsWith("login.html");
}

function getLoginPath() {
  return isInPagesFolder() ? "../login.html" : "./login.html";
}

function getHomePath() {
  return isInPagesFolder() ? "../index.html" : "./index.html";
}

function protectPage() {
  if (!isLoginPage() && !isLoggedIn()) {
    window.location.replace(getLoginPath());
  }

  if (isLoginPage() && isLoggedIn()) {
    window.location.replace("./index.html");
  }
}

function logout(event) {
  if (event) event.preventDefault();

  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);

  window.location.replace(getLoginPath());
}

window.logout = logout;

document.addEventListener("click", function (event) {
  const logoutButton = event.target.closest("#logoutBtn");

  if (logoutButton) {
    logout(event);
  }
});

protectPage();