(function () {
  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var source = config.source;
    var started = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function showError() {
      overlay.classList.remove("is-hidden");
      overlay.innerHTML = "<span class=\"play-circle\">▶</span><strong>播放暂不可用</strong>";
    }

    function attachSource() {
      if (started) {
        return Promise.resolve();
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              showError();
            }
          }
        });
        return Promise.resolve();
      }

      showError();
      return Promise.reject(new Error("not-supported"));
    }

    function play() {
      attachSource().then(function () {
        var request = video.play();

        if (request && typeof request.catch === "function") {
          request.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }).catch(function () {
        showError();
      });
    }

    overlay.addEventListener("click", function () {
      play();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
