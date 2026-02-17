/**
 * WorldPedia — Main JS
 * jQuery + section nav + micro-interactions
 */
$(function () {

  // ── Section Tab Navigation ──────────────────────────────────────────────
  const $sectionNav = $('.section-nav');
  const $navItems   = $('.section-nav-item');
  const $sections   = $('[data-section]');

  // Scroll spy: highlight active section tab
  function updateActiveSection() {
    if (!$sectionNav.length) return;
    const scrollTop = $(window).scrollTop() + 160;
    let current = '';
    $sections.each(function () {
      const top = $(this).offset().top;
      if (scrollTop >= top) current = $(this).data('section');
    });
    $navItems.removeClass('active');
    $navItems.filter(`[data-target="${current}"]`).addClass('active');
  }

  $(window).on('scroll', updateActiveSection);
  updateActiveSection();

  // Click tab → smooth scroll
  $navItems.on('click', function () {
    const target = $(this).data('target');
    const $target = $(`[data-section="${target}"]`);
    if ($target.length) {
      const offset = $target.offset().top - 64 - 50; // nav + section-nav
      $('html, body').animate({ scrollTop: offset }, 500, 'swing');
    }
  });

  // ── Anthem Player (mock) ────────────────────────────────────────────────
  let playing = false;
  $('#anthem-play-btn').on('click', function () {
    playing = !playing;
    const $icon = $(this).find('i');
    if (playing) {
      $icon.removeClass('fa-play').addClass('fa-pause');
      $('#anthem-status').text('Playing…');
      $(this).addClass('pulse');
    } else {
      $icon.removeClass('fa-pause').addClass('fa-play');
      $('#anthem-status').text('Click to play');
      $(this).removeClass('pulse');
    }
  });

  // ── Lazy fade-in on scroll ──────────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.wp-card, .division-card, .attraction-card, .book-card, .movie-card, .food-card, .person-card, .product-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    observer.observe(el);
  });

  // ── Country search (homepage) ───────────────────────────────────────────
  $('#country-search').on('input', function () {
    const q = $(this).val().toLowerCase();
    $('.country-entry').each(function () {
      const name = $(this).find('.country-entry-name').text().toLowerCase();
      $(this).toggle(name.includes(q));
    });
  });

  // ── Tooltip on info icons ───────────────────────────────────────────────
  $('[data-bs-toggle="tooltip"]').tooltip();

  // ── Amazon affiliate click tracking (placeholder) ───────────────────────
  $('.btn-amazon').on('click', function () {
    const product = $(this).closest('.product-card').find('.product-name').text();
    console.log(`[Affiliate] Clicked: ${product}`);
    // In production: send to analytics
  });

  // ── Map embed placeholder interaction ──────────────────────────────────
  $('#map-placeholder').on('click', function () {
    const lat  = $(this).data('lat');
    const lng  = $(this).data('lng');
    const name = $(this).data('name');
    if (lat && lng) {
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=6/${lat}/${lng}`;
      window.open(url, '_blank');
    }
  });

});
