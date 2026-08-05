(() => {
  const root = document.querySelector("[data-pw-wing-people]");

  if (!root) return;

  const shares = Array.from(root.querySelectorAll(".pw-wing-people__share"));

  const closeShare = (share) => {
    const toggle = share.querySelector("[data-pw-wing-share-toggle]");
    const panel = share.querySelector("[data-pw-wing-share-panel]");

    share.classList.remove("is-open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    if (panel) {
      panel.hidden = true;
    }
  };

  const openShare = (share) => {
    const toggle = share.querySelector("[data-pw-wing-share-toggle]");
    const panel = share.querySelector("[data-pw-wing-share-panel]");

    shares.forEach((item) => {
      if (item !== share) {
        closeShare(item);
      }
    });

    share.classList.add("is-open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
    }

    if (panel) {
      panel.hidden = false;
    }
  };

  const toggleShare = (share) => {
    const isOpen = share.classList.contains("is-open");

    if (isOpen) {
      closeShare(share);
      return;
    }

    openShare(share);
  };

  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-pw-wing-share-toggle]");
    const closeButton = event.target.closest("[data-pw-wing-share-close]");

    if (toggle) {
      const share = toggle.closest(".pw-wing-people__share");

      if (share) {
        toggleShare(share);
      }

      return;
    }

    if (closeButton) {
      const share = closeButton.closest(".pw-wing-people__share");

      if (share) {
        closeShare(share);
      }
    }
  });

  document.addEventListener("click", (event) => {
    const isInsideWingPeople = event.target.closest("[data-pw-wing-people]");
    const isInsideShare = event.target.closest(".pw-wing-people__share");

    if (isInsideWingPeople && isInsideShare) return;

    shares.forEach(closeShare);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    shares.forEach(closeShare);
  });
})();
