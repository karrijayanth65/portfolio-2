/**
 * JAYANTH KARRI — SOC ANALYST PORTFOLIO
 * Core Client-Side Logic:
 * 1. Dual Theme Engine (Dark / Light with LocalStorage & OS Sync)
 * 2. Navigation Scroll-Spy & Header Compaction
 * 3. Hero Visual Flank Controller (Studio Cutout vs. 360° Scroll Motion)
 * 4. 360° Frame Sequence Engine (Preloading, Responsive Canvas, Drag + Scroll)
 * 5. Incident Investigation Workbench (Tab Switcher)
 * 6. KQL Query Copy Utility
 * 7. Email Copy Utility & Toast System
 * 8. Certificate Preview Modal
 * 9. Ambient Interactive Cursor Follower
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. DUAL THEME ENGINE (DARK / LIGHT)
  // =========================================================================
  const THEME_STORAGE_KEY = 'portfolio-theme';
  const themeToggleBtn = document.getElementById('themeToggle');

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Default to dark mode (Enterprise SOC look), but respect explicit OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
      themeToggleBtn.setAttribute('title', `Current: ${theme === 'dark' ? 'Dark' : 'Light'} Mode (Click to toggle)`);
    }
  }

  // Initialize theme immediately
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch (e) {
        // Storage might be restricted
      }
    });
  }

  // Listen to system changes if user hasn't explicitly set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // =========================================================================
  // 2. PINNED NAVBAR SCROLL-SPY & HEADER COMPACTION
  // =========================================================================
  const pinnedNavbar = document.getElementById('pinnedNavbar');
  const navLinks = document.querySelectorAll('.nav-item-link[data-nav]');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  function updateScrollSpy() {
    const scrollPos = window.scrollY;

    if (pinnedNavbar) {
      if (scrollPos > 25) {
        pinnedNavbar.classList.add('scrolled');
      } else {
        pinnedNavbar.classList.remove('scrolled');
      }
    }

    // Determine current active section
    let currentId = '';
    const offsetThreshold = scrollPos + 240;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (offsetThreshold >= top && offsetThreshold < top + height) {
        currentId = id;
      }
    });

    navLinks.forEach((link) => {
      const navTarget = link.getAttribute('data-nav');
      if (navTarget === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  window.addEventListener('resize', updateScrollSpy, { passive: true });
  setTimeout(updateScrollSpy, 150);

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('mobile-open');
    });

    // Close menu when clicking any navigation link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================================================================
  // 3. HERO VISUAL FLANK CONTROLLER (STUDIO CUTOUT vs. 360° MOTION)
  // =========================================================================
  const viewBtnPortrait = document.getElementById('viewBtnPortrait');
  const viewBtnCinematic = document.getElementById('viewBtnCinematic');
  const heroStagePortrait = document.getElementById('heroStagePortrait');
  const heroStageCanvas = document.getElementById('heroStageCanvas');
  let currentHeroMode = 'portrait';

  window.switchHeroView = function(viewMode) {
    currentHeroMode = viewMode;
    if (viewMode === 'portrait') {
      if (viewBtnPortrait) {
        viewBtnPortrait.classList.add('active');
        viewBtnPortrait.setAttribute('aria-selected', 'true');
      }
      if (viewBtnCinematic) {
        viewBtnCinematic.classList.remove('active');
        viewBtnCinematic.setAttribute('aria-selected', 'false');
      }
      if (heroStagePortrait) heroStagePortrait.classList.add('active');
      if (heroStageCanvas) heroStageCanvas.classList.remove('active');
    } else if (viewMode === 'cinematic') {
      if (viewBtnCinematic) {
        viewBtnCinematic.classList.add('active');
        viewBtnCinematic.setAttribute('aria-selected', 'true');
      }
      if (viewBtnPortrait) {
        viewBtnPortrait.classList.remove('active');
        viewBtnPortrait.setAttribute('aria-selected', 'false');
      }
      if (heroStageCanvas) heroStageCanvas.classList.add('active');
      if (heroStagePortrait) heroStagePortrait.classList.remove('active');

      // Make sure canvas is properly sized and rendered
      if (typeof window.triggerCanvasResize === 'function') {
        window.triggerCanvasResize();
      }
    }
  };

  window.toggleHeroView = function() {
    const nextMode = currentHeroMode === 'portrait' ? 'cinematic' : 'portrait';
    window.switchHeroView(nextMode);
  };

  // =========================================================================
  // 4. 360° SCROLL-DRIVEN SEQUENCE ENGINE
  // =========================================================================
  const canvas = document.getElementById('heroScrollCanvas');
  const TOTAL_FRAMES = 180;
  const framesCache = new Array(TOTAL_FRAMES + 1);
  const loadedFlags = new Array(TOTAL_FRAMES + 1).fill(false);

  let targetFrame = 1;
  let currentFrame = 1;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartFrame = 1;
  let canvasCtx = null;
  let hasReducedMotion = false;

  if (window.matchMedia) {
    hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getFramePath(frameIndex) {
    const padded = String(frameIndex).padStart(3, '0');
    return `./assets/frames/ezgif-frame-${padded}.jpg`;
  }

  function loadSingleFrame(frameIndex, onLoaded) {
    if (framesCache[frameIndex]) {
      if (loadedFlags[frameIndex] && onLoaded) onLoaded(framesCache[frameIndex]);
      return;
    }
    const img = new Image();
    img.src = getFramePath(frameIndex);
    img.onload = () => {
      loadedFlags[frameIndex] = true;
      if (onLoaded) onLoaded(img);
      // If this is currently the frame we are trying to show, re-render
      if (Math.round(currentFrame) === frameIndex && canvasCtx) {
        renderFrame(frameIndex);
      }
    };
    framesCache[frameIndex] = img;
  }

  // Preloading Strategy: Frame 1 -> Anchor milestones -> Remaining frames
  function startPreloading() {
    // 1. First priority: Frame 1
    loadSingleFrame(1, (img) => {
      if (canvasCtx) renderFrame(1);
    });

    // 2. Anchor milestones every 10 frames for fast scrubbing availability
    setTimeout(() => {
      for (let i = 10; i <= TOTAL_FRAMES; i += 10) {
        loadSingleFrame(i);
      }
    }, 100);

    // 3. Incrementally preload all remaining frames in chunks
    setTimeout(() => {
      let nextFrame = 2;
      function preloadBatch() {
        const batchSize = 6;
        let count = 0;
        while (nextFrame <= TOTAL_FRAMES && count < batchSize) {
          if (!loadedFlags[nextFrame]) {
            loadSingleFrame(nextFrame);
          }
          nextFrame++;
          count++;
        }
        if (nextFrame <= TOTAL_FRAMES) {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(preloadBatch, { timeout: 150 });
          } else {
            setTimeout(preloadBatch, 40);
          }
        }
      }
      preloadBatch();
    }, 400);
  }

  // Find nearest loaded frame if target frame is still downloading
  function getNearestLoadedFrame(index) {
    if (loadedFlags[index]) return framesCache[index];
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const lower = index - offset;
      if (lower >= 1 && loadedFlags[lower]) return framesCache[lower];
      const upper = index + offset;
      if (upper <= TOTAL_FRAMES && loadedFlags[upper]) return framesCache[upper];
    }
    return framesCache[1] || null;
  }

  // Proportional cover drawing on canvas
  function drawImageCover(ctx, img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const r = Math.max(cw / iw, ch / ih);
    const nw = iw * r;
    const nh = ih * r;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, nx, ny, nw, nh);
  }

  function renderFrame(index) {
    if (!canvasCtx) return;
    const img = getNearestLoadedFrame(index);
    if (img) {
      drawImageCover(canvasCtx, img);
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round((rect.width || 500) * dpr);
    canvas.height = Math.round((rect.height || 500) * dpr);
    renderFrame(Math.round(currentFrame));
  }
  window.triggerCanvasResize = resizeCanvas;

  // Animation lerp loop
  function tickSequence() {
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.05) {
      currentFrame += diff * 0.22;
      renderFrame(Math.round(currentFrame));
    }
    requestAnimationFrame(tickSequence);
  }

  if (canvas) {
    canvasCtx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    startPreloading();
    requestAnimationFrame(tickSequence);

    // Scroll-driven frame update
    window.addEventListener('scroll', () => {
      if (hasReducedMotion) return;
      const scrollPos = window.scrollY;
      const heroSection = document.getElementById('hero');
      const heroHeight = heroSection ? heroSection.offsetHeight : 700;

      if (scrollPos <= heroHeight) {
        const progress = Math.min(Math.max(scrollPos / (heroHeight * 0.9), 0), 1);
        targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(progress * (TOTAL_FRAMES - 1)) + 1));
      }
    }, { passive: true });

    // Interactive Drag / Swipe rotation on canvas (Click toggles back to portrait)
    let dragDistance = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartFrame = currentFrame;
      dragDistance = 0;
      canvas.classList.add('grabbing');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      dragDistance = Math.max(dragDistance, Math.abs(deltaX));
      const frameOffset = Math.round(deltaX / 3.5);
      let newFrame = (dragStartFrame - frameOffset) % TOTAL_FRAMES;
      if (newFrame < 1) newFrame += TOTAL_FRAMES;
      targetFrame = newFrame;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        canvas.classList.remove('grabbing');
        // If it was a simple click rather than a rotation drag, switch back to portrait!
        if (dragDistance < 6) {
          window.toggleHeroView();
        }
      }
    });

    // Touch support for mobile rotation (Tap toggles back to portrait)
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartFrame = currentFrame;
        dragDistance = 0;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - dragStartX;
      dragDistance = Math.max(dragDistance, Math.abs(deltaX));
      const frameOffset = Math.round(deltaX / 4);
      let newFrame = (dragStartFrame - frameOffset) % TOTAL_FRAMES;
      if (newFrame < 1) newFrame += TOTAL_FRAMES;
      targetFrame = newFrame;
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        if (dragDistance < 6) {
          window.toggleHeroView();
        }
      }
    });
  }

  // =========================================================================
  // 5. INCIDENT INVESTIGATION WORKBENCH (CASE SWITCHER)
  // =========================================================================
  window.switchCase = function(caseId) {
    const tabButtons = document.querySelectorAll('.case-tab-btn');
    const casePanels = document.querySelectorAll('.case-study-panel');

    tabButtons.forEach((btn) => {
      const target = btn.getAttribute('data-case');
      if (target === caseId) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    casePanels.forEach((panel) => {
      if (panel.id === caseId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  };

  // =========================================================================
  // 6. COPY QUERY CODE TO CLIPBOARD
  // =========================================================================
  window.copyQuery = function(btnElement, codeElementId) {
    const codeEl = document.getElementById(codeElementId);
    if (!codeEl) return;

    const queryText = codeEl.textContent.trim();

    navigator.clipboard.writeText(queryText).then(() => {
      const origHtml = btnElement.innerHTML;
      btnElement.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copied!</span>
      `;
      btnElement.style.background = 'var(--accent-green)';
      btnElement.style.borderColor = 'var(--accent-green)';
      btnElement.style.color = '#ffffff';

      showToast('KQL Detection Query copied to clipboard!');

      setTimeout(() => {
        btnElement.innerHTML = origHtml;
        btnElement.style.background = '';
        btnElement.style.borderColor = '';
        btnElement.style.color = '';
      }, 2500);
    }).catch(() => {
      showToast('Could not copy query automatically.');
    });
  };

  // =========================================================================
  // 7. COPY EMAIL TO CLIPBOARD & TOAST SYSTEM
  // =========================================================================
  window.copyEmail = function() {
    const email = 'karrijayanth65@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Email address copied to clipboard!');
    }).catch(() => {
      prompt('Copy email manually:', email);
    });
  };

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // 8. CERTIFICATE PREVIEW MODAL
  // =========================================================================
  const modal = document.getElementById('previewModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  window.openModal = function(type, url, title) {
    if (!modal || !modalBody) return;
    if (modalTitle) modalTitle.textContent = title || 'Credential Preview';
    modalBody.innerHTML = '';

    if (type === 'image') {
      const img = document.createElement('img');
      img.src = url;
      img.alt = title || 'Credential Preview';
      img.loading = 'eager';
      modalBody.appendChild(img);
    } else if (type === 'pdf') {
      const iframe = document.createElement('iframe');
      iframe.src = url + '#toolbar=0';
      iframe.style.width = '100%';
      iframe.style.height = '72vh';
      iframe.style.border = 'none';
      modalBody.appendChild(iframe);
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalBody) modalBody.innerHTML = '';
  };

  window.closeModalOnBackdrop = function(e) {
    if (e.target === modal) {
      window.closeModal();
    }
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      window.closeModal();
    }
  });

  // =========================================================================
  // 9. INTERACTIVE AMBIENT CURSOR GLOW (DESKTOP / FINE POINTER)
  // =========================================================================
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches && !hasReducedMotion) {
    let cursorDot = document.getElementById('cursorDot');
    let cursorFollower = document.getElementById('cursorFollower');

    if (!cursorDot) {
      cursorDot = document.createElement('div');
      cursorDot.id = 'cursorDot';
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);
    }

    if (!cursorFollower) {
      cursorFollower = document.createElement('div');
      cursorFollower.id = 'cursorFollower';
      cursorFollower.className = 'cursor-follower';
      document.body.appendChild(cursorFollower);
    }

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity = '1';
        cursorFollower.style.opacity = '1';
        followerX = mouseX;
        followerY = mouseY;
      }

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorFollower.style.opacity = '0';
      isVisible = false;
    });

    function attachCursorHover() {
      const interactiveElements = document.querySelectorAll(
        'a, button, .snapshot-tile, .cap-card, .case-tab-btn, .rule-card, .cert-card, .github-card, .tool-flow-step, .lifecycle-card'
      );
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovered'));
      });
    }
    attachCursorHover();

    function renderCursor() {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;

      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

})();
