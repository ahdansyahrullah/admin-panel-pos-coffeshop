document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".admin-sidebar");

  if(toggleButton && sidebar){
    toggleButton.addEventListener("click", () => {
      sidebar.classList.toggle("is-collapsed");
    });
  }
});
