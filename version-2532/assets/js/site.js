(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var changeSlide = function (next) {
            if (!slides.length) {
                return;
            }
            slides[current].classList.remove('active');
            if (dots[current]) {
                dots[current].classList.remove('active');
            }
            current = (next + slides.length) % slides.length;
            slides[current].classList.add('active');
            if (dots[current]) {
                dots[current].classList.add('active');
            }
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                changeSlide(index);
            });
        });
        window.setInterval(function () {
            changeSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('.site-search');
    var yearFilter = document.querySelector('.year-filter');
    var grid = document.querySelector('[data-card-grid]');
    var emptyState = document.querySelector('[data-empty-state]');

    var getQueryFromUrl = function () {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    };

    if (searchInput && getQueryFromUrl()) {
        searchInput.value = getQueryFromUrl();
    }

    var applyFilters = function () {
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.children);
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year')
            ].join(' ').toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var show = matchQuery && matchYear;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
    applyFilters();
})();
