    // ===== INTERSECTION OBSERVER FOR FADE-UP =====
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // ===== CONTENT TABS =====
    document.querySelectorAll('.content-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.content-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
      });
    });

    // ===== SEARCH REDIRECT =====
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.querySelector('button').addEventListener('click', () => {
        const q = searchBar.querySelector('input').value.trim();
        if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
      });
      searchBar.querySelector('input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = e.target.value.trim();
          if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
        }
      });
    }

    // ===== NAV SCROLL SHADOW =====
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
      nav.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(30,18,4,0.10)'
        : 'none';
    }, { passive: true });


// ===== UNDER CONSTRUCTION MODAL =====
// Remove a path from this array once that page is live.
const underConstructionPaths = [
  '/explore',
  '/about',
  '/countries',
  '/regions',
  '/cultures',
  '/languages',
  '/religions',
  '/subdivisions',
  '/search',
  '/countries/france',
  '/countries/india/states',
  '/cultures/languages',
  '/countries/nigeria',
  '/regions/balkans',
  '/cultures/indigenous',
  '/countries/china/provinces',
  '/cultures/religions',
  '/regions/africa',
  '/regions/asia',
  '/regions/europe',
  '/regions/americas',
  '/regions/middle-east',
  '/regions/oceania',
  '/regions/central-asia',
  '/regions/caribbean',
  '/api',
  '/contact',
  '/contribute',
  '/terms',
  '/privacy'
];

(function () {
  // Inject modal HTML
  const modal = document.createElement('div');
  modal.id = 'uc-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'uc-modal-title');
  modal.innerHTML = `
    <div class="uc-backdrop"></div>
    <div class="uc-box">
      <div class="uc-icon">🌍</div>
      <h2 class="uc-title" id="uc-modal-title">Coming Soon</h2>
      <p class="uc-desc">This section of Open World Register is still being built. Check back soon — the world is almost ready.</p>
      <button class="uc-close" aria-label="Close">Got it</button>
    </div>`;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.uc-backdrop');
  const closeBtn = modal.querySelector('.uc-close');

  function openModal() {
    modal.classList.add('uc-visible');
    closeBtn.focus();
  }
  function closeModal() {
    modal.classList.remove('uc-visible');
  }

  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Intercept all internal links matching the array
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (underConstructionPaths.includes(href)) {
      e.preventDefault();
      openModal();
    }
  });
})();
