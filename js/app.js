/* ─────────────────────────────────────────────
   El Frasco de Notas — app.js (Borrador v3)
   With Gatito Guardián, Option A Entrance, Sound Synth,
   Click Bursts & Preserved Packed Hearts + Sparkles Interior
   ───────────────────────────────────────────── */

// ═══════════════════════════════════════════════
// CONSTANTS & STATE
// ═══════════════════════════════════════════════

const JAR_CONFIGS = {
  frases: {
    title: "El Frasco de Notas · Para Salome",
    description: "Cada corazoncito guarda algo bonito sobre ti o una palabra suave que quería dejarte cerquita del corazón.",
    labelTitle: "EL FRASCO DE<br><strong>Salome</strong> <span class=\"jar-label-card__heart\">❤</span>",
    labelSub: "Abierto para ti siempre,<br>mi cielo bonito.",
    defaultCategory: "lo-bonito-de-ti",
    categories: [
      { id: "lo-bonito-de-ti", emoji: "✨", text: "Lo Bonito de Ti" },
      { id: "palabras-para-ti", emoji: "💗", text: "Palabras para Ti" }
    ],
    labels: {
      'lo-bonito-de-ti': '✨ Lo Bonito de Ti',
      'palabras-para-ti': '💗 Palabras para Ti'
    }
  },
  cupones: {
    title: "Tus Cupones de Amor · Salome",
    description: "¡Aquí tienes cupones especiales para canjear cuando quieras! Elige una categoría y saca un cupón. ✨",
    labelTitle: "CUPONES DE<br><strong>Salome</strong> <span class=\"jar-label-card__heart\">🎟️</span>",
    labelSub: "Canjéalos con amor,<br>cuando quieras mi vida.",
    defaultCategory: "Cupones-amor",
    categories: [
      { id: "Cupones-amor", emoji: "🎟️", text: "Vales de Amor" },
      { id: "momentos-especiales", emoji: "💖", text: "Momentos Especiales" }
    ],
    labels: {
      'Cupones-amor': '🎟️ Vales de Amor',
      'momentos-especiales': '💖 Momentos Especiales'
    }
  }
};

const state = {
  currentJar: 'frases',
  categoriaActiva: 'lo-bonito-de-ti',
  ultimaNotaId: null,
  isShaking: false,
  modalAbierto: false,
  notaActual: null,
  lastInteractionAt: 0,
  soundEnabled: false,
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2
};

// ═══════════════════════════════════════════════
// DOM REFS
// ═══════════════════════════════════════════════

const jarWrapper = document.getElementById('jarWrapper');
const jarLabel = document.getElementById('jarLabel');
const noteModal = document.getElementById('noteModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalCard = document.getElementById('modalCard');
const modalChip = document.getElementById('modalChip');
const modalText = document.getElementById('modalText');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const categoryBtns = document.querySelectorAll('.category-btn');
const categoryIndicator = document.getElementById('categoryIndicator');
const cursorTrailContainer = document.getElementById('cursorTrailContainer');
const burstContainer = document.getElementById('burstContainer');
const soundToggleBtn = document.getElementById('soundToggleBtn');

// Gatito SVG DOM Refs
const catTopper = document.getElementById('catTopper');
const catHead = document.getElementById('catHead');
const pupilLeft = document.getElementById('pupilLeft');
const pupilRight = document.getElementById('pupilRight');
const catCrown = document.getElementById('catCrown');
const catEnvelope = document.getElementById('catEnvelope');
const catHeartHeld = document.getElementById('catHeartHeld');

// ═══════════════════════════════════════════════
// WEB AUDIO SYNTHESIZER (Optional Soft Chimes)
// ═══════════════════════════════════════════════

let audioCtx = null;

function setCatAccessory(categoria) {
  if (!catCrown || !catTopper) return;
  const eyeHearts = document.querySelectorAll('.cat-eye-heart-group');
  const eyeOpens = document.querySelectorAll('.cat-eye-open');
  const eyePupils = document.querySelectorAll('.cat-eye-pupil');
  const eyeShines = document.querySelectorAll('.cat-eye-shine');

  if (categoria === 'lo-bonito-de-ti' || categoria === 'vales-amor') {
    catCrown.style.display = 'block';
    if (catHeartHeld) catHeartHeld.style.display = 'none';
    eyeHearts.forEach(el => el.style.display = 'none');
    eyeOpens.forEach(el => el.style.display = 'block');
    eyePupils.forEach(el => el.style.display = 'block');
    eyeShines.forEach(el => el.style.display = 'block');
  } else {
    // "Palabras para ti" or "momentos-especiales" mode: Crown off, held heart on, eyes turn into hearts!
    catCrown.style.display = 'none';
    if (catHeartHeld) catHeartHeld.style.display = 'block';
    eyeHearts.forEach(el => el.style.display = 'block');
    eyeOpens.forEach(el => el.style.display = 'none');
    eyePupils.forEach(el => el.style.display = 'none');
    eyeShines.forEach(el => el.style.display = 'none');
  }
}

function playSoftChime(type = 'note') {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';

    if (type === 'note') {
      // Soft crystal chime chord (E5 to B5)
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, audioCtx.currentTime + 0.15); // B5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    } else {
      // Soft purr/plop chime
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(554.37, audioCtx.currentTime + 0.1); // C#5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    }

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + (type === 'note' ? 0.6 : 0.35));
  } catch (err) {
    // Ignore audio errors if blocked
  }
}

// ═══════════════════════════════════════════════
// CORE NOTE LOGIC
// ═══════════════════════════════════════════════

function getNotasPorCategoria(categoria) {
  const pool = state.currentJar === 'cupones' ? CUPONES : NOTAS;
  return pool.filter(n => n.categoria === categoria);
}

const elegirNotaAleatoria = (categoria, excluirId) => {
  const pool = getNotasPorCategoria(categoria);
  if (pool.length === 0) return null;
  let candidatas = pool.filter(n => n.id !== excluirId);
  if (candidatas.length === 0) candidatas = pool;
  return candidatas[Math.floor(Math.random() * candidatas.length)];
};

function setJarDisabled(disabled) {
  jarWrapper.classList.toggle('jar-wrapper--disabled', disabled);
  if (disabled) {
    jarWrapper.setAttribute('aria-disabled', 'true');
  } else {
    jarWrapper.removeAttribute('aria-disabled');
  }
}

// ═══════════════════════════════════════════════
// WORD-BY-WORD REVEAL
// ═══════════════════════════════════════════════

function wrapWordsInSpans(text) {
  const words = text.split(/\s+/);
  return words.map((word, i) =>
    `<span class="word" style="--word-delay: ${i * 0.04}s">${word}</span>`
  ).join(' ');
}

function revealWords() {
  const words = modalText.querySelectorAll('.word');
  if (typeof gsap !== 'undefined' && words.length > 0) {
    gsap.fromTo(words,
      { opacity: 0, y: 8 },
      {
        opacity: 1, y: 0,
        duration: 0.35,
        stagger: 0.035,
        ease: 'power2.out',
        delay: 0.45
      }
    );
  } else {
    words.forEach(w => w.classList.add('word--visible'));
  }
}

// ═══════════════════════════════════════════════
// MODAL OPEN / CLOSE
// ═══════════════════════════════════════════════

function abrirNota(nota) {
  if (!nota) return;
  state.notaActual = nota;
  state.modalAbierto = true;

  modalChip.textContent = JAR_CONFIGS[state.currentJar].labels[nota.categoria] || nota.categoria;
  modalText.innerHTML = wrapWordsInSpans(nota.texto);

  noteModal.classList.remove('modal--closing');
  noteModal.classList.add('modal--visible');
  noteModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setJarDisabled(true);

  // Play audio chime
  playSoftChime('note');

  // Stagger internal elements
  requestAnimationFrame(() => {
    modalChip.classList.add('modal__chip--visible');
    modalCloseBtn.classList.add('modal__btn--visible');
    revealWords();
  });

  modalCloseBtn.focus();
}

const cerrarNota = () => {
  if (!state.modalAbierto) return;

  if (state.notaActual) {
    state.ultimaNotaId = state.notaActual.id;
    state.notaActual = null;
  }

  modalCloseBtn.classList.add('modal__btn--closing');

  setTimeout(() => {
    noteModal.classList.add('modal--closing');
    noteModal.classList.remove('modal--visible');
    modalChip.classList.remove('modal__chip--visible');
    modalCloseBtn.classList.remove('modal__btn--visible');
    modalCloseBtn.classList.remove('modal__btn--closing');

    const onEnd = () => {
      noteModal.classList.remove('modal--closing');
      noteModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      state.modalAbierto = false;
      setJarDisabled(false);
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(onEnd, reducedMotion ? 150 : 280);
  }, 180);
};

// ═══════════════════════════════════════════════
// TAP / CLICK HEART BURST
// ═══════════════════════════════════════════════

function triggerHeartBurst(x, y) {
  if (!burstContainer) return;
  const icons = ['💖', '💕', '✨', '🌸', '💖'];
  const count = 4;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'burst-heart';
    heart.textContent = icons[i % icons.length];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    const dx = (Math.random() * 60 - 30);
    const dr = (Math.random() * 40 - 20);

    heart.style.setProperty('--dx', `${dx}px`);
    heart.style.setProperty('--dr', `${dr}deg`);

    burstContainer.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  }
}

// ═══════════════════════════════════════════════
// GATITO GUARDIÁN: TRACKING & REACTIONS
// ═══════════════════════════════════════════════

function triggerCatHappyReaction() {
  if (!catTopper) return;
  catTopper.classList.add('cat-topper--happy');
  setTimeout(() => {
    catTopper.classList.remove('cat-topper--happy');
  }, 750);
}

function updateCatEyeTracking(eX, eY) {
  if (!pupilLeft || !pupilRight || !catHead) return;

  // Base eye center coordinates in page space
  const rect = catTopper ? catTopper.getBoundingClientRect() : null;
  if (!rect) return;

  const headCenterX = rect.left + rect.width / 2;
  const headCenterY = rect.top + rect.height * 0.45;

  const deltaX = eX - headCenterX;
  const deltaY = eY - headCenterY;
  const angle = Math.atan2(deltaY, deltaX);
  const distance = Math.min(3.8, Math.hypot(deltaX, deltaY) / 60);

  const moveX = Math.cos(angle) * distance;
  const moveY = Math.sin(angle) * distance;

  // Eye pupil offset
  pupilLeft.setAttribute('cx', String(58 + moveX));
  pupilLeft.setAttribute('cy', String(44 + moveY));
  pupilRight.setAttribute('cx', String(102 + moveX));
  pupilRight.setAttribute('cy', String(44 + moveY));

  // Subtle Head tilt (-3.5deg to +3.5deg)
  const headTilt = Math.max(-3.5, Math.min(3.5, deltaX / 120));
  catHead.style.transform = `rotate(${headTilt}deg)`;
}

function initCatBlink() {
  setInterval(() => {
    if (state.modalAbierto) return;
    const eyes = document.querySelectorAll('.cat-eye-container');
    eyes.forEach(eye => {
      eye.style.transform = 'scaleY(0.15)';
      eye.style.transformOrigin = 'center 44px';
    });
    setTimeout(() => {
      eyes.forEach(eye => {
        eye.style.transform = 'none';
      });
    }, 160);
  }, 3800);
}



// ═══════════════════════════════════════════════
// JAR INTERACTION (with Ripple & Cat Happy Reaction)
// ═══════════════════════════════════════════════

function createRipple() {
  jarWrapper.classList.remove('jar-wrapper--ripple');
  void jarWrapper.offsetWidth;
  jarWrapper.classList.add('jar-wrapper--ripple');
  setTimeout(() => jarWrapper.classList.remove('jar-wrapper--ripple'), 600);
}

function onJarInteraction(e) {
  if (state.isShaking || state.modalAbierto) return;

  const pool = getNotasPorCategoria(state.categoriaActiva);
  if (pool.length === 0) return;

  createRipple();
  triggerCatHappyReaction();
  playSoftChime('tap');

  if (e) triggerHeartBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);

  state.isShaking = true;
  setJarDisabled(true);
  jarWrapper.classList.add('jar-wrapper--shake');
  window.clearTimeout(onJarInteraction.timeoutId);
  onJarInteraction.timeoutId = window.setTimeout(() => {
    jarWrapper.classList.remove('jar-wrapper--shake');
    state.isShaking = false;

    const nota = elegirNotaAleatoria(state.categoriaActiva, state.ultimaNotaId);
    if (nota) {
      abrirNota(nota);
    } else {
      setJarDisabled(false);
    }
  }, 450);
}

function triggerJarInteraction(e) {
  const now = Date.now();
  if (now - state.lastInteractionAt < 350) return;
  state.lastInteractionAt = now;
  onJarInteraction(e);
}

// ═══════════════════════════════════════════════
// SLIDING PILL INDICATOR + CATEGORY CHANGE
// ═══════════════════════════════════════════════

function updateIndicatorPosition(btn) {
  if (!categoryIndicator) return;
  const grid = btn.closest('.category-nav__grid');
  if (!grid) return;

  const gridRect = grid.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  categoryIndicator.style.width = `${btnRect.width}px`;
  categoryIndicator.style.height = `${btnRect.height}px`;
  categoryIndicator.style.transform = `translate(${btnRect.left - gridRect.left}px, ${btnRect.top - gridRect.top}px)`;
  categoryIndicator.classList.add('category-nav__indicator--visible');
}

function setCategoriaActiva(categoria) {
  state.categoriaActiva = categoria;

  const currentBtns = document.querySelectorAll('.category-btn');
  currentBtns.forEach(btn => {
    const active = btn.dataset.categoria === categoria;
    btn.setAttribute('aria-pressed', String(active));
    if (active) updateIndicatorPosition(btn);
  });

  setCatAccessory(categoria);

  jarWrapper.classList.add('jar-wrapper--pulse');
  jarWrapper.classList.add('jar-wrapper--category-change');
  setTimeout(() => {
    jarWrapper.classList.remove('jar-wrapper--pulse');
    jarWrapper.classList.remove('jar-wrapper--category-change');
  }, 600);

  if (jarLabel) {
    const labelText = JAR_CONFIGS[state.currentJar].labels[categoria] || categoria;
    jarLabel.innerHTML = `<span class="jar-category-hint__dot"></span> ${labelText}`;
  }
}

// ═══════════════════════════════════════════════
// CONFETTI & SPARKLES
// ═══════════════════════════════════════════════

function initConfetti() {
  const field = document.getElementById('confettiField');
  if (!field) return;

  const colors = ['#f9a8d4', '#93c5fd', '#fde047', '#c4b5fd', '#fda4af', '#fbbf24', '#a78bfa'];
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 18 : 28;

  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement('span');
    wrapper.className = 'confetti-wrapper';

    const piece = document.createElement('span');
    piece.className = 'confetti-piece';

    const shapeType = i % 5;
    const nearJar = i < Math.floor(count * 0.35);

    wrapper.style.left = `${nearJar ? 25 + Math.random() * 50 : Math.random() * 100}%`;
    if (nearJar) piece.style.opacity = '0.85';

    if (shapeType === 0) {
      piece.style.width = '4px'; piece.style.height = '6px';
    } else if (shapeType === 1) {
      piece.style.width = '3px'; piece.style.height = '3px';
      piece.style.borderRadius = '50%';
    } else if (shapeType === 2) {
      piece.style.width = '5px'; piece.style.height = '4px';
      piece.style.borderRadius = '1px';
    } else if (shapeType === 3) {
      piece.textContent = '♥';
      piece.style.width = 'auto'; piece.style.height = 'auto';
      piece.style.fontSize = `${5 + Math.random() * 3}px`;
      piece.style.background = 'none';
      piece.style.color = colors[i % colors.length];
    } else {
      piece.textContent = '✦';
      piece.style.width = 'auto'; piece.style.height = 'auto';
      piece.style.fontSize = `${4 + Math.random() * 3}px`;
      piece.style.background = 'none';
      piece.style.color = colors[i % colors.length];
    }

    if (shapeType < 3) {
      piece.style.background = colors[i % colors.length];
    }

    const duration = 14 + Math.random() * 16;
    const swayDuration = 3 + Math.random() * 4;

    wrapper.style.animationDuration = `${duration}s`;
    wrapper.style.animationDelay = `${Math.random() * 14}s`;

    piece.style.animationDuration = `${swayDuration}s`;
    piece.style.animationDelay = `${Math.random() * 3}s`;

    wrapper.appendChild(piece);
    field.appendChild(wrapper);
  }
}

function initSparkles() {
  const field = document.getElementById('sparkleField');
  if (!field) return;

  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 3 : 6;
  const colors = ['#ffd700', '#ea7ca3', '#af95ff', '#ffc0cb', '#e8b4f8'];

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = `sparkle sparkle--${i}`;

    const angle = (i / count) * 360;
    const radiusX = 52 + Math.random() * 8;
    const radiusY = 48 + Math.random() * 8;
    const x = 50 + radiusX * Math.cos(angle * Math.PI / 180);
    const y = 45 + radiusY * Math.sin(angle * Math.PI / 180);

    sparkle.style.left = `${x}%`;
    sparkle.style.top = `${y}%`;
    sparkle.style.setProperty('--sparkle-color', colors[i % colors.length]);
    sparkle.style.animationDelay = `${i * 0.8}s`;
    sparkle.style.animationDuration = `${6 + Math.random() * 4}s`;

    field.appendChild(sparkle);
  }
}

// ═══════════════════════════════════════════════
// JAR INTERIOR: PACKED 💖 HEARTS + ✨ GOLDEN SPARKLES
// (Preserved exact look from user screenshot)
// ═══════════════════════════════════════════════

function initCorazones() {
  const container = document.getElementById('jarContents');
  if (!container) return;

  container.innerHTML = '';

  // Rich packing: 11 rows by 8 columns = 88 items
  const filas = 11;
  const columnas = 8;

  for (let r = 0; r < filas; r++) {
    for (let c = 0; c < columnas; c++) {
      const isSparkle = (r + c) % 4 === 0 && Math.random() > 0.3;

      if (isSparkle) {
        // Interspersed Golden 4-point Sparkle Star ✨ as in screenshot
        const star = document.createElement('span');
        star.className = 'jar-sparkle-star';
        star.textContent = '✨';

        let topBase = 4 + (r / (filas - 1)) * 84;
        let leftBase = 6 + (c / (columnas - 1)) * 80;

        star.style.left = `${leftBase + (Math.random() * 4 - 2)}%`;
        star.style.top = `${topBase + (Math.random() * 4 - 2)}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;

        container.appendChild(star);
      }

      // Packed Pink Heart 💖 or Ticket 🎟️ depending on current jar
      const heart = document.createElement('span');
      heart.className = state.currentJar === 'cupones' ? 'jar-heart jar-ticket' : 'jar-heart';
      heart.textContent = state.currentJar === 'cupones' ? ((r + c) % 2 === 0 ? '🎟️' : '💖') : '💖';

      let topBase = 2 + (r / (filas - 1)) * 86;
      let leftBase = 4 + (c / (columnas - 1)) * 82;

      const top = topBase + (Math.random() * 4 - 2);
      const left = leftBase + (Math.random() * 4 - 2);

      const rotate = (Math.random() * 60) - 30;
      const delay = Math.random() * 4;
      const zIndex = Math.floor(Math.random() * 20);

      heart.style.left = `${left}%`;
      heart.style.top = `${top}%`;
      heart.style.setProperty('--r', `${rotate}deg`);
      heart.style.animationDelay = `${delay}s`;
      heart.style.zIndex = zIndex;

      container.appendChild(heart);
    }
  }
}

// ═══════════════════════════════════════════════
// OPTION A ENTRANCE ANIMATION (Elastic Bounce)
// ═══════════════════════════════════════════════

function initEntranceAnimation() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.unrevealed');

  if (reducedMotion) {
    elements.forEach(el => {
      el.classList.remove('unrevealed');
      el.classList.add('revealed');
    });
    return;
  }

  if (typeof gsap !== 'undefined') {
    elements.forEach(el => {
      const delay = parseInt(el.dataset.revealDelay || '0') / 1000;
      const isJar = el.classList.contains('jar-wrapper');
      const isNav = el.classList.contains('category-nav');

      // Option A: Jar enters with an elastic bottom slide + bounce!
      const fromVars = {
        opacity: 0,
        y: isJar ? 75 : (isNav ? 40 : 22),
        scale: isJar ? 0.88 : 1
      };

      const toVars = {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: isJar ? 0.95 : 0.65,
        delay: delay,
        ease: isJar ? 'back.out(1.4)' : 'power3.out',
        onComplete: () => {
          el.classList.remove('unrevealed');
          el.classList.add('revealed');
          el.style.removeProperty('opacity');
          el.style.removeProperty('transform');
        }
      };

      gsap.fromTo(el, fromVars, toVars);
    });

    // Animate separator SVG
    const sepLines = document.querySelectorAll('.hero-separator__line');
    sepLines.forEach((line, i) => {
      const length = line.getTotalLength ? line.getTotalLength() : 100;
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 0.8,
        delay: 0.6 + (i * 0.15),
        ease: 'power2.inOut'
      });
    });
  } else {
    elements.forEach(el => {
      requestAnimationFrame(() => {
        el.classList.remove('unrevealed');
        el.classList.add('revealed');
      });
    });
  }
}

// ═══════════════════════════════════════════════
// CURSOR TRAIL & MOUSE LISTENERS
// ═══════════════════════════════════════════════

function initMouseEvents() {
  let lastTrailTime = 0;
  const trailThrottle = 80;

  window.addEventListener('pointermove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;

    // Gatito eye & head tracking
    updateCatEyeTracking(e.clientX, e.clientY);

    // Desktop cursor trail near jar
    if (window.matchMedia('(pointer: fine)').matches && cursorTrailContainer) {
      const now = Date.now();
      if (now - lastTrailTime >= trailThrottle) {
        lastTrailTime = now;
        const jarRect = jarWrapper.getBoundingClientRect();
        const jarCenterX = jarRect.left + jarRect.width / 2;
        const jarCenterY = jarRect.top + jarRect.height / 2;
        const dist = Math.hypot(e.clientX - jarCenterX, e.clientY - jarCenterY);

        if (dist <= 250) {
          const trail = document.createElement('span');
          trail.className = 'cursor-trail';
          trail.style.left = `${e.clientX}px`;
          trail.style.top = `${e.clientY}px`;
          cursorTrailContainer.appendChild(trail);
          trail.addEventListener('animationend', () => trail.remove());
        }
      }
    }
  });

  // Tap/Click Burst Hearts across the screen
  window.addEventListener('click', (e) => {
    // Avoid triggering burst on modal close button or category buttons directly
    if (e.target.closest('.category-btn') || e.target.closest('.modal__btn')) return;
    triggerHeartBurst(e.clientX, e.clientY);
  });
}

// ═══════════════════════════════════════════════
// JAR SWITCHER & DYNAMIC CATEGORIES
// ═══════════════════════════════════════════════

function renderCategoryButtons() {
  const grid = document.querySelector('.category-nav__grid');
  if (!grid) return;

  const config = JAR_CONFIGS[state.currentJar];

  // Remove existing buttons but keep the indicator
  const existingBtns = grid.querySelectorAll('.category-btn');
  existingBtns.forEach(btn => btn.remove());

  // Append new buttons
  config.categories.forEach(cat => {
    const isPressed = cat.id === state.categoriaActiva;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-btn';
    btn.setAttribute('data-categoria', cat.id);
    btn.setAttribute('aria-pressed', String(isPressed));
    btn.innerHTML = `
      <span class="category-btn__emoji" aria-hidden="true">${cat.emoji}</span>
      <span class="category-btn__text">${cat.text}</span>
    `;
    btn.addEventListener('click', () => {
      setCategoriaActiva(cat.id);
    });
    grid.appendChild(btn);
  });

  // Update indicator position for the active button
  const activeBtn = grid.querySelector(`.category-btn[data-categoria="${state.categoriaActiva}"]`);
  if (activeBtn) {
    requestAnimationFrame(() => {
      updateIndicatorPosition(activeBtn);
    });
  }
}

function switchJar(jarType) {
  if (state.currentJar === jarType || state.isShaking || state.modalAbierto) return;

  state.currentJar = jarType;

  // Update switcher buttons active class
  const switcherBtns = document.querySelectorAll('.switcher-btn');
  switcherBtns.forEach(btn => {
    const active = btn.dataset.jar === jarType;
    btn.classList.toggle('active', active);
  });

  // Get active config
  const config = JAR_CONFIGS[jarType];

  // Update hero text
  const heroCopy = document.querySelector('.hero__copy');
  if (heroCopy) heroCopy.textContent = config.description;

  // Update jar labels
  const labelTitle = document.querySelector('.jar-label-card__title');
  if (labelTitle) labelTitle.innerHTML = config.labelTitle;

  const labelSub = document.querySelector('.jar-label-card__sub');
  if (labelSub) labelSub.innerHTML = config.labelSub;

  // Change category to default for this jar
  state.categoriaActiva = config.defaultCategory;
  renderCategoryButtons();

  // Reset category label in UI
  if (jarLabel) {
    const labelText = config.labels[state.categoriaActiva] || state.categoriaActiva;
    jarLabel.innerHTML = `<span class="jar-category-hint__dot"></span> ${labelText}`;
  }

  // Reload jar contents (hearts vs tickets)
  initCorazones();

  // Pulse effects
  jarWrapper.classList.add('jar-wrapper--pulse');
  jarWrapper.classList.add('jar-wrapper--category-change');
  setTimeout(() => {
    jarWrapper.classList.remove('jar-wrapper--pulse');
    jarWrapper.classList.remove('jar-wrapper--category-change');
  }, 600);

  // Sound chime
  playSoftChime('tap');

  // Update cat accessory
  setCatAccessory(state.categoriaActiva);
}

// ═══════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════

function init() {
  initConfetti();
  renderCategoryButtons();
  initCorazones();
  initSparkles();
  initCatBlink();
  initMouseEvents();
  setCategoriaActiva(state.categoriaActiva);

  // Switcher event listeners
  const switcherBtns = document.querySelectorAll('.switcher-btn');
  switcherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchJar(btn.dataset.jar);
    });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initEntranceAnimation();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ═══════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════

jarWrapper.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  triggerJarInteraction(e);
});

jarWrapper.addEventListener('pointerup', (e) => {
  if (e.pointerType === 'mouse') return;
  e.preventDefault();
  e.stopPropagation();
  triggerJarInteraction(e);
});

jarWrapper.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    triggerJarInteraction(e);
  }
});

soundToggleBtn.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  soundToggleBtn.setAttribute('aria-pressed', String(state.soundEnabled));
  soundToggleBtn.setAttribute('aria-label', state.soundEnabled ? 'Sonido (activado)' : 'Sonido (desactivado)');
  if (state.soundEnabled) playSoftChime('tap');
});

modalCloseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  cerrarNota();
});

modalCard.addEventListener('click', (e) => {
  e.stopPropagation();
});

modalBackdrop.addEventListener('click', (e) => {
  e.stopPropagation();
  cerrarNota();
});

noteModal.addEventListener('click', (e) => {
  if (e.target === noteModal) cerrarNota();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.modalAbierto) {
    cerrarNota();
  }
});

window.addEventListener('resize', () => {
  const activeBtn = document.querySelector('.category-btn[aria-pressed="true"]');
  if (activeBtn) updateIndicatorPosition(activeBtn);
});
