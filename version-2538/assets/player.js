(function () {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('[data-video]');
  var button = document.querySelector('[data-start]');

  if (!shell || !video || !button) {
    return;
  }

  var address = video.getAttribute('data-play');
  var ready = false;

  function bindMedia() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = address;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(address);
      hls.attachMedia(video);
    } else {
      video.src = address;
    }
  }

  function start() {
    bindMedia();
    shell.classList.add('is-playing');
    video.controls = true;
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  button.addEventListener('click', start);
  shell.addEventListener('click', function (event) {
    if (event.target === video && video.paused) {
      start();
    }
  });
})();
