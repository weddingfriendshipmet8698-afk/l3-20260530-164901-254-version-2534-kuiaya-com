(function () {
    var base = document.body.getAttribute("data-base") || "";

    function withBase(path) {
        return base + String(path || "").replace(/^\.\//, "");
    }

    function normalize(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("is-active", index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("is-active", index === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restart();
            });
        });
        restart();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var cardList = document.querySelector("[data-card-list]");
    if (filterInput && cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
        var paramName = filterInput.getAttribute("data-query-param");
        if (paramName) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get(paramName);
            if (queryValue) {
                filterInput.value = queryValue;
            }
        }

        function applyFilter(value) {
            var query = normalize(value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
            });
        }

        filterInput.addEventListener("input", function () {
            applyFilter(filterInput.value);
        });

        document.querySelectorAll("[data-filter-term]").forEach(function (button) {
            button.addEventListener("click", function () {
                filterInput.value = button.getAttribute("data-filter-term") || "";
                applyFilter(filterInput.value);
                filterInput.focus();
            });
        });

        applyFilter(filterInput.value);
    }

    var globalInput = document.querySelector("[data-global-search]");
    var globalResults = document.querySelector("[data-global-results]");
    if (globalInput && globalResults && Array.isArray(window.MOVIE_INDEX)) {
        function renderGlobalResults(value) {
            var query = normalize(value);
            if (!query) {
                globalResults.classList.remove("is-open");
                globalResults.innerHTML = "";
                return;
            }
            var matches = window.MOVIE_INDEX.filter(function (item) {
                return normalize(item.search).indexOf(query) !== -1;
            }).slice(0, 8);

            if (!matches.length) {
                globalResults.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有匹配影片</strong><span>换个关键词试试</span></div></div>';
                globalResults.classList.add("is-open");
                return;
            }

            globalResults.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + withBase(item.url) + '">' +
                    '<img src="' + withBase(item.cover) + '" alt="' + item.title.replace(/"/g, "&quot;") + '">' +
                    '<div><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></div>' +
                    '</a>';
            }).join("");
            globalResults.classList.add("is-open");
        }

        globalInput.addEventListener("input", function () {
            renderGlobalResults(globalInput.value);
        });

        document.addEventListener("click", function (event) {
            if (!globalResults.contains(event.target) && event.target !== globalInput) {
                globalResults.classList.remove("is-open");
            }
        });
    }

    var hlsLoader = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoader) {
            return hlsLoader;
        }
        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("load failed"));
            };
            document.head.appendChild(script);
        });
        return hlsLoader;
    }

    function startVideo(stage) {
        var video = stage.querySelector("video");
        var cover = stage.querySelector("[data-play-trigger]");
        var status = stage.querySelector("[data-player-status]");
        var src = stage.getAttribute("data-hls");
        if (!video || !src) {
            return;
        }
        if (cover) {
            cover.classList.add("is-hidden");
        }
        if (status) {
            status.textContent = "正在加载视频...";
        }
        video.controls = true;

        function playNow() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.addEventListener("loadedmetadata", playNow, { once: true });
            video.load();
            return;
        }

        loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    if (status) {
                        status.textContent = "";
                    }
                    playNow();
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && status) {
                        status.textContent = "播放暂时不可用，请稍后重试。";
                    }
                });
                stage._hls = hls;
            } else if (status) {
                status.textContent = "播放暂时不可用，请稍后重试。";
            }
        }).catch(function () {
            if (status) {
                status.textContent = "播放暂时不可用，请稍后重试。";
            }
        });
    }

    document.querySelectorAll("[data-player]").forEach(function (stage) {
        var trigger = stage.querySelector("[data-play-trigger]");
        if (trigger) {
            trigger.addEventListener("click", function () {
                startVideo(stage);
            });
        }
        var video = stage.querySelector("video");
        if (video) {
            video.addEventListener("click", function () {
                if (!video.controls || !video.currentSrc) {
                    startVideo(stage);
                }
            });
        }
    });
})();
