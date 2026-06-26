document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});

function loadNavbar() {
  const navbarTarget = document.getElementById("navbar");

  if (!navbarTarget) return;

  const isInsidePages = window.location.pathname.includes("/pages/");
  const navbarPath = isInsidePages
    ? "../component/navbar.html"
    : "component/navbar.html";

  fetch(navbarPath)
    .then(response => {
      if (!response.ok) {
        throw new Error("Navbar gagal dimuat");
      }

      return response.text();
    })
    .then(html => {
      navbarTarget.innerHTML = html;
      setNavbarLinks();
      setActiveMenu();
      if (typeof renderAuthUser === "function") {
        renderAuthUser();
      }
    })
    .catch(error => {
      console.error("Error:", error);
      navbarTarget.innerHTML = `
        <div style="padding:20px;color:red;background:#fff;border-bottom:1px solid #ddd;">
          Navbar gagal dimuat. Jalankan dengan Live Server dan cek folder component/navbar.html.
        </div>
      `;
    });
}

function setNavbarLinks() {
  const currentPath = window.location.pathname;
  const isInsidePages = currentPath.includes("/pages/");

  const links = {
    pos: document.querySelector('[data-page="pos"]'),
    history: document.querySelector('[data-page="history"]'),
    dashboard: document.querySelector('[data-page="dashboard"]'),
    master: document.querySelector('[data-page="master"]'),
    form: document.querySelector('[data-page="form"]'),
    report: document.querySelector('[data-page="report"]')
  };

  if (links.pos) links.pos.href = isInsidePages ? "../index.html" : "index.html";
  if (links.history) links.history.href = isInsidePages ? "history.html" : "pages/history.html";
  if (links.dashboard) links.dashboard.href = isInsidePages ? "dashboard.html" : "pages/dashboard.html";
  if (links.master) links.master.href = isInsidePages ? "data-master.html" : "pages/data-master.html";
  if (links.form) links.form.href = isInsidePages ? "form.html" : "pages/form.html";
  if (links.report) links.report.href = isInsidePages ? "report.html" : "pages/report.html";
}

function setActiveMenu() {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".menu a").forEach(link => {
    link.classList.remove("active");
  });

  const activeMap = [
    { page: "pos", match: currentPath.endsWith("/") || currentPath.includes("index.html") },
    { page: "history", match: currentPath.includes("history.html") },
    { page: "dashboard", match: currentPath.includes("dashboard.html") },
    { page: "master", match: currentPath.includes("data-master.html") },
    { page: "form", match: currentPath.includes("form.html") },
    { page: "report", match: currentPath.includes("report.html") }
  ];

  activeMap.forEach(item => {
    if (item.match) {
      const link = document.querySelector(`[data-page="${item.page}"]`);
      if (link) link.classList.add("active");
    }
  });
}
