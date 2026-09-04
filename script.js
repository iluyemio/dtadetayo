(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Fixed "sheet index" tracks section in view ---------- */
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var indexCurrent = document.querySelector(".sheet-index__current");

  if (sheets.length && indexCurrent && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var num = entry.target.getAttribute("data-sheet");
            if (num) indexCurrent.textContent = num;
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sheets.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Proof stat count-up ---------- */
  var statEl = document.querySelector("[data-count-to]");
  if (statEl) {
    var target = parseInt(statEl.getAttribute("data-count-to"), 10) || 0;
    var plusEl = statEl.querySelector(".proof__plus");
    var plusHTML = plusEl ? plusEl.outerHTML : "+";

    var runCount = function () {
      if (reduceMotion) {
        statEl.innerHTML = target + plusHTML;
        return;
      }
      var start = null;
      var duration = 1400;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(eased * target);
        statEl.innerHTML = current + plusHTML;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var statObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCount();
              obs.disconnect();
            }
          });
        },
        { threshold: 0.6 }
      );
      statObserver.observe(statEl);
    } else {
      runCount();
    }
  }

  /* ---------- Lead magnet modal ---------- */
  var modal = document.getElementById("lead-modal");
  var openBtn = document.getElementById("open-lead-magnet");
  var closeEls = document.querySelectorAll("[data-close-modal]");
  var leadForm = document.getElementById("lead-form");
  var confirmMsg = document.getElementById("modal-confirm");
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var emailInput = document.getElementById("lead-email");
    if (emailInput) emailInput.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  closeEls.forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      leadForm.hidden = true;
      if (confirmMsg) confirmMsg.hidden = false;
    });
  }

  /* ---------- Smooth in-page anchors (fallback for older browsers) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });
})();
