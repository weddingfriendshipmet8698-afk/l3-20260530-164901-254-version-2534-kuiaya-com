(function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setHero(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setHero(current + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterScope(scope, query, typeValue) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var matched = 0;
    var q = normalize(query);
    var t = normalize(typeValue);

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
      var cardType = normalize(card.getAttribute("data-type"));
      var ok = (!q || text.indexOf(q) !== -1) && (!t || cardType.indexOf(t) !== -1 || text.indexOf(t) !== -1);
      card.hidden = !ok;

      if (ok) {
        matched += 1;
      }
    });

    var box = scope.closest(".container") || document;
    var empty = box.querySelector(".empty-state");

    if (empty) {
      empty.hidden = matched !== 0;
    }
  }

  function connectFilters(container) {
    var scopes = Array.prototype.slice.call(container.querySelectorAll(".filter-scope"));

    scopes.forEach(function (scope) {
      var box = scope.parentElement;
      var input = box.querySelector(".card-filter-input");
      var select = box.querySelector(".card-filter-select");

      function run() {
        filterScope(scope, input ? input.value : "", select ? select.value : "");
      }

      if (input) {
        input.addEventListener("input", run);
      }

      if (select) {
        select.addEventListener("change", run);
      }

      run();
    });
  }

  connectFilters(document);

  var params = new URLSearchParams(window.location.search);
  var searchQuery = params.get("q") || "";
  var searchInput = document.querySelector(".search-page-input");
  var mirroredSearch = document.querySelector(".mirrored-search");

  if (searchQuery && searchInput) {
    searchInput.value = searchQuery;
  }

  if (searchQuery && mirroredSearch) {
    mirroredSearch.value = searchQuery;
    mirroredSearch.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (searchInput && mirroredSearch) {
    searchInput.addEventListener("input", function () {
      mirroredSearch.value = searchInput.value;
      mirroredSearch.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
})();
