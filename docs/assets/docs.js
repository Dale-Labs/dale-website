(function () {
  var topbar = document.querySelector(".dale-docs-topbar");
  var button = document.querySelector(".dale-docs-menu");
  if (topbar && button) {
    button.addEventListener("click", function () {
      var isOpen = topbar.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }
})();
