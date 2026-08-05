export function initPwBackToTop(root = document) {
  const trigger = root.querySelector("[data-pw-back-to-top]");

  if (!trigger) return;

  const container = trigger.closest(".pw-floating-actions");
  const visibleClass = "is-back-to-top-visible";
  const threshold = Number(trigger.dataset.pwBackToTopThreshold || 360);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const updateVisibility = () => {
    if (!container) return;

    container.classList.toggle(visibleClass, window.scrollY > threshold);
  };

  trigger.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });

    trigger.blur();
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility);

  updateVisibility();
}
