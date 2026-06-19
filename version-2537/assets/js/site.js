(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-arrow.prev");
    var next = hero.querySelector(".hero-arrow.next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-search]");
    var category = panel.querySelector("[data-filter-category]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-region][data-year][data-category]"));

    function apply() {
      var keyword = normalize(input && input.value);
      var cat = category ? category.value : "";
      var reg = region ? region.value : "";
      var yr = year ? year.value : "";

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = !cat || card.getAttribute("data-category") === cat;
        var matchedRegion = !reg || card.getAttribute("data-region") === reg;
        var matchedYear = !yr || card.getAttribute("data-year") === yr;
        card.classList.toggle("hidden-card", !(matchedKeyword && matchedCategory && matchedRegion && matchedYear));
      });
    }

    [input, category, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  window.initMoviePlayer = function (boxId, sourceUrl) {
    var box = document.getElementById(boxId);
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    var playButton = box.querySelector(".player-play");
    var prepared = false;
    var hlsInstance = null;

    function attachSource() {
      if (prepared || !video) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function startPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
