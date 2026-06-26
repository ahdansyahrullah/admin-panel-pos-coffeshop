const AUTH_KEY = "kopiKitaAuth";
const AUTH_USERS = [
  { username: "admin", password: "admin123", name: "Admin", role: "Administrator" },
  { username: "kasir", password: "kasir123", name: "Kasir", role: "Kasir" }
];

function getAuthData(){
  try{
    const data = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }catch(error){
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    return null;
  }
}

function isLoggedIn(){
  const auth = getAuthData();
  return Boolean(auth && auth.username && auth.loginAt);
}

function isLoginPage(){
  return window.location.pathname.endsWith("login.html");
}

function getLoginPath(){
  return window.location.pathname.includes("/pages/") ? "../login.html" : "login.html";
}

function getHomePath(){
  return window.location.pathname.includes("/pages/") ? "../index.html" : "index.html";
}

function protectPage(){
  if(isLoginPage()){
    if(isLoggedIn()){
      window.location.replace("index.html");
    }
    return;
  }

  if(!isLoggedIn()){
    window.location.replace(getLoginPath());
  }
}

function saveAuth(user, remember){
  const payload = {
    username: user.username,
    name: user.name,
    role: user.role,
    loginAt: new Date().toISOString()
  };

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_KEY, JSON.stringify(payload));

  if(remember){
    sessionStorage.removeItem(AUTH_KEY);
  }else{
    localStorage.removeItem(AUTH_KEY);
  }
}

function logout(){
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = getLoginPath();
}

function renderAuthUser(){
  const auth = getAuthData();
  const nameTarget = document.getElementById("authUserName");
  const roleTarget = document.getElementById("authUserRole");
  const logoutButton = document.getElementById("logoutBtn");

  if(nameTarget && auth){
    nameTarget.textContent = auth.name || auth.username;
  }

  if(roleTarget && auth){
    roleTarget.textContent = auth.role || "User";
  }

  if(logoutButton){
    logoutButton.addEventListener("click", logout);
  }
}

protectPage();
