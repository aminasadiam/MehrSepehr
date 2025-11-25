(() => {
  const sidebar = document.querySelector("[data-sidebar]");
  const toggleBtn = document.querySelector("[data-sidebar-toggle]");
  const closeBtn = document.querySelector("[data-sidebar-close]");
  const overlay = document.querySelector("[data-sidebar-overlay]");
  const scrollTopBtn = document.querySelector("[data-scroll-top]");
  const mediaQuery = window.matchMedia("(min-width: 1024px)");

  if (!sidebar) {
    return;
  }

  const syncAria = (isOpen) => {
    const isDesktop = mediaQuery.matches;
    sidebar.setAttribute("aria-hidden", isDesktop ? "false" : (!isOpen).toString());
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", isDesktop ? "false" : String(isOpen));
    }
  };

  const openSidebar = () => {
    sidebar.classList.add("is-open");
    document.body.classList.add("sidebar-open");
    overlay?.classList.add("is-visible");
    syncAria(true);
  };

  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    document.body.classList.remove("sidebar-open");
    overlay?.classList.remove("is-visible");
    syncAria(false);
  };

  const toggleSidebar = () => {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  toggleBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    if (!mediaQuery.matches) {
      toggleSidebar();
    }
  });

  closeBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    closeSidebar();
  });

  overlay?.addEventListener("click", closeSidebar);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });

  mediaQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeSidebar();
    } else {
      syncAria(false);
    }
  });

  scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  syncAria(false);
})();
