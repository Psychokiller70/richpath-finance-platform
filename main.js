/* RichPath — interactions
   header · scroll-spy · charts · gateway tiles · pricing toggle · FAQ · dialogs · newsletter · toast */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2600);
  };

  // Links to pages that don't exist yet
  $$('[data-toast]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toast(`${el.dataset.toast} — coming soon`);
    });
  });

  /* ---------- Header: scrolled state + mobile menu ---------- */
  const header = $('.site-header');
  const toggle = $('.nav__toggle');
  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  $$('#nav-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => {
    if (header.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll-spy ---------- */
  const navLinks = $$('.nav__links > a');
  const spyIds = ['home', 'technology', 'features', 'pricing', 'faq'];
  const setActive = (id) => navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  if ('IntersectionObserver' in window) {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => seen.set(en.target.id, en.isIntersecting));
      const current = spyIds.find((id) => seen.get(id));
      if (current) setActive(current);
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyIds.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- Charts ---------- */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // [send, receive] in thousands
  const DATA = [
    [9.8, 13.6], [8.2, 11.9], [11.4, 16.2], [9.0, 13.1], [12.6, 16.8], [18.2, 13.9],
    [10.9, 15.2], [12.1, 16.0], [9.3, 13.0], [13.2, 16.9], [11.6, 15.4], [14.5, 15.8],
  ];
  const money = (k) => '$' + (k * 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function buildChart(root) {
    const mini = root.dataset.chart === 'mini';
    const max = mini ? 36 : 50;
    const ticks = ['50k', '40k', '30k', '20k', '10k', '0'];

    const y = document.createElement('div');
    y.className = 'chart__y';
    y.innerHTML = ticks.map((t) => `<span>${t}</span>`).join('');

    const plot = document.createElement('div');
    plot.className = 'chart__plot';
    plot.innerHTML = `<div class="chart__grid">${ticks.map(() => '<i></i>').join('')}</div>`;
    const cols = document.createElement('div');
    cols.className = 'chart__cols';

    DATA.forEach(([send, recv], i) => {
      const total = send + recv;
      const col = document.createElement('button');
      col.type = 'button';
      col.className = 'chart__col';
      col.setAttribute('aria-label', `${MONTHS[i]}: sent ${money(send)}, received ${money(recv)}`);
      const bar = document.createElement('span');
      bar.className = 'chart__bar';
      bar.style.height = `${(total / max) * 100}%`;
      bar.innerHTML = `<span class="s" style="flex:${send}"></span><span class="r" style="flex:${recv}"></span>`;
      col.appendChild(bar);
      cols.appendChild(col);
    });
    plot.appendChild(cols);

    const x = document.createElement('div');
    x.className = 'chart__x';
    x.innerHTML = MONTHS.map((m) => `<span>${m}</span>`).join('');

    root.append(y, plot, x);

    if (mini) {
      // highlight one bar for visual rhythm, no tooltip
      cols.children[5].classList.add('is-active');
      return;
    }

    const tip = document.createElement('div');
    tip.className = 'chart__tip';
    plot.appendChild(tip);

    const show = (i) => {
      $$('.chart__col', cols).forEach((c, idx) => c.classList.toggle('is-active', idx === i));
      const col = cols.children[i];
      const bar = col.firstElementChild;
      const [send, recv] = DATA[i];
      tip.innerHTML = `<small>${MONTHS[i]} 10, 2024</small><b>${money(send)}</b><br><b style="opacity:.85">${money(recv)}</b>`;
      const left = col.offsetLeft + col.offsetWidth / 2;
      const top = plot.clientHeight - bar.offsetHeight;
      // keep the tooltip inside the plot horizontally
      const half = tip.offsetWidth / 2;
      tip.style.left = `${Math.min(Math.max(left, half), plot.clientWidth - half)}px`;
      tip.style.top = `${Math.max(top, tip.offsetHeight + 12)}px`;
    };
    cols.addEventListener('pointerover', (e) => {
      const col = e.target.closest('.chart__col');
      if (col) show([...cols.children].indexOf(col));
    });
    cols.addEventListener('focusin', (e) => {
      const col = e.target.closest('.chart__col');
      if (col) show([...cols.children].indexOf(col));
    });
    show(5);
    if ('ResizeObserver' in window) new ResizeObserver(() => show(Math.max(0, $$('.chart__col', cols).findIndex((c) => c.classList.contains('is-active'))))).observe(plot);
  }
  $$('[data-chart]').forEach(buildChart);

  /* ---------- Payment gateway tiles (decorative) ---------- */
  const gw = $('[data-gateway]');
  if (gw) {
    const icons = ['card', 'wallet', 'bank', 'qr', 'globe', 'coins', 'receipt', 'phone', 'zap', 'shield'];
    const NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 21; i++) {
      const tile = document.createElement('div');
      tile.className = 'gw__tile';
      if (i !== 10) {
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'ic');
        const use = document.createElementNS(NS, 'use');
        use.setAttribute('href', `#i-${icons[(i * 3 + Math.floor(i / 7)) % icons.length]}`);
        svg.appendChild(use);
        tile.appendChild(svg);
      }
      gw.appendChild(tile);
    }
  }

  /* ---------- Pricing toggle ---------- */
  const billingBtns = $$('[data-billing]');
  const setBilling = (mode) => {
    billingBtns.forEach((b) => {
      const on = b.dataset.billing === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $$('.plan__amount').forEach((el) => { el.textContent = `$${el.dataset[mode]}`; });
    $$('.plan__per').forEach((el) => { el.textContent = mode === 'yearly' ? '/Month, billed yearly' : '/Month'; });
  };
  billingBtns.forEach((b) => b.addEventListener('click', () => setBilling(b.dataset.billing)));

  /* ---------- FAQ accordion ---------- */
  const accs = $$('[data-accordion] .acc');
  accs.forEach((acc) => {
    const btn = $('.acc__btn', acc);
    btn.addEventListener('click', () => {
      const willOpen = !acc.classList.contains('is-open');
      accs.forEach((a) => {
        const open = a === acc && willOpen;
        a.classList.toggle('is-open', open);
        $('.acc__btn', a).setAttribute('aria-expanded', String(open));
      });
    });
  });

  /* ---------- Dialog helpers ---------- */
  const openDialog = (dlg) => { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); };
  $$('dialog.modal').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  });

  /* ---------- Demo / product tour ---------- */
  const demo = $('#demo-dialog');
  const slides = $$('.tour__slide', demo);
  const dots = $$('.tour__dots button', demo);
  const nextBtn = $('[data-tour="next"]', demo);
  const prevBtn = $('[data-tour="prev"]', demo);
  let step = 0;
  const goStep = (n) => {
    step = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, i) => s.classList.toggle('is-active', i === step));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === step));
    prevBtn.disabled = step === 0;
    prevBtn.style.opacity = step === 0 ? '.45' : '1';
    nextBtn.textContent = step === slides.length - 1 ? 'Get started' : 'Next';
  };
  $$('[data-demo]').forEach((b) => b.addEventListener('click', () => { goStep(0); openDialog(demo); }));
  nextBtn.addEventListener('click', () => {
    if (step === slides.length - 1) { demo.close(); document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' }); } else goStep(step + 1);
  });
  prevBtn.addEventListener('click', () => goStep(step - 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goStep(i)));
  demo.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goStep(step + 1);
    if (e.key === 'ArrowLeft') goStep(step - 1);
  });
  goStep(0);

  /* ---------- Auth dialog (log in / sign up) ---------- */
  const auth = $('#auth-dialog');
  const authForm = $('#auth-form');
  const authTitle = $('#auth-title');
  const authSubmit = $('#auth-submit');
  const authError = $('#auth-error');
  const authPlan = $('#auth-plan');
  const nameField = $('.field--name', auth);
  const pwInput = $('input[name="password"]', auth);
  const tabs = $$('.auth__tabs button', auth);
  let mode = 'login';

  const setMode = (m) => {
    mode = m;
    const signup = m === 'signup';
    tabs.forEach((t) => { const on = t.dataset.tab === m; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); });
    authTitle.textContent = signup ? 'Create your account' : 'Welcome back';
    authSubmit.textContent = signup ? 'Create account' : 'Log in';
    nameField.hidden = !signup;
    pwInput.autocomplete = signup ? 'new-password' : 'current-password';
    authError.textContent = '';
    if (!signup) { authPlan.hidden = true; }
  };
  tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.tab)));

  $$('[data-auth]').forEach((b) => b.addEventListener('click', () => {
    setMenu(false);
    setMode(b.dataset.auth);
    if (b.dataset.plan) { authPlan.textContent = `Selected: ${b.dataset.plan}`; authPlan.hidden = false; }
    else authPlan.hidden = true;
    authForm.reset();
    $$('input', authForm).forEach((i) => i.classList.remove('is-invalid'));
    openDialog(auth);
  }));

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(authForm);
    const email = String(f.get('email') || '').trim();
    const pw = String(f.get('password') || '');
    const name = String(f.get('name') || '').trim();
    const emailInput = $('input[name="email"]', authForm);
    emailInput.classList.toggle('is-invalid', !emailOk(email));
    pwInput.classList.toggle('is-invalid', pw.length < 8);
    if (!emailOk(email)) { authError.textContent = 'Please enter a valid email address.'; emailInput.focus(); return; }
    if (pw.length < 8) { authError.textContent = 'Password must be at least 8 characters.'; pwInput.focus(); return; }
    authError.textContent = '';
    auth.close();
    toast(mode === 'signup' ? `Welcome to RichPath${name ? ', ' + name.split(' ')[0] : ''}! Your account is ready.` : 'Welcome back! You are logged in.');
  });

  /* ---------- Newsletter ---------- */
  const news = $('#newsletter');
  const newsInput = $('#news-email');
  const newsMsg = $('#news-msg');
  const defaultMsg = newsMsg.innerHTML;
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = newsInput.value.trim();
    if (!emailOk(v)) {
      newsInput.classList.add('is-invalid');
      newsMsg.className = 'news__msg is-error';
      newsMsg.textContent = 'Please enter a valid email address.';
      newsInput.focus();
      return;
    }
    newsInput.classList.remove('is-invalid');
    newsMsg.className = 'news__msg is-ok';
    newsMsg.textContent = `Thanks! ${v} is now subscribed.`;
    news.reset();
  });
  newsInput.addEventListener('input', () => {
    if (newsMsg.classList.contains('is-error') || newsMsg.classList.contains('is-ok')) {
      newsInput.classList.remove('is-invalid');
      newsMsg.className = 'news__msg';
      newsMsg.innerHTML = defaultMsg;
      $('[data-toast]', newsMsg)?.addEventListener('click', (ev) => { ev.preventDefault(); toast('Privacy Policy — coming soon'); });
    }
  });
})();
