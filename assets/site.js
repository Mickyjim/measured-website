const revealTargets = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach(target => observer.observe(target));
} else {
  revealTargets.forEach(target => target.classList.add("is-visible"));
}

document.querySelectorAll("[data-current-year]").forEach(target => {
  target.textContent = new Date().getFullYear();
});
