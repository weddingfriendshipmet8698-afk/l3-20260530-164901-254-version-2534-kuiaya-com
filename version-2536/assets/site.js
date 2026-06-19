(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
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
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      var target = form.getAttribute('action') || 'search.html';
      window.location.href = target + '?q=' + encodeURIComponent(input.value.trim());
    });
  });

  var localFilter = document.querySelector('[data-local-filter]');

  if (localFilter) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    localFilter.addEventListener('input', function () {
      var keyword = localFilter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden-card', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  var searchInput = document.getElementById('movie-search');
  var categoryFilter = document.getElementById('category-filter');
  var results = document.getElementById('search-results');
  var clear = document.getElementById('search-clear');

  if (searchInput && categoryFilter && results && window.SEARCH_MOVIES) {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    searchInput.value = query;

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render() {
      var keyword = searchInput.value.trim().toLowerCase();
      var category = categoryFilter.value;
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category
        ].join(' ').toLowerCase();
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var categoryMatch = !category || movie.category === category;
        return keywordMatch && categoryMatch;
      }).slice(0, 120);

      results.innerHTML = matches.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="play-badge">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>' +
          '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>' +
          '<div class="tag-row">' + movie.tags.split(',').slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
          }).join('') + '</div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    searchInput.addEventListener('input', render);
    categoryFilter.addEventListener('change', render);

    if (clear) {
      clear.addEventListener('click', function () {
        searchInput.value = '';
        categoryFilter.value = '';
        render();
      });
    }

    render();
  }
})();
