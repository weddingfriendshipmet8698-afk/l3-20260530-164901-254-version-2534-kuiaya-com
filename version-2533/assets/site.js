(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle("is-active", itemIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        activate(Number(thumb.getAttribute("data-hero-thumb")) || 0);
      });
    });

    activate(0);
    start();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    var section = panel.closest("section") || document;
    var input = panel.querySelector("[data-search-input]");
    var region = panel.querySelector("[data-region-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
    var empty = section.querySelector("[data-empty-state]");

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var query = valueOf(input);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var text = title + " " + cardRegion + " " + cardType + " " + genre + " " + tags;
        var matched = (!query || text.indexOf(query) !== -1) && (!regionValue || cardRegion.indexOf(regionValue) !== -1) && (!typeValue || cardType.indexOf(typeValue) !== -1);
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
})();
