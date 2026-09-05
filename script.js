/**
 * IZISAAS CV PRO - CORE JAVASCRIPT (V2 ÉPURÉE)
 * Gestion du Thème Lumineux/Sombre, Sélecteur de Palettes, Mode Édition Directe, Filtres Compétences & Contact
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeAndPalette();
  initLiveEditMode();
  initStatsCounters();
  initSkillsFilter();
  initContactForm();
  initMobileNav();
  initScrollSpy();
  setCurrentYear();
});

/* ==========================================================================
   1. GESTIONNAIRE DE THÈME ET COULEURS D'ACCENT
   ========================================================================== */
function initThemeAndPalette() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('btnThemeToggle');
  const paletteBtn = document.getElementById('btnPalette');
  const paletteMenu = document.getElementById('paletteMenu');
  const printBtn = document.getElementById('btnPrintCV');

  // Thème sauvegardé
  const savedTheme = localStorage.getItem('cv_theme') || 'dark';
  root.setAttribute('data-theme', savedTheme);

  // Palette sauvegardée
  const savedAccent = localStorage.getItem('cv_accent') || 'sapphire';
  root.setAttribute('data-accent', savedAccent);

  // Bascule Thème Sombre / Clair
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', nextTheme);
      localStorage.setItem('cv_theme', nextTheme);
      showToast(`Mode ${nextTheme === 'dark' ? 'Sombre Lumineux' : 'Clair'} activé`);
    });
  }

  // Menu Palette
  if (paletteBtn && paletteMenu) {
    paletteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      paletteMenu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      paletteMenu.classList.remove('open');
    });

    paletteMenu.querySelectorAll('.palette-opt').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = btn.getAttribute('data-color');
        root.setAttribute('data-accent', color);
        localStorage.setItem('cv_accent', color);
        paletteMenu.classList.remove('open');
        showToast(`Couleur appliquée : ${btn.title}`);
      });
    });
  }

  // Impression PDF
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   2. MODE ÉDITION EN DIRECT (LIVE QUICK EDIT)
   ========================================================================== */
function initLiveEditMode() {
  const toggleBtn = document.getElementById('btnToggleEdit');
  const banner = document.getElementById('editModeBanner');
  const saveBtn = document.getElementById('btnSaveEdit');
  const exitBtn = document.getElementById('btnExitEdit');
  const editables = document.querySelectorAll('[data-editable]');

  let isEditing = false;

  // Restaurer les textes personnalisés s'ils existent
  const savedTexts = JSON.parse(localStorage.getItem('cv_custom_texts') || '{}');
  editables.forEach((el) => {
    const key = el.getAttribute('data-editable');
    if (savedTexts[key]) {
      el.innerText = savedTexts[key];
    }
  });

  function setEditingState(active) {
    isEditing = active;
    if (banner) banner.style.display = active ? 'block' : 'none';

    editables.forEach((el) => {
      el.setAttribute('contenteditable', active ? 'true' : 'false');
    });

    if (active) {
      showToast('Mode Édition activé : Cliquez sur les textes pour les modifier !');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('Mode Édition désactivé');
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      setEditingState(!isEditing);
    });
  }

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      setEditingState(false);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const textsToSave = {};
      editables.forEach((el) => {
        const key = el.getAttribute('data-editable');
        textsToSave[key] = el.innerText.trim();
      });
      localStorage.setItem('cv_custom_texts', JSON.stringify(textsToSave));
      showToast('Vos modifications ont été enregistrées avec succès !', 'success');
      setEditingState(false);
    });
  }
}

/* ==========================================================================
   3. ANIMATION DES COMPTEURS STATISTIQUES
   ========================================================================== */
function initStatsCounters() {
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach((counter) => {
          const target = +counter.getAttribute('data-target');
          const duration = 1400; // ms
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.innerText = target;
              clearInterval(timer);
            } else {
              counter.innerText = Math.ceil(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.25 });

  const statsSection = document.querySelector('.hero-stats-container');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* ==========================================================================
   4. FILTRES DES COMPÉTENCES TECHNIQUES
   ========================================================================== */
function initSkillsFilter() {
  const tabs = document.querySelectorAll('[data-skill-filter]');
  const cards = document.querySelectorAll('.skill-card');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-skill-filter');

      cards.forEach((card) => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   5. FORMULAIRE DE CONTACT INTERACTIF & VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');
  const submitBtn = document.getElementById('btnSubmitForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset erreurs
    const nameErr = document.getElementById('nameError');
    const emailErr = document.getElementById('emailError');
    const subjectErr = document.getElementById('subjectError');
    const msgErr = document.getElementById('messageError');

    if (nameErr) nameErr.innerText = '';
    if (emailErr) emailErr.innerText = '';
    if (subjectErr) subjectErr.innerText = '';
    if (msgErr) msgErr.innerText = '';

    // Nom
    if (!nameInput.value.trim()) {
      if (nameErr) nameErr.innerText = 'Veuillez saisir votre nom.';
      isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      if (emailErr) emailErr.innerText = 'Veuillez renseigner un email valide.';
      isValid = false;
    }

    // Sujet
    if (!subjectInput.value) {
      if (subjectErr) subjectErr.innerText = 'Veuillez choisir un sujet.';
      isValid = false;
    }

    // Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 8) {
      if (msgErr) msgErr.innerText = 'Votre message doit contenir au moins 8 caractères.';
      isValid = false;
    }

    if (!isValid) return;

    // Animation bouton d'envoi élégant
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span>Envoi en cours...</span>
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      form.reset();
      showToast('Votre message a bien été envoyé ! Je vous répondrai très rapidement.', 'success');
    }, 1100);
  });
}

/* ==========================================================================
   6. NAVIGATION MOBILE RESPONSIVE
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('btnMobileToggle');
  const menu = document.getElementById('navMenu');

  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('mobile-open');
    });

    // Fermer lors d'un clic sur un lien
    menu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('mobile-open');
      });
    });

    // Fermer lors d'un clic en dehors
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('mobile-open');
      }
    });
  }
}

/* ==========================================================================
   7. SCROLL SPY POUR LIENS ACTIFS
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 130;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   8. SYSTÈME DE NOTIFICATIONS TOAST
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '💡'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

/* ==========================================================================
   9. ANNÉE DU FOOTER
   ========================================================================== */
function setCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) {
    el.innerText = new Date().getFullYear();
  }
}
