/**
 * Jayanth Karri — SOC Analyst Portfolio
 * Precision Cyber Defense Architecture: Splash Screen, Pinned Header Scroll-Spy,
 * Canvas Background, Modal Previews, Tab Switchers, and Interactive Cursor
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. HEROIC INTRODUCTORY SPLASH SCREEN (1 to 2 seconds transition)
  // =========================================================================
  const splash = document.getElementById('splash-screen');
  if (splash) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 850);
      }, 1500);
    });

    // Fallback safety timeout
    setTimeout(() => {
      if (document.body.contains(splash)) {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 850);
      }
    }, 2000);
  }

  // =========================================================================
  // 2. PINNED NAVBAR (IMAGE 4) & SCROLL-SPY
  // =========================================================================
  const pinnedNavbar = document.getElementById('pinnedNavbar');
  const navLinks = document.querySelectorAll('.nav-item-link[data-nav]');
  const sections = document.querySelectorAll('section[id]');

  function updateScrollSpy() {
    const scrollPosition = window.scrollY;

    // Compact navbar on scroll
    if (pinnedNavbar) {
      if (scrollPosition > 40) {
        pinnedNavbar.classList.add('scrolled');
      } else {
        pinnedNavbar.classList.remove('scrolled');
      }
    }

    // Determine current active section
    let currentSectionId = '';
    const offsetThreshold = scrollPosition + 250;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (offsetThreshold >= top && offsetThreshold < top + height) {
        currentSectionId = id;
      }
    });

    navLinks.forEach((link) => {
      const navTarget = link.getAttribute('data-nav');
      if (navTarget === currentSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  window.addEventListener('resize', updateScrollSpy, { passive: true });
  setTimeout(updateScrollSpy, 250);
  setTimeout(updateScrollSpy, 1600);

  // =========================================================================
  // 3. ABOUT ME TABS (IMAGE 5: Technical Skills vs Education)
  // =========================================================================
  window.switchAboutTab = function(tabName) {
    const btnSkills = document.getElementById('tabAboutSkills');
    const btnEdu = document.getElementById('tabAboutEdu');
    const panelSkills = document.getElementById('panelAboutSkills');
    const panelEdu = document.getElementById('panelAboutEdu');

    if (!btnSkills || !btnEdu || !panelSkills || !panelEdu) return;

    if (tabName === 'skills') {
      btnSkills.classList.add('active');
      btnEdu.classList.remove('active');
      panelSkills.classList.add('active');
      panelEdu.classList.remove('active');
    } else {
      btnEdu.classList.add('active');
      btnSkills.classList.remove('active');
      panelEdu.classList.add('active');
      panelSkills.classList.remove('active');
    }
  };

  // =========================================================================
  // 4. EDGE-TO-EDGE CANVAS BACKGROUND
  // =========================================================================
  const TOTAL_FRAMES = 180;
  const LERP_FACTOR = 0.09;

  const canvas = document.getElementById('canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    const images = new Array(TOTAL_FRAMES + 1);
    const loadedMap = new Uint8Array(TOTAL_FRAMES + 1);

    let currentFrame = 1;
    let targetFrame = 1;
    let lastRenderedIndex = -1;
    let needsRedraw = true;
    let hasFirstFrameRendered = false;

    function getFrameUrl(index) {
      const padded = String(index).padStart(3, '0');
      return `./assets/frames/ezgif-frame-${padded}.jpg`;
    }

    function loadFrame(index) {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          images[index] = img;
          loadedMap[index] = 1;

          if (!hasFirstFrameRendered && (index === 1 || index === Math.round(targetFrame))) {
            hasFirstFrameRendered = true;
            renderFrame(index);
          }
          if (index === Math.round(currentFrame)) {
            needsRedraw = true;
          }
          resolve(img);
        };
        img.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            images[index] = fallbackImg;
            loadedMap[index] = 1;
            resolve(fallbackImg);
          };
          fallbackImg.onerror = () => resolve(null);
          fallbackImg.src = `./assets/frames/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;
        };
        img.src = getFrameUrl(index);
      });
    }

    async function preloadFrames() {
      await loadFrame(1);
      for (let i = 10; i <= TOTAL_FRAMES; i += 10) {
        loadFrame(i);
      }
      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        if (!loadedMap[i]) {
          loadFrame(i);
        }
      }
    }

    function getNearestLoadedFrame(targetIdx) {
      if (loadedMap[targetIdx]) return images[targetIdx];

      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const down = targetIdx - offset;
        if (down >= 1 && loadedMap[down]) return images[down];
        const up = targetIdx + offset;
        if (up <= TOTAL_FRAMES && loadedMap[up]) return images[up];
      }
      return images[1] || null;
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const newWidth = Math.round(window.innerWidth * dpr);
      const newHeight = Math.round(window.innerHeight * dpr);

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        needsRedraw = true;
      }
    }

    function drawImageCover(img) {
      if (!img) return;
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      if (!imgWidth || !imgHeight) return;

      const cWidth = canvas.width;
      const cHeight = canvas.height;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = cWidth / cHeight;

      let renderWidth, renderHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        renderWidth = cWidth;
        renderHeight = cWidth / imgRatio;
        offsetX = 0;
        offsetY = (cHeight - renderHeight) / 2;
      } else {
        renderHeight = cHeight;
        renderWidth = cHeight * imgRatio;
        offsetX = (cWidth - renderWidth) / 2;
        offsetY = 0;
      }

      ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    }

    function renderFrame(index) {
      const img = getNearestLoadedFrame(index);
      if (img) {
        drawImageCover(img);
        lastRenderedIndex = index;
      }
    }

    function updateScrollTarget() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        targetFrame = 1;
        return;
      }
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      targetFrame = 1 + progress * (TOTAL_FRAMES - 1);
    }

    function animate() {
      updateScrollTarget();

      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.001) {
        currentFrame += diff * LERP_FACTOR;
      } else {
        currentFrame = targetFrame;
      }

      const frameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(currentFrame)));

      if (frameIndex !== lastRenderedIndex || needsRedraw) {
        renderFrame(frameIndex);
        needsRedraw = false;
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      needsRedraw = true;
    }, { passive: true });

    resizeCanvas();
    preloadFrames();
    requestAnimationFrame(animate);
  }

  // =========================================================================
  // 5. CERTIFICATE PREVIEW MODAL (IMAGE 1 EYE BUTTON)
  // =========================================================================
  const modal = document.getElementById('previewModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  window.openModal = function(type, url, title) {
    if (!modal || !modalBody) return;
    modalTitle.textContent = title || 'Credential Preview';
    modalBody.innerHTML = '';

    if (type === 'image') {
      const img = document.createElement('img');
      img.src = url;
      img.alt = title || 'Certification Preview';
      img.loading = 'eager';
      img.decoding = 'async';
      modalBody.appendChild(img);
    } else if (type === 'pdf') {
      const iframe = document.createElement('iframe');
      iframe.src = url + '#toolbar=0';
      modalBody.appendChild(iframe);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    if (!modal) return;
    modal.classList.remove('active');
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
  // 6. COPY EMAIL TO CLIPBOARD
  // =========================================================================
  window.copyEmail = function() {
    const email = 'karrijayanth65@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 2500);
      }
    }).catch(() => {
      alert(`Email: ${email}`);
    });
  };

  // =========================================================================
  // 7. INTERACTIVE GLOWING CURSOR EFFECT
  // =========================================================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorFollower = document.getElementById('cursorFollower');

  if (cursorDot && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
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

    window.addEventListener('mousedown', () => {
      cursorFollower.classList.add('active');
    });

    window.addEventListener('mouseup', () => {
      cursorFollower.classList.remove('active');
    });

    function attachCursorHover() {
      const targets = document.querySelectorAll('a, button, input, textarea, .cert-ref-card, .project-ref-card, .achievement-card, .skill-pill-item, .exp-card-ref, .btn-copy-email-glow');
      targets.forEach((el) => {
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
