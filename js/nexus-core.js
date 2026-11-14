/**
 * NexusLab AI - Core Engine & State Management
 * Persistent localStorage Database, Audio Synth, Theme, & Sessions
 */

const NexusCore = (() => {
  // --- DEFAULT DATABASE SEEDS ---
  const DEFAULT_USERS = [
    {
      id: 'usr_admin',
      username: 'admin',
      passwordHash: 'admin1234',
      fullName: 'Dr. Alexis Vance (Director)',
      email: 'admin@nexuslab.ai',
      role: 'admin',
      plan: 'master',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      linkedAccounts: { google: true, line: true, facebook: false, email: true },
      joinedDate: '2026-01-10',
      status: 'active'
    },
    {
      id: 'usr_pro_01',
      username: 'dr_sarah',
      passwordHash: 'pass1234',
      fullName: 'Assoc. Prof. Sarah Connor',
      email: 'sarah.c@university.ac.th',
      role: 'researcher',
      plan: 'pro',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      linkedAccounts: { google: true, line: false, facebook: true, email: true },
      joinedDate: '2026-02-14',
      status: 'active'
    },
    {
      id: 'usr_stu_01',
      username: 'somchai_kvis',
      passwordHash: 'pass1234',
      fullName: 'Somchai Prasert (Student)',
      email: 'somchai.p@student.edu',
      role: 'student',
      plan: 'explorer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      linkedAccounts: { google: true, line: true, facebook: true, email: true },
      joinedDate: '2026-03-01',
      status: 'active'
    }
  ];

  const DEFAULT_PLANS = [
    {
      id: 'explorer',
      name: 'Explorer (ผู้เริ่มต้น)',
      priceMonthlyTHB: 0,
      priceYearlyTHB: 0,
      badge: 'Free Forever',
      color: 'slate',
      features: [
        'ห้องปฏิบัติการ 2D พื้นฐานทั้ง 4 วิชา (20 บททดลอง)',
        'AI Tutor ถาม-ตอบ 15 ครั้ง/วัน',
        'พรีเซ็ตการทดลองมาตรฐาน',
        'ชุมชนนักวิทยาศาสตร์ Nexus Community',
        'ไม่มีการบันทึกห้องแล็บกำหนดเอง (Read-only)'
      ],
      creatorCostEstTHB: 15,
      targetUser: 'นักเรียนมัธยม & ผู้สนใจเริ่มต้น'
    },
    {
      id: 'pro',
      name: 'Pro Researcher (มืออาชีพ & นักวิจัย)',
      priceMonthlyTHB: 299,
      priceYearlyTHB: 2890,
      badge: 'Most Popular',
      color: 'cyan',
      features: [
        'ปลดล็อกห้องปฏิบัติการ 2D & 3D Interactive เต็มรูปแบบ',
        'AI Tutor ไม่จำกัด พร้อม Voice ถอดเสียงพูด & อัปโหลดรูปภาพ',
        'นำเข้า PDF รายงานวิจัย & สรุปผลอัตโนมัติ',
        'ระบบ Custom Lab Designer ออกแบบห้องแล็บของตนเอง (ไม่จำกัดสล็อต)',
        'ส่งออกข้อมูลเชิงลึกเป็น CSV, JSON & LaTeX Data Report',
        'การเข้าถึงคู่มือการทดลองของจริง (Real-World SOPs)'
      ],
      creatorCostEstTHB: 42,
      targetUser: 'นักศึกษาปริญญาตรี/โท, ครูวิทยาศาสตร์, นักวิจัยเดี่ยว'
    },
    {
      id: 'master',
      name: 'Lab Master (สถาบัน & องค์กร)',
      priceMonthlyTHB: 999,
      priceYearlyTHB: 9900,
      badge: 'Campus & Enterprise',
      color: 'purple',
      features: [
        'สิทธิ์การใช้งาน 10 ที่นั่งสำหรับห้องเรียน/แล็บวิจัย (เพิ่มที่นั่งได้)',
        'ระบบจัดการห้องเรียน & แดชบอร์ดติดตามผลนักเรียนรายบุคคล',
        'รองรับ Custom MCP Key Server & Private Gemini API Key',
        'เรนเดอร์กราฟิกประมวลผลสูง (Priority GPU/WebGL Cloud Engine)',
        'Custom Branding ใส่โลโก้โรงเรียน/มหาวิทยาลัยบน Lab Report',
        'การสนับสนุนระดับ Enterprise 24/7 พร้อม SLA 99.9%'
      ],
      creatorCostEstTHB: 120,
      targetUser: 'โรงเรียน, สถาบันการศึกษา, ศูนย์วิจัย, ภาควิชา'
    }
  ];

  const DEFAULT_PROMOS = [
    { code: 'NEXUS2026', discountPercent: 100, monthsFree: 1, maxUses: 1000, usedCount: 142, active: true },
    { code: 'SCIENCEPRO', discountPercent: 50, monthsFree: 0, maxUses: 500, usedCount: 89, active: true },
    { code: 'STUDENTFREE', discountPercent: 100, monthsFree: 3, maxUses: 2000, usedCount: 310, active: true },
    { code: 'KVIS2026', discountPercent: 30, monthsFree: 0, maxUses: 100, usedCount: 12, active: true }
  ];

  // --- INITIALIZE STORAGE ---
  function initStorage() {
    if (!localStorage.getItem('nexus_users')) {
      localStorage.setItem('nexus_users', JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem('nexus_plans')) {
      localStorage.setItem('nexus_plans', JSON.stringify(DEFAULT_PLANS));
    }
    if (!localStorage.getItem('nexus_promos')) {
      localStorage.setItem('nexus_promos', JSON.stringify(DEFAULT_PROMOS));
    }
    if (!localStorage.getItem('nexus_api_keys')) {
      localStorage.setItem('nexus_api_keys', JSON.stringify({
        geminiKey: 'AIzaSyDemo-GeminiKeyPlaceholder_NexusLab2026',
        mcpServerUrl: 'https://mcp.nexuslab.ai/v1/science',
        wolframKey: 'WOLFRAM-ALPHA-DEMO-2026',
        activeEngine: 'gemini-2.0-flash'
      }));
    }
    if (!localStorage.getItem('nexus_theme')) {
      localStorage.setItem('nexus_theme', 'dark');
    }
    if (!localStorage.getItem('nexus_current_user')) {
      // Default to guest / admin for smooth inspection
      localStorage.setItem('nexus_current_user', JSON.stringify(DEFAULT_USERS[0]));
    }
    if (!localStorage.getItem('nexus_system_logs')) {
      const logs = [
        { time: new Date().toLocaleTimeString(), event: 'SYSTEM_BOOT', message: 'NexusLab AI Workstation Engine initialized successfully.' },
        { time: new Date().toLocaleTimeString(), event: 'AUTH_SUCCESS', message: 'Admin account preloaded into secure sandbox storage.' },
        { time: new Date().toLocaleTimeString(), event: 'SUBSCRIPTION_ENGINE', message: 'Tri-tier pricing architecture synchronized.' }
      ];
      localStorage.setItem('nexus_system_logs', JSON.stringify(logs));
    }
    if (!localStorage.getItem('nexus_custom_labs')) {
      localStorage.setItem('nexus_custom_labs', JSON.stringify({
        biology: {
          name: 'ห้องปฏิบัติการพันธุวิศวกรรมขั้นสูง (Genetic Engineering Lab)',
          colorTheme: '#10b981',
          equipment: ['microscope', 'centrifuge', 'pcr_cycler', 'incubator', 'pipette_rack']
        },
        chemistry: {
          name: 'ห้องแล็บสังเคราะห์สารอินทรีย์นาโน (Organic Synthesis Hub)',
          colorTheme: '#f43f5e',
          equipment: ['fume_hood', 'buret_stand', 'magnetic_stirrer', 'spectrophotometer', 'reagent_shelf']
        },
        physics: {
          name: 'สถานีทดสอบควอนตัมและเลเซอร์ (Quantum Optics Bay)',
          colorTheme: '#06b6d4',
          equipment: ['optical_bench', 'oscilloscope', 'laser_emitter', 'sensor_probe', 'breadboard']
        },
        astronomy: {
          name: 'หอดูดาวอวกาศลึกเน็กซัส (Deep Space Observatory)',
          colorTheme: '#8b5cf6',
          equipment: ['telescope_cassegrain', 'spectrograph', 'radio_receiver', 'ccd_camera', 'star_tracker']
        }
      }));
    }
  }

  // --- AUDIO SYNTHESIS (Web Audio API) ---
  let audioCtx = null;
  let isMuted = localStorage.getItem('nexus_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const Sound = {
    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('nexus_muted', isMuted);
      return isMuted;
    },
    isMuted() {
      return isMuted;
    },
    click() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    },
    success() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.06, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.22);
      });
    },
    beep(freq = 600, duration = 0.1) {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    },
    bubble() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    },
    laser() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    }
  };

  // --- THEME MANAGEMENT ---
  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light');
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
      html.classList.remove('light');
    }
    localStorage.setItem('nexus_theme', theme);
  }

  function toggleTheme() {
    const current = localStorage.getItem('nexus_theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    Sound.click();
    return next;
  }

  // --- TOAST SYSTEM ---
  function toast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('nexus-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'nexus-toast-container';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'nexus-toast';

    let icon = 'fa-info-circle text-cyan-400';
    if (type === 'success') icon = 'fa-check-circle text-emerald-400';
    if (type === 'warning') icon = 'fa-exclamation-triangle text-amber-400';
    if (type === 'error') icon = 'fa-skull-crossbones text-rose-500';

    toastEl.innerHTML = `
      <i class="fas ${icon} text-lg"></i>
      <div class="flex-1 text-sm font-medium leading-tight">${message}</div>
      <button class="text-slate-400 hover:text-white text-xs px-1">&times;</button>
    `;

    toastEl.querySelector('button').onclick = () => toastEl.remove();
    container.appendChild(toastEl);

    if (type === 'success') Sound.success();
    else if (type === 'error') Sound.beep(220, 0.25);
    else Sound.click();

    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateY(-10px)';
        toastEl.style.transition = 'all 0.3s ease';
        setTimeout(() => toastEl.remove(), 300);
      }
    }, duration);
  }

  // --- AUTH & USER MANAGEMENT ---
  function getUsers() {
    return JSON.parse(localStorage.getItem('nexus_users') || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem('nexus_users', JSON.stringify(users));
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('nexus_current_user') || 'null');
  }

  function login(usernameOrEmail, password) {
    const users = getUsers();
    const user = users.find(u => 
      (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
       u.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
      u.passwordHash === password
    );

    if (user) {
      if (user.status === 'banned') {
        toast('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ', 'error');
        return { success: false, error: 'BANNED' };
      }
      localStorage.setItem('nexus_current_user', JSON.stringify(user));
      logEvent('AUTH_LOGIN', `User ${user.username} (${user.role}) logged in successfully.`);
      toast(`ยินดีต้อนรับคุณ ${user.fullName} เข้าสู่ NexusLab AI`, 'success');
      return { success: true, user };
    }

    toast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  function logout() {
    const u = getCurrentUser();
    if (u) {
      logEvent('AUTH_LOGOUT', `User ${u.username} logged out.`);
    }
    localStorage.removeItem('nexus_current_user');
    toast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
  }

  function register(newUser) {
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      toast('ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ', 'warning');
      return { success: false, error: 'USERNAME_TAKEN' };
    }
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      toast('อีเมลนี้ถูกใช้งานแล้วในระบบ', 'warning');
      return { success: false, error: 'EMAIL_TAKEN' };
    }

    const created = {
      id: 'usr_' + Date.now().toString(36),
      username: newUser.username,
      passwordHash: newUser.password,
      fullName: newUser.fullName || newUser.username,
      email: newUser.email,
      role: 'student',
      plan: newUser.plan || 'explorer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      linkedAccounts: { google: false, line: false, facebook: false, email: true },
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    users.push(created);
    saveUsers(users);
    localStorage.setItem('nexus_current_user', JSON.stringify(created));
    logEvent('AUTH_REGISTER', `New user registered: ${created.username} with plan ${created.plan}`);
    toast('ลงทะเบียนสมาชิกสำเร็จ ยินดีต้อนรับสู่ NexusLab AI!', 'success');
    return { success: true, user: created };
  }

  // --- PROMO CODE VERIFIER ---
  function verifyPromo(code) {
    if (!code) return { valid: false, message: 'กรุณากรอกโค้ดโปรโมชั่น' };
    const promos = JSON.parse(localStorage.getItem('nexus_promos') || '[]');
    const match = promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase() && p.active);
    if (!match) {
      return { valid: false, message: 'โค้ดส่วนลดนี้ไม่ถูกต้องหรือหมดอายุแล้ว' };
    }
    if (match.usedCount >= match.maxUses) {
      return { valid: false, message: 'โค้ดส่วนลดนี้ถูกใช้สิทธิ์ครบตามจำนวนแล้ว' };
    }
    return { valid: true, promo: match, message: `ใช้โค้ดสำเร็จ! รับส่วนลด ${match.discountPercent}% ทันที` };
  }

  // --- SYSTEM LOGS ---
  function logEvent(event, message) {
    const logs = JSON.parse(localStorage.getItem('nexus_system_logs') || '[]');
    logs.unshift({
      time: new Date().toLocaleTimeString(),
      event,
      message
    });
    if (logs.length > 100) logs.pop();
    localStorage.setItem('nexus_system_logs', JSON.stringify(logs));
  }

  function getLogs() {
    return JSON.parse(localStorage.getItem('nexus_system_logs') || '[]');
  }

  // --- CUSTOM LAB CONFIGURATION ---
  function getCustomLab(discipline) {
    const labs = JSON.parse(localStorage.getItem('nexus_custom_labs') || '{}');
    return labs[discipline] || null;
  }

  function saveCustomLab(discipline, config) {
    const labs = JSON.parse(localStorage.getItem('nexus_custom_labs') || '{}');
    labs[discipline] = config;
    localStorage.setItem('nexus_custom_labs', JSON.stringify(labs));
    logEvent('LAB_CUSTOMIZED', `Updated custom workbench layout for ${discipline.toUpperCase()}`);
    toast(`บันทึกการออกแบบห้องแล็บ ${discipline.toUpperCase()} เรียบร้อยแล้ว!`, 'success');
  }

  // --- NAVIGATION BAR INJECTOR / ACTIVE HIGHLIGHT ---
  function renderNavbar(activePage = '') {
    const user = getCurrentUser();
    const nav = document.getElementById('nexus-main-nav');
    if (!nav) return;

    const currentTheme = localStorage.getItem('nexus_theme') || 'dark';

    nav.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <a href="index.html" class="flex items-center gap-2 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <i class="fas fa-atom text-white text-xl animate-spin" style="animation-duration: 15s;"></i>
              </div>
              <div>
                <span class="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">NEXUSLAB</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 ml-1">AI</span>
              </div>
            </a>

            <!-- Navigation Links (Desktop) -->
            <nav class="hidden md:flex items-center gap-1 ml-6 text-sm font-medium">
              <a href="index.html" class="px-3 py-2 rounded-lg transition-all ${activePage === 'home' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}">
                <i class="fas fa-home mr-1.5 text-xs"></i> หน้าแรก
              </a>
              <a href="biology.html" class="px-3 py-2 rounded-lg transition-all ${activePage === 'biology' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}">
                <i class="fas fa-dna mr-1.5 text-xs text-emerald-400"></i> ชีววิทยา
              </a>
              <a href="chemistry.html" class="px-3 py-2 rounded-lg transition-all ${activePage === 'chemistry' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}">
                <i class="fas fa-flask mr-1.5 text-xs text-rose-400"></i> เคมี
              </a>
              <a href="physics.html" class="px-3 py-2 rounded-lg transition-all ${activePage === 'physics' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}">
                <i class="fas fa-bolt mr-1.5 text-xs text-sky-400"></i> ฟิสิกส์
              </a>
              <a href="astronomy.html" class="px-3 py-2 rounded-lg transition-all ${activePage === 'astronomy' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}">
                <i class="fas fa-satellite-dish mr-1.5 text-xs text-purple-400"></i> ดาราศาสตร์
              </a>
              <a href="database.html" class="px-3 py-2 rounded-lg transition-all ${activePage === 'database' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}">
                <i class="fas fa-lock mr-1.5 text-xs text-amber-400"></i> ฐานข้อมูล Admin
              </a>
            </nav>
          </div>

          <!-- Right Controls (Theme, Sound, Profile) -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Sound Toggle -->
            <button id="btn-sound-toggle" title="เปิด/ปิดเสียงเอฟเฟกต์" class="p-2 w-9 h-9 rounded-lg glass-card flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors">
              <i class="fas ${isMuted ? 'fa-volume-mute text-rose-400' : 'fa-volume-up text-cyan-400'}"></i>
            </button>

            <!-- Theme Toggle -->
            <button id="btn-theme-toggle" title="สลับโหมดมืด/สว่าง" class="p-2 w-9 h-9 rounded-lg glass-card flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors">
              <i class="fas ${currentTheme === 'light' ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-400'}"></i>
            </button>

            <!-- User Menu / Login -->
            ${user ? `
              <div class="relative group">
                <button class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full glass-card border border-cyan-500/30 hover:border-cyan-400 transition-all">
                  <img src="${user.avatar}" alt="${user.username}" class="w-7 h-7 rounded-full object-cover border border-cyan-400">
                  <span class="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[100px] truncate">${user.fullName || user.username}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded-full uppercase font-bold ${user.plan === 'master' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : user.plan === 'pro' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-500/20 text-slate-300'}">${user.plan}</span>
                </button>
                <!-- Dropdown -->
                <div class="absolute right-0 mt-2 w-56 rounded-xl glass-panel p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div class="p-2 border-b border-slate-700/50 mb-1">
                    <p class="text-xs text-slate-400">เข้าสู่ระบบในชื่อ</p>
                    <p class="text-sm font-bold text-white truncate">${user.fullName}</p>
                    <p class="text-[11px] text-cyan-400 font-mono truncate">${user.email}</p>
                  </div>
                  <a href="database.html" class="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white">
                    <i class="fas fa-sliders-h text-cyan-400"></i> แดชบอร์ด & Admin Lock
                  </a>
                  <button id="btn-logout" class="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 text-left mt-1">
                    <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
                  </button>
                </div>
              </div>
            ` : `
              <a href="login.html" class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                <i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ
              </a>
            `}
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      const muted = Sound.toggleMute();
      toast(muted ? 'ปิดเสียงเอฟเฟกต์แล้ว' : 'เปิดเสียงเอฟเฟกต์แล้ว', 'info');
      renderNavbar(activePage);
    });

    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      toggleTheme();
      renderNavbar(activePage);
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
      logout();
    });
  }

  // --- MOBILE BOTTOM NAVIGATION ---
  function renderMobileBottomNav(activeItem = 'lab') {
    const nav = document.getElementById('nexus-mobile-nav');
    if (!nav) return;

    nav.className = 'mobile-bottom-nav';
    nav.innerHTML = `
      <a href="biology.html" class="mobile-nav-btn ${activeItem === 'bio' ? 'active' : ''}">
        <i class="fas fa-dna"></i>
        <span>ชีวะ</span>
      </a>
      <a href="chemistry.html" class="mobile-nav-btn ${activeItem === 'chem' ? 'active' : ''}">
        <i class="fas fa-flask"></i>
        <span>เคมี</span>
      </a>
      <a href="physics.html" class="mobile-nav-btn ${activeItem === 'phys' ? 'active' : ''}">
        <i class="fas fa-bolt"></i>
        <span>ฟิสิกส์</span>
      </a>
      <a href="astronomy.html" class="mobile-nav-btn ${activeItem === 'astro' ? 'active' : ''}">
        <i class="fas fa-satellite-dish"></i>
        <span>ดาราศาสตร์</span>
      </a>
      <button id="btn-mobile-ai-toggle" class="mobile-nav-btn ${activeItem === 'ai' ? 'active' : ''}">
        <i class="fas fa-robot text-cyan-400"></i>
        <span>AI Tutor</span>
      </button>
    `;
  }

  // Auto initialize on script load
  initStorage();
  applyTheme(localStorage.getItem('nexus_theme') || 'dark');

  return {
    Sound,
    toast,
    applyTheme,
    toggleTheme,
    getUsers,
    saveUsers,
    getCurrentUser,
    login,
    logout,
    register,
    verifyPromo,
    logEvent,
    getLogs,
    getCustomLab,
    saveCustomLab,
    renderNavbar,
    renderMobileBottomNav,
    DEFAULT_PLANS
  };
})();
