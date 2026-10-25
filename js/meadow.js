// The meadow: regrowing landscape, data-driven bloom, beehive with honey, seasons.
// Returns an SVG string in a 390x330 design space. Port of R2-Meadow on the design canvas.
(function () {
  const SEASONS = {
    spring: { sky: '#CFEAF4', far: '#B5E2A8', mid: '#8FD18A', near: '#6BBF73', tree: '#5DB870', sun: '#FFD45C' },
    summer: { sky: '#BFE3F5', far: '#9AD58C', mid: '#74C26E', near: '#55AE5E', tree: '#3E9C5A', sun: '#FFC93C' },
    autumn: { sky: '#F6E3C7', far: '#E8C98A', mid: '#D9B26A', near: '#C79A52', tree: '#E0893F', sun: '#F7A94B' },
  };
  const NIGHT = { sky: '#2E2C55', far: '#3E4C72', mid: '#34436A', near: '#2B395C', tree: '#4C6E7A', sun: '#FFF3C4', trunk: '#3A3550', stem: '#5E9C78', leaf: '#5E9C78', ghost: '#5A5F8A' };
  const TREE_SPOTS = [[40,186,14],[262,178,13],[70,180,11],[110,182,12],[226,184,10],[20,196,9],[136,178,10],[360,180,11],[196,172,9],[90,192,8]];
  const FLOWER_SPOTS = [[40,300],[150,296],[262,292],[230,316],[110,316],[200,322],[20,316],[130,306]];
  const BLOOM_SPOTS = [[124,318],[214,320],[250,308],[30,300],[110,296],[236,292]];

  function sprout(mood) {
    const happy = mood === 'happy';
    return `<g class="sprout ${happy ? 'bob' : ''}">
      <ellipse cx="76" cy="300" rx="18" ry="4" fill="#2F2A26" opacity="0.12"/>
      <path d="M76 262 c-2 -10 -11 -13 -18 -11 c2 8 10 12 18 11z" fill="#4FB466"/>
      <path d="M76 262 c2 -10 11 -13 18 -11 c-2 8 -10 12 -18 11z" fill="#6BCB7C"/>
      <rect x="59" y="260" width="34" height="38" rx="17" fill="#A8E6A1"/>
      ${happy ? `<circle cx="70" cy="276" r="3" fill="#3B2F2A"/><circle cx="83" cy="276" r="3" fill="#3B2F2A"/>
        <path d="M71 284 q5 4 10 0" fill="none" stroke="#3B2F2A" stroke-width="2.2" stroke-linecap="round"/>
        <path class="wave-arm" d="M93 276 q8 -4 8 -14" fill="none" stroke="#A8E6A1" stroke-width="5" stroke-linecap="round"/>`
      : mood === 'sleeping' ? `<path d="M67 277 q3 2 6 0 M80 277 q3 2 6 0" fill="none" stroke="#3B2F2A" stroke-width="2" stroke-linecap="round"/>
        <text class="zz" x="98" y="258" font-family="Nunito, sans-serif" font-size="13" font-weight="900" fill="#FFF3C4">z</text>
        <text class="zz" x="108" y="246" font-family="Nunito, sans-serif" font-size="10" font-weight="900" fill="#FFF3C4" opacity="0.7">z</text>`
      : `<path d="M67 277 q3 2 6 0 M80 277 q3 2 6 0" fill="none" stroke="#3B2F2A" stroke-width="2" stroke-linecap="round"/>
        <path d="M72 285 h8" fill="none" stroke="#3B2F2A" stroke-width="2" stroke-linecap="round"/>`}
      <circle cx="65" cy="284" r="3" fill="#FF9E80" opacity="0.6"/><circle cx="88" cy="284" r="3" fill="#FF9E80" opacity="0.6"/>
    </g>`;
  }

  function bee(x, y, night, i, extraClass = '') {
    const delay = `${(i % 6) * 0.35}s`;
    if (night) return `<g class="hover ${extraClass}" style="animation-delay:${delay}"><circle class="glow" cx="${x}" cy="${y}" r="7" fill="#FFF3A0" opacity="0.4"/><circle cx="${x}" cy="${y}" r="2.4" fill="#FFF7C8"/></g>`;
    return `<g class="hover ${extraClass}" style="animation-delay:${delay}">
      <ellipse class="wing" cx="${x - 1}" cy="${y - 4}" rx="3.5" ry="2.5" fill="#FFFFFF" opacity="0.9"/>
      <ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.5" fill="#FFC93C"/>
      <rect x="${x - 0.8}" y="${y - 3.5}" width="1.6" height="7" fill="#4A3A30"/></g>`;
  }

  window.meadowSVG = function (o) {
    const night = !!o.night;
    const season = o.season || 'spring';
    const c = night ? NIGHT : { ...SEASONS[season], trunk: '#A7764F', stem: '#4FA864', leaf: season === 'autumn' ? '#8FAE52' : '#5DB870', ghost: season === 'autumn' ? '#C9A56A' : '#9CC9A0' };
    const petalCount = Math.max(0, Math.min(14, o.petals || 0));
    const petalColors = night ? ['#F5C2DA', '#E9A8C9'] : season === 'autumn' ? ['#F7B267', '#F79D65'] : season === 'summer' ? ['#FFC6A8', '#FF9E80'] : ['#FFB59A', '#FF9E80'];
    const step = 360 / 14;
    let s = `<svg viewBox="0 0 390 330" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${o.label || 'Your meadow'}">`;
    s += `<rect width="390" height="330" fill="${c.sky}"/>`;
    if (night) {
      s += '<g fill="#FFF3C4">' + [[40,40,1.4],[90,76,1],[150,30,1.3],[214,62,1],[252,24,1.4],[120,118,0.9],[186,96,1.1]].map(([x,y,r],i) => `<circle class="twinkle" style="animation-delay:${i*0.4}s" cx="${x}" cy="${y}" r="${r}"/>`).join('') + '</g>';
      s += `<circle cx="316" cy="62" r="24" fill="#FFF3C4"/><circle cx="328" cy="54" r="22" fill="${c.sky}"/>`;
    } else {
      s += `<circle class="pulse" cx="316" cy="62" r="44" fill="${c.sun}" opacity="0.3"/><circle cx="316" cy="62" r="26" fill="${c.sun}"/>`;
      s += `<g class="drift" fill="#FFFFFF" opacity="0.95"><ellipse cx="74" cy="62" rx="30" ry="12"/><ellipse cx="92" cy="54" rx="18" ry="12"/><ellipse cx="210" cy="40" rx="22" ry="9"/><ellipse cx="222" cy="34" rx="12" ry="8"/></g>`;
    }
    s += `<path d="M0 190 Q 80 140 170 172 T 390 156 V330 H0Z" fill="${c.far}"/>`;
    TREE_SPOTS.slice(0, o.trees || 0).forEach(([x, y, r], i) => {
      const fill = !night && season === 'autumn' && i % 2 ? '#C9662F' : c.tree;
      s += `<rect x="${x - 3}" y="${y - r}" width="6" height="${r + 8}" rx="3" fill="${c.trunk}"/><circle class="treesway" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${y - r}" r="${r}" fill="${fill}"/>`;
      if (!night && season === 'spring' && i % 2 === 0) s += `<circle cx="${x - r * 0.4}" cy="${y - r * 1.3}" r="2.6" fill="#FFD1DC"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.9}" r="2.6" fill="#FFFFFF"/>`;
    });
    s += `<path d="M0 236 Q 110 196 220 226 T 390 214 V330 H0Z" fill="${c.mid}"/>`;
    s += `<path d="M0 286 Q 120 252 250 276 T 390 268 V330 H0Z" fill="${c.near}"/>`;
    const flowerColors = night ? ['#C9B8F0'] : season === 'summer' ? ['#FFD45C', '#FF9E80', '#FFFFFF', '#FFC93C'] : season === 'autumn' ? ['#F7A94B', '#C9662F', '#FFD45C'] : ['#FF9E80', '#FFD45C', '#FFFFFF', '#C9B8F0'];
    FLOWER_SPOTS.slice(0, Math.ceil((o.trees || 0) * 0.8)).forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="3.5" fill="${flowerColors[i % flowerColors.length]}"/>`; });
    // Completed blooms become permanent wildflowers
    BLOOM_SPOTS.slice(0, o.blooms || 0).forEach(([x, y], i) => {
      s += `<path d="M${x} ${y + 14} V${y}" stroke="${c.stem}" stroke-width="2.5" stroke-linecap="round"/>`;
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; s += `<circle cx="${(x + Math.cos(a) * 5).toFixed(1)}" cy="${(y + Math.sin(a) * 5).toFixed(1)}" r="4" fill="${petalColors[i % 2]}"/>`; }
      s += `<circle cx="${x}" cy="${y}" r="3" fill="#FFD45C"/>`;
    });

    // Bloom
    s += `<g class="sway ${o.drooping ? 'droop' : ''}">`;
    s += `<path d="M170 300 C 167 260, 173 230, 170 196" fill="none" stroke="${c.stem}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M170 262 c -16 -2 -26 -12 -28 -22 c 14 -2 24 6 28 22z" fill="${c.leaf}"/><path d="M171 246 c 14 -4 24 -14 26 -24 c -14 0 -22 8 -26 24z" fill="${c.leaf}"/>`;
    for (let i = petalCount; i < 14; i++) s += `<ellipse cx="170" cy="162" rx="10" ry="22" fill="none" stroke="${c.ghost}" stroke-width="2" stroke-dasharray="3 4" transform="rotate(${i * step} 170 184)"/>`;
    for (let i = 0; i < petalCount; i++) s += `<ellipse class="${o.newPetal && i === petalCount - 1 ? 'petal-open' : ''}" cx="170" cy="162" rx="11" ry="23" fill="${petalColors[i % 2]}" opacity="${o.drooping ? 0.75 : 1}" transform="rotate(${i * step} 170 184)"/>`;
    s += `<circle cx="170" cy="184" r="15" fill="#FFD45C"/><circle cx="170" cy="184" r="13.5" fill="none" stroke="#F2B630" stroke-width="3"/></g>`;

    // Hive
    const hiveOpacity = o.hiveLocked ? 0.45 : o.foraging ? 0.7 : 1;
    s += `<g opacity="${hiveOpacity}"><rect x="311" y="262" width="8" height="34" rx="3" fill="#A7764F"/><rect x="290" y="258" width="50" height="8" rx="4" fill="#B98559"/>
      <ellipse cx="315" cy="248" rx="30" ry="11" fill="#E9B44C"/><ellipse cx="315" cy="236" rx="27" ry="11" fill="#F2C35E"/><ellipse cx="315" cy="225" rx="23" ry="10" fill="#E9B44C"/>
      <ellipse cx="315" cy="215" rx="18" ry="9" fill="#F2C35E"/><ellipse cx="315" cy="206" rx="12" ry="7" fill="#E9B44C"/><path d="M305 254 a10 9 0 0 1 20 0 z" fill="#7A5230"/>`;
    if (o.hiveLocked) s += `<circle cx="336" cy="204" r="13" fill="#FFFFFF"/><rect x="330" y="203" width="12" height="9" rx="2" fill="#7A6A60"/><path d="M332.5 203 v-3 a3.5 3.5 0 0 1 7 0 v3" fill="none" stroke="#7A6A60" stroke-width="2"/>`;
    const jars = o.hiveLocked ? 0 : Math.min(5, o.jars || 0);
    for (let i = 0; i < jars; i++) { const x = 290 + i * 14 - (jars - 1) * 3; s += `<rect x="${x}" y="276" width="13" height="16" rx="4" fill="#F2B630"/><rect x="${x + 1}" y="272" width="11" height="5" rx="2" fill="#A7764F"/><rect x="${x + 3}" y="280" width="3" height="7" rx="1.5" fill="#FFFFFF" opacity="0.6"/>`; }
    s += '</g>';

    // Bees: half live at the hive, half visit the bloom. Locked hive: all at the bloom.
    const shown = Math.min(o.bees || 0, 22);
    for (let i = 0; i < shown; i++) {
      const atHive = !o.hiveLocked && i % 2 === 1;
      const k = Math.floor(i / 2);
      const a = (k / Math.max(1, Math.ceil(shown / 2))) * Math.PI * 2 + (atHive ? 0.9 : 0.3);
      const r = atHive ? 30 + (k % 3) * 8 : 62 + (k % 3) * 12;
      const x = (atHive ? 315 : 170) + Math.cos(a) * r * (atHive ? 1.1 : 1.2);
      const y = (atHive ? 222 : 172) + Math.sin(a) * r * (atHive ? 0.7 : 0.6);
      s += bee(x.toFixed(1), y.toFixed(1), night, i, o.arriving && i === shown - 1 ? 'arrive' : '');
    }
    if (o.foraging) {
      s += `<path d="M318 214 C 340 170, 360 140, 400 110" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" opacity="0.9"/>`;
      for (let i = 0; i < 3; i++) s += `<g class="away" style="animation-delay:${i * 1.05}s">${bee(322 + i * 6, 210 - i * 4, night, i)}</g>`;
    }
    if (o.sprout !== false) s += sprout(night ? 'sleeping' : o.foraging ? 'calm' : 'happy');
    return s + '</svg>';
  };

  window.meadowLabel = function (p, night) {
    if (p.hiveLocked) return `Your meadow. The bloom has ${p.petals} petals. The beehive is locked until you clear out your stash.`;
    if (p.foraging) return `Your meadow. The hive is quiet: ${p.away} bees are out foraging and will come back over the next few good days.`;
    return `Your meadow in ${p.season}${night ? ' at night' : ''}: a bloom with ${p.petals} of 14 petals, ${p.trees} trees, ${p.bees} ${night ? 'fireflies' : 'bees'} and ${p.jars} jars of honey.`;
  };
})();
