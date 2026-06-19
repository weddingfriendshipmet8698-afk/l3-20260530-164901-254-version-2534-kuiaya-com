(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function matchesRegion(card, region) {
    if (!region) {
      return true;
    }
    var value = card.dataset.region || "";
    if (region === "欧美") {
      return /美国|英国|法国|德国|意大利|西班牙|加拿大|澳大利亚|欧美|欧洲/.test(value);
    }
    if (region === "其他") {
      return !/美国|英国|法国|德国|意大利|西班牙|加拿大|澳大利亚|欧美|欧洲|中国|日本|韩国/.test(value);
    }
    return value.indexOf(region) !== -1;
  }

  function matchesType(card, type) {
    if (!type) {
      return true;
    }
    var value = (card.dataset.type || "") + " " + (card.dataset.title || "");
    return value.indexOf(type) !== -1;
  }

  function sortCards(grid, sortBy) {
    var cards = Array.prototype.slice.call(grid.children);
    cards.sort(function (a, b) {
      if (sortBy === "title") {
        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
      }
      if (sortBy === "year") {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      if (sortBy === "views") {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }
      return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function setupCatalog(section) {
    var query = section.querySelector(".filter-query");
    var type = section.querySelector(".filter-type");
    var region = section.querySelector(".filter-region");
    var category = section.querySelector(".filter-category");
    var sort = section.querySelector(".filter-sort");
    var grid = section.querySelector(".catalog-grid");
    if (!grid) {
      return;
    }

    function apply() {
      var q = normalize(query && query.value);
      var typeValue = type ? type.value : "";
      var regionValue = region ? region.value : "";
      var categoryValue = category ? category.value : "";
      var cards = Array.prototype.slice.call(grid.children);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.textContent
        ].join(" "));
        var visible = true;
        visible = visible && (!q || haystack.indexOf(q) !== -1);
        visible = visible && matchesType(card, typeValue);
        visible = visible && matchesRegion(card, regionValue);
        visible = visible && (!categoryValue || card.dataset.category === categoryValue);
        card.classList.toggle("is-hidden", !visible);
      });
      if (sort) {
        sortCards(grid, sort.value);
      }
    }

    [query, type, region, category, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-catalog]").forEach(setupCatalog);

    var backTop = document.querySelector(".back-top");
    if (backTop) {
      window.addEventListener("scroll", function () {
        backTop.classList.toggle("show", window.scrollY > 420);
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
}());
