/**
 * SÈLOOM HERO SECTION - CURSOR IMAGE TRAIL
 * Authentic replication of nightkidz.shop/us cursor image trail
 */

(function () {
  'use strict';

  // Curated clothing photography from SÈLOOM collection
  const CLOTHES = [
    '/cdn/shop/files/WEBP_File_5699.webp',
    '/cdn/shop/files/WEBP_File_5689.webp',
    '/cdn/shop/files/WEBP_File_5759.webp',
    '/cdn/shop/files/WEBP_File_5739.webp',
    '/cdn/shop/files/WEBP_File_5749_f69d34a1-cd65-48ba-9c36-d8542d5b4d2d.webp',
    '/cdn/shop/files/WEBP_File_5719.webp',
    '/cdn/shop/files/WEBP_File_5709.webp',
    '/cdn/shop/files/WEBP_File_5332.webp',
    '/cdn/shop/files/WEBP_File_5681.webp',
    '/cdn/shop/files/WEBP_File_5701.webp',
    '/cdn/shop/files/WEBP_File_5721.webp',
    '/cdn/shop/files/WEBP_File_5740.webp',
    '/cdn/shop/files/WEBP_File_5755.webp',
    '/cdn/shop/files/WEBP_File_5813.webp',
    '/cdn/shop/files/WEBP_File_5843.webp',
    '/cdn/shop/files/WEBP_File_5906.webp'
  ];

  // Preload all images immediately for instant popup without flash
  CLOTHES.forEach(function (src) {
    const img = new Image();
    img.src = src;
  });

  function initSeloomHero() {
    const heroWrapper = document.getElementById('auge-xp-hero-section');
    const trailContainer = document.getElementById('seloom-trail-container');
    if (!heroWrapper || !trailContainer) return;

    let imgIndex = 0;
    let zIndexCounter = 1;
    let lastSpawnX = null;
    let lastSpawnY = null;
    const activeCards = [];
    const MAX_ACTIVE_CARDS = 16;
    const SPAWN_DISTANCE_THRESHOLD = 65; // pixels traveled between new image spawns

    function spawnTrailCard(x, y) {
      const card = document.createElement('div');
      card.className = 'seloom-trail-card';
      card.style.left = x + 'px';
      card.style.top = y + 'px';

      // Random subtle editorial tilt between -7deg and +7deg
      const rot = (Math.random() * 14 - 7).toFixed(1) + 'deg';
      card.style.setProperty('--rot', rot);
      card.style.zIndex = String(zIndexCounter++);

      const img = document.createElement('img');
      img.src = CLOTHES[imgIndex];
      img.alt = 'SÈLOOM Collection';
      img.draggable = false;
      card.appendChild(img);

      trailContainer.appendChild(card);
      activeCards.push(card);

      imgIndex = (imgIndex + 1) % CLOTHES.length;

      // Keep DOM lean for 60fps performance
      if (activeCards.length > MAX_ACTIVE_CARDS) {
        const oldest = activeCards.shift();
        if (oldest && oldest.parentNode) {
          oldest.remove();
        }
      }

      // Remove card once pop animation finishes
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

      // Ensure cursor is within hero section bounds
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

    // Mouse Move Listener
    heroWrapper.addEventListener('mousemove', function (e) {
      handlePointerMove(e.clientX, e.clientY);
    }, { passive: true });

    // Touch Move Listener for Mobile Devices
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
