// State lives in localStorage on the phone. Derived numbers (days, petals, bees, honey)
// are computed here so every screen agrees. Mirrors RegrowCore/RecoveryProgress.swift.
(function () {
  const KEY = 'regrow.v1';
  const DAY = 86400000;
  const JAR = 30; // £ of money kept per jar of honey

  const blank = () => ({
    profile: null,      // { name, packId, start, weeklySpend, frequency, why, triggers }
    clearOut: { stash: false, gear: false, contact: false, at: null },
    cravings: [],       // { at, outcome: 'beaten'|'used', intensity, tool, trigger, note, spend }
    sleep: [],          // { date: 'YYYY-MM-DD', hours, quality, dreams, wakes }
    checkIns: [],       // { at, period, mood, craving, triggers, note }
    journal: [],        // { at, prompt, text }
    rewards: [],        // { id, day, title, cost, claimed }
    customDistractions: [], // the user's own ideas, shown first in Distract me
    celebrated: [],     // milestone days already celebrated
    slipClearedAt: null // clear-out done after the latest slip
  });

  let state;
  try { state = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); }
  catch { state = blank(); }

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);

  function progress(now = Date.now()) {
    const p = state.profile;
    if (!p) return null;
    const elapsed = Math.max(0, daysBetween(p.start, now));
    const uses = state.cravings.filter(c => c.outcome === 'used' && c.at >= startOfDay(p.start) && c.at <= now);
    const useDays = new Set(uses.map(u => dayKey(u.at)));
    let good = 0;
    for (let i = 0; i <= elapsed; i++) if (!useDays.has(dayKey(startOfDay(p.start) + i * DAY + DAY / 2))) good++;
    // Milestones count completed good days, so today only counts once it's over.
    const cleanDays = good - (useDays.has(dayKey(now)) ? 0 : 1);
    const beaten = state.cravings.filter(c => c.outcome === 'beaten').length;
    const lastUse = uses.length ? Math.max(...uses.map(u => u.at)) : null;
    const spent = uses.reduce((s, u) => s + (u.spend || 0), 0);
    const money = Math.max(0, p.weeklySpend / 7 * ((now - p.start) / DAY) - spent);
    const petals = good === 0 ? 0 : (good % 14 === 0 ? 14 : good % 14);
    const bonusJars = (state.clearOut.gear ? 1 : 0) + (state.clearOut.contact ? 1 : 0);

    // Foraging: after a slip the bees fly off and return over the next 3 good days (2 if you clear out again).
    let away = 0;
    if (lastUse) {
      const goodSince = Math.max(0, daysBetween(lastUse, now));
      const returnDays = state.slipClearedAt && state.slipClearedAt > lastUse ? 2 : 3;
      const fractionBack = Math.min(1, goodSince / returnDays);
      away = Math.round(beaten * 0.85 * (1 - fractionBack));
    }
    const dayIndex = elapsed;
    const season = (dayIndex % 90) < 30 ? 'spring' : (dayIndex % 90) < 60 ? 'summer' : 'autumn';

    return {
      dayNumber: elapsed + 1,
      goodDays: good,
      cleanDays: Math.max(0, cleanDays),
      beaten,
      bees: beaten - away,
      away,
      foraging: away > 0,
      money,
      jars: Math.floor(money / JAR) + bonusJars,
      petals,
      blooms: good > 0 ? Math.floor((good - 1) / 14) : 0,
      grown: Math.max(0, cleanDays),
      trees: Math.max(0, Math.min(10, Math.floor(cleanDays / 3))),
      drooping: lastUse ? now - lastUse < DAY : false,
      lastUse,
      season,
      hiveLocked: !state.clearOut.stash,
      isNight: (() => { const h = new Date(now).getHours(); return h >= 21 || h < 5; })(),
    };
  }

  function humanDuration(days) {
    if (days < 7) return `${days} day${days === 1 ? '' : 's'}`;
    if (days < 30) {
      const w = Math.floor(days / 7), d = days % 7;
      return `${w} week${w === 1 ? '' : 's'}${d ? `, ${d} day${d === 1 ? '' : 's'}` : ''}`;
    }
    if (days < 365) {
      const m = Math.floor(days / 30.44), w = Math.floor((days - m * 30.44) / 7);
      return `${m} month${m === 1 ? '' : 's'}${w ? `, ${w} week${w === 1 ? '' : 's'}` : ''}`;
    }
    const y = Math.floor(days / 365.25), m = Math.floor((days - y * 365.25) / 30.44);
    return `${y} year${y === 1 ? '' : 's'}${m ? `, ${m} month${m === 1 ? '' : 's'}` : ''}`;
  }

  function nextMilestone(goodDays) { return MILESTONES.find(m => m.d > goodDays) || null; }
  function pendingCelebration(goodDays) {
    return MILESTONES.filter(m => m.d <= goodDays && !state.celebrated.includes(m.d)).pop() || null;
  }

  function insights() {
    const logged = state.cravings.filter(c => c.intensity != null);
    if (logged.length < 5) return [];
    const out = [];
    const windows = { morning: 0, afternoon: 0, evening: 0, 'late at night': 0 };
    logged.forEach(c => { const h = new Date(c.at).getHours(); windows[h >= 5 && h < 12 ? 'morning' : h < 17 && h >= 12 ? 'afternoon' : h < 22 && h >= 17 ? 'evening' : 'late at night']++; });
    const [w, n] = Object.entries(windows).sort((a, b) => b[1] - a[1])[0];
    if (n / logged.length >= 0.4) out.push({ title: `Your cravings peak ${w === 'late at night' ? w : 'in the ' + w}`, body: `${n} of your last ${logged.length} cravings hit ${w === 'late at night' ? w : 'in the ' + w}.` });
    const tagged = logged.map(c => c.trigger).filter(Boolean);
    if (tagged.length >= 3) {
      const counts = {}; tagged.forEach(t => counts[t] = (counts[t] || 0) + 1);
      const [t, k] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (k >= 2) out.push({ title: `${t} is your biggest trigger`, body: `It's behind ${k} of the ${tagged.length} cravings you've tagged.`, tip: TRIGGER_TIPS[t] });
    }
    const beaten = logged.filter(c => c.outcome === 'beaten').length;
    out.push({ title: `You've ridden out ${Math.round(beaten / logged.length * 100)}% of cravings`, body: `${beaten} of ${logged.length}. Each one you ride out makes the next one weaker.` });
    return out;
  }

  window.Store = {
    get state() { return state; },
    save,
    reset() { state = blank(); save(); },
    progress, humanDuration, nextMilestone, pendingCelebration, insights, dayKey, daysBetween, JAR,
    pack() { return PACKS[(state.profile && state.profile.packId) || 'weed']; },
    update(fn) { fn(state); save(); },
  };
})();
