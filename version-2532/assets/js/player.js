(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]'));

    var attachSource = function (video, source) {
        if (!source || video.dataset.ready === '1') {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.dataset.ready = '1';
            video._hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = '1';
        } else {
            video.src = source;
            video.dataset.ready = '1';
        }
    };

    shells.forEach(function (shell) {
        var video = shell.querySelector('video[data-video-src]');
        var start = shell.querySelector('[data-video-start]');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-video-src');
        var playVideo = function () {
            attachSource(video, source);
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
            if (start) {
                start.classList.add('hidden');
            }
        };

        if (start) {
            start.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            if (start) {
                start.classList.add('hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (start && video.currentTime === 0) {
                start.classList.remove('hidden');
            }
        });
    });
})();
