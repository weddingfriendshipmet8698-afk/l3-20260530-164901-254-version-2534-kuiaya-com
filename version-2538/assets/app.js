(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

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

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-grid]'));
  var emptyTip = document.querySelector('[data-empty-tip]');

  function filterCards() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;

    grids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();

        var matchText = !query || text.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var show = matchText && matchYear;

        card.hidden = !show;

        if (show) {
          visible += 1;
        }
      });
    });

    if (emptyTip) {
      emptyTip.classList.toggle('show', visible === 0);
    }
  }

  function sortCards() {
    if (!sortSelect) {
      return;
    }

    var mode = sortSelect.value;

    grids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

      cards.sort(function (a, b) {
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }

        if (mode === 'hot') {
          return Number(b.querySelector('.rating') ? b.querySelector('.rating').textContent : 0) - Number(a.querySelector('.rating') ? a.querySelector('.rating').textContent : 0);
        }

        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });

    filterCards();
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
  }
})();
