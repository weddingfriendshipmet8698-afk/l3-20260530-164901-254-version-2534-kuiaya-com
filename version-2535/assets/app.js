(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.target || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    function attachSearch(input) {
      var list = document.querySelector(".searchable-list");
      if (!input || !list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);
      function filter() {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          card.classList.toggle("hidden-by-search", value && text.indexOf(value) === -1);
        });
      }
      input.addEventListener("input", filter);
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
        filter();
      }
    }

    attachSearch(document.querySelector("[data-local-search]"));
    attachSearch(document.querySelector("[data-global-search]"));

    function setupPlayer(shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }

      var initialized = false;

      function initSource() {
        if (initialized) {
          return;
        }
        initialized = true;
        var hlsUrl = video.getAttribute("data-hls");
        var mp4Url = video.getAttribute("data-mp4");

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          video._hlsInstance = hls;
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
          return;
        }

        video.src = mp4Url;
      }

      function playVideo() {
        initSource();
        button.classList.add("hidden");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            button.classList.remove("hidden");
          });
        }
      }

      button.addEventListener("click", playVideo);
      shell.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        if (!button.classList.contains("hidden")) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("hidden");
        }
      });
    }

    document.querySelectorAll("[data-video-shell]").forEach(setupPlayer);
  });
})();
