// ==========================================================================
// PORTFOLIO LOGIC, 3D ENGINES & GAMIFICATION — GOKULKRISHNAN G
// ==========================================================================

// Global State & Performance Guards
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowEndDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
let audioEnabled = false;
let audioCtx = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAudioToggle();
  initScrollProgressBar();
  initCustomCursor();
  initHeroStatCounters();
  initProjectFilters();
  initProjectCard3DTilt();
  initCertificateModal();
  initSkillsInteractiveGraph();
  initCliTerminal();
  initKonamiCode();
  initAchievements();
  initScrollSpy();
  initMobileMenu();
  initKeyboardNav();
  initScrollReveal();
  initBackToTop();
  initScrollParallax();

  // Lazy-load 3D hero experiences if motion is permitted
  if (!prefersReducedMotion && !isLowEndDevice) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        initHeroGridCanvas();
      });
    } else {
      setTimeout(() => {
        initHeroGridCanvas();
      }, 200);
    }
  }
});

// ==========================================================================
// 1. THEME TOGGLE (WHITE/LIGHT MODE PRIMARY, DARK SECONDARY WITH 5-10s CLICKBAIT)
// ==========================================================================
let clickbaitInterval = null;
let clickbaitElem = null;

function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('gokul_portfolio_theme');
  
  // White mode is PRIMARY default, dark is secondary
  const activeTheme = storedTheme || 'light';
  document.documentElement.setAttribute('data-theme', activeTheme);
  updateThemeIcon(activeTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('gokul_portfolio_theme', newTheme);
      updateThemeIcon(newTheme);
      playBlip(700, 'sine', 0.05);
      dismissThemeClickbait();
    });
  }

  // Initial 5 to 10s Clickbait Toast (ONLY in light mode, self-destructs after 8s)
  if (activeTheme === 'light') {
    initDynamicClickbait();
  }
}

function initDynamicClickbait() {
  // Never display intrusive clickbait toast on mobile screens
  if (window.innerWidth <= 768) return;

  // If already dismissed in this session, don't show
  if (sessionStorage.getItem('theme_clickbait_dismissed')) return;

  // Wait 1.2s after page loads before showing floating clickbait
  setTimeout(() => {
    // Check mobile again in case of resize
    if (window.innerWidth <= 768) return;
    // Only show if user is still in light mode
    if (document.documentElement.getAttribute('data-theme') !== 'light') return;
    if (document.getElementById('themeClickbaitToast')) return;

    clickbaitElem = document.createElement('div');
    clickbaitElem.className = 'theme-clickbait-toast';
    clickbaitElem.id = 'themeClickbaitToast';
    clickbaitElem.setAttribute('role', 'alert');
    clickbaitElem.innerHTML = `
      <div class="clickbait-header">
        <div class="clickbait-title">
          <i class="fa-solid fa-fire clickbait-flame"></i>
          <span>Secret Recruiter View</span>
        </div>
        <button class="clickbait-close" id="clickbaitCloseBtn" aria-label="Close">&times;</button>
      </div>
      <div class="clickbait-msg">
        89% of tech recruiters view this portfolio in <strong>Cyber Dark Mode</strong>.
      </div>
      <button class="clickbait-cta-btn" id="clickbaitCtaBtn">
        <i class="fa-solid fa-moon"></i> Switch to Dark Mode &bull; <span id="clickbaitTimerCount">8</span>s
      </button>
      <div class="clickbait-progress-track">
        <div class="clickbait-progress-fill"></div>
      </div>
    `;

    document.body.appendChild(clickbaitElem);

    // Smooth entrance
    requestAnimationFrame(() => {
      if (clickbaitElem) clickbaitElem.classList.add('show');
    });

    // 8-second countdown timer (strictly 5 to 10s)
    let remainingSeconds = 8;
    const timerSpan = document.getElementById('clickbaitTimerCount');

    clickbaitInterval = setInterval(() => {
      remainingSeconds--;
      if (timerSpan) timerSpan.textContent = remainingSeconds;

      if (remainingSeconds <= 0) {
        dismissThemeClickbait();
      }
    }, 1000);

    // Close button dismisses immediately
    const closeBtn = document.getElementById('clickbaitCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissThemeClickbait();
      });
    }

    // CTA button activates dark mode
    const ctaBtn = document.getElementById('clickbaitCtaBtn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activateDarkModeFromClickbait();
      });
    }

    // Clicking anywhere on the toast also activates dark mode
    clickbaitElem.addEventListener('click', (e) => {
      if (e.target.closest('#clickbaitCloseBtn')) return;
      activateDarkModeFromClickbait();
    });
  }, 1200);
}

function activateDarkModeFromClickbait() {
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('gokul_portfolio_theme', 'dark');
  updateThemeIcon('dark');
  playBlip(750, 'sine', 0.08);
  showAchievement('Achievement Unlocked: Cyber Dark Protocol Activated! 🕶️');
  dismissThemeClickbait();
}

function dismissThemeClickbait() {
  sessionStorage.setItem('theme_clickbait_dismissed', 'true');
  if (clickbaitInterval) {
    clearInterval(clickbaitInterval);
    clickbaitInterval = null;
  }
  if (clickbaitElem) {
    clickbaitElem.classList.remove('show');
    setTimeout(() => {
      if (clickbaitElem && clickbaitElem.parentElement) {
        clickbaitElem.remove();
      }
      clickbaitElem = null;
    }, 350);
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  btn.innerHTML = theme === 'light' 
    ? '<i class="fa-solid fa-moon" style="color:#2563eb;" title="Switch to Cyber Dark Mode"></i>' 
    : '<i class="fa-solid fa-sun" style="color:#f59e0b;" title="Switch to Clean Light Mode"></i>';
}

// ==========================================================================
// 2. AUDIO FEEDBACK (WEB AUDIO API — ZERO EXTERNAL FILES, MUTED BY DEFAULT)
// ==========================================================================
function initAudioToggle() {
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  if (!audioToggleBtn) return;

  audioToggleBtn.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high" style="color:var(--accent-cyan);"></i>';
      audioToggleBtn.setAttribute('title', 'Sound Effects (ON)');
      playBlip(880, 'sine', 0.06);
      showToast('Sound Effects Enabled!');
    } else {
      audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      audioToggleBtn.setAttribute('title', 'Sound Effects (OFF)');
      showToast('Sound Effects Muted.');
    }
  });
}

function playBlip(freq = 800, type = 'sine', duration = 0.04) {
  if (!audioEnabled || prefersReducedMotion) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

// ==========================================================================
// 3. SCROLL PROGRESS / XP BAR & LEVEL REPUTATION
// ==========================================================================
function initScrollProgressBar() {
  const progressBar = document.getElementById('xp-progress-bar');
  const xpLevelNum = document.getElementById('xpLevelNum');
  const xpRoleText = document.getElementById('xpRoleText');
  const xpText = document.getElementById('xpText');
  const backToTopProgress = document.getElementById('backToTopProgress');
  if (!progressBar) return;

  const ranks = [
    { threshold: 0.15, level: 'LVL 1', title: 'AUDITOR' },
    { threshold: 0.35, level: 'LVL 2', title: 'AI REVIEW' },
    { threshold: 0.60, level: 'LVL 3', title: 'ARCHITECT' },
    { threshold: 0.85, level: 'LVL 4', title: 'HIRING MGR' },
    { threshold: 1.00, level: 'LVL 5', title: 'OFFER READY' }
  ];

  const totalCircumference = 125.66;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / (docHeight || 1), 0), 1);

    progressBar.style.width = `${(progress * 100).toFixed(1)}%`;

    if (backToTopProgress) {
      const offset = totalCircumference - (progress * totalCircumference);
      backToTopProgress.style.strokeDashoffset = offset.toFixed(2);
    }

    for (let i = 0; i < ranks.length; i++) {
      if (progress <= ranks[i].threshold || i === ranks.length - 1) {
        if (xpLevelNum && xpLevelNum.textContent !== ranks[i].level) {
          xpLevelNum.textContent = ranks[i].level;
        }
        if (xpRoleText && xpRoleText.textContent !== ranks[i].title) {
          xpRoleText.textContent = ranks[i].title;
        }
        if (xpText && xpText.textContent !== `${ranks[i].level}: ${ranks[i].title}`) {
          xpText.textContent = `${ranks[i].level}: ${ranks[i].title}`;
        }
        break;
      }
    }
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ==========================================================================
// 4. CUSTOM DESKTOP CURSOR
// ==========================================================================
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Interactive element hover states
  const interactives = document.querySelectorAll('a, button, .project-card, .skill-tag, .cert-card, .filter-btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
}

// ==========================================================================
// 5. HERO ANIMATION: LIVE STATS COUNT-UP
// ==========================================================================
function initHeroStatCounters() {
  const metricCards = document.querySelectorAll('.metric-number[data-target]');
  if (!metricCards.length) return;

  // Initialize with 0 starting text for visible count-up effect
  metricCards.forEach(el => {
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    el.textContent = `${prefix}0${suffix}`;
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        animateValue(el, 0, target, 1600, prefix, suffix);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

  metricCards.forEach(card => observer.observe(card));
}

function animateValue(obj, start, end, duration, prefix, suffix) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Ease out cubic
    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOutProgress * (end - start) + start);
    
    // Format numbers with commas (e.g. 30,000)
    const formatted = current >= 1000 ? current.toLocaleString() : current;
    obj.textContent = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      const finalFormatted = end >= 1000 ? end.toLocaleString() : end;
      obj.textContent = `${prefix}${finalFormatted}${suffix}`;
    }
  };
  window.requestAnimationFrame(step);
}

// ==========================================================================
// 6. HERO SECTION (CLEAN AMBIENT LIGHTING & PORTRAIT FRAMING)
// ==========================================================================


// ==========================================================================
// 6B. HERO CYBER GRID BACKGROUND CANVAS
// ==========================================================================
function initHeroGridCanvas() {
  const canvas = document.getElementById('heroGridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = canvas.offsetHeight || 600);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.offsetHeight || 600;
  });

  let cursorX = width / 2;
  let cursorY = height / 2;

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    cursorX = e.clientX - rect.left;
    cursorY = e.clientY - rect.top;
  }, { passive: true });

  const gridSize = 45;
  let pulseOffset = 0;

  function drawGrid() {
    pulseOffset += 0.015;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Mouse reactive focal glow
    const grad = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 220);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(drawGrid);
  }
  requestAnimationFrame(drawGrid);
}

// ==========================================================================
// 7. ANIMATION 3: 3D PERSPECTIVE TILT ON PROJECT CARDS
// ==========================================================================
function initProjectCard3DTilt() {
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max tilt 7 degrees
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// ==========================================================================
// 8. PROJECT FILTERING LOGIC
// ==========================================================================
// 8. PROJECT FILTERING & REORDERING LOGIC
// ==========================================================================
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  window.originalProjectCards = Array.from(projectCards);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // If clicking a standard category button, clear any locked skill filter
      if (btn.id !== 'activeSkillTab') {
        activeLockedSkill = null;
        const skillTab = document.getElementById('activeSkillTab');
        if (skillTab) skillTab.remove();
        const banner = document.getElementById('activeFilterBanner');
        if (banner) banner.style.display = 'none';
        updateSkillsHintLocked(null, 0);
        clearMatrixPillHighlights();
      }

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playBlip(650, 'sine', 0.03);

      // Smooth horizontal scroll to center active filter button on mobile
      if (typeof btn.scrollIntoView === 'function') {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }

      const filter = btn.getAttribute('data-filter');

      // Re-append cards in original order
      const projectsGrid = document.querySelector('.projects-grid');
      if (projectsGrid && window.originalProjectCards) {
        window.originalProjectCards.forEach(c => projectsGrid.appendChild(c));
      }

      projectCards.forEach(card => {
        card.classList.remove('skill-matched');
        const categories = card.getAttribute('data-category') || '';
        
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 180);
        }
      });
    });
  });
}

// ==========================================================================
// 9. ANIMATION 2: INTERACTIVE SKILLS ORBIT GRAPH & PERSISTENT SKILL FILTER
// ==========================================================================
let skillsGraphActive = true;
let activeLockedSkill = null;

function initSkillsInteractiveGraph() {
  const canvas = document.getElementById('skillsGraphCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const container = canvas.parentElement;
  let width = 800;
  let height = 440;
  let dpr = 1;

  function updateCanvasDimensions() {
    if (!container) return;
    const isMobile = window.innerWidth < 640 || (container.offsetWidth && container.offsetWidth < 600);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = container.offsetWidth || 800;
    height = isMobile ? 380 : 440;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  updateCanvasDimensions();

  window.addEventListener('resize', () => {
    updateCanvasDimensions();
  });

  // Hubs and Orbiting Skills
  const hubs = [
    { id: 'agent', label: 'Agentic AI', x: -180, y: -60, color: '#38bdf8', icon: 'fa-robot' },
    { id: 'backend', label: 'Go & FastAPI', x: 180, y: -60, color: '#818cf8', icon: 'fa-server' },
    { id: 'cloud', label: 'Cloud & Vector DB', x: 180, y: 80, color: '#34d399', icon: 'fa-database' },
    { id: 'vision', label: 'Vision & ML', x: -180, y: 80, color: '#fbbf24', icon: 'fa-eye' }
  ];

  const skillNodes = [
    { hub: 'agent', label: 'LangGraph', radius: 70, angle: 0.2, speed: 0.008, color: '#38bdf8' },
    { hub: 'agent', label: 'FastMCP', radius: 85, angle: 1.8, speed: -0.007, color: '#38bdf8' },
    { hub: 'agent', label: 'LangChain', radius: 65, angle: 3.4, speed: 0.009, color: '#38bdf8' },
    { hub: 'agent', label: 'HITL', radius: 95, angle: 4.9, speed: -0.006, color: '#38bdf8' },

    { hub: 'backend', label: 'Go 1.22+', radius: 70, angle: 0.5, speed: 0.008, color: '#818cf8' },
    { hub: 'backend', label: 'FastAPI', radius: 85, angle: 2.1, speed: -0.007, color: '#818cf8' },
    { hub: 'backend', label: 'Clean Arch', radius: 65, angle: 3.8, speed: 0.009, color: '#818cf8' },
    { hub: 'backend', label: 'GORM', radius: 90, angle: 5.2, speed: -0.006, color: '#818cf8' },

    { hub: 'cloud', label: 'PostgreSQL', radius: 70, angle: 0.8, speed: 0.008, color: '#34d399' },
    { hub: 'cloud', label: 'pgvector', radius: 85, angle: 2.4, speed: -0.007, color: '#34d399' },
    { hub: 'cloud', label: 'AWS ECS', radius: 65, angle: 4.1, speed: 0.009, color: '#34d399' },
    { hub: 'cloud', label: 'Docker', radius: 90, angle: 5.6, speed: -0.006, color: '#34d399' },

    { hub: 'vision', label: 'Bedrock Vision', radius: 70, angle: 0.3, speed: 0.008, color: '#fbbf24' },
    { hub: 'vision', label: 'OpenCV OCR', radius: 85, angle: 1.9, speed: -0.007, color: '#fbbf24' },
    { hub: 'vision', label: 'TensorFlow', radius: 65, angle: 3.6, speed: 0.009, color: '#fbbf24' },
    { hub: 'vision', label: 'SBERT', radius: 90, angle: 5.1, speed: -0.006, color: '#fbbf24' }
  ];

  let mouseX = -1000;
  let mouseY = -1000;
  let hoveredNode = null;
  let isDraggingCanvas = false;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let touchStartTime = 0;

  const updatePointer = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = clientX - rect.left;
    mouseY = clientY - rect.top;
  };

  canvas.addEventListener('mousemove', (e) => {
    updatePointer(e.clientX, e.clientY);
  });

  canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
    hoveredNode = null;
    if (activeLockedSkill) {
      highlightProjectsForSkill(activeLockedSkill);
      highlightMatrixPillsForSkill(activeLockedSkill);
    } else {
      clearProjectHighlights();
      clearMatrixPillHighlights();
    }
  });

  // Tap or click selection with generous touch radius
  const handleNodeSelect = (clientX, clientY) => {
    updatePointer(clientX, clientY);
    const isMobile = width < 640;
    const cx = width / 2;
    const cy = height / 2;
    const hubSpreadX = isMobile ? Math.min(width * 0.28, 88) : 180;
    const hubSpreadY = isMobile ? 65 : 75;

    let closest = null;
    let minDist = isMobile ? 38 : 26;

    skillNodes.forEach(node => {
      const hub = hubs.find(h => h.id === node.hub);
      if (!hub) return;
      const hpx = cx + (hub.x > 0 ? hubSpreadX : -hubSpreadX);
      const hpy = cy + (hub.y > 0 ? hubSpreadY : -hubSpreadY);
      const baseRadius = isMobile ? Math.min(node.radius * 0.52, width * 0.14) : node.radius;
      const nx = hpx + Math.cos(node.angle) * baseRadius;
      const ny = hpy + Math.sin(node.angle) * baseRadius;
      const dist = Math.hypot(mouseX - nx, mouseY - ny);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    });

    if (closest) {
      selectSkillFilter(closest.label);
    } else if (hoveredNode) {
      selectSkillFilter(hoveredNode.label);
    }
  };

  canvas.addEventListener('click', (e) => {
    handleNodeSelect(e.clientX, e.clientY);
  });

  // Mobile Touch Gestures (Drag orbit & Tap select)
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDraggingCanvas = true;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      touchStartTime = Date.now();
      updatePointer(lastTouchX, lastTouchY);
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (isDraggingCanvas && e.touches.length === 1) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - lastTouchX;
      
      // Rotate nodes based on touch swipe
      skillNodes.forEach(n => {
        n.angle += deltaX * 0.008;
      });

      lastTouchX = touchX;
      lastTouchY = touchY;
      updatePointer(touchX, touchY);
    }
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (isDraggingCanvas) {
      isDraggingCanvas = false;
      const touchDuration = Date.now() - touchStartTime;
      // If it was a quick tap (< 250ms), select the tapped node
      if (touchDuration < 250 && e.changedTouches.length === 1) {
        handleNodeSelect(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }
  });

  // Also enable clicking any matrix pill in the Technical Skills matrix below
  initMatrixPillListeners();

  function renderSkillsGraph() {
    if (!skillsGraphActive) {
      requestAnimationFrame(renderSkillsGraph);
      return;
    }

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.clearRect(0, 0, width, height);
    const isMobile = width < 640;
    const cx = width / 2;
    const cy = height / 2;

    // Hub positions scaled for screen width
    const hubSpreadX = isMobile ? Math.min(width * 0.28, 88) : 180;
    const hubSpreadY = isMobile ? 65 : 75;

    const resolvedHubs = hubs.map(h => ({
      ...h,
      px: cx + (h.x > 0 ? hubSpreadX : -hubSpreadX),
      py: cy + (h.y > 0 ? hubSpreadY : -hubSpreadY)
    }));

    // Draw central inter-hub connectors
    for (let i = 0; i < resolvedHubs.length; i++) {
      for (let j = i + 1; j < resolvedHubs.length; j++) {
        ctx.beginPath();
        ctx.moveTo(resolvedHubs[i].px, resolvedHubs[i].py);
        ctx.lineTo(resolvedHubs[j].px, resolvedHubs[j].py);
        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw Orbit Rings & Orbiting Skills
    hoveredNode = null;
    skillNodes.forEach(node => {
      node.angle += node.speed;
      const hub = resolvedHubs.find(h => h.id === node.hub);
      if (!hub) return;

      const baseRadius = isMobile ? Math.min(node.radius * 0.52, width * 0.14) : node.radius;
      let nx = hub.px + Math.cos(node.angle) * baseRadius;
      let ny = hub.py + Math.sin(node.angle) * baseRadius;

      // Keep node circle safely within canvas boundaries
      const safeMargin = isMobile ? 18 : 22;
      nx = Math.max(safeMargin, Math.min(width - safeMargin, nx));
      ny = Math.max(safeMargin, Math.min(height - safeMargin, ny));

      // Check direct mouse hover
      const d = Math.hypot(mouseX - nx, mouseY - ny);
      const isDirectHover = d < (isMobile ? 26 : 22);
      if (isDirectHover) hoveredNode = node;

      // Check if locked by user click
      const isLocked = activeLockedSkill && (
        node.label.toLowerCase() === activeLockedSkill.toLowerCase() ||
        activeLockedSkill.toLowerCase().includes(node.label.toLowerCase()) ||
        node.label.toLowerCase().includes(activeLockedSkill.toLowerCase())
      );

      const isActive = isLocked || isDirectHover;

      // Draw connection to hub with glowing stroke
      ctx.beginPath();
      ctx.moveTo(hub.px, hub.py);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = isActive 
        ? node.color 
        : (isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(255, 255, 255, 0.08)');
      ctx.lineWidth = isLocked ? (isMobile ? 2.4 : 3) : (isActive ? 2 : 0.85);
      if (isActive) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isLocked ? 12 : 7;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Node circle
      const dotRadius = isLocked ? (isMobile ? 7 : 8.5) : (isActive ? (isMobile ? 6 : 7.5) : (isMobile ? 4 : 5));
      ctx.beginPath();
      ctx.arc(nx, ny, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = isActive 
        ? (isLight ? '#0284c7' : '#ffffff') 
        : node.color;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = isLocked ? 16 : (isActive ? 12 : 5);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Skill Label with Boundary-Aware Layout (Flips to left if near right edge)
      ctx.font = isActive 
        ? (isMobile ? 'bold 10px "JetBrains Mono", monospace' : 'bold 12px "JetBrains Mono", monospace')
        : (isMobile ? '600 9px "JetBrains Mono", monospace' : '600 11px "JetBrains Mono", monospace');
      ctx.fillStyle = isActive 
        ? (isLight ? '#0284c7' : '#38bdf8') 
        : (isLight ? '#0f172a' : '#f8fafc');

      const labelWidth = ctx.measureText(node.label).width;
      let textX = nx + (isMobile ? 6 : 9);
      // Auto flip label to left of node if it would exceed canvas right edge
      if (textX + labelWidth > width - 6) {
        textX = nx - labelWidth - (isMobile ? 6 : 9);
      }
      if (textX < 6) textX = 6;

      ctx.fillText(node.label, textX, ny + (isMobile ? 3 : 4));
    });

    // Draw Hub Nodes on top
    resolvedHubs.forEach(h => {
      const isHubLocked = activeLockedSkill && skillNodes.some(n => 
        n.hub === h.id && (
          n.label.toLowerCase() === activeLockedSkill.toLowerCase() ||
          activeLockedSkill.toLowerCase().includes(n.label.toLowerCase())
        )
      );

      const hubRadius = isHubLocked ? (isMobile ? 22 : 27) : (isMobile ? 18 : 24);
      ctx.beginPath();
      ctx.arc(h.px, h.py, hubRadius, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#ffffff' : 'rgba(14, 20, 36, 0.92)';
      ctx.strokeStyle = h.color;
      ctx.lineWidth = isHubLocked ? (isMobile ? 2.8 : 3.5) : (isLight ? 2.2 : 1.8);
      ctx.shadowColor = h.color;
      ctx.shadowBlur = isHubLocked ? 18 : (isLight ? 6 : 14);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Pulse ring for locked hub
      if (isHubLocked) {
        ctx.beginPath();
        ctx.arc(h.px, h.py, hubRadius + (isMobile ? 5 : 8), 0, Math.PI * 2);
        ctx.strokeStyle = h.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Inner Hub Accent Dot
      ctx.beginPath();
      ctx.arc(h.px, h.py, isMobile ? 4 : 6, 0, Math.PI * 2);
      ctx.fillStyle = h.color;
      ctx.fill();

      // Hub Title below node
      ctx.font = isMobile ? 'bold 10.5px "Plus Jakarta Sans", sans-serif' : 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(h.label, h.px, h.py + (isMobile ? 30 : 38));
      ctx.textAlign = 'start';
    });

    requestAnimationFrame(renderSkillsGraph);
  }
  requestAnimationFrame(renderSkillsGraph);
}

// Select a skill filter and lock it until the next skill click, reordering matching projects to top
function selectSkillFilter(skillName) {
  activeLockedSkill = skillName;
  playBlip(750, 'sine', 0.04);
  const count = filterAndReorderProjectsForSkill(activeLockedSkill);
  highlightMatrixPillsForSkill(activeLockedSkill);
  updateSkillsHintLocked(activeLockedSkill, count);
  showToast(`Filtered & reordered: ${count} project${count === 1 ? '' : 's'} matching "${activeLockedSkill}"`);
}

// Reset skill filter back to neutral and restore all 16 projects in original order
function resetSkillFilter() {
  activeLockedSkill = null;

  // Remove active skill chip tab
  const skillTab = document.getElementById('activeSkillTab');
  if (skillTab) skillTab.remove();

  // Hide active filter banner
  const banner = document.getElementById('activeFilterBanner');
  if (banner) banner.style.display = 'none';

  // Restore 'All Projects' as active
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(b => b.classList.remove('active'));
  const allBtn = document.getElementById('filter-all');
  if (allBtn) allBtn.classList.add('active');

  // Restore all cards in original order and display them all
  const projectsGrid = document.querySelector('.projects-grid');
  if (projectsGrid && window.originalProjectCards) {
    window.originalProjectCards.forEach(card => {
      projectsGrid.appendChild(card);
      card.classList.remove('skill-matched');
      card.style.display = 'flex';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 10);
    });
  }

  clearMatrixPillHighlights();
  updateSkillsHintLocked(null, 0);
  showToast('Restored all 16 projects');
}

// Match a project card with a skill query
function matchProjectWithSkill(card, skillName) {
  const normSkill = skillName.toLowerCase().trim();
  const text = card.textContent.toLowerCase();
  const skills = (card.getAttribute('data-skills') || '').toLowerCase();
  const category = (card.getAttribute('data-category') || '').toLowerCase();
  const combined = `${text} ${skills} ${category}`;

  // 1. Go / Golang special matching
  if (normSkill === 'go' || normSkill === 'go 1.22+' || normSkill === 'golang') {
    return category.includes('golang') || skills.includes('go') || /\bgo\b/.test(combined) || combined.includes('golang');
  }

  // 2. Python
  if (normSkill === 'python') {
    return skills.includes('python') || combined.includes('python');
  }

  // 3. FastAPI
  if (normSkill === 'fastapi') {
    return skills.includes('fastapi') || combined.includes('fastapi');
  }

  // 4. Clean Architecture
  if (normSkill === 'clean arch' || normSkill === 'clean architecture') {
    return skills.includes('clean architecture') || combined.includes('clean architecture') || combined.includes('clean arch');
  }

  // 5. GORM
  if (normSkill === 'gorm') {
    return skills.includes('gorm') || combined.includes('gorm');
  }

  // 6. Docker
  if (normSkill === 'docker') {
    return skills.includes('docker') || combined.includes('docker');
  }

  // 7. AWS ECS / AWS / Cloud
  if (normSkill === 'aws ecs' || normSkill === 'aws') {
    return combined.includes('aws') || combined.includes('ecs') || combined.includes('docker');
  }

  // 8. PostgreSQL / pgvector
  if (normSkill === 'pgvector') {
    return skills.includes('pgvector') || combined.includes('pgvector');
  }
  if (normSkill === 'postgresql' || normSkill === 'postgres') {
    return skills.includes('postgresql') || combined.includes('postgresql') || combined.includes('postgres');
  }

  // 9. LangGraph
  if (normSkill === 'langgraph') {
    return skills.includes('langgraph') || combined.includes('langgraph');
  }

  // 10. FastMCP / MCP
  if (normSkill === 'fastmcp' || normSkill === 'mcp') {
    return skills.includes('fastmcp') || combined.includes('fastmcp') || combined.includes('mcp');
  }

  // 11. LangChain
  if (normSkill === 'langchain') {
    return skills.includes('langchain') || combined.includes('langchain');
  }

  // 12. Human-in-the-Loop (HITL)
  if (normSkill === 'hitl' || normSkill.includes('hitl') || normSkill.includes('human-in-the-loop')) {
    return skills.includes('hitl') || combined.includes('hitl') || combined.includes('human-in-the-loop');
  }

  // 13. Bedrock Vision / AWS Bedrock / Claude Vision
  if (normSkill === 'bedrock vision' || normSkill.includes('bedrock')) {
    return skills.includes('aws bedrock') || combined.includes('bedrock') || combined.includes('vision');
  }

  // 14. OpenCV OCR / OpenCV
  if (normSkill.includes('opencv') || normSkill.includes('ocr')) {
    return skills.includes('opencv') || combined.includes('opencv') || combined.includes('ocr');
  }

  // 15. TensorFlow
  if (normSkill.includes('tensorflow')) {
    return skills.includes('tensorflow') || combined.includes('tensorflow');
  }

  // 16. SBERT / Transformers
  if (normSkill.includes('sbert')) {
    return skills.includes('sbert') || combined.includes('sbert') || combined.includes('distilbert');
  }

  // 17. Java / OOP
  if (normSkill === 'java' || normSkill.includes('oop')) {
    return skills.includes('java') || combined.includes('java') || combined.includes('oop');
  }

  // Generic fallback: tokenize words (length >= 2)
  const words = normSkill.replace(/[()&,+/.]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !['the', 'and', 'for', 'with', 'api', 'apis'].includes(w));
  return words.some(w => combined.includes(w));
}

// Filter and reorder project cards for a selected skill
function filterAndReorderProjectsForSkill(skillName) {
  const projectsGrid = document.querySelector('.projects-grid');
  if (!projectsGrid) return 0;

  if (!window.originalProjectCards || window.originalProjectCards.length === 0) {
    window.originalProjectCards = Array.from(document.querySelectorAll('.project-card'));
  }

  const matchingCards = [];
  const nonMatchingCards = [];

  window.originalProjectCards.forEach(card => {
    if (matchProjectWithSkill(card, skillName)) {
      matchingCards.push(card);
    } else {
      nonMatchingCards.push(card);
    }
  });

  // Re-order in DOM: Matching cards are placed at the TOP of the grid!
  matchingCards.forEach(card => {
    projectsGrid.appendChild(card);
    card.classList.add('skill-matched');
    card.style.display = 'flex';
    requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  });

  // Non-matching cards are hidden
  nonMatchingCards.forEach(card => {
    card.classList.remove('skill-matched');
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    card.style.display = 'none';
  });

  // Update filter tabs UI: show active skill chip
  const filterTabsContainer = document.getElementById('projectFilterTabs');
  if (filterTabsContainer) {
    const regularBtns = filterTabsContainer.querySelectorAll('.filter-btn:not(#activeSkillTab)');
    regularBtns.forEach(b => b.classList.remove('active'));

    let skillTab = document.getElementById('activeSkillTab');
    if (!skillTab) {
      skillTab = document.createElement('button');
      skillTab.id = 'activeSkillTab';
      skillTab.className = 'filter-btn active skill-filter-chip';
      filterTabsContainer.insertBefore(skillTab, filterTabsContainer.firstChild);
    }
    skillTab.innerHTML = `<i class="fa-solid fa-filter"></i> Skill: ${skillName} (${matchingCards.length}) <span class="tab-close-icon" onclick="event.stopPropagation(); resetSkillFilter();" title="Clear filter">&times;</span>`;
    skillTab.onclick = () => resetSkillFilter();
  }

  // Update active filter banner above the grid
  const banner = document.getElementById('activeFilterBanner');
  const bannerSkillName = document.getElementById('activeFilterSkillName');
  const bannerCount = document.getElementById('activeFilterMatchCount');
  if (banner && bannerSkillName && bannerCount) {
    bannerSkillName.textContent = skillName;
    bannerCount.textContent = matchingCards.length;
    banner.style.display = 'flex';
  }

  return matchingCards.length;
}

// Wire up matrix pills in the Technical Skills matrix
function initMatrixPillListeners() {
  const pills = document.querySelectorAll('.skills-container .skill-tag, .skills-container .tech-pill');
  pills.forEach(pill => {
    pill.style.cursor = 'pointer';
    pill.setAttribute('title', 'Click to filter projects matching this skill');
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const skillName = pill.textContent.trim();
      selectSkillFilter(skillName);
    });
  });
}

function updateSkillsHintLocked(skillName, count) {
  const hint = document.getElementById('skillsGraphHint');
  if (!hint) return;
  if (skillName) {
    hint.classList.add('locked');
    hint.innerHTML = `
      <div class="skills-hint-info">
        <i class="fa-solid fa-lock" style="color:var(--accent-cyan);"></i>
        <span>Active Focus: <strong>${skillName}</strong> (${count} matching project${count === 1 ? '' : 's'})</span>
      </div>
      <div class="skills-hint-actions">
        <a href="#projects" class="skills-hint-btn view-btn" onclick="event.stopPropagation();">
          <i class="fa-solid fa-arrow-down"></i> View Projects
        </a>
        <button class="skills-hint-btn reset-btn" onclick="event.stopPropagation(); resetSkillFilter();">
          <i class="fa-solid fa-rotate-left"></i> Reset Filter
        </button>
      </div>
    `;
  } else {
    hint.classList.remove('locked');
    hint.innerHTML = `<span class="skills-hint-default"><i class="fa-solid fa-crosshairs"></i> Tap any skill node or matrix pill to highlight matching projects</span>`;
  }
}

function switchSkillsView(view) {
  const graphBtn = document.getElementById('skillsViewGraphBtn');
  const pillsBtn = document.getElementById('skillsViewPillsBtn');
  const graphWrapper = document.getElementById('skillsGraphWrapper');
  const pillsContainer = document.querySelector('.skills-container');

  if (view === 'graph') {
    skillsGraphActive = true;
    if (graphBtn) graphBtn.classList.add('active');
    if (pillsBtn) pillsBtn.classList.remove('active');
    if (graphWrapper) graphWrapper.style.display = 'block';
    if (pillsContainer) pillsContainer.style.display = 'grid';
  } else {
    skillsGraphActive = false;
    if (graphBtn) graphBtn.classList.remove('active');
    if (pillsBtn) pillsBtn.classList.add('active');
    if (graphWrapper) graphWrapper.style.display = 'none';
    if (pillsContainer) pillsContainer.style.display = 'grid';
  }
}

function highlightProjectsForSkill(skillName) {
  return filterAndReorderProjectsForSkill(skillName);
}

function clearProjectHighlights() {
  resetSkillFilter();
}

function highlightMatrixPillsForSkill(skillName) {
  const pills = document.querySelectorAll('.skills-container .skill-tag, .skills-container .tech-pill');
  if (!skillName) {
    pills.forEach(p => p.classList.remove('active-skill-pill'));
    return;
  }
  const cleanStr = skillName.toLowerCase().replace(/[()&,+/.]/g, ' ').trim();
  pills.forEach(p => {
    const pText = p.textContent.toLowerCase().replace(/[()&,+/.]/g, ' ').trim();
    if (pText.includes(cleanStr) || cleanStr.includes(pText)) {
      p.classList.add('active-skill-pill');
    } else {
      p.classList.remove('active-skill-pill');
    }
  });
}

function clearMatrixPillHighlights() {
  const pills = document.querySelectorAll('.skills-container .skill-tag, .skills-container .tech-pill');
  pills.forEach(p => p.classList.remove('active-skill-pill'));
}

// ==========================================================================
// 10. REWARDED INTERACTION: "DOWNLOAD RESUME"
// ==========================================================================
function handleResumeDownload(event) {
  playBlip(900, 'sine', 0.08);
  triggerConfetti();
  showAchievement('Achievement Unlocked: Resume Acquired! (1-Yr Production AI & Go)');
}

function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f43f5e'];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: 60,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -8 - 3,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.rotation += p.vRot;
      p.alpha -= 0.012;

      if (p.alpha > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (activeCount > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(renderConfetti);
}

// ==========================================================================
// 11. EASTER EGG: INTERACTIVE CLI TERMINAL (KONAMI & BUTTON TRIGGERED)
// ==========================================================================
function initCliTerminal() {
  const cliBtn = document.getElementById('cliToggleBtn');
  const cliInput = document.getElementById('cliInput');

  if (cliBtn) {
    cliBtn.addEventListener('click', openCliModal);
  }

  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = cliInput.value.trim();
        if (cmd) {
          execCliCmd(cmd);
          cliInput.value = '';
        }
      }
    });
  }
}

function openCliModal() {
  const modal = document.getElementById('cliModal');
  const cliInput = document.getElementById('cliInput');
  if (!modal) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  playBlip(720, 'sine', 0.05);
  showAchievement('Achievement Unlocked: Discovered Engineer Terminal Mode!');

  if (cliInput) {
    setTimeout(() => cliInput.focus(), 100);
  }
}

function closeCliModal(event) {
  const modal = document.getElementById('cliModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
}

function execCliCmd(cmdStr) {
  const cliBody = document.getElementById('cliBody');
  if (!cliBody) return;

  const cmd = cmdStr.toLowerCase().trim();
  appendCliLine(`gokul@engineer:~$ ${cmdStr}`, 'prompt-echo');
  playBlip(820, 'sine', 0.03);

  switch (cmd) {
    case 'whoami':
      appendCliLine('NAME: Gokulkrishnan G', 'highlight');
      appendCliLine('ROLE: AI-Native Software Engineer', 'accent');
      appendCliLine('EXP: 1 Year Cumulative (8+ Mos in Production AI @ AVASOFT)', 'info');
      appendCliLine('DEGREE: B.Tech in AI & Data Science (8.33 CGPA, Panimalar Eng College)', 'info');
      appendCliLine('LOCATION: Chennai, India (Open to Relocate / Remote)', 'info');
      break;

    case 'stack':
      appendCliLine('LANGUAGES: Python, Go (Golang 1.22+), Java, JavaScript, SQL', 'highlight');
      appendCliLine('AI / AGENTS: LangGraph, FastMCP, LangChain, MultiServerMCPClient, HITL', 'accent');
      appendCliLine('CLOUD LLMS: AWS Bedrock (Claude Haiku 4.5 Vision, Titan Embeddings)', 'accent');
      appendCliLine('BACKEND: Clean Architecture, FastAPI, GORM ORM, Gorilla Mux, SQLAlchemy 2.0', 'info');
      appendCliLine('DATABASES: PostgreSQL, pgvector (Cosine Similarity), Asyncpg', 'info');
      appendCliLine('DEVOPS: AWS (ECS, EventBridge, SES, S3, RDS), Docker, Azure DevOps CI/CD', 'info');
      break;

    case 'metrics':
      appendCliLine('&bull; 30,000+ monthly emails ingested & parsed via Vision AI', 'success');
      appendCliLine('&bull; Incident resolution slashed from 4+ hours to <45 seconds', 'success');
      appendCliLine('&bull; 50+ production REST APIs engineered across Python & Go', 'success');
      appendCliLine('&bull; >97% OCR & ticket data entity extraction accuracy', 'success');
      appendCliLine('&bull; 40% Docker image layer optimization on AWS ECS', 'success');
      break;

    case 'projects':
      appendCliLine('1. Enterprise Room Booking Management (Go Flagship Clean Arch)', 'highlight');
      appendCliLine('2. FastAPI Clean Architecture Production REST API', 'highlight');
      appendCliLine('3. Autonomous Multi-Agent Code Generation & Review (LangGraph)', 'highlight');
      appendCliLine('4. Enterprise RAG Knowledge Base & Recommendation (pgvector)', 'highlight');
      appendCliLine('5. Agentic HITL Framework & FastMCP Checkpoints', 'accent');
      appendCliLine('6. LangChain AI Projects Suite (7 Modular Agent Systems)', 'accent');
      appendCliLine('7. Library Reservation REST API & Go Concurrency Engine', 'info');
      appendCliLine('8. AI Psychometric Stress Assistant & AGV Navigation (2 Forks)', 'info');
      break;

    case 'resume':
      appendCliLine('Downloading Gokulkrishnan G Resume PDF...', 'success');
      triggerConfetti();
      window.open('assets/resume.pdf', '_blank');
      break;

    case 'clear':
      cliBody.innerHTML = '';
      break;

    case 'help':
      appendCliLine('Available Commands:', 'highlight');
      appendCliLine('  whoami    - Engineer profile & credentials', 'info');
      appendCliLine('  stack     - Tech stack & architecture proficiencies', 'info');
      appendCliLine('  metrics   - Production impact & scale numbers', 'info');
      appendCliLine('  projects  - Flagship projects overview', 'info');
      appendCliLine('  resume    - Trigger resume PDF download', 'info');
      appendCliLine('  clear     - Clear terminal buffer', 'info');
      appendCliLine('  exit      - Close CLI terminal mode', 'info');
      break;

    case 'exit':
      closeCliModal();
      break;

    default:
      appendCliLine(`command not found: ${cmdStr}. Type 'help' for commands.`, 'accent');
      break;
  }

  cliBody.scrollTop = cliBody.scrollHeight;
}

function appendCliLine(text, className = '') {
  const cliBody = document.getElementById('cliBody');
  if (!cliBody) return;
  const line = document.createElement('div');
  line.className = `cli-line ${className}`;
  line.innerHTML = text;
  cliBody.appendChild(line);
}

function initKonamiCode() {
  const konamiSeq = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === konamiSeq[konamiIndex].toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiSeq.length) {
        openCliModal();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

// ==========================================================================
// 12. ACHIEVEMENT TOAST SYSTEM
// ==========================================================================
const unlockedAchievements = new Set();

function initAchievements() {
  const sections = [
    { id: 'about', desc: 'Explored Multi-Agent Architecture & Pillars' },
    { id: 'experience', desc: 'Verified AVASOFT Production AI Impact & Scale' },
    { id: 'projects', desc: 'Inspected Go & FastAPI Clean Microservices' },
    { id: 'credentials', desc: 'Verified Oracle GenAI & International Publications' },
    { id: 'skills', desc: 'Explored Full Technical Skills Matrix' },
    { id: 'contact', desc: 'Direct Engineering Line Open!' }
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const match = sections.find(s => s.id === entry.target.id);
        if (match && !unlockedAchievements.has(match.id)) {
          unlockedAchievements.add(match.id);
          showAchievement(match.desc);
        }
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
}

let achievementTimer = null;
function showAchievement(desc) {
  const toast = document.getElementById('achievementToast');
  const descEl = document.getElementById('achievementDesc');
  if (!toast || !descEl) return;

  descEl.textContent = desc;
  toast.classList.add('show');
  playBlip(950, 'sine', 0.05);

  clearTimeout(achievementTimer);
  achievementTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function dismissAchievement() {
  const toast = document.getElementById('achievementToast');
  if (toast) toast.classList.remove('show');
}

// ==========================================================================
// 13. CERTIFICATE MODAL LIGHTBOX
// ==========================================================================
function initCertificateModal() {
  // Global modal handlers
}

function openModal(imageSrc, title, subtitle) {
  const modal = document.getElementById('certModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalDownloadBtn = document.getElementById('modalDownloadBtn');

  if (!modal || !modalImg) return;

  modalImg.src = imageSrc;
  modalTitle.textContent = title || 'Certificate Preview';
  modalSubtitle.innerHTML = subtitle || 'Verified Document';
  modalDownloadBtn.href = imageSrc;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  playBlip(680, 'sine', 0.04);
}

function closeModal(event) {
  const modal = document.getElementById('certModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
}

function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeCliModal();
    }
  });
}

// ==========================================================================
// 14. CLIPBOARD & GENERAL TOAST NOTIFICATIONS
// ==========================================================================
function copyToClipboard(text, customMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMessage || 'Copied to clipboard!');
      playBlip(850, 'sine', 0.03);
    }).catch(err => {
      fallbackCopyText(text, customMessage);
    });
  } else {
    fallbackCopyText(text, customMessage);
  }
}

function fallbackCopyText(text, customMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(customMessage || 'Copied to clipboard!');
    playBlip(850, 'sine', 0.03);
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// ==========================================================================
// 15. SCROLL SPY, ACTIVE TIMELINE TRACKING & NAVBAR BLUR
// ==========================================================================
function initScrollSpy() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');
  const experienceCards = document.querySelectorAll('.experience-card');

  let ticking = false;

  const onScroll = () => {
    const scrollY = window.scrollY;

    // Navbar blur and elevation
    if (navbar) {
      if (scrollY > 20) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }

    // ScrollSpy active link
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });

    // Experience Card in-view highlight (timeline tracking)
    if (experienceCards.length) {
      const viewportCenter = window.innerHeight * 0.5;
      let closestCard = null;
      let closestDistance = Infinity;

      experienceCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - cardCenter);

        if (rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15) {
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCard = card;
          }
        }
      });

      experienceCards.forEach(card => {
        if (card === closestCard) {
          card.classList.add('in-view');
        } else {
          card.classList.remove('in-view');
        }
      });
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();
}

// ==========================================================================
// 16. RESPONSIVE MOBILE NAVIGATION DRAWER
// ==========================================================================
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
  const backdrop = document.getElementById('mobileBackdrop');
  if (!mobileBtn || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    mobileBtn.setAttribute('aria-expanded', 'true');
    mobileBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.body.style.overflow = '';
  }

  mobileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
      playBlip(600, 'sine', 0.04);
    }
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });
}

// Global hook for drawer buttons
window.closeMobileDrawer = function() {
  const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
  const backdrop = document.getElementById('mobileBackdrop');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (navLinks) navLinks.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (mobileBtn) {
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }
  document.body.style.overflow = '';
};

// ==========================================================================
// 17. SCROLL-REVEAL SYSTEM (SMOOTH INTERSECTION OBSERVER ENHANCEMENT)
// ==========================================================================
function initScrollReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
    return;
  }

  // Target all key UI elements
  const targets = document.querySelectorAll(
    '.section-header, .metric-card, .experience-card, .project-card, .cert-card, .skill-category, .contact-box, .project-block'
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight * 0.85;

    el.classList.add('reveal-on-scroll');

    const parentGrid = el.closest('.metrics-grid, .projects-grid, .cert-grid, .skills-container, .experience-list');
    if (parentGrid) {
      const siblings = Array.from(parentGrid.children);
      const siblingIndex = siblings.indexOf(el);
      if (siblingIndex > -1) {
        el.style.transitionDelay = `${(siblingIndex % 4) * 80}ms`;
      }
    }

    if (isAlreadyVisible) {
      setTimeout(() => {
        el.classList.add('is-revealed');
      }, 100);
    } else {
      observer.observe(el);
    }
  });
}

// ==========================================================================
// 18. FLOATING BACK TO TOP BUTTON WITH CIRCULAR PROGRESS
// ==========================================================================
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 320) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    playBlip(750, 'sine', 0.05);
  });
}

// ==========================================================================
// 19. SMOOTH SCROLL-DRIVEN PARALLAX (HERO DEPTH & AMBIENT MOTION)
// ==========================================================================
function initScrollParallax() {
  if (prefersReducedMotion || isLowEndDevice) return;

  const heroPhoto = document.querySelector('.hero-portrait-frame');
  const heroGlow = document.querySelector('.hero-card-glow');
  const heroContent = document.querySelector('.hero-content');

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight * 1.2) {
          if (heroPhoto) {
            heroPhoto.style.transform = `translateY(${Math.min(scrollY * 0.12, 50)}px)`;
          }
          if (heroGlow) {
            heroGlow.style.transform = `translateY(${Math.min(scrollY * 0.18, 70)}px) scale(${1 + scrollY * 0.0003})`;
          }
          if (heroContent && window.innerWidth > 768) {
            heroContent.style.transform = `translateY(${Math.min(scrollY * 0.05, 30)}px)`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

