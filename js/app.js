// Regrow web app: screens, flows and interactions. Plain JS, no build step.
(function () {
  const $app = document.getElementById('app');
  const $overlay = document.getElementById('sheet-root');
  const S = () => Store.state;

  let tab = 'today';
  let overlay = null;           // { kind, ...data } for full-screen flows and sheets
  let fx = {};                  // one-shot animation flags for the next meadow render
  let timers = [];

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '£' + Math.round(n).toLocaleString('en-GB');
  const plural = (n, word, many) => `${n} ${n === 1 ? word : (many || word + 's')}`;
  const clearTimers = () => { timers.forEach(clearInterval); timers = []; };
  const todayKey = () => Store.dayKey(Date.now());
  const hour = () => new Date().getHours();

  const I = {
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V11"/><path d="M12 13c-4 0-6-3-6-7 4 0 6 3 6 7z"/><path d="M12 11c0-4 2-7 6-7 0 4-2 7-6 7z"/></svg>',
    path: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/></svg>',
    pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    waves: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c3-4 5-4 8 0s5 4 8 0 3-2 4-1"/><path d="M2 18c3-4 5-4 8 0s5 4 8 0"/></svg>',
    person: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
    gift: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#7A5F1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S10 8 12 8zm0 0c2-4 6-4 6-1.5S14 8 12 8z"/></svg>',
    jar: '<svg viewBox="0 0 24 24" fill="none" stroke="#7A5F1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="7" width="12" height="14" rx="3"/><path d="M8 7V4h8v3"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="#5E4E8C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="#7A5F1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="#7A5F1E" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="#3D5A63" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="#7A5F1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M9 9h6M9 13h4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="#5E4E8C"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
  };

  // Drawn faces for mood and sleep (no emoji)
  const FACE_TINTS = ['#F7C7B6', '#FBDDB0', '#FFF0C2', '#CFEFC9', '#A8E6A1'];
  function faceSVG(level) {
    const curve = (level - 3) * 3.6;
    return `<svg width="30" height="30" viewBox="0 0 30 30"><ellipse cx="8" cy="11" rx="1.7" ry="2" fill="#3B2F2A"/><ellipse cx="22" cy="11" rx="1.7" ry="2" fill="#3B2F2A"/><path d="M8.5 ${20.4 - curve * 0.3} Q15 ${20.4 + curve} 21.5 ${20.4 - curve * 0.3}" fill="none" stroke="#3B2F2A" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
  const faces = (field, value, labels) => `<div class="faces">${labels.map((l, i) => `<button class="face ${value === i + 1 ? 'on' : ''}" data-act="set" data-field="${field}" data-value="${i + 1}" aria-label="${l}" aria-pressed="${value === i + 1}"><i style="background:${FACE_TINTS[i]}">${faceSVG(i + 1)}</i>${l}</button>`).join('')}</div>`;

  function meadow(p, opts = {}) {
    const night = opts.night ?? p.isNight;
    const svg = meadowSVG({ ...p, night, label: meadowLabel(p, night), arriving: fx.arriving, newPetal: fx.newPetal, ...opts });
    return svg;
  }

  // ---------- render ----------
  function render() {
    clearTimersIfIdle();
    if (!S().profile) { document.body.classList.remove('night'); $app.innerHTML = onboarding(); $overlay.innerHTML = ''; bindInputs(); return; }
    const p = Store.progress();
    const night = tab === 'tonight';
    document.body.classList.toggle('night', night && !overlay);
    const screen = { today, journey, body, tonight }[tab](p);
    $app.innerHTML = screen + tabbar(night) + (tab === 'today' || tab === 'tonight' ? sosDock(night) : '');
    $overlay.innerHTML = overlay ? renderOverlay(p) : '';
    bindInputs();
    fx = {};
    if (!overlay && tab === 'today') {
      const due = Store.pendingCelebration(p.cleanDays);
      if (due) { overlay = { kind: 'celebrate', milestone: due }; setTimeout(render, 600); }
    }
  }
  function clearTimersIfIdle() { if (!overlay || !['craving', 'breathe'].includes(overlay.kind)) clearTimers(); }

  function tabbar(night) {
    const t = (id, label, icon) => `<button class="${tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}" aria-current="${tab === id ? 'page' : 'false'}">${icon}${label}</button>`;
    return `<nav class="tabbar ${night ? 'night' : ''}" aria-label="Main">${t('today', 'Today', I.leaf)}${t('journey', 'Journey', I.path)}${t('body', 'Body', I.pulse)}${t('tonight', 'Tonight', I.moon)}</nav>`;
  }
  const sosDock = (night) => `<button class="moment ${night ? 'night' : ''}" data-act="craving" aria-label="Need a moment: open the breathing and craving tools">${I.waves} Need a moment</button>`;

  // ---------- Today ----------
  function today(p) {
    const s = S(), pack = Store.pack();
    const next = Store.nextMilestone(p.cleanDays);
    const nextReward = next && s.rewards.find(r => r.day === next.d && !r.claimed);
    const h = hour();
    const greet = h < 5 ? 'Still up' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
    const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const nextLine = next ? `${plural(next.d - p.cleanDays, 'day')} to ${next.t}${nextReward ? ` · ${esc(nextReward.title.toLowerCase())} waiting` : ''}` : '';
    const milestone = pack.timeline.filter(m => m.day <= p.dayNumber - 1).pop() || pack.timeline[0];
    const period = h < 15 ? 'morning' : 'evening';
    const checked = s.checkIns.some(c => c.period === period && Store.dayKey(c.at) === todayKey());
    const ins = Store.insights();
    const lastSleep = s.sleep[s.sleep.length - 1];
    const label = p.hiveLocked ? ['Your meadow', 'Hive locked until you clear out'] : p.foraging ? ['Your bees are out foraging', "They'll be back over the next few good days"] : [`${p.season[0].toUpperCase() + p.season.slice(1)} meadow`, `${plural(p.petals, 'petal')} · ${plural(p.bees, 'bee')} in the hive`];

    return `<section class="screen">
      <div class="row between">
        <div class="stack" style="gap:0">
          <span class="small soft">${date}</span>
          <h1 class="display">${greet}, ${esc(s.profile.name)}</h1>
          ${nextLine ? `<button class="link" style="padding:2px 0" data-act="tab" data-tab="journey">${nextLine}</button>` : ''}
        </div>
        <div class="row" style="gap:8px;align-self:flex-start">
          <span class="daypill">Day ${p.dayNumber}</span>
          <button class="avatar" data-act="settings" aria-label="Settings and support">${I.person}</button>
        </div>
      </div>
      <div class="meadow" data-act="tab" data-tab="journey">${meadow(p)}<div class="label" aria-hidden="true"><b>${label[0]}</b><span>${label[1]}</span></div></div>
      ${p.hiveLocked ? `<button class="card lilac row" data-act="clearout"><span class="badge" style="background:#fff">${I.lock}</span><span class="stack" style="gap:2px"><b class="title" style="font-size:17px">Unlock your hive</b><span class="small">Clear out your stash and your bees can move in.</span></span></button>` : ''}
      ${p.foraging ? `<div class="card stack"><b class="title" style="font-size:18px">A rough one. That's okay.</b><span class="body" style="color:#5E5047">Nothing is lost: your ${plural(p.goodDays, 'good day')}, ${money(p.money)} of honey and every bee you've earned are still yours. ${p.away} are out foraging and coming home over the next few good days.</span>${s.slipClearedAt && s.slipClearedAt > p.lastUse ? '' : `<button class="btn small paper" data-act="clearout" data-slip="1">Clear out anything left over</button>`}</div>` : ''}
      <div class="grid3">
        <div class="tile butter"><b>${money(p.money)}</b><span>${plural(p.jars, 'jar')} of honey</span></div>
        <div class="tile mint"><b>${p.beaten}</b><span>${p.beaten === 1 ? 'craving beaten' : 'cravings beaten'}</span></div>
        <div class="tile lilac"><b>${p.goodDays}</b><span>${p.goodDays === 1 ? 'good day' : 'good days'}</span></div>
      </div>
      ${checked ? '' : `<button class="card row" data-act="checkin" data-period="${period}"><span class="badge" style="background:var(--butter)">${period === 'morning' ? I.sun : I.moon.replace('currentColor', '#7A5F1E')}</span><span class="stack" style="gap:2px;flex:1"><b style="font-size:17px">${period === 'morning' ? 'Morning check-in' : 'Evening check-in'}</b><span class="small soft">${period === 'morning' ? 'How you slept and how you feel. 20 seconds.' : 'How today went. 20 seconds.'}</span></span><span aria-hidden="true">›</span></button>`}
      <div class="card row" style="align-items:flex-start"><span class="badge" style="background:var(--lilac)">${I.moon.replace('currentColor', '#5E4E8C')}</span><div class="stack" style="gap:4px"><span class="eyebrow" style="color:var(--lilac-ink)">Day ${p.dayNumber} in your body</span><b style="font-size:18px">${esc(milestone.title)}</b><span class="body" style="font-size:15px">${esc(milestone.body)}</span></div></div>
      ${lastSleep ? `<button class="card row" data-act="tab" data-tab="body"><span class="badge" style="background:var(--lilac)">${I.pulse.replace('currentColor', '#5E4E8C')}</span><span class="stack" style="gap:2px;flex:1"><span class="eyebrow" style="color:var(--lilac-ink)">Your sleep</span><b style="font-size:16px">${sleepSummary()}</b></span><span aria-hidden="true">›</span></button>` : ''}
      ${ins.length ? `<div class="card sky stack" style="gap:6px"><span class="row eyebrow" style="color:var(--sky-ink);gap:6px"><span style="width:16px;height:16px">${I.spark}</span>Pattern spotted</span><b style="font-size:18px">${esc(ins[0].title)}</b><span class="body" style="font-size:15px">${esc(ins[0].body)}</span>${ins[0].tip ? `<span class="body" style="font-size:15px;background:rgba(255,255,255,.7);border-radius:14px;padding:10px 12px">${esc(ins[0].tip)}</span>` : ''}</div>` : ''}
      <button class="card row" data-act="journal"><span class="badge" style="background:var(--butter)">${I.pen}</span><span class="stack" style="gap:2px;flex:1"><b style="font-size:17px">Journal</b><span class="small soft">${S().journal.length ? plural(S().journal.length, 'entry', 'entries') : JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length]}</span></span><span aria-hidden="true">›</span></button>
    </section>`;
  }

  function sleepSummary() {
    const recent = S().sleep.slice(-7);
    const dreams = recent.filter(x => x.dreams).length;
    const good = recent.filter(x => x.quality >= 4).length;
    return `${good} of the last ${recent.length} nights good${dreams ? ` · vivid dreams on ${dreams}` : ''}`;
  }

  // ---------- Journey ----------
  function journey(p) {
    const s = S();
    const seasonName = { spring: 'Spring · The thaw', summer: 'Summer · In full bloom', autumn: 'Autumn · The harvest' }[p.season];
    const dayInSeason = (p.dayNumber - 1) % 30 + 1;
    const visible = MILESTONES.filter(m => m.d <= Math.max(180, p.cleanDays + 120));
    const next = Store.nextMilestone(p.cleanDays);
    const rungs = visible.map(m => {
      const done = m.d <= p.cleanDays, isNext = next && next.d === m.d;
      const reward = s.rewards.find(r => r.day === m.d);
      return `<div class="rung ${done ? 'done' : ''} ${isNext ? 'next' : ''}">
        <div class="dot"><i>${done ? '✓' : ''}</i></div>
        <div class="stack" style="gap:6px;flex:1;padding-bottom:4px">
          <div class="row between"><b style="font-size:17px;${done || isNext ? '' : 'color:#5E5047'}">${m.t}</b><span class="small" style="color:${done ? 'var(--leaf-deep)' : isNext ? 'var(--coral-deep)' : 'var(--ink-muted)'}">${done ? 'Done' : isNext ? `${plural(m.d - p.cleanDays, 'day')} to go` : `Day ${m.d}`}</span></div>
          ${reward ? `<button class="reward ${reward.claimed ? 'claimed' : ''}" data-act="editreward" data-id="${reward.id}">${I.gift}<span class="stack" style="gap:0;flex:1"><b style="font-size:14px">${esc(reward.title)}</b><span class="small soft">${rewardNote(reward, p)}</span></span></button>` : (!done ? `<button class="link" style="padding:2px 0;font-size:14px" data-act="addreward" data-day="${m.d}">+ Add a reward</button>` : '')}
        </div></div>`;
    }).join('');
    const pack = Store.pack();
    const body = pack.timeline.map(m => {
      const done = m.day < p.dayNumber - 1, now = pack.timeline.filter(x => x.day <= p.dayNumber - 1).pop() === m;
      return `<div class="row" style="align-items:flex-start;opacity:${done || now ? 1 : .6}"><span class="small" style="width:56px;flex:none;color:${now ? 'var(--coral-deep)' : 'var(--ink-soft)'}">Day ${m.day + 1}</span><div class="stack" style="gap:2px"><b>${esc(m.title)}</b>${now ? `<span class="body" style="font-size:14px">${esc(m.body)}</span>` : ''}</div></div>`;
    }).join('');

    return `<section class="screen">
      <div class="row between" style="align-items:flex-end">
        <div class="stack" style="gap:0"><span class="small soft">Quitting ${pack.name.toLowerCase()}</span><span class="big" style="font-size:52px">Day ${p.dayNumber}</span><span class="small soft">${Store.humanDuration(p.dayNumber - 1 || 0) === '0 days' ? 'Your first day' : Store.humanDuration(p.dayNumber - 1)}</span></div>
        <div class="tile butter" style="align-items:flex-end"><span>Honey to spend</span><b>${money(p.money)}</b></div>
      </div>
      <div class="card stack" style="padding:0;overflow:hidden;gap:0">
        <div style="height:150px;overflow:hidden">${meadowSVG({ ...p, night: false, sprout: false, label: 'Your meadow this season' }).replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"')}</div>
        <div class="stack" style="padding:12px 16px 14px;gap:8px">
          <div class="row between"><b style="font-size:17px">${seasonName}</b><span class="small" style="color:var(--coral-deep)">Day ${dayInSeason} of 30</span></div>
          <div class="progressbar"><div style="width:${dayInSeason / 30 * 100}%"></div></div>
          <span class="small soft">Spring days 1–30, summer 31–60, autumn harvest 61–90.</span>
        </div>
      </div>
      <h2 class="title" style="margin-top:6px">Milestones</h2>
      <div class="ladder">${rungs}</div>
      <h2 class="title" style="margin-top:10px">What's happening in your body</h2>
      <div class="card stack" style="gap:12px">${body}</div>
    </section>`;
  }

  function projectedMoney(day) {
    const p = S().profile; return Math.max(0, p.weeklySpend / 7 * day);
  }
  function rewardNote(r, p) {
    if (r.claimed) return 'Treated yourself. Nice.';
    if (!r.cost) return `At ${MILESTONES.find(m => m.d === r.day)?.t || 'day ' + r.day}`;
    if (p.money >= r.cost) return `${money(r.cost)} · your honey already covers it`;
    return `${money(r.cost)} · about ${money(projectedMoney(r.day))} of honey by then`;
  }

  // ---------- Body ----------
  function body(p) {
    const s = S();
    const logged = s.sleep.find(x => x.date === todayKey());
    const recent = s.sleep.slice(-14);
    const dreams = recent.filter(x => x.dreams).length;
    const trend = recent.length >= 4 ? (avg(recent.slice(-3).map(x => x.quality)) - avg(recent.slice(0, 3).map(x => x.quality))) : 0;
    const marker = Math.min(30, p.dayNumber);
    const mx = 6 + (marker / 30) * 314;
    const my = remCurve(marker);
    return `<section class="screen">
      <div class="stack" style="gap:0"><span class="small soft">Logged by you</span><h1 class="display">Your sleep</h1></div>
      ${logged ? `<div class="card mint row"><b style="font-size:16px">Last night is logged.</b><span class="small" style="margin-left:auto">${logged.hours} hrs · ${logged.dreams ? 'vivid dreams' : 'no vivid dreams'}</span></div>`
        : `<button class="card row" data-act="checkin" data-period="morning"><span class="badge" style="background:var(--lilac)">${I.moon.replace('currentColor', '#5E4E8C')}</span><span class="stack" style="gap:2px;flex:1"><b style="font-size:17px">Log last night</b><span class="small soft">Hours, how you slept, dreams. A few taps.</span></span><span aria-hidden="true">›</span></button>`}
      <div class="card stack" style="gap:8px">
        <div class="row between"><span class="small soft">How you slept, last ${recent.length || 0} nights</span>${recent.length >= 4 ? `<b class="small" style="color:${trend >= 0 ? 'var(--leaf-deep)' : 'var(--ink-soft)'}">${trend > 0.3 ? 'Improving' : trend < -0.3 ? 'A rough patch' : 'Steady'}</b>` : ''}</div>
        ${recent.length ? `<div style="position:relative;height:104px">
          <div style="position:absolute;left:0;right:0;top:0;border-top:1px solid #F1EADF"></div><span class="small" style="position:absolute;left:0;top:-2px;font-size:10px;color:var(--ink-muted);background:#fff;padding-right:4px">Great</span>
          <div style="position:absolute;left:0;right:0;top:80px;border-top:1px solid #E2D5C3"></div><span class="small" style="position:absolute;left:0;top:66px;font-size:10px;color:var(--ink-muted);background:#fff;padding-right:4px">Awful</span>
          <div class="bars" style="position:absolute;left:44px;right:0;top:0;height:80px;grid-template-columns:repeat(${recent.length},minmax(0,1fr))">
            ${recent.map((x, i) => `<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:80px;gap:3px;border-radius:0" title="${x.date}: ${x.hours} hrs">${x.dreams ? '<span style="width:6px;height:6px;border-radius:50%;background:var(--coral)"></span>' : ''}<div style="width:min(18px,80%);height:${x.quality * 15}px;background:${i === recent.length - 1 ? '#5E4E8C' : '#A99AD6'}"></div></div>`).join('')}
          </div></div>
          <span class="row small soft" style="gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:var(--coral)"></span>Vivid dreams on ${dreams} of ${recent.length} nights</span>`
        : `<span class="body soft">Log a few mornings and your sleep chart appears here.</span>`}
      </div>
      <div class="card lilac stack" style="gap:6px">
        <div class="row between"><span class="eyebrow" style="color:var(--lilac-ink)">What's typically happening</span><span class="small" style="font-size:11px;color:var(--lilac-ink)">Typical pattern, not your data</span></div>
        <svg viewBox="0 0 326 92" style="width:100%;height:auto" role="img" aria-label="Typical REM sleep after stopping weed: a dip in the first nights, a rebound above normal around days 4 to 14, then back to normal by about four weeks. You are on day ${p.dayNumber}.">
          <line x1="0" y1="60" x2="326" y2="60" stroke="#B9A9E6" stroke-width="1"/>
          <text x="326" y="74" text-anchor="end" font-size="10" font-weight="800" fill="#5E4E8C">your normal</text>
          <path d="${remPath()}" fill="none" stroke="#7B68B5" stroke-width="2" stroke-linecap="round"/>
          <line x1="${mx}" y1="8" x2="${mx}" y2="86" stroke="#F26A44" stroke-width="1"/>
          <circle cx="${mx}" cy="${my}" r="5" fill="#F26A44" stroke="#ECE4FD" stroke-width="2"/>
          <text x="${mx > 240 ? mx - 6 : mx + 6}" y="12" text-anchor="${mx > 240 ? 'end' : 'start'}" font-size="11" font-weight="900" fill="#3B2F2A">You, day ${p.dayNumber}</text>
          <text x="0" y="90" font-size="10" font-weight="800" fill="#5E4E8C">Day 1</text><text x="326" y="90" text-anchor="end" font-size="10" font-weight="800" fill="#5E4E8C">Day 30</text>
        </svg>
        <span class="body" style="font-size:14px;font-weight:700">${p.dayNumber <= 3 ? 'Early on, REM is often disrupted while your body adjusts. Expect lighter, broken sleep for a few nights.' : p.dayNumber <= 16 ? 'Right now REM is usually rebounding, which is why dreams feel so vivid. It settles within a few weeks.' : 'By now REM is usually settling back to your normal. Vivid dreams should be easing off.'}</span>
      </div>
      <div class="card stack" style="gap:6px"><b>Got a WHOOP, Apple Watch or Oura?</b><span class="body soft" style="font-size:14px">The iPhone app reads real REM, heart rate and HRV from Apple Health. This test version uses your own logs.</span></div>
    </section>`;
  }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
  // A smooth, illustrative curve: dip days 1–3, rebound peak ~day 9, settle by ~day 28.
  function remCurve(day) {
    const dip = -10 * Math.exp(-Math.pow((day - 1.5) / 1.4, 2));
    const rebound = 42 * Math.exp(-Math.pow((day - 9) / 6, 2));
    return 60 - dip - rebound;
  }
  function remPath() { let d = ''; for (let i = 0; i <= 60; i++) { const day = i / 2; d += `${i ? 'L' : 'M'}${(6 + day / 30 * 314).toFixed(1)} ${remCurve(day).toFixed(1)}`; } return d; }

  // ---------- Tonight ----------
  function tonight(p) {
    const s = S();
    return `<section class="screen night">
      <div class="stack" style="gap:0"><span class="small soft">${p.isNight ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · Night ' + p.dayNumber : 'For tonight'}</span><h1 class="display">${p.isNight ? `Can't sleep, ${esc(s.profile.name)}?` : 'Wind down'}</h1></div>
      <div class="meadow" style="box-shadow:none">${meadow(p, { night: true })}</div>
      <p class="body" style="color:var(--night-text)">${p.dayNumber <= 21 ? 'Restless nights are normal in the first few weeks. Your sleep is recalibrating. It gets easier.' : 'Good sleep protects you from cravings. A calm routine helps.'}</p>
      <div class="grid2">
        ${nightTile('Slow breathing', '5 minutes, lights low', 'breathe')}
        ${nightTile('Brain dump', "Park tomorrow's worries", 'braindump')}
        ${nightTile("Why it's hard", '2 minute read', 'article')}
        ${nightTile('Journal', s.journal.length ? plural(s.journal.length, 'entry', 'entries') : 'A few lines before bed', 'journal')}
      </div>
    </section>`;
  }
  const nightTile = (t, sub, act) => `<button class="card stack" style="gap:6px;min-height:110px;box-shadow:0 4px 0 var(--night-deep)" data-act="${act}"><b style="font-size:16px;color:var(--moon)">${t}</b><span class="small" style="color:var(--night-soft)">${sub}</span></button>`;

  // ---------- Overlays ----------
  function renderOverlay(p) {
    const o = overlay;
    switch (o.kind) {
      case 'craving': return cravingFlow(p);
      case 'checkin': return checkInSheet();
      case 'settings': return settingsSheet(p);
      case 'clearout': return clearOutSheet(p);
      case 'reward': return rewardSheet(p);
      case 'celebrate': return celebrate(p);
      case 'journal': return journalView();
      case 'compose': return composeSheet();
      case 'braindump': return composeSheet(true);
      case 'article': return article();
      case 'breathe': return breathe();
      case 'support': return supportSheet(o.intro);
      case 'confirmreset': return `<div class="sheet-backdrop" data-act="close"><div class="sheet" data-stop><div class="grabber"></div><h2 class="display" style="font-size:24px">Start over?</h2><p class="body soft">This erases your meadow, logs and journal from this phone.</p><button class="btn" data-act="doreset">Erase everything</button><button class="quiet" data-act="close">Keep my meadow</button></div></div>`;
    }
    return '';
  }
  const sheet = (inner, night) => `<div class="sheet-backdrop" data-act="close"><div class="sheet ${night ? 'night' : ''}" data-stop role="dialog" aria-modal="true"><div class="grabber"></div>${inner}</div></div>`;
  const full = (inner, cls = '') => `<div class="full ${cls}" role="dialog" aria-modal="true"><div class="full-inner">${inner}</div></div>`;
  const closeBtn = () => `<button class="close" data-act="close" aria-label="Close">✕</button>`;

  // Craving flow
  function cravingFlow(p) {
    const o = overlay, pack = Store.pack();
    if (o.stage === 'intensity') {
      const labels = ['A flicker', 'Noticeable', 'Strong', 'Very strong', 'Overwhelming'];
      return full(`<div class="row between">${closeBtn()}<span></span></div>
        <div style="flex:1"></div>
        <svg width="90" height="90" viewBox="40 240 72 64" aria-hidden="true">${meadowSVG({ petals: 0, trees: 0, bees: 0, sprout: true }).match(/<g class="sprout[\s\S]*?<\/g>/)[0]}</svg>
        <h1 class="display" style="font-size:34px">I've got you.<br>How strong is it?</h1>
        <div class="stack">${labels.map((l, i) => `<button class="btn paper" style="justify-content:space-between" data-act="intensity" data-value="${i + 1}"><span>${l}</span><span>${[0, 1, 2, 3, 4].map(k => `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-left:3px;background:${k <= i ? 'var(--coral)' : 'var(--sand)'}"></span>`).join('')}</span></button>`).join('')}</div>
        <button class="quiet" data-act="intensity" data-value="">Skip, just help me</button>`, 'sky');
    }
    if (o.stage === 'ride') {
      const tools = [['wave', 'Ride the wave'], ['why', 'Hear your why'], ['tape', 'Play it forward'], ['distract', 'Distract me']];
      let content = '';
      if (o.tool === 'wave') content = `<div class="stack" style="gap:8px"><h1 class="display" style="font-size:32px">Let's ride this one out together.</h1><p class="body" style="color:var(--sky-ink)">Cravings rise, peak and fall like a wave. You don't have to fight it, just stay on the board.</p></div>${waveScene()}`;
      if (o.tool === 'why') content = `<span class="eyebrow" style="color:var(--sky-ink)">You told us, on day one</span><h1 class="display">“${esc(S().profile.why || 'I want to feel like myself again.')}”</h1><p class="body" style="color:var(--sky-ink)">That reason hasn't changed. The craving will pass. Your reason won't.</p>`;
      if (o.tool === 'tape') {
        const n = o.revealed || 1;
        content = `<h1 class="display">Play the tape forward.</h1>${pack.tapeForward.slice(0, n).map((t, i) => `<div class="card ${i === pack.tapeForward.length - 1 ? 'mint' : ''} row" style="align-items:flex-start;box-shadow:none"><b style="width:28px;height:28px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;background:${i === pack.tapeForward.length - 1 ? 'var(--leaf)' : 'var(--sky)'};color:${i === pack.tapeForward.length - 1 ? '#fff' : 'var(--sky-ink)'}">${i + 1}</b><b style="font-size:17px">${t}</b></div>`).join('')}${n < pack.tapeForward.length ? `<button class="btn small paper" style="align-self:flex-start" data-act="tapemore">Then what?</button>` : ''}`;
      }
      if (o.tool === 'distract') {
        const mine = S().customDistractions;
        const ideas = o.ideas || pack.distractions.slice().sort(() => Math.random() - .5).slice(0, mine.length ? 2 : 3);
        o.ideas = ideas;
        content = `<h1 class="display">Change the channel.</h1><p class="body" style="color:var(--sky-ink)">Pick one and do it right now. A few minutes of moving your body or your focus lets the craving pass.</p>
          ${mine.length ? `<span class="eyebrow" style="color:var(--sky-ink)">Your ideas</span>${mine.map(t => `<div class="card mint row" style="box-shadow:none"><b style="font-size:17px">→ ${esc(t)}</b></div>`).join('')}<span class="eyebrow" style="color:var(--sky-ink)">Or try</span>` : ''}
          ${ideas.map(t => `<div class="card row" style="box-shadow:none"><b style="font-size:17px">→ ${t}</b></div>`).join('')}
          <button class="btn small paper" style="align-self:flex-start" data-act="shuffle">Shuffle</button>
          <div class="row" style="gap:8px"><input class="field" style="font-size:16px;padding:12px 14px" placeholder="Add your own, e.g. peppermint tea" data-model="newIdea" value="${esc(o.newIdea || '')}"><button class="btn small green" style="flex:none" data-act="addidea">Add</button></div>`;
      }
      return full(`<div class="row between">${closeBtn()}<span class="card row small" style="padding:10px 16px;border-radius:999px" id="countdown">1:30 left</span></div>
        <div class="stack" style="flex:1;gap:14px">${content}</div>
        <div class="card stack" style="border-radius:28px;gap:12px"><span class="eyebrow soft">${o.tool === 'wave' ? 'Or try' : 'Tools'}</span>
          <div class="wrap">${tools.filter(t => t[0] !== o.tool).map(t => `<button class="chip" data-act="tool" data-tool="${t[0]}">${t[1]}</button>`).join('')}</div>
          <button class="btn green" data-act="beaten">I rode it out</button>
          <button class="quiet" data-act="used">I used, and that's okay. Log it</button></div>`, 'sky');
    }
    if (o.stage === 'beaten') {
      return full(`<div class="meadow">${meadow(p)}</div>
        <h1 class="big" style="font-size:36px">You rode it out.</h1>
        <p class="body soft">A new ${p.isNight ? 'firefly' : 'bee'} just joined your meadow. That's ${plural(p.beaten, 'craving')} beaten. Each one makes the next one weaker.</p>
        <span class="eyebrow soft">What set it off? (optional)</span>
        <div class="wrap">${pack.triggers.map(t => `<button class="chip ${o.trigger === t ? 'on' : ''}" data-act="settrigger" data-value="${esc(t)}">${t}</button>`).join('')}</div>
        <div style="flex:1"></div><button class="btn green" data-act="close">Done</button>`);
    }
    if (o.stage === 'used') {
      return full(`<h1 class="display" style="margin-top:20px">Thanks for being honest.</h1>
        <p class="body soft">This doesn't undo anything. Your ${plural(p.goodDays, 'good day')} and ${plural(p.beaten, 'bee')} are all still yours. Your bloom rests for a day, and your bees will come back over the next few good days.</p>
        <span class="eyebrow soft">What was going on?</span>
        <div class="wrap">${pack.triggers.map(t => `<button class="chip lilac ${o.trigger === t ? 'on' : ''}" data-act="settrigger" data-value="${esc(t)}">${t}</button>`).join('')}</div>
        ${o.trigger && TRIGGER_TIPS[o.trigger] ? `<div class="card butter row" style="align-items:flex-start"><span class="badge" style="background:#fff">${I.bulb}</span><span class="stack" style="gap:2px"><b>For next time</b><span class="body" style="font-size:15px">${TRIGGER_TIPS[o.trigger]}</span></span></div>` : ''}
        <span class="eyebrow soft">Spent anything? (optional)</span>
        <input class="field" inputmode="decimal" placeholder="£0" data-model="spend" value="${esc(o.spend || '')}">
        <span class="eyebrow soft">Anything to remember? (optional)</span>
        <textarea class="field" style="min-height:80px" placeholder="e.g. Friday after work, bored and on my own" data-model="note">${esc(o.note || '')}</textarea>
        <button class="btn" data-act="saveused">Save and keep going</button>`);
    }
    return '';
  }

  function waveScene() {
    return `<div style="position:relative;height:260px;margin:0 -22px">
      <svg viewBox="0 0 390 260" style="width:100%;height:100%;overflow:visible" aria-label="Your sprout surfing a gentle wave" role="img">
        <g class="swell2"><path d="M-40 110 C 30 70, 80 70, 140 102 S 260 140, 320 94 S 420 70, 440 90 V260 H-40Z" fill="#A9DCEA"/></g>
        <g class="swell"><path d="M-40 160 C 40 110, 110 80, 190 86 C 250 90, 270 130, 330 140 S 420 130, 440 126 V260 H-40Z" fill="#6EC1DB"/>
          <path d="M150 102 c 14 -6 30 -6 44 0" fill="none" stroke="#FFF" stroke-width="4" stroke-linecap="round"/></g>
        <g class="ride"><path d="M148 84 Q190 96 234 82 Q238 89 230 93 Q190 103 150 92 Q144 88 148 84Z" fill="#FFD45C"/>
          <path d="M190 44 c-3 -12 -14 -16 -22 -14 c2 10 12 15 22 14z" fill="#4FB466"/><path d="M190 44 c3 -12 14 -16 22 -14 c-2 10 -12 15 -22 14z" fill="#6BCB7C"/>
          <rect x="171" y="42" width="38" height="40" rx="19" fill="#A8E6A1"/>
          <path d="M180 58 q3 -3 6 0 M194 58 q3 -3 6 0 M184 67 q6 5 12 0" fill="none" stroke="#3B2F2A" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M171 62 l-14 -10 M209 62 l14 -12" stroke="#A8E6A1" stroke-width="5" stroke-linecap="round"/></g>
      </svg>
      <div id="breath" class="card breath" style="position:absolute;left:50%;top:170px;transform:translateX(-50%);border-radius:999px;padding:12px 24px;font-weight:900;font-size:19px;white-space:nowrap;box-shadow:0 8px 20px rgba(59,47,42,.12)">Breathe in… 4</div>
    </div>`;
  }

  function startCravingTimers() {
    clearTimers();
    const start = Date.now();
    timers.push(setInterval(() => {
      const t = (Date.now() - start) / 1000;
      const left = Math.max(0, 90 - Math.floor(t));
      const cd = document.getElementById('countdown');
      if (cd) cd.textContent = left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left` : 'You made it to 90s';
      const b = document.getElementById('breath');
      if (b) {
        const c = t % 10, inhaling = c < 4;
        b.textContent = inhaling ? `Breathe in… ${Math.ceil(4 - c)}` : `And out… ${Math.ceil(10 - c)}`;
        b.style.transform = `translateX(-50%) scale(${inhaling ? 1.08 : 1})`;
      }
    }, 250));
  }

  function checkInSheet() {
    const o = overlay, pack = Store.pack();
    const morning = o.period === 'morning';
    const hrs = ['<5', '5–6', '6–7', '7–8', '8+'];
    return sheet(`<div class="row between"><h2 class="display" style="font-size:26px">${morning ? `Morning, ${esc(S().profile.name)}` : 'How was today?'}</h2>${closeBtn()}</div>
      ${morning ? `<b>How many hours did you sleep?</b><div class="grid3" style="grid-template-columns:repeat(5,1fr);gap:6px">${hrs.map(h => `<button class="chip sun ${o.hours === h ? 'on' : ''}" style="padding:0" data-act="set" data-field="hours" data-value="${h}">${h}</button>`).join('')}</div>
        <b>How did you sleep?</b>${faces('quality', o.quality, ['Awful', 'Poor', 'OK', 'Good', 'Great'])}
        <div class="grid2"><button class="chip butter ${o.dreams ? 'on' : ''}" data-act="toggle" data-field="dreams">Vivid dreams</button><button class="chip" data-act="cyclewakes">Woke up: ${['never', 'once', 'twice', '3+ times'][o.wakes || 0]}</button></div>` : ''}
      <b>${morning ? 'How are you feeling?' : 'How are you feeling now?'}</b>${faces('mood', o.mood, ['Rough', 'Low', 'OK', 'Good', 'Great'])}
      <b>${morning ? 'Cravings right now' : 'Cravings today'}</b>
      <div class="grid3" style="grid-template-columns:repeat(5,1fr);gap:6px">${['None', 'Mild', 'Some', 'Strong', 'Intense'].map((l, i) => `<button class="chip sun ${o.craving === i ? 'on' : ''}" style="padding:0;font-size:13px" data-act="set" data-field="craving" data-value="${i}">${l}</button>`).join('')}</div>
      ${!morning || (o.craving || 0) >= 2 ? `<b>Anything stand out?</b><div class="wrap">${pack.triggers.map(t => `<button class="chip ${(o.triggers || []).includes(t) ? 'on' : ''}" data-act="toggletrigger" data-value="${esc(t)}">${t}</button>`).join('')}</div>` : ''}
      <textarea class="field" style="min-height:70px" placeholder="${morning ? "Today I'm going to…" : 'Today I noticed…'}" data-model="note">${esc(o.note || '')}</textarea>
      <button class="btn green" data-act="savecheckin">Save check-in</button>`);
  }

  function clearOutSheet(p) {
    const o = overlay, pack = Store.pack();
    const c = o.slip ? o.local : S().clearOut;
    const item = (k, title, detail, tag, required) => `<button class="option ${c[k] ? 'on' : ''}" data-act="toggleclear" data-key="${k}" aria-pressed="${c[k]}"><span class="stack" style="gap:0"><b style="font-size:16px">${title}</b><span class="small soft">${detail}</span></span><span class="small" style="margin-left:auto;color:${required ? 'var(--coral-deep)' : 'var(--butter-ink)'};white-space:nowrap">${tag}</span><span class="tick" style="margin-left:8px">${c[k] ? '✓' : ''}</span></button>`;
    return sheet(`<div class="row between"><span class="eyebrow" style="color:${o.slip ? 'var(--lilac-ink)' : 'var(--coral-deep)'}">${o.slip ? 'After a slip · no judgement' : 'One more step'}</span>${closeBtn()}</div>
      <h2 class="display">Clear it out</h2>
      <p class="body soft">If it's not in the house, a craving has nowhere to go. ${o.slip ? 'Clearing out what\'s left brings your bees home faster.' : 'Your hive opens once your stash is gone.'}</p>
      ${item('stash', `I've binned or flushed my ${pack.stash}`, o.slip ? 'Anything left over, all of it' : 'All of it, including the emergency bit', o.slip ? 'Bees home faster' : p.hiveLocked ? 'Unlocks hive' : 'Done', true)}
      ${item('gear', 'Gear is gone too', pack.gear, '+1 jar of honey')}
      ${item('contact', "Deleted my dealer's number", 'Blocking works even better', '+1 jar of honey')}
      <button class="btn ${c.stash ? 'green' : ''}" ${c.stash ? '' : 'disabled'} data-act="finishclear">${c.stash ? (o.slip ? 'Done, call my bees home' : 'Open my hive') : 'Bin it first to open the hive'}</button>
      <button class="quiet" data-act="close">Not yet</button>`);
  }

  function rewardSheet(p) {
    const o = overlay;
    const options = MILESTONES.filter(m => m.d > p.cleanDays).slice(0, 6);
    const day = o.day || options[0]?.d;
    const cost = parseFloat(String(o.cost || '').replace(/[^0-9.]/g, '')) || 0;
    const projected = projectedMoney(day);
    const note = !cost ? 'Add a rough cost and we\'ll check it against your honey.' : projected >= cost ? `You'll have about ${money(projected)} of honey by then. ${money(cost)} is covered, with ${money(projected - cost)} to spare.` : `You'll have about ${money(projected)} of honey by then. Worth saving it for a later milestone?`;
    return sheet(`<div class="row between"><h2 class="display" style="font-size:26px">Promise yourself something</h2>${closeBtn()}</div>
      <b>What's the treat?</b>
      <input class="field" placeholder="Steak dinner, done properly" data-model="title" value="${esc(o.title || '')}">
      <div class="wrap">${['New trainers', 'Gig tickets', 'A day off, no plans', 'Weekend away', 'Steak dinner'].map(t => `<button class="chip" data-act="set" data-field="title" data-value="${t}">${t}</button>`).join('')}</div>
      <b>When you reach</b>
      <div class="wrap">${options.map(m => `<button class="chip sun ${day === m.d ? 'on' : ''}" data-act="set" data-field="day" data-value="${m.d}">${m.t}</button>`).join('')}</div>
      <b>Roughly what it costs <span class="soft">(optional)</span></b>
      <input class="field" inputmode="decimal" placeholder="£40" data-model="cost" value="${esc(o.cost || '')}">
      <div class="card butter row" style="align-items:flex-start"><span class="badge" style="background:#fff">${I.jar}</span><span class="body" style="font-size:14px;font-weight:700" id="honeynote">${note}</span></div>
      <button class="btn green" data-act="savereward">Save my reward</button>
      ${o.id ? '<button class="quiet" data-act="deletereward">Remove this reward</button>' : ''}`);
  }

  function celebrate(p) {
    const m = overlay.milestone;
    const reward = S().rewards.find(r => r.day === m.d && !r.claimed);
    const colors = ['#FFB59A', '#FF9E80', '#FFD45C', '#A8E6A1', '#C9B8F0'];
    const petals = Array.from({ length: 14 }, (_, i) => `<ellipse class="fallpetal" style="animation-delay:${(i * 0.37) % 5}s;transform-box:fill-box" cx="${20 + i * 26}" cy="0" rx="5" ry="10" fill="${colors[i % 5]}"/>`).join('');
    return full(`<div class="meadow" style="margin:0 -6px">${meadow(p, { night: false, petals: m.d % 14 === 0 ? 14 : p.petals, blooms: m.d % 14 === 0 ? Math.max(0, p.blooms - 1) : p.blooms })}<svg viewBox="0 0 390 300" style="position:absolute;inset:0;pointer-events:none" aria-hidden="true">${petals}</svg></div>
      <div class="stack" style="gap:4px"><span class="eyebrow" style="color:var(--coral-deep)">Milestone · ${m.t}</span><h1 class="big">${m.t[0].toUpperCase() + m.t.slice(1)}.</h1><p class="body soft">${MILESTONE_LINES[m.d] || 'Look how far you\'ve come.'}</p></div>
      ${reward ? `<div class="card butter stack" style="gap:4px;box-shadow:0 4px 0 var(--butter-deep)"><span class="eyebrow" style="color:var(--butter-ink)">You promised yourself</span><b style="font-size:22px">${esc(reward.title)}</b><span class="body" style="font-size:14px">${reward.cost ? `${money(reward.cost)} from your honey. You've got ${money(p.money)}${p.money >= reward.cost ? ', so go and enjoy it.' : '.'}` : 'Go and enjoy it. You earned this.'}</span></div>` : `<button class="card row" data-act="addreward" data-day="${Store.nextMilestone(p.cleanDays)?.d || ''}">${I.gift}<span class="stack" style="gap:2px"><b>Set a reward for ${Store.nextMilestone(p.cleanDays)?.t || 'your next milestone'}</b><span class="small soft">Something to look forward to.</span></span></button>`}
      <div class="grid3" style="text-align:center"><div><b style="font-size:20px">${p.goodDays}</b><br><span class="small soft">good days</span></div><div><b style="font-size:20px">${p.beaten}</b><br><span class="small soft">cravings beaten</span></div><div><b style="font-size:20px">${money(p.money)}</b><br><span class="small soft">kept</span></div></div>
      <div style="flex:1"></div>
      ${reward ? `<button class="btn green" data-act="claim" data-id="${reward.id}">I've treated myself</button><div class="row between"><button class="quiet" style="width:auto" data-act="celebrated">Save it for later</button><button class="link" data-act="share">Share my meadow</button></div>`
        : `<button class="btn green" data-act="celebrated">Keep growing</button><button class="link" style="align-self:center" data-act="share">Share my meadow</button>`}`);
  }

  function journalView() {
    const j = S().journal.slice().reverse();
    return full(`<div class="row between"><h1 class="display">Journal</h1>${closeBtn()}</div>
      <button class="card row" data-act="compose"><span class="badge" style="background:var(--butter)">${I.pen}</span><span class="stack" style="gap:2px"><b>${JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length]}</b><span class="small soft">Write a few lines</span></span></button>
      ${j.length ? j.map(e => `<div class="card stack" style="gap:4px"><span class="small soft">${new Date(e.at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>${e.prompt ? `<b class="soft" style="font-size:14px">${esc(e.prompt)}</b>` : ''}<span class="body">${esc(e.text)}</span></div>`).join('') : '<p class="body soft">Your entries will appear here. Only on this phone.</p>'}`);
  }

  function composeSheet(dump) {
    const prompt = dump ? 'Brain dump' : (overlay.prompt || JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length]);
    return sheet(`<div class="row between"><h2 class="display" style="font-size:24px">${dump ? 'Brain dump' : esc(prompt)}</h2>${closeBtn()}</div>
      ${dump ? '<p class="body" style="color:var(--night-text)">Everything on your mind, and anything you need to do tomorrow. Get it out of your head and onto the page, then let it go for tonight.</p>' : ''}
      <textarea class="field" style="min-height:180px" placeholder="${dump ? 'Tomorrow I need to…' : 'Start writing…'}" data-model="text" autofocus>${esc(overlay.text || '')}</textarea>
      <button class="btn ${dump ? 'sun' : 'green'}" data-act="savejournal" data-prompt="${esc(prompt)}">${dump ? 'Park it for tonight' : 'Save'}</button>`, dump);
  }

  function article() {
    const a = Store.pack().nightArticle;
    return full(`<div class="row between"><span></span>${closeBtn()}</div><h1 class="display">${a.title}</h1>${a.paragraphs.map(t => `<p class="body" style="font-size:18px;color:var(--night-text);line-height:1.55">${t}</p>`).join('')}`, 'night');
  }

  function breathe() {
    return full(`<div class="row between"><span></span>${closeBtn()}</div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px">
        <div style="position:relative;width:280px;height:280px;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(255,243,160,.08)"></div>
          <div id="orb" style="width:150px;height:150px;border-radius:50%;background:rgba(255,243,160,.2);transition:transform 4s ease-in-out"></div>
          <div style="position:absolute;width:60px;height:60px;border-radius:50%;background:rgba(255,243,160,.5);filter:blur(10px)"></div>
        </div>
        <h1 class="display" id="breathword">Breathe in</h1>
        <span class="body" style="color:var(--night-soft)" id="breathleft">5 min</span>
      </div>`, 'night');
  }
  function startBreatheTimers() {
    clearTimers();
    const start = Date.now(); let last = null;
    timers.push(setInterval(() => {
      const t = (Date.now() - start) / 1000, c = t % 11, inhaling = c < 4;
      if (inhaling !== last) {
        last = inhaling;
        const orb = document.getElementById('orb'), w = document.getElementById('breathword');
        if (orb) { orb.style.transition = `transform ${inhaling ? 4 : 7}s ease-in-out`; orb.style.transform = `scale(${inhaling ? 1.8 : 1})`; }
        if (w) w.textContent = inhaling ? 'Breathe in' : 'Slowly out';
      }
      const l = document.getElementById('breathleft');
      if (l) l.textContent = t < 300 ? `${Math.ceil((300 - t) / 60)} min` : 'Well done. Let sleep come.';
    }, 200));
  }

  function settingsSheet(p) {
    const s = S();
    return sheet(`<div class="row between"><h2 class="display" style="font-size:26px">Settings</h2>${closeBtn()}</div>
      <span class="eyebrow soft">Support, any time</span>
      ${SUPPORT.map(l => `<a class="card row" style="text-decoration:none;color:inherit" href="${l.tel ? 'tel:' + l.tel : 'sms:' + l.sms}"><span class="stack" style="gap:0;flex:1"><b>${l.name}</b><span class="small soft">${l.detail}</span></span><b style="color:var(--leaf)">${l.tel ? 'Call' : 'Text'}</b></a>`).join('')}
      <p class="small soft">Regrow is a self-help tool, not medical treatment. If you're struggling, talk to your GP or one of the services above.</p>
      <span class="eyebrow soft">Your plan</span>
      <div class="card stack" style="gap:6px"><span class="row between"><span class="soft">Quitting</span><b>${Store.pack().name}</b></span><span class="row between"><span class="soft">Started</span><b>${new Date(s.profile.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</b></span><span class="row between"><span class="soft">Weekly spend</span><b>${money(s.profile.weeklySpend)}</b></span><span class="row between"><span class="soft">Stash cleared</span><b>${s.clearOut.stash ? 'Yes' : 'Not yet'}</b></span></div>
      <span class="eyebrow soft">Your why</span><div class="card body">${esc(s.profile.why)}</div>
      <span class="eyebrow soft">Your distraction ideas</span>
      <div class="card stack" style="gap:8px">
        ${s.customDistractions.length ? s.customDistractions.map((t, i) => `<div class="row between"><b>${esc(t)}</b><button class="link" style="color:var(--ink-soft)" data-act="removeidea" data-i="${i}" aria-label="Remove ${esc(t)}">Remove</button></div>`).join('') : '<span class="small soft">Add things that work for you. They show first when you tap Distract me.</span>'}
        <div class="row" style="gap:8px"><input class="field" style="font-size:16px;padding:12px 14px" placeholder="e.g. Peppermint tea" data-model="newIdea" value="${esc(overlay.newIdea || '')}"><button class="btn small green" style="flex:none" data-act="addidea">Add</button></div>
      </div>
      ${s.clearOut.stash ? '' : '<button class="btn small paper" data-act="clearout">Clear out and unlock the hive</button>'}
      <p class="small soft">Everything stays on this phone. This is a test version, so all Regrow+ features are switched on.</p>
      <button class="quiet" style="color:var(--coral-deep)" data-act="confirmreset">Start over</button>`);
  }

  function supportSheet(intro) {
    return sheet(`<div class="row between"><h2 class="display" style="font-size:26px">You're not alone</h2>${closeBtn()}</div><p class="body">${intro}</p>
      ${SUPPORT.map(l => `<a class="card row" style="text-decoration:none;color:inherit" href="${l.tel ? 'tel:' + l.tel : 'sms:' + l.sms}"><span class="stack" style="gap:0;flex:1"><b>${l.name}</b><span class="small soft">${l.detail}</span></span><b style="color:var(--leaf)">${l.tel ? 'Call' : 'Text'}</b></a>`).join('')}`);
  }

  // ---------- Onboarding ----------
  let ob = { step: 'welcome', name: '', freq: 'daily', spend: 40, triggers: [], why: '', start: 0 };
  const OB_STEPS = ['welcome', 'name', 'usage', 'spend', 'triggers', 'why', 'safety', 'start', 'clearout', 'reveal'];

  function onboarding() {
    const pack = PACKS.weed;
    const i = OB_STEPS.indexOf(ob.step);
    const q = (t, sub) => `<div class="stack" style="gap:8px;margin-bottom:10px"><h1 class="display">${t}</h1>${sub ? `<p class="body soft">${sub}</p>` : ''}</div>`;
    const head = ob.step === 'welcome' || ob.step === 'reveal' ? '' : `<div class="row"><button class="close" style="box-shadow:none;background:none" data-act="obback" aria-label="Back">‹</button><div class="progressbar" style="flex:1"><div style="width:${i / (OB_STEPS.length - 1) * 100}%"></div></div></div>`;
    let body = '', cta = '';
    switch (ob.step) {
      case 'welcome':
        body = `<div class="meadow" style="height:340px;margin-top:10px">${meadowSVG({ petals: 1, trees: 0, bees: 0, hiveLocked: true, label: 'A bare meadow with one petal open' })}</div>
          <h1 class="big" style="margin-top:10px">Regrow</h1><p class="body soft" style="font-size:18px">Quit weed for good, one day at a time. Every good day, your meadow grows back a little more.</p>`;
        cta = `<button class="btn" data-act="obnext">Let's begin</button>`; break;
      case 'name':
        body = q('First up, what should we call you?', 'Just a first name or nickname. Nothing is shared.') + `<input class="field" style="font-size:24px" placeholder="Your name" data-ob="name" value="${esc(ob.name)}" autocomplete="given-name">`;
        cta = `<button class="btn" data-act="obnext" ${ob.name.trim() ? '' : 'disabled'} id="obcta">Continue</button>`; break;
      case 'usage':
        body = q('How often do you smoke at the moment?', 'Roughly is fine.') + pack.frequency.map(f => `<button class="option ${ob.freq === f.id ? 'on' : ''}" data-act="obset" data-field="freq" data-value="${f.id}"><b style="font-size:17px">${f.label}</b><span class="tick">${ob.freq === f.id ? '✓' : ''}</span></button>`).join('');
        cta = `<button class="btn" data-act="obnext">Continue</button>`; break;
      case 'spend':
        body = q('About how much do you spend a week?', "We'll show you the money you keep, adding up as you go.") + `<div class="big" style="text-align:center;font-size:56px" id="spendval">${money(ob.spend)}</div>
          <input type="range" min="0" max="200" step="5" value="${ob.spend}" data-ob="spend" style="width:100%;accent-color:var(--coral)" aria-label="Weekly spend">
          <div class="card butter row" style="box-shadow:none"><span class="badge" style="background:#fff">${I.jar}</span><span class="body" id="spendyear">That's ${money(ob.spend * 52)} a year, filling your hive with honey.</span></div>`;
        cta = `<button class="btn" data-act="obnext">Continue</button>`; break;
      case 'triggers':
        body = q('When do you usually feel like it?', 'Pick any that fit.') + `<div class="wrap">${pack.triggers.map(t => `<button class="chip ${ob.triggers.includes(t) ? 'on' : ''}" data-act="obtrigger" data-value="${esc(t)}">${t}</button>`).join('')}</div>`;
        cta = `<button class="btn" data-act="obnext">Continue</button>`; break;
      case 'why':
        body = q('Why now?', "In your own words. We'll remind you of this when a craving hits.") + `<textarea class="field" placeholder="I want to…" data-ob="why">${esc(ob.why)}</textarea>
          <div class="wrap">${['Sleep properly', 'A clearer head', 'Save money', 'Feel like myself again', 'Get my motivation back', 'For the people I love'].map(t => `<button class="chip butter" data-act="obwhy" data-value="${t}">${t}</button>`).join('')}</div>`;
        cta = `<button class="btn" data-act="obnext" ${ob.why.trim() ? '' : 'disabled'} id="obcta">Continue</button>`; break;
      case 'safety':
        body = q('Before we start') + `<div class="card row" style="align-items:flex-start"><span class="badge" style="background:var(--lilac)">${I.heart}</span><span class="body">${pack.safetyNote}</span></div>
          <div class="card row" style="align-items:flex-start"><span class="badge" style="background:var(--mint)">${I.leaf.replace('currentColor', '#4E6B55')}</span><span class="body">Regrow is a self-help tool, not medical treatment. Support lines are always one tap away in Settings.</span></div>`;
        cta = `<button class="btn" data-act="obnext">I understand</button>`; break;
      case 'start':
        body = q('When does your journey start?') + ['Today', 'I stopped yesterday', 'I stopped a few days ago'].map((l, k) => `<button class="option ${ob.start === k ? 'on' : ''}" data-act="obset" data-field="start" data-value="${k}"><b style="font-size:17px">${l}</b><span class="tick">${ob.start === k ? '✓' : ''}</span></button>`).join('');
        cta = `<button class="btn" data-act="obnext">Continue</button>`; break;
      case 'clearout':
        body = q('Clear it out', "If it's not in the house, a craving has nowhere to go. Your beehive opens once your stash is gone.") +
          [['stash', "I've binned or flushed my weed", 'All of it, including the emergency bit', 'Unlocks hive'], ['gear', 'Gear is gone too', pack.gear, '+1 jar'], ['contact', "Deleted my dealer's number", 'Blocking works even better', '+1 jar']]
            .map(([k, t, d, tag]) => `<button class="option ${ob[k] ? 'on' : ''}" data-act="obtoggle" data-field="${k}"><span class="stack" style="gap:0"><b style="font-size:16px">${t}</b><span class="small soft">${d}</span></span><span class="small" style="margin-left:auto;white-space:nowrap;color:${k === 'stash' ? 'var(--coral-deep)' : 'var(--butter-ink)'}">${tag}</span><span class="tick" style="margin-left:8px">${ob[k] ? '✓' : ''}</span></button>`).join('');
        cta = `<button class="btn ${ob.stash ? 'green' : ''}" data-act="obnext">${ob.stash ? 'Open my hive' : "I'll do it later"}</button>`; break;
      case 'reveal':
        body = `<div class="meadow" style="height:360px;margin-top:10px">${meadowSVG({ petals: ob.start === 0 ? 1 : ob.start === 1 ? 2 : 4, newPetal: true, trees: 0, bees: 0, hiveLocked: !ob.stash, jars: 0, label: 'Your new meadow' })}</div>
          <h1 class="display" style="margin-top:8px">This is your meadow, ${esc(ob.name.trim())}.</h1>
          <p class="body soft">Every good day opens a petal. Every craving you ride out brings a bee to your hive. Your money kept becomes honey. It never resets: a rough day just sends the bees out foraging for a while.</p>`;
        cta = `<button class="btn green" data-act="obfinish">Start growing</button>`; break;
    }
    return `<section class="screen" style="padding-bottom:calc(var(--safe-bottom) + 120px)">${head}<div class="stack" style="gap:12px">${body}</div></section>
      <div class="sos-dock" style="bottom:calc(var(--safe-bottom) + 8px)">${cta}</div>`;
  }

  // ---------- actions ----------
  const actions = {
    tab: (d) => { tab = d.tab; overlay = null; render(); window.scrollTo(0, 0); },
    close: () => {
      if (overlay?.kind === 'celebrate') return actions.celebrated();
      overlay = null; clearTimers(); render();
    },
    craving: () => { overlay = { kind: 'craving', stage: 'intensity' }; render(); },
    intensity: (d) => { overlay = { kind: 'craving', stage: 'ride', tool: 'wave', intensity: d.value ? +d.value : null, tools: ['wave'] }; render(); startCravingTimers(); },
    tool: (d) => { overlay.tool = d.tool; overlay.tools.push(d.tool); overlay.revealed = 1; overlay.ideas = null; render(); },
    addidea: () => {
      const t = (overlay.newIdea || '').trim(); if (!t) return;
      Store.update(s => { if (!s.customDistractions.includes(t)) s.customDistractions.push(t); });
      overlay.newIdea = ''; overlay.ideas = null; render();
    },
    removeidea: (d) => { Store.update(s => s.customDistractions.splice(+d.i, 1)); render(); },
    tapemore: () => { overlay.revealed = (overlay.revealed || 1) + 1; render(); },
    shuffle: () => { overlay.ideas = null; render(); },
    beaten: () => {
      clearTimers();
      const tool = [...new Set(overlay.tools)].join(',');
      Store.update(s => s.cravings.push({ at: Date.now(), outcome: 'beaten', intensity: overlay.intensity ?? 3, tool }));
      overlay = { kind: 'craving', stage: 'beaten', logIndex: S().cravings.length - 1 };
      fx.arriving = true; render();
    },
    used: () => { clearTimers(); overlay = { kind: 'craving', stage: 'used', intensity: overlay.intensity, tool: [...new Set(overlay.tools)].join(',') }; render(); },
    settrigger: (d) => {
      overlay.trigger = overlay.trigger === d.value ? null : d.value;
      if (overlay.stage === 'beaten') Store.update(s => { s.cravings[overlay.logIndex].trigger = overlay.trigger; });
      render();
    },
    saveused: () => {
      const o = overlay;
      const spend = parseFloat(String(o.spend || '').replace(/[^0-9.]/g, '')) || 0;
      Store.update(s => s.cravings.push({ at: Date.now(), outcome: 'used', intensity: o.intensity, tool: o.tool, trigger: o.trigger || null, note: (o.note || '').trim() || null, spend }));
      overlay = { kind: 'clearout', slip: true, local: { stash: false, gear: false, contact: false } }; render();
    },
    checkin: (d) => { overlay = { kind: 'checkin', period: d.period, mood: 0, quality: 0, craving: 0, triggers: [], wakes: 0, dreams: false }; render(); },
    set: (d) => { overlay[d.field] = /^\d+$/.test(d.value) ? +d.value : d.value; render(); },
    toggle: (d) => { overlay[d.field] = !overlay[d.field]; render(); },
    cyclewakes: () => { overlay.wakes = ((overlay.wakes || 0) + 1) % 4; render(); },
    toggletrigger: (d) => { const t = overlay.triggers; const k = t.indexOf(d.value); k >= 0 ? t.splice(k, 1) : t.push(d.value); render(); },
    savecheckin: () => {
      const o = overlay, now = Date.now();
      Store.update(s => {
        s.checkIns.push({ at: now, period: o.period, mood: o.mood || 3, craving: o.craving || 0, triggers: o.triggers, note: (o.note || '').trim() || null });
        if (o.period === 'morning' && (o.hours || o.quality)) {
          s.sleep = s.sleep.filter(x => x.date !== todayKey());
          s.sleep.push({ date: todayKey(), hours: o.hours || '6–7', quality: o.quality || 3, dreams: !!o.dreams, wakes: o.wakes || 0 });
          s.sleep.sort((a, b) => a.date.localeCompare(b.date));
        }
        if ((o.note || '').trim()) s.journal.push({ at: now, prompt: o.period === 'morning' ? 'Morning check-in' : 'Evening check-in', text: o.note.trim() });
      });
      overlay = null; render();
    },
    clearout: (d) => { overlay = { kind: 'clearout', slip: !!d.slip, local: { stash: false, gear: false, contact: false } }; render(); },
    toggleclear: (d) => {
      if (overlay.slip) overlay.local[d.key] = !overlay.local[d.key];
      else Store.update(s => { s.clearOut[d.key] = !s.clearOut[d.key]; if (d.key === 'stash' && s.clearOut.stash) s.clearOut.at = Date.now(); });
      render();
    },
    finishclear: () => {
      if (overlay.slip) {
        const l = overlay.local; if (!l.stash) return;
        Store.update(s => { s.slipClearedAt = Date.now(); s.clearOut.stash = true; if (l.gear) s.clearOut.gear = true; if (l.contact) s.clearOut.contact = true; });
      } else if (!S().clearOut.stash) return;
      overlay = null; render();
    },
    addreward: (d) => { overlay = { kind: 'reward', day: d.day ? +d.day : null }; render(); },
    editreward: (d) => { const r = S().rewards.find(x => x.id === d.id); if (r.claimed) return; overlay = { kind: 'reward', id: r.id, title: r.title, cost: r.cost ? String(r.cost) : '', day: r.day }; render(); },
    savereward: () => {
      const o = overlay; const title = (o.title || '').trim(); if (!title) return;
      const p = Store.progress();
      const day = o.day || MILESTONES.find(m => m.d > p.cleanDays).d;
      const cost = parseFloat(String(o.cost || '').replace(/[^0-9.]/g, '')) || 0;
      Store.update(s => { s.rewards = s.rewards.filter(r => r.id !== o.id && r.day !== day); s.rewards.push({ id: o.id || String(Date.now()), day, title, cost, claimed: false }); });
      overlay = null; render();
    },
    deletereward: () => { Store.update(s => { s.rewards = s.rewards.filter(r => r.id !== overlay.id); }); overlay = null; render(); },
    claim: (d) => { Store.update(s => { const r = s.rewards.find(x => x.id === d.id); if (r) r.claimed = true; }); actions.celebrated(); },
    celebrated: () => { const m = overlay.milestone; Store.update(s => { if (!s.celebrated.includes(m.d)) s.celebrated.push(m.d); }); overlay = null; render(); },
    share: () => {
      const p = Store.progress();
      const text = `Day ${p.dayNumber} on Regrow: ${p.beaten} cravings beaten and ${money(p.money)} kept. 🌼`;
      if (navigator.share) navigator.share({ text }).catch(() => {}); else navigator.clipboard?.writeText(text);
    },
    journal: () => { overlay = { kind: 'journal' }; render(); },
    compose: () => { overlay = { kind: 'compose' }; render(); },
    braindump: () => { overlay = { kind: 'braindump' }; render(); },
    savejournal: (d) => {
      const text = (overlay.text || '').trim();
      if (text) Store.update(s => s.journal.push({ at: Date.now(), prompt: d.prompt, text }));
      const crisis = CRISIS_TERMS.some(t => text.toLowerCase().includes(t));
      overlay = crisis ? { kind: 'support', intro: "It sounds like things are really hard right now. You don't have to deal with this alone. These people are there to listen, any time." } : (overlay.kind === 'compose' ? { kind: 'journal' } : null);
      render();
    },
    article: () => { overlay = { kind: 'article' }; render(); },
    breathe: () => { overlay = { kind: 'breathe' }; render(); startBreatheTimers(); },
    settings: () => { overlay = { kind: 'settings' }; render(); },
    confirmreset: () => { overlay = { kind: 'confirmreset' }; render(); },
    doreset: () => { Store.reset(); overlay = null; tab = 'today'; ob = { step: 'welcome', name: '', freq: 'daily', spend: 40, triggers: [], why: '', start: 0 }; render(); },

    // onboarding
    obnext: () => { const i = OB_STEPS.indexOf(ob.step); ob.step = OB_STEPS[Math.min(i + 1, OB_STEPS.length - 1)]; render(); window.scrollTo(0, 0); },
    obback: () => { const i = OB_STEPS.indexOf(ob.step); ob.step = OB_STEPS[Math.max(0, i - 1)]; render(); },
    obset: (d) => { ob[d.field] = /^\d+$/.test(d.value) ? +d.value : d.value; render(); },
    obtoggle: (d) => { ob[d.field] = !ob[d.field]; render(); },
    obtrigger: (d) => { const k = ob.triggers.indexOf(d.value); k >= 0 ? ob.triggers.splice(k, 1) : ob.triggers.push(d.value); render(); },
    obwhy: (d) => { ob.why = ob.why.trim() ? `${ob.why.trim().replace(/\.$/, '')}. ${d.value}` : d.value; render(); },
    obfinish: () => {
      const offset = [0, 1, 3][ob.start];
      const start = offset === 0 ? Date.now() : (() => { const d = new Date(); d.setDate(d.getDate() - offset); d.setHours(0, 0, 0, 0); return d.getTime(); })();
      Store.update(s => {
        s.profile = { name: ob.name.trim(), packId: 'weed', start, weeklySpend: ob.spend, frequency: ob.freq, why: ob.why.trim(), triggers: ob.triggers };
        s.clearOut = { stash: !!ob.stash, gear: !!ob.gear, contact: !!ob.contact, at: ob.stash ? Date.now() : null };
        s.celebrated = MILESTONES.filter(m => m.d <= offset).map(m => m.d);
      });
      tab = 'today'; render();
    },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.classList.contains('sheet-backdrop') && e.target.closest('[data-stop]')) return;
    e.preventDefault();
    const fn = actions[el.dataset.act];
    if (fn) fn({ ...el.dataset });
  });

  function bindInputs() {
    document.querySelectorAll('[data-model]').forEach(el => el.addEventListener('input', () => {
      if (!overlay) return;
      overlay[el.dataset.model] = el.value;
      if (overlay.kind === 'reward' && el.dataset.model === 'cost') {
        const n = document.getElementById('honeynote');
        const cost = parseFloat(el.value.replace(/[^0-9.]/g, '')) || 0;
        const projected = projectedMoney(overlay.day || MILESTONES.find(m => m.d > Store.progress().cleanDays).d);
        if (n) n.textContent = !cost ? "Add a rough cost and we'll check it against your honey." : projected >= cost ? `You'll have about ${money(projected)} of honey by then. ${money(cost)} is covered, with ${money(projected - cost)} to spare.` : `You'll have about ${money(projected)} of honey by then. Worth saving it for a later milestone?`;
      }
    }));
    document.querySelectorAll('[data-ob]').forEach(el => el.addEventListener('input', () => {
      const f = el.dataset.ob;
      ob[f] = f === 'spend' ? +el.value : el.value;
      if (f === 'spend') {
        document.getElementById('spendval').textContent = money(ob.spend);
        document.getElementById('spendyear').textContent = `That's ${money(ob.spend * 52)} a year, filling your hive with honey.`;
      }
      const cta = document.getElementById('obcta');
      if (cta) cta.disabled = !String(ob[f]).trim();
    }));
  }

  // Keep money ticking and night mode current
  setInterval(() => { if (!overlay && S().profile && document.visibilityState === 'visible') render(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !overlay) render(); });

  render();
})();
