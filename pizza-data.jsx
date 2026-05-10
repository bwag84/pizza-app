// Recipe templates and pure helpers (no React).
// Baker's % is always relative to flour weight.

const TEMPLATES = {
  roman: {
    id: 'roman',
    name: 'Roman',
    sub: 'Thin & crisp',
    glyph: 'GlyphRoman',
    // grams
    flour: 1000, water: 580, salt: 28, oil: 30, yeast: 3,
    waterTemp: 22, doughTemp: 24, ovenTemp: 250,
    bulkMin: 1440, ballMin: 60, bakeMin: '8-10',
    notes: 'Cold ferment 24h. Stretch don\u2019t roll. Olive oil on the pan.',
  },
  sheet: {
    id: 'sheet',
    name: 'Sheet-Pan',
    sub: 'Thick & airy',
    glyph: 'GlyphSheetPan',
    flour: 1000, water: 800, salt: 25, oil: 40, yeast: 2,
    waterTemp: 20, doughTemp: 25, ovenTemp: 240,
    bulkMin: 240, ballMin: 0, bakeMin: '18-22',
    notes: 'High hydration. Don\u2019t deflate after the bulk. Generous oil on the sheet.',
  },
};

const TEMPLATE_ORDER = ['roman', 'sheet'];
const BUILTIN_IDS = ['roman', 'sheet'];

// Fields that count for dirty-detection + saving as a new custom template.
const RECIPE_FIELDS = ['flour','water','salt','oil','yeast','waterTemp','doughTemp','ovenTemp','bulkMin','ballMin','bakeMin','notes'];

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

Object.assign(window, { TEMPLATES, TEMPLATE_ORDER, BUILTIN_IDS, RECIPE_FIELDS, fmtPct, fmtMin, buildTimeline });
