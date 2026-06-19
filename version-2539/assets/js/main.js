(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var backTop = document.querySelector('.back-top');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 420) {
                backTop.classList.add('show');
            } else {
                backTop.classList.remove('show');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var searchForms = document.querySelectorAll('.go-search');

    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';

            if (value) {
                event.preventDefault();
                window.location.href = 'library.html?q=' + encodeURIComponent(value);
            }
        });
    });

    var filterForm = document.querySelector('[data-filter-form]');
    var cardGrid = document.querySelector('[data-card-grid]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterForm && cardGrid) {
        var cards = Array.prototype.slice.call(cardGrid.children);
        var params = new URLSearchParams(window.location.search);
        var queryInput = filterForm.querySelector('input[name="q"]');
        var categorySelect = filterForm.querySelector('select[name="category"]');
        var yearSelect = filterForm.querySelector('select[name="year"]');
        var sortSelect = filterForm.querySelector('select[name="sort"]');

        if (queryInput && params.get('q')) {
            queryInput.value = params.get('q');
        }

        if (sortSelect && params.get('sort')) {
            sortSelect.value = params.get('sort');
        }

        function textOf(card) {
            return (card.getAttribute('data-search') || '').toLowerCase();
        }

        function numberValue(card, name) {
            return Number(card.getAttribute(name) || 0);
        }

        function applyFilter() {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var sortValue = sortSelect ? sortSelect.value : 'default';
            var visible = 0;
            var ordered = cards.slice();

            if (sortValue === 'rating') {
                ordered.sort(function (a, b) {
                    return numberValue(b, 'data-rating') - numberValue(a, 'data-rating');
                });
            }

            if (sortValue === 'views') {
                ordered.sort(function (a, b) {
                    return numberValue(b, 'data-views') - numberValue(a, 'data-views');
                });
            }

            if (sortValue === 'year') {
                ordered.sort(function (a, b) {
                    return numberValue(b, 'data-year') - numberValue(a, 'data-year');
                });
            }

            ordered.forEach(function (card) {
                cardGrid.appendChild(card);
            });

            cards.forEach(function (card) {
                var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
                var matchesCategory = !category || card.getAttribute('data-category') === category;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var show = matchesQuery && matchesCategory && matchesYear;
                card.hidden = !show;

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        filterForm.addEventListener('input', applyFilter);
        filterForm.addEventListener('change', applyFilter);
        applyFilter();
    }

    var video = document.querySelector('.video-player');
    var overlay = document.querySelector('.player-overlay');

    if (video) {
        var stream = video.getAttribute('data-stream');
        var attached = false;

        function attachStream() {
            if (attached || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hls.loadSource(stream);
                hls.attachMedia(video);
                attached = true;
                return;
            }

            video.src = stream;
            attached = true;
        }

        function playVideo() {
            attachStream();
            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }
})();
