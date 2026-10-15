/**
 * POSHĀK HERO & PRELOADER - EXACT AUGE XP ENGINE
 * Complete replication of https://auge-xp.com/ preloader & text reveals using GSAP
 */

(function () {
  'use strict';

  // POSHĀK Clothing Model Photos for Cursor Image Trail (Extracted from Unsplash)
  const CLOTHES = [
    '/cdn/unsplash_clothing_models/model_01.webp',
    '/cdn/unsplash_clothing_models/model_02.webp',
    '/cdn/unsplash_clothing_models/model_03.webp',
    '/cdn/unsplash_clothing_models/model_04.webp',
    '/cdn/unsplash_clothing_models/model_05.webp',
    '/cdn/unsplash_clothing_models/model_06.webp',
    '/cdn/unsplash_clothing_models/model_07.webp',
    '/cdn/unsplash_clothing_models/model_08.webp',
    '/cdn/unsplash_clothing_models/model_09.webp',
    '/cdn/unsplash_clothing_models/model_10.webp',
    '/cdn/unsplash_clothing_models/model_11.webp',
    '/cdn/unsplash_clothing_models/model_12.webp',
    '/cdn/unsplash_clothing_models/model_13.webp',
    '/cdn/unsplash_clothing_models/model_14.webp',
    '/cdn/unsplash_clothing_models/model_15.webp',
    '/cdn/unsplash_clothing_models/model_16.webp',
    '/cdn/unsplash_clothing_models/model_17.webp',
    '/cdn/unsplash_clothing_models/model_18.webp',
    '/cdn/unsplash_clothing_models/model_19.webp',
    '/cdn/unsplash_clothing_models/model_20.webp',
    '/cdn/unsplash_clothing_models/model_21.webp',
    '/cdn/unsplash_clothing_models/model_22.webp',
    '/cdn/unsplash_clothing_models/model_23.webp',
    '/cdn/unsplash_clothing_models/model_24.webp',
    '/cdn/unsplash_clothing_models/model_25.webp'
  ];

  // Preload images immediately
  CLOTHES.forEach(function (src) {
    const img = new Image();
    img.src = src;
  });

  /**
   * Character Cipher / Text Scramble Decryptor
   */
  function runTextScramble(element, targetText, duration, chars) {
    if (!element) return;
    const glyphs = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const startTime = performance.now();
    const len = targetText.length;

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const resolvedIndex = Math.floor(progress * len);

      let output = '';
      for (let i = 0; i < len; i++) {
        const char = targetText[i];
        if (char === ' ' || char === '®' || char === '©' || char === '-' || char === '.' || char === ',') {
          output += char;
        } else if (i < resolvedIndex) {
          output += char;
        } else {
          output += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }
      element.textContent = output;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        element.textContent = targetText;
      }
    }

    requestAnimationFrame(frame);
  }

  /**
   * Auge XP Band Glitch Effect (Module 98232)
   */
  function createBandGlitch(source, overlay) {
    if (!source || !overlay || typeof gsap === 'undefined') return null;
    const slices = Array.from(overlay.children).filter(el => el instanceof HTMLElement);
    if (slices.length !== 4) return null;

    let active = false, steps = 0, amp = 0, decay = 0, stepCount = 0, nextTime = 0, height = 0;
    const offsets = [0, 0, 0, 0];

    function measure() {
      height = source.offsetHeight || source.getBoundingClientRect().height || 36;
    }

    function signedUnit(seed) {
      let t = Math.imul(0x9e3779b9 ^ seed, 0x85ebca6b);
      t ^= t >>> 13;
      t = Math.imul(t, 0xc2b2ae35);
      return 2 * (((t ^= t >>> 16) >>> 0) / 0x100000000) - 1;
    }

    function hashUnit(seed) {
      let t = Math.imul(0x9e3779b9 ^ seed, 0x85ebca6b);
      t ^= t >>> 13;
      t = Math.imul(t, 0xc2b2ae35);
      return ((t ^= t >>> 16) >>> 0) / 0x100000000;
    }

    function sliceBands(step) {
      let top = 0;
      for (let r = 0; r < 4; r++) {
        const seed = 97 * step + 13 * r;
        const isLast = (r === 3);
        const target = (r + 1) / 4;
        const split = isLast ? 1 : target + 0.09 * signedUnit(seed + 1);
        const bottom = isLast ? 0 : Math.max(0, (1 - split) * 100 - 0.6);
        slices[r].style.clipPath = `inset(${(100 * top).toFixed(2)}% 0% ${bottom.toFixed(2)}% 0%)`;
        const mag = 0.08 + 0.18 * hashUnit(seed + 4);
        offsets[r] = (hashUnit(seed + 2) < 0.28 ? 0 : (hashUnit(seed + 3) < 0.5 ? -1 : 1)) * mag;
        top = split;
      }
    }

    function applyShift(scale) {
      for (let r = 0; r < 4; r++) {
        const px = offsets[r] * height * scale;
        slices[r].style.transform = `translateX(${px.toFixed(2)}px)`;
      }
    }

    function settle() {
      amp = 0; decay = 0; steps = 0; nextTime = 0;
      applyShift(0);
      overlay.style.visibility = 'hidden';
      source.style.opacity = '';
      if (active) {
        active = false;
        gsap.ticker.remove(onTick);
        for (const s of slices) s.style.willChange = '';
      }
    }

    function onTick() {
      const time = gsap.ticker.time;
      let dirty = false;
      if (time >= nextTime) {
        if (steps > 0) {
          steps -= 1;
          stepCount += 1;
          sliceBands(stepCount);
          nextTime = time + 0.09 * (1 + 0.55 * signedUnit(31 * stepCount));
          dirty = true;
        } else {
          decay = 0;
          nextTime = Infinity;
        }
      }
      if (decay === 0) {
        const factor = 1 - Math.pow(0.78, gsap.ticker.deltaRatio(60));
        amp -= amp * factor;
        if (amp < 0.01) {
          settle();
          return;
        }
        dirty = true;
      }
      if (dirty) applyShift(amp);
    }

    return {
      shatter: function () {
        measure();
        steps = 7; amp = 1; decay = 1;
        stepCount += 1;
        sliceBands(stepCount);
        nextTime = gsap.ticker.time + 0.09;
        applyShift(1);
        source.style.opacity = '0';
        overlay.style.visibility = 'visible';
        if (!active) {
          active = true;
          for (const s of slices) s.style.willChange = 'transform';
          gsap.ticker.add(onTick);
        }
      },
      destroy: settle
    };
  }

  /**
   * EXACT AUGE XP PRELOADER ENGINE
   */
  function runAugeLoader(onComplete) {
    const loaderRoot = document.getElementById('seloom-preloader');
    const backdrop = document.querySelector('[data-loader-backdrop]');
    const mask = document.getElementById('auge-loader-mask');
    const wordmarkInner = document.getElementById('auge-loader-wordmark-inner');
    const subInner = document.getElementById('auge-loader-sub-inner');
    const subEl = document.getElementById('auge-loader-sub');
    const glitchOverlay = document.getElementById('auge-glitch-overlay');
    const counterInner = document.getElementById('auge-loader-counter-inner');
    const counterEl = document.getElementById('auge-loader-counter');

    if (!loaderRoot || typeof gsap === 'undefined') {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    // Lock page scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Glitch controller
    const glitch = createBandGlitch(subEl, glitchOverlay);

    // Initial positioning:
    // Mask at yPercent: 100 (below screen)
    gsap.set(mask, { yPercent: 100, visibility: 'visible' });
    // Text elements at yPercent: 140 (completely hidden below mask line)
    gsap.set([wordmarkInner, subInner, counterInner], { yPercent: 140, visibility: 'visible' });

    let riseComplete = false;
    let counterComplete = false;
    let exited = false;

    function checkExit() {
      if (!riseComplete || !counterComplete || exited) return;
      exited = true;

      if (glitch) glitch.destroy();

      // Hold at 100% for 120ms (exact Auge timing)
      setTimeout(function () {
        // AUGE XP EXIT TIMELINE:
        // 1. Text elements slide UP through their masks
        const textExitTl = gsap.timeline();
        textExitTl.to(wordmarkInner, { yPercent: -140, duration: 0.6, ease: 'expoInOut' }, 0);
        textExitTl.to(subInner, { yPercent: -140, duration: 0.6, ease: 'expoInOut' }, '>-0.45');
        textExitTl.to(counterInner, { yPercent: -140, duration: 0.6, ease: 'expoInOut' }, '>-0.45');

        // 2. Rising black curtain continues up out of viewport, unveiling the site!
        gsap.to(mask, {
          yPercent: -100,
          duration: 0.9,
          delay: 0.18,
          ease: 'expoInOut',
          onStart: function () {
            // Trigger hero reveal halfway through curtain rise
            setTimeout(function () {
              if (typeof onComplete === 'function') onComplete();
            }, 150);
          },
          onComplete: function () {
            loaderRoot.style.display = 'none';
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
          }
        });
      }, 120);
    }

    // ENTRANCE TIMELINE:
    const enterTl = gsap.timeline({
      delay: 0.15,
      onComplete: function () {
        // Trigger subtitle glitch
        if (glitch) {
          setTimeout(function () {
            glitch.shatter();
          }, 350);
        }

        // Rising curtain rises from bottom to cover full viewport:
        gsap.to(mask, {
          yPercent: 0,
          duration: 0.9,
          ease: 'expoInOut',
          onComplete: function () {
            // Crucial: hide backdrop when screen is 100% black so lifting mask reveals site!
            if (backdrop) backdrop.style.display = 'none';
            riseComplete = true;
            checkExit();
          }
        });
      }
    });

    // 1. Wordmark slides up into view
    enterTl.to(wordmarkInner, { yPercent: 0, duration: 1.0, ease: 'expoOut' }, 0);

    // 2. Subtitle slides up into view
    enterTl.to(subInner, { yPercent: 0, duration: 1.0, ease: 'expoOut' }, 0.25);
    enterTl.add(function () {
      runTextScramble(subEl, 'POSHĀK Fashion', 950, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
    }, 0.25);

    // 3. Counter slides up into view
    gsap.to(counterInner, { yPercent: 0, duration: 1.0, delay: 0.45, ease: 'expoOut' });

    // Counter value increments from 000 to 100
    const counterObj = { value: 0 };
    gsap.to(counterObj, {
      value: 88,
      duration: 1.35,
      delay: 0.45,
      ease: 'none',
      onUpdate: function () {
        if (counterEl) {
          counterEl.textContent = String(Math.round(counterObj.value)).padStart(3, '0');
        }
      },
      onComplete: function () {
        // Final ramp 88 -> 100
        gsap.to(counterObj, {
          value: 100,
          duration: 0.4,
          ease: 'none',
          onUpdate: function () {
            if (counterEl) {
              counterEl.textContent = String(Math.round(counterObj.value)).padStart(3, '0');
            }
          },
          onComplete: function () {
            counterComplete = true;
            checkExit();
          }
        });
      }
    });
  }

  /**
   * Hero text reveal with Auge masked transitions & cipher scramble
   */
  function revealHeroText() {
    const heroWrapper = document.getElementById('auge-xp-hero-section');
    if (!heroWrapper) return;

    heroWrapper.classList.add('is-revealed');

    // Scramble decrypt studio label "POSHĀK ORIGINALS®"
    const labelEl = document.getElementById('auge-studio-label');
    if (labelEl) {
      runTextScramble(labelEl, 'POSHĀK ORIGINALS®', 950);
    }
  }

  /**
   * Main Hero Initialization
   */
  function initSeloomHero() {
    const heroWrapper = document.getElementById('auge-xp-hero-section');
    const trailContainer = document.getElementById('seloom-trail-container');

    // Run exact Auge loader, then reveal hero
    runAugeLoader(function () {
      revealHeroText();
    });

    if (!heroWrapper || !trailContainer) return;

    let imgIndex = 0;
    let zIndexCounter = 1;
    let lastSpawnX = null;
    let lastSpawnY = null;
    const activeCards = [];
    const MAX_ACTIVE_CARDS = 16;
    const SPAWN_DISTANCE_THRESHOLD = 65;

    function spawnTrailCard(x, y) {
      const card = document.createElement('div');
      card.className = 'seloom-trail-card';
      card.style.left = x + 'px';
      card.style.top = y + 'px';

      const rot = (Math.random() * 14 - 7).toFixed(1) + 'deg';
      card.style.setProperty('--rot', rot);
      card.style.zIndex = String(zIndexCounter++);

      const img = document.createElement('img');
      img.src = CLOTHES[imgIndex];
      img.alt = 'POSHĀK Collection';
      img.draggable = false;
      card.appendChild(img);

      trailContainer.appendChild(card);
      activeCards.push(card);

      imgIndex = (imgIndex + 1) % CLOTHES.length;

      if (activeCards.length > MAX_ACTIVE_CARDS) {
        const oldest = activeCards.shift();
        if (oldest && oldest.parentNode) {
          oldest.remove();
        }
      }

      setTimeout(function () {
        const idx = activeCards.indexOf(card);
        if (idx !== -1) {
          activeCards.splice(idx, 1);
        }
        if (card.parentNode) {
          card.remove();
        }
      }, 920);
    }

    function handlePointerMove(clientX, clientY) {
      const rect = heroWrapper.getBoundingClientRect();

      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return;
      }

      if (lastSpawnX === null || lastSpawnY === null) {
        lastSpawnX = clientX;
        lastSpawnY = clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        spawnTrailCard(x, y);
        return;
      }

      const dist = Math.hypot(clientX - lastSpawnX, clientY - lastSpawnY);
      if (dist >= SPAWN_DISTANCE_THRESHOLD) {
        lastSpawnX = clientX;
        lastSpawnY = clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        spawnTrailCard(x, y);
      }
    }

    heroWrapper.addEventListener('mousemove', function (e) {
      handlePointerMove(e.clientX, e.clientY);
    }, { passive: true });

    heroWrapper.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    heroWrapper.addEventListener('mouseleave', function () {
      lastSpawnX = null;
      lastSpawnY = null;
    });

    // Sound toggle button
    const soundBtn = document.getElementById('auge-sound-btn');
    if (soundBtn) {
      let isMuted = true;
      soundBtn.addEventListener('click', function () {
        isMuted = !isMuted;
        soundBtn.setAttribute('aria-pressed', String(!isMuted));
        soundBtn.title = isMuted ? 'Unmute' : 'Mute';
      });
    }

    // Menu Card Toggle for mobile / click
    const menuCard = document.getElementById('auge-menu-card');
    const menuTrigger = menuCard ? menuCard.querySelector('.auge-menu-trigger') : null;
    if (menuCard && menuTrigger) {
      menuTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        menuCard.classList.toggle('is-open');
      });

      document.addEventListener('click', function (e) {
        if (!menuCard.contains(e.target)) {
          menuCard.classList.remove('is-open');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSeloomHero);
  } else {
    initSeloomHero();
  }
})();
