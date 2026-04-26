/* ═══════════════════════════════════════════════════════════════
   34 North — main.js
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Nav: scroll-aware appearance ──────────────────────────── */
  const header = document.querySelector('.site-header');

  const LIGHT_SECTIONS = ['services', 'database', 'why-us'];

  function updateNav() {
    const scrollY = window.scrollY;

    if (scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // Detect which section is near the top to flip nav colour
    const inLight = LIGHT_SECTIONS.some(id => {
      const el = document.getElementById(id);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 10 && rect.bottom > 10;
    });

    header.classList.toggle('is-light', inLight);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ─── Hamburger / Mobile Menu ────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.querySelector('.mobile-overlay');
  const closeBtn = document.querySelector('.mobile-menu-close');

  function openMenu() {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Keyboard: close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* ─── Scroll Reveal (IntersectionObserver) ───────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── Active nav link highlight ──────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.color = href === '#' + id ? 'var(--accent-light)' : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* ─── Footer year ────────────────────────────────────────────── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── Math CAPTCHA ───────────────────────────────────────────── */
  const captchaQuestion = document.getElementById('captcha-question');
  const captchaSum = document.getElementById('captcha-sum');

  let correctAnswer = 0;

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    correctAnswer = a + b;
    if (captchaQuestion) captchaQuestion.textContent = a + ' + ' + b;
    if (captchaSum) captchaSum.value = correctAnswer;
  }

  generateCaptcha();

  /* ─── Form time token (bot speed check) ─────────────────────── */
  const formTimeInput = document.getElementById('form-time-token');
  if (formTimeInput) {
    formTimeInput.value = Date.now().toString();
  }

  /* ─── Contact Form ───────────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successEl = document.getElementById('form-success');
  const errorStateEl = document.getElementById('form-error-state');

  if (!form) return;

  /* ─── Submission rate limiting ───────────────────────────────── */
  const SUBMIT_LIMIT = 3;
  const COOLDOWN_SECS = 30;
  let submitCount = parseInt(sessionStorage.getItem('34n_sub_count') || '0', 10);

  if (submitCount >= SUBMIT_LIMIT) {
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-label').textContent = 'Submission limit reached';
  }

  function applyCooldown() {
    let remaining = COOLDOWN_SECS;
    submitBtn.disabled = true;
    (function tick() {
      if (remaining <= 0) {
        if (submitCount < SUBMIT_LIMIT) {
          submitBtn.querySelector('.btn-label').textContent = 'Send Message';
          submitBtn.disabled = false;
        } else {
          submitBtn.querySelector('.btn-label').textContent = 'Submission limit reached';
        }
        return;
      }
      submitBtn.querySelector('.btn-label').textContent = `Try again in ${remaining}s`;
      remaining--;
      setTimeout(tick, 1000);
    }());
  }

  /* Field refs */
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const captchaInput = document.getElementById('captcha-answer');
  const honeypotInput = form.querySelector('.honeypot');

  /* Error els */
  function setError(inputEl, errorElId, msg) {
    const errorEl = document.getElementById(errorElId);
    if (!errorEl) return;
    errorEl.textContent = msg;
    if (msg) {
      inputEl.classList.add('is-invalid');
      inputEl.setAttribute('aria-invalid', 'true');
    } else {
      inputEl.classList.remove('is-invalid');
      inputEl.removeAttribute('aria-invalid');
    }
  }

  function clearError(inputEl, errorElId) {
    setError(inputEl, errorElId, '');
  }

  /* Live validation */
  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) setError(nameInput, 'name-error', 'Please enter your name.');
    else clearError(nameInput, 'name-error');
  });

  emailInput.addEventListener('blur', () => {
    const val = emailInput.value.trim();
    if (!val) setError(emailInput, 'email-error', 'Please enter your email address.');
    else if (!isValidEmail(val)) setError(emailInput, 'email-error', 'Please enter a valid email address.');
    else clearError(emailInput, 'email-error');
  });

  messageInput.addEventListener('blur', () => {
    if (!messageInput.value.trim()) setError(messageInput, 'message-error', 'Please describe your project or question.');
    else clearError(messageInput, 'message-error');
  });

  captchaInput.addEventListener('input', () => {
    clearError(captchaInput, 'captcha-error');
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  /* Full validation */
  function validateForm() {
    let valid = true;

    // Honeypot check — if filled, silently fail
    if (honeypotInput && honeypotInput.value.trim() !== '') {
      return false;
    }

    // Time check — if submitted in under 3s, likely a bot
    const formTime = parseInt(formTimeInput ? formTimeInput.value : '0', 10);
    const elapsed = Date.now() - formTime;
    if (elapsed < 3000) {
      return false;
    }

    // Name
    if (!nameInput.value.trim()) {
      setError(nameInput, 'name-error', 'Please enter your name.');
      valid = false;
    }

    // Email
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      setError(emailInput, 'email-error', 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      setError(emailInput, 'email-error', 'Please enter a valid email address.');
      valid = false;
    }

    // Message
    if (!messageInput.value.trim()) {
      setError(messageInput, 'message-error', 'Please describe your project or question.');
      valid = false;
    }

    // CAPTCHA
    const captchaVal = parseInt(captchaInput.value, 10);
    if (isNaN(captchaVal) || captchaVal !== correctAnswer) {
      setError(captchaInput, 'captcha-error', 'Incorrect answer — please try again.');
      generateCaptcha(); // regenerate so they can retry
      captchaInput.value = '';
      valid = false;
    }

    return valid;
  }

  const WEB3FORMS_KEY = '2bf352bd-09b1-4824-b5cd-4bbe927243f5';

  /* Submit handler */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: 'New inquiry from 34north.net',
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      company: document.getElementById('company').value.trim(),
      service: document.getElementById('service').value,
      message: messageInput.value.trim(),
    };

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      form.hidden = true;
      successEl.hidden = false;

    } catch (err) {
      console.error('Form submission error:', err);
      errorStateEl.hidden = false;
    } finally {
      submitBtn.classList.remove('is-loading');
      submitCount++;
      sessionStorage.setItem('34n_sub_count', submitCount.toString());
      applyCooldown();
    }
  });

  /* ─── Smooth scroll for anchor links ────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = header ? header.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

})();
