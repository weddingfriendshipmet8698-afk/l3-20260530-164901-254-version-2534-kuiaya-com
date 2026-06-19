(function () {
  function readPlayerData() {
    var node = document.getElementById("player-data");
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function startVideo(video, overlay) {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("play-overlay");
    var data = readPlayerData();
    if (!video || !data || !data.source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = data.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(data.source);
      hls.attachMedia(video);
    } else {
      video.src = data.source;
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        startVideo(video, overlay);
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startVideo(video, overlay);
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (overlay && !video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
  });
}());
