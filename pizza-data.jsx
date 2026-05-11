// Recipe templates and pure helpers (no React).
// Baker's % is always relative to flour weight.

// Yeast % vs. fermentation time, per template. Linear interpolation between
// points; clamp outside the range. Single-point curves return a constant.
const YEAST_CURVES = {
  roman: [
    { h: 2,  pct: 2.0 },
    { h: 4,  pct: 1.0 },
    { h: 20, pct: 0.5 },
  ],
  sheet: [
    { h: 4, pct: 1.65 },
  ],
};
YEAST_CURVES.custom = YEAST_CURVES.roman;

const TEMPLATES = {
  roman: {
    id: 'roman',
    name: 'Roman',
    sub: 'Thin & crisp',
    glyph: 'GlyphRoman',
    // grams
    flour: 1000, water: 580, salt: 28, oil: 30, yeast: 5,
    waterTemp: 22, doughTemp: 24, ovenTemp: 250,
    fermentHours: 20, bulkMin: 1200, ballMin: 60, bakeMin: '8-10',
    yeastCurve: YEAST_CURVES.roman,
    notes: 'Cold ferment 20h. Stretch don\u2019t roll. Olive oil on the pan.',
  },
  sheet: {
    id: 'sheet',
    name: 'Sheet-Pan',
    sub: 'Thick & airy',
    glyph: 'GlyphSheetPan',
    flour: 1000, water: 671, salt: 19, oil: 47, yeast: 17,
    waterTemp: 20, doughTemp: 25, ovenTemp: 240,
    fermentHours: 4, bulkMin: 240, ballMin: 0, bakeMin: '18-22',
    yeastCurve: YEAST_CURVES.sheet,
    notes: 'High hydration. Don\u2019t deflate after the bulk. Generous oil on the sheet.',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    sub: 'Your spec',
    glyph: 'GlyphCustom',
    flour: 1000, water: 580, salt: 28, oil: 30, yeast: 5,
    waterTemp: 22, doughTemp: 24, ovenTemp: 250,
    fermentHours: 20, bulkMin: 1200, ballMin: 60, bakeMin: '8-10',
    yeastCurve: YEAST_CURVES.custom,
    notes: 'Cold ferment 20h. Stretch don\u2019t roll. Olive oil on the pan.',
  },
};

// Look up yeast % for a given fermentation duration (hours). Linear interp
// between the two flanking points; clamp at the curve's endpoints.
function yeastPctForHours(curve, hours) {
  if (!curve || curve.length === 0) return null;
  if (curve.length === 1) return curve[0].pct;
  const sorted = [...curve].sort((a, b) => a.h - b.h);
  if (hours <= sorted[0].h) return sorted[0].pct;
  if (hours >= sorted[sorted.length - 1].h) return sorted[sorted.length - 1].pct;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (hours >= a.h && hours <= b.h) {
      const t = (hours - a.h) / (b.h - a.h);
      return a.pct + t * (b.pct - a.pct);
    }
  }
  return sorted[sorted.length - 1].pct;
}

// Round yeast grams sensibly: <10g to 1 decimal, \u226510g to integer.
function yeastGramsFromHours(curve, hours, flour) {
  const pct = yeastPctForHours(curve, hours);
  if (pct == null || !flour) return null;
  const g = (pct / 100) * flour;
  return g < 10 ? Math.round(g * 10) / 10 : Math.round(g);
}

const TEMPLATE_ORDER = ['roman', 'sheet', 'custom'];
const BUILTIN_IDS = ['roman', 'sheet'];

// Fields that count for dirty-detection + saving as a new custom template.
const RECIPE_FIELDS = ['flour','water','salt','oil','yeast','fermentHours','notes'];

const fmtPct = (n, flour) => {
  if (!flour) return '0.0%';
  const v = (n / flour) * 100;
  return v >= 10 ? v.toFixed(0) + '%' : v.toFixed(1) + '%';
};

const fmtMin = (m) => {
  if (typeof m === 'string') return m;
  if (m < 60) return { val: String(m), unit: 'min' };
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? { val: `${h}h ${r}`, unit: 'min' } : { val: `${h}`, unit: 'h' };
};

// Timeline steps derived from a template + a start time.
function buildTimeline(t, startMs) {
  const steps = [
    { id: 'mix', name: 'Mix', sub: 'Flour, water, salt, oil, yeast.', dur: 8 },
    { id: 'autolyse', name: 'Autolyse', sub: 'Rest. Let the flour drink.', dur: 20 },
    { id: 'bulk', name: 'Bulk ferment', sub: t.bulkMin >= 720 ? 'Cold, in the fridge.' : 'Covered. Warm spot.', dur: t.bulkMin },
  ];
  if (t.ballMin > 0) {
    steps.push({ id: 'ball', name: 'Divide & ball', sub: 'Tight, smooth tops.', dur: 5 });
    steps.push({ id: 'rest', name: 'Ball rest', sub: 'Let the gluten relax.', dur: t.ballMin });
  }
  steps.push({ id: 'shape', name: 'Shape & top', sub: 'Stretch, sauce, cheese.', dur: 5 });
  const bakeMid = typeof t.bakeMin === 'string'
    ? Math.round((parseInt(t.bakeMin.split('-')[0],10) + parseInt(t.bakeMin.split('-')[1],10)) / 2)
    : t.bakeMin;
  steps.push({ id: 'bake', name: 'Bake', sub: `${t.ovenTemp}\u00b0C. Stone or steel.`, dur: bakeMid });

  // assign absolute start/end
  let cursor = startMs;
  return steps.map((s) => {
    const start = cursor;
    const end = start + s.dur * 60_000;
    cursor = end;
    return { ...s, start, end };
  });
}

Object.assign(window, { TEMPLATES, TEMPLATE_ORDER, BUILTIN_IDS, RECIPE_FIELDS, YEAST_CURVES, fmtPct, fmtMin, buildTimeline, yeastPctForHours, yeastGramsFromHours });
