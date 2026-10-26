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


  // ----- Garden features, unlocked by completed good days (window.GARDEN) -----
  const GRASS = [[18,292],[96,298],[140,290],[206,286],[284,284],[350,290],[60,314],[186,320],[300,318],[156,326]];
  const STREAM = [[226,228,2.5],[240,244,4],[252,262,6],[240,282,8],[228,302,10],[240,334,13]];

  function stream(night) {
    const water = night ? '#4A5E8C' : '#8ED3EE';
    let s = '';
    for (let i = 1; i < STREAM.length; i++) {
      const [x0, y0, w0] = STREAM[i - 1], [x1, y1, w1] = STREAM[i];
      s += `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${water}" stroke-width="${(w0 + w1) / 2}" stroke-linecap="round"/>`;
    }
    const d = 'M' + STREAM.map(([x, y]) => `${x} ${y}`).join(' L');
    return s + `<path class="flow" d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity="${night ? 0.3 : 0.7}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 9"/>`;
  }

  function pond(night) {
    return `<ellipse cx="350" cy="303" rx="30" ry="8.5" fill="${night ? '#3A4A72' : '#6FBF8A'}"/>
      <ellipse cx="350" cy="302" rx="27" ry="7" fill="${night ? '#4A5E8C' : '#8ED3EE'}"/>
      <ellipse class="flow-glint" cx="340" cy="300" rx="7" ry="1.4" fill="#FFFFFF" opacity="${night ? 0.25 : 0.6}"/>
      <path d="M360 303 a5 2.4 0 1 1 6 -1.5 l-4 0.6 z" fill="${night ? '#5E9C78' : '#4FA864'}"/>`;
  }

  function lavender(night) {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const x = 256 + i * 5, h = 13 + (i % 3) * 3, y = 292;
      s += `<path d="M${x} ${y} L${x + (i % 2 ? 1 : -1)} ${y - h}" stroke="${night ? '#5E9C78' : '#6E9E5E'}" stroke-width="1.4" stroke-linecap="round"/>`;
      for (let k = 0; k < 3; k++) s += `<ellipse cx="${x + (i % 2 ? 1 : -1)}" cy="${y - h + k * 3.2}" rx="1.8" ry="2.2" fill="${night ? '#8E86C9' : k ? '#A58AD8' : '#B9A2E6'}"/>`;
    }
    return s;
  }

  function sunflowers(night) {
    return [[14, 238], [32, 252]].map(([x, top], i) => {
      let s = `<path d="M${x} 304 C ${x - 2} 284, ${x + 2} 266, ${x} ${top}" stroke="${night ? '#5E9C78' : '#4FA864'}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M${x} 280 c 6 -1 10 -5 11 -9 c -6 0 -10 3 -11 9z" fill="${night ? '#5E9C78' : '#5DB870'}"/>`;
      if (night) return s + `<circle cx="${x}" cy="${top}" r="5" fill="#6E6A3A"/>`;
      s += `<g class="nod" style="animation-delay:${i * 0.8}s;transform-origin:${x}px ${top + 10}px">`;
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; s += `<ellipse cx="${(x + Math.cos(a) * 7).toFixed(1)}" cy="${(top + Math.sin(a) * 7).toFixed(1)}" rx="3.4" ry="1.8" fill="#FFC93C" transform="rotate(${k * 30} ${(x + Math.cos(a) * 7).toFixed(1)} ${(top + Math.sin(a) * 7).toFixed(1)})"/>`; }
      return s + `<circle cx="${x}" cy="${top}" r="4.6" fill="#7A5230"/></g>`;
    }).join('');
  }

  function bench() {
    return `<g fill="#A7764F"><rect x="88" y="203" width="24" height="2.6" rx="1.3"/><rect x="88" y="208" width="24" height="3" rx="1.5"/>
      <rect x="90" y="203" width="2.2" height="12" rx="1"/><rect x="107.8" y="203" width="2.2" height="12" rx="1"/></g>`;
  }

  function oak(c, night) {
    const leaf = night ? '#41606E' : c.tree, dark = night ? '#36505E' : '#3E9C5A';
    return `<path d="M40 178 C 42 160, 40 140, 44 118 L 52 118 C 54 140, 52 160, 56 178 Z" fill="${c.trunk}"/>
      <path d="M47 140 C 36 130, 30 126, 22 126 M49 132 C 60 124, 66 122, 74 124" stroke="${c.trunk}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="treesway"><circle cx="24" cy="116" r="22" fill="${dark}"/><circle cx="74" cy="114" r="22" fill="${dark}"/>
      <circle cx="48" cy="96" r="30" fill="${leaf}"/><circle cx="26" cy="108" r="18" fill="${leaf}"/><circle cx="70" cy="106" r="19" fill="${leaf}"/></g>
      ${night ? '<g class="twinkle"><circle cx="36" cy="120" r="1.8" fill="#FFF3A0"/><circle cx="62" cy="122" r="1.8" fill="#FFF3A0"/><circle cx="48" cy="124" r="1.8" fill="#FFF3A0"/></g>' : ''}`;
  }

  function secondHive(locked) {
    return `<g opacity="${locked ? 0.45 : 1}">${boxHive(366, 262, 28, [15, 12], 12)}</g>`;
  }

  // Front view of a box hive: legs, stand, stacked boxes (bottom first), entrance slot, pitched coral roof.
  function boxHive(cx, standY, w, boxes, roofH) {
    const half = w / 2;
    let s = `<rect x="${cx - half + 3}" y="${standY}" width="${w * 0.13}" height="${roofH * 2}" rx="2" fill="#A7764F"/>
      <rect x="${cx + half - 3 - w * 0.13}" y="${standY}" width="${w * 0.13}" height="${roofH * 2}" rx="2" fill="#A7764F"/>
      <rect x="${cx - half - 5}" y="${standY - 1}" width="${w + 10}" height="${w * 0.14}" rx="3" fill="#B98559"/>`;
    let y = standY - 1;
    boxes.forEach((h, i) => {
      const top = y - h;
      s += `<rect x="${cx - half}" y="${top}" width="${w}" height="${h - 1}" rx="2.5" fill="${i % 2 ? '#E9B44C' : '#F2C35E'}"/>
        <rect x="${cx - half}" y="${y - 3}" width="${w}" height="2" fill="#D9A23E"/>
        <rect x="${cx - w * 0.18}" y="${top + h * 0.3}" width="${w * 0.36}" height="${Math.max(2, h * 0.12)}" rx="1" fill="#C98F2E" opacity="0.8"/>`;
      if (i === 0) s += `<rect x="${cx - w * 0.28}" y="${y - h * 0.3}" width="${w * 0.56}" height="${Math.max(3, h * 0.14)}" rx="1.6" fill="#4A3221"/>`;
      y = top;
    });
    s += `<path d="M${cx - half - 6} ${y + 1} L${cx} ${y - roofH} L${cx + half + 6} ${y + 1} Z" fill="#FF7A5C"/>
      <path d="M${cx - half + 1} ${y + 1} L${cx} ${y - roofH + 5} L${cx + half - 1} ${y + 1} Z" fill="#FF8A65"/>`;
    return s;
  }

  function butterfly(x, y, colour, i) {
    return `<g class="flutter" style="animation-delay:${i * 1.7}s"><g class="flap" style="transform-origin:${x}px ${y}px">
      <ellipse cx="${x - 3}" cy="${y - 2}" rx="3.4" ry="2.6" fill="${colour}"/><ellipse cx="${x + 3}" cy="${y - 2}" rx="3.4" ry="2.6" fill="${colour}"/>
      <ellipse cx="${x - 2.4}" cy="${y + 1.6}" rx="2.2" ry="1.8" fill="${colour}"/><ellipse cx="${x + 2.4}" cy="${y + 1.6}" rx="2.2" ry="1.8" fill="${colour}"/></g>
      <rect x="${x - 0.6}" y="${y - 3}" width="1.2" height="6" rx="0.6" fill="#4A3A30"/></g>`;
  }

  window.meadowSVG = function (o) {
    const night = !!o.night;
    const season = o.season || 'spring';
    const c = night ? NIGHT : { ...SEASONS[season], trunk: '#A7764F', stem: '#4FA864', leaf: season === 'autumn' ? '#8FAE52' : '#5DB870', ghost: season === 'autumn' ? '#C9A56A' : '#9CC9A0' };
    const petalCount = Math.max(0, Math.min(14, o.petals || 0));
    const petalColors = night ? ['#F5C2DA', '#E9A8C9'] : season === 'autumn' ? ['#F7B267', '#F79D65'] : season === 'summer' ? ['#FFC6A8', '#FF9E80'] : ['#FFB59A', '#FF9E80'];
    const step = 360 / 14;
    const g = Math.max(0, o.grown || 0);
    const treeCount = Math.min(10, Math.floor(g / 3));
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
    if (g >= 365) s += oak(c, night);
    // Each tree starts as a sapling and grows to full size over three weeks of good days.
    TREE_SPOTS.slice(0, treeCount).forEach(([x, y, full], i) => {
      const k = Math.min(1, 0.35 + 0.65 * (g - (3 + 3 * i)) / 21);
      const r = full * k, trunk = (full + 8) * k;
      const fill = !night && season === 'autumn' && i % 2 ? '#C9662F' : c.tree;
      s += `<rect x="${x - 3 * Math.max(0.6, k)}" y="${y + 8 - trunk}" width="${6 * Math.max(0.6, k)}" height="${trunk}" rx="3" fill="${c.trunk}"/><circle class="treesway" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${y + 8 - trunk}" r="${r.toFixed(1)}" fill="${fill}"/>`;
      if (k > 0.7 && !night && season === 'spring' && i % 2 === 0) s += `<circle cx="${x - r * 0.4}" cy="${y + 8 - trunk - r * 0.3}" r="2.6" fill="#FFD1DC"/><circle cx="${x + r * 0.35}" cy="${y + 8 - trunk + r * 0.1}" r="2.6" fill="#FFFFFF"/>`;
      // Fruit from 3 months, on the trees that are fully grown
      if (g >= 90 && k === 1 && !night) s += `<circle cx="${x - r * 0.45}" cy="${y + 8 - trunk + r * 0.2}" r="2.4" fill="#E5484D"/><circle cx="${x + r * 0.4}" cy="${y + 8 - trunk - r * 0.25}" r="2.4" fill="#E5484D"/>`;
    });
    s += `<path d="M0 236 Q 110 196 220 226 T 390 214 V330 H0Z" fill="${c.mid}"/>`;
    if (g >= 180) s += bench();
    s += `<path d="M0 286 Q 120 252 250 276 T 390 268 V330 H0Z" fill="${c.near}"/>`;
    if (g >= 7) s += stream(night);
    if (g >= 30) s += pond(night);
    if (g >= 1) s += GRASS.map(([x, y]) => `<path d="M${x - 4} ${y} l1.5 -6 l1.5 6 l1.5 -8 l1.5 8 l1.5 -5 l1.5 5" fill="none" stroke="${night ? c.stem : '#4FA864'}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" opacity="0.8"/>`).join('');
    if (g >= 21) s += lavender(night);
    const flowerColors = night ? ['#C9B8F0'] : season === 'summer' ? ['#FFD45C', '#FF9E80', '#FFFFFF', '#FFC93C'] : season === 'autumn' ? ['#F7A94B', '#C9662F', '#FFD45C'] : ['#FF9E80', '#FFD45C', '#FFFFFF', '#C9B8F0'];
    FLOWER_SPOTS.slice(0, Math.ceil(treeCount * 0.8)).forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="3.5" fill="${flowerColors[i % flowerColors.length]}"/>`; });
    // Completed blooms become permanent wildflowers
    BLOOM_SPOTS.slice(0, o.blooms || 0).forEach(([x, y], i) => {
      s += `<path d="M${x} ${y + 14} V${y}" stroke="${c.stem}" stroke-width="2.5" stroke-linecap="round"/>`;
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; s += `<circle cx="${(x + Math.cos(a) * 5).toFixed(1)}" cy="${(y + Math.sin(a) * 5).toFixed(1)}" r="4" fill="${petalColors[i % 2]}"/>`; }
      s += `<circle cx="${x}" cy="${y}" r="3" fill="#FFD45C"/>`;
    });

    if (g >= 60) s += sunflowers(night);

    // Bloom
    s += `<g class="sway ${o.drooping ? 'droop' : ''}">`;
    s += `<path d="M170 300 C 167 260, 173 230, 170 196" fill="none" stroke="${c.stem}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M170 262 c -16 -2 -26 -12 -28 -22 c 14 -2 24 6 28 22z" fill="${c.leaf}"/><path d="M171 246 c 14 -4 24 -14 26 -24 c -14 0 -22 8 -26 24z" fill="${c.leaf}"/>`;
    for (let i = petalCount; i < 14; i++) s += `<ellipse cx="170" cy="162" rx="10" ry="22" fill="none" stroke="${c.ghost}" stroke-width="2" stroke-dasharray="3 4" transform="rotate(${i * step} 170 184)"/>`;
    for (let i = 0; i < petalCount; i++) s += `<ellipse class="${o.newPetal && i === petalCount - 1 ? 'petal-open' : ''}" cx="170" cy="162" rx="11" ry="23" fill="${petalColors[i % 2]}" opacity="${o.drooping ? 0.75 : 1}" transform="rotate(${i * step} 170 184)"/>`;
    s += `<circle cx="170" cy="184" r="15" fill="#FFD45C"/><circle cx="170" cy="184" r="13.5" fill="none" stroke="#F2B630" stroke-width="3"/></g>`;

    // Hive
    const hiveOpacity = o.hiveLocked ? 0.45 : o.foraging ? 0.7 : 1;
    // Box hive with a pitched roof, matching the app icon
    s += `<g opacity="${hiveOpacity}">${boxHive(315, 254, 46, [24, 18, 16], 18)}`;
    if (o.hiveLocked) s += `<circle cx="341" cy="206" r="13" fill="#FFFFFF"/><rect x="335" y="205" width="12" height="9" rx="2" fill="#7A6A60"/><path d="M337.5 205 v-3 a3.5 3.5 0 0 1 7 0 v3" fill="none" stroke="#7A6A60" stroke-width="2"/>`;
    const jars = o.hiveLocked ? 0 : Math.min(5, o.jars || 0);
    for (let i = 0; i < jars; i++) { const x = 290 + i * 14 - (jars - 1) * 3; s += `<rect x="${x}" y="276" width="13" height="16" rx="4" fill="#F2B630"/><rect x="${x + 1}" y="272" width="11" height="5" rx="2" fill="#A7764F"/><rect x="${x + 3}" y="280" width="3" height="7" rx="1.5" fill="#FFFFFF" opacity="0.6"/>`; }
    s += '</g>';
    if (g >= 270) s += secondHive(o.hiveLocked);

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
    if (g >= 14 && !night) s += butterfly(118, 236, '#C9B8F0', 0) + butterfly(214, 206, '#FF9E80', 1);
    if (o.sprout !== false) s += sprout(night ? 'sleeping' : o.foraging ? 'calm' : 'happy');
    return s + '</svg>';
  };

  window.meadowLabel = function (p, night) {
    if (p.hiveLocked) return `Your meadow. The bloom has ${p.petals} petals. The beehive is locked until you clear out your stash.`;
    if (p.foraging) return `Your meadow. The hive is quiet: ${p.away} bees are out foraging and will come back over the next few good days.`;
    return `Your meadow in ${p.season}${night ? ' at night' : ''}: a bloom with ${p.petals} of 14 petals, ${p.trees} trees${(window.GARDEN || []).filter(f => f.d <= (p.grown || 0) && f.d > 3).map(f => ', ' + f.t.toLowerCase()).join('')}, ${p.bees} ${night ? 'fireflies' : 'bees'} and ${p.jars} jars of honey.`;
  };
})();
