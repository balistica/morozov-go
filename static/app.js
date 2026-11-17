(() => {
  const root = document.documentElement, key = "theme";
  try { const s = localStorage.getItem(key); if (s) root.dataset.theme = s; } catch (e) {}
  document.getElementById("theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem(key, root.dataset.theme); } catch (e) {}
  });
  const pipe = document.querySelector(".pipeline");
  const stages = document.querySelectorAll(".stage");
  if (pipe && !matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    stages.forEach((s) => s.classList.remove("ok"));
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      stages.forEach((s, i) => setTimeout(() => s.classList.add("ok"), i * 650));
    }, { threshold: 0.5 });
    io.observe(pipe);
  }
})();
