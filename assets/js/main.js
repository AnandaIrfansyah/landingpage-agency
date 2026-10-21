/* ============================================
   PLAN B AGENCY — Main Script
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     LOADING SCREEN — tampil semua halaman
     ============================================ */
  (function initLoader() {
    // Hormati prefers-reduced-motion (aksesibilitas)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Buat elemen loader
    const loader = document.createElement('div');
    loader.className = 'pb-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="pb-loader-inner">
        <div class="pb-loader-logo">
          <div class="pb-loader-mark">B</div>
        </div>
        <div class="pb-loader-spinner"></div>
      </div>
    `;

    // Sisipkan ke <body>
    document.body.appendChild(loader);

    // Cegah scroll saat loading
    document.body.classList.add('pb-loading');

    // Delay: 0.8 detik setelah window.load
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('pb-loader-hide');
        document.body.classList.remove('pb-loading');

        setTimeout(() => {
          if (loader.parentElement) loader.remove();
        }, 400);
      }, 800);
    });

    // Fallback: kalau window.load gak ke-trigger, paksa hilang setelah 2.5 detik
    setTimeout(() => {
      if (document.body.contains(loader) && !loader.classList.contains('pb-loader-hide')) {
        loader.classList.add('pb-loader-hide');
        document.body.classList.remove('pb-loading');
        setTimeout(() => {
          if (loader.parentElement) loader.remove();
        }, 400);
      }
    }, 2500);
  })();

  /* ============================================
     NAVBAR SCROLL EFFECT
     ============================================ */
  const navbar = document.getElementById('nav');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  /* ============================================
     MOBILE MENU TOGGLE
     ============================================ */
  const toggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Tutup menu saat link diklik
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  /* ============================================
     REVEAL ON SCROLL
     ============================================ */
  const revealTargets = document.querySelectorAll(
    '.layanan-card, .kenapa-item, .porto-item, .testi-card, .aside-card, .sub-card, .process-item'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealTargets.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ============================================
     SMOOTH SCROLL & CLOSE MOBILE MENU
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function () {
      if (navLinks) navLinks.classList.remove('open');
    });
  });

  /* ============================================
     QUICK NAV — highlight saat scroll
     ============================================ */
  const quickNavLinks = document.querySelectorAll('#quickNavList a');
  const layananSections = document.querySelectorAll('.layanan-section');

  if (quickNavLinks.length && layananSections.length && 'IntersectionObserver' in window) {

    const setActive = (id) => {
      quickNavLinks.forEach(link => {
        const isActive = link.getAttribute('href') === '#' + id;
        link.classList.toggle('is-active', isActive);

        // Auto-scroll tab aktif ke tengah (khusus mobile)
        if (isActive && link.parentElement) {
          link.parentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      });
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    layananSections.forEach(sec => navObserver.observe(sec));
  }

  /* ============================================
     PAKET: TAB SWITCHER
     ============================================ */
  const paketTabs = document.querySelectorAll('.quick-nav-btn[data-tab]');
  const paketPanels = document.querySelectorAll('.paket-panel[data-panel]');

  if (paketTabs.length && paketPanels.length) {
    paketTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        paketTabs.forEach(t => t.classList.toggle('is-active', t === tab));

        paketPanels.forEach(panel => {
          panel.classList.toggle('is-active', panel.dataset.panel === target);
        });
      });
    });
  }

  /* ============================================
     FAQ ACCORDION
     ============================================ */
  const faqItems = document.querySelectorAll('.faq-item');

  if (faqItems.length) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        faqItems.forEach(i => i.classList.remove('open'));

        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ============================================
     PORTOFOLIO: FILTER
     ============================================ */
  const portoFilters = document.querySelectorAll('.quick-nav-btn[data-filter]');
  const portoCards = document.querySelectorAll('.porto-card');
  const portoEmpty = document.getElementById('portoEmpty');

  if (portoFilters.length && portoCards.length) {

    const applyFilter = (filter) => {
      let visibleCount = 0;

      portoCards.forEach(card => {
        const cat = card.dataset.category || '';
        const show = filter === 'all' || cat === filter;

        card.classList.toggle('is-hidden', !show);
        if (show) visibleCount++;
      });

      if (portoEmpty) {
        portoEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
      }

      portoFilters.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.filter === filter);
      });
    };

    portoFilters.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });

    // Query param ?cat=foto
    const params = new URLSearchParams(window.location.search);
    const catFromUrl = params.get('cat');
    if (catFromUrl) {
      const match = Array.from(portoFilters).find(b => b.dataset.filter === catFromUrl);
      if (match) applyFilter(catFromUrl);
    }
  }

  /* ============================================
     PORTOFOLIO: LIGHTBOX
     ============================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && portoCards.length) {

    const lbTag = document.getElementById('lightboxTag');
    const lbTitle = document.getElementById('lightboxTitle');
    const lbClient = document.getElementById('lightboxClient');
    const lbYear = document.getElementById('lightboxYear');
    const lbDesc = document.getElementById('lightboxDesc');
    const lbVisual = document.getElementById('lightboxVisual');

    const openLightbox = (card) => {
      const cat = card.dataset.category || '';
      const title = card.dataset.title || '';
      const client = card.dataset.client || '—';
      const year = card.dataset.year || '—';
      const desc = card.dataset.desc || '';

      const tagLabels = {
        foto: 'Foto & Visual',
        website: 'Website',
        skripsi: 'Skripsi & Karier',
        jersey: 'Jersey & Apparel'
      };
      if (lbTag) lbTag.textContent = tagLabels[cat] || cat;
      if (lbTitle) lbTitle.textContent = title;
      if (lbClient) lbClient.textContent = client;
      if (lbYear) lbYear.textContent = year;
      if (lbDesc) lbDesc.textContent = desc;

      const bgCard = card.querySelector('.porto-card-bg');
      if (bgCard && lbVisual) {
        const colorKey = bgCard.dataset.color;
        lbVisual.style.background = getComputedStyle(bgCard).background;
        lbVisual.dataset.color = colorKey;
      }

      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    portoCards.forEach(card => {
      card.addEventListener('click', () => openLightbox(card));
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  /* ============================================
     STATUS HARI INI (kontak)
     ============================================ */
  const todayStatus = document.getElementById('todayStatus');

  if (todayStatus) {
    const now = new Date();
    const day = now.getDay(); // 0=Min, 6=Sab
    const hour = now.getHours();
    const isOpen = day !== 0 && hour >= 8 && hour < 21;

    if (isOpen) {
      todayStatus.textContent = 'Buka sekarang';
      todayStatus.style.color = 'var(--accent)';
      todayStatus.style.fontWeight = '600';
    } else if (day === 0) {
      todayStatus.textContent = 'Tutup (Minggu)';
    } else if (hour < 8) {
      todayStatus.textContent = 'Buka jam 08.00';
    } else {
      todayStatus.textContent = 'Tutup';
    }
  }

})();