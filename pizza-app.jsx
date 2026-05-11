// Pizza app — all screens + main App. Loaded after react/babel/icons/data.

const { useState, useEffect, useRef, useMemo } = React;

// True on phones and when launched as an installed PWA — render full-screen
// without the iPhone mock frame so the app feels native on the home screen.
function useNativeMode() {
  const detect = () => {
    if (typeof window === 'undefined') return false;
    const narrow = window.matchMedia('(max-width: 700px)').matches;
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    return narrow || standalone;
  };
  const [native, setNative] = useState(detect);
  useEffect(() => {
    const mqs = [
      window.matchMedia('(max-width: 700px)'),
      window.matchMedia('(display-mode: standalone)'),
    ];
    const onChange = () => setNative(detect());
    mqs.forEach((m) => m.addEventListener('change', onChange));
    return () => mqs.forEach((m) => m.removeEventListener('change', onChange));
  }, []);
  return native;
}

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────
function PageHeader({ title, tag }) {
  return (
    <div className="page-hdr">
      <div>
        <h1 className="page-hdr__title">{title}</h1>
        <p className="page-hdr__tag">{tag}</p>
      </div>
    </div>
  );
}

function Section({ eyebrow, trailing, children }) {
  return (
    <div className="section">
      <div className="section__head">
        <span className="eyebrow">{eyebrow}</span>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function NumInput({ value, unit, onChange, min = 0, max = 100000 }) {
  return (
    <div className="input">
      <input type="number" value={value} min={min} max={max}
             onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value || 0))))} />
      <span className="input__unit">{unit}</span>
    </div>
  );
}

// Click-to-edit baker's % cell. Tap the % to enter a new ratio; the gram
// value for that ingredient updates relative to flour. Flour itself is
// non-editable (it's the 100% reference).
function PctCell({ grams, flour, editable, onChange, accent }) {
  const [editing, setEditing] = useState(false);
  const pct = flour > 0 ? (grams / flour) * 100 : 0;
  const display = pct >= 10 ? pct.toFixed(0) : pct.toFixed(1);
  const [draft, setDraft] = useState(display);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setDraft(display);
      // Defer focus + select until after the input is mounted.
      requestAnimationFrame(() => {
        if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
      });
    }
  }, [editing]);

  const commit = () => {
    const v = parseFloat(draft);
    if (!isNaN(v) && v >= 0 && v <= 500) {
      const decimals = v < 1 ? 2 : v < 10 ? 1 : 0;
      const newGrams = Math.round((v / 100) * flour * Math.pow(10, decimals)) / Math.pow(10, decimals);
      onChange(newGrams);
    }
    setEditing(false);
  };
  const cancel = () => setEditing(false);

  if (editing) {
    return (
      <div className="bp-edit">
        <input ref={inputRef} type="number" step="0.1" value={draft}
               onChange={(e) => setDraft(e.target.value)}
               onBlur={commit}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') commit();
                 else if (e.key === 'Escape') cancel();
               }} />
        <span>%</span>
      </div>
    );
  }
  return (
    <button type="button"
            className={`bp bp-btn ${accent ? 'bp--accent' : ''} ${editable ? '' : 'bp--locked'}`}
            onClick={() => editable && setEditing(true)}
            disabled={!editable}
            title={editable ? 'Tap to edit %' : 'Flour is always 100%'}>
      {display}%
    </button>
  );
}

// Save/rename bar for the Custom template. Only rendered when custom is active.
function CustomSaveBar({ template, recipe, onSave, onRename }) {
  const [name, setName] = useState(template.name || 'Custom');
  const [savedFlash, setSavedFlash] = useState(false);
  useEffect(() => { setName(template.name || 'Custom'); }, [template.name]);

  // Detect unsaved differences vs the stored template.
  const fields = ['flour','water','salt','oil','yeast','fermentHours','notes'];
  const dirty = fields.some((k) => recipe[k] !== template[k]) || name !== (template.name || 'Custom');

  const commit = () => {
    onSave(name.trim() || 'Custom');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };
  const onNameBlur = () => {
    const trimmed = (name || 'Custom').trim();
    if (trimmed !== template.name) onRename(trimmed);
  };

  return (
    <div className="cust-save">
      <div className="cust-save__row">
        <span className="cust-save__lbl">Name</span>
        <input className="cust-save__input"
               value={name} onChange={(e) => setName(e.target.value)}
               onBlur={onNameBlur} maxLength={32}
               placeholder="Friday night dough" />
      </div>
      <button className={`btn ${dirty ? 'btn--primary' : 'btn--secondary'}`}
              onClick={commit} disabled={!dirty && !savedFlash}
              style={{ minWidth: 96 }}>
        {savedFlash ? (<><IconCheck size={14} stroke={2.4} /> Saved</>) : 'Save'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Templates screen
// ─────────────────────────────────────────────────────────────
function TemplatesScreen({ recipe, setRecipe, activeId, setActiveId, templates, saveCustom, renameCustom }) {
  const Glyphs = { GlyphRoman, GlyphSheetPan, GlyphCustom };
  const order = TEMPLATE_ORDER;
  const T = templates || TEMPLATES;

  const updateField = (field, val) => {
    setRecipe({ ...recipe, [field]: val });
  };

  // Changing fermentation time recomputes yeast (and keeps bulkMin in sync
  // so the Timeline screen still has something to render).
  const updateFermentHours = (hours) => {
    const h = Number(hours) || 0;
    const curve = recipe.yeastCurve || (T[activeId] && T[activeId].yeastCurve);
    const next = { ...recipe, fermentHours: h, bulkMin: Math.round(h * 60) };
    const g = yeastGramsFromHours(curve, h, recipe.flour);
    if (g != null) next.yeast = g;
    setRecipe(next);
  };

  // Order matters: water first, then salt to dissolve, then flour, then yeast, then oil.
  const ingredients = [
    { id: 'water', name: 'Water', icon: <IconWater /> },
    { id: 'salt',  name: 'Salt',  icon: <IconSalt /> },
    { id: 'flour', name: 'Flour', icon: <IconFlour /> },
    { id: 'yeast', name: 'Yeast', icon: <IconYeast /> },
    { id: 'oil',   name: 'Oil',   icon: <IconOil /> },
  ];


  return (
    <>
      <PageHeader title="Pizza" tag={<>Dough by spec. <span className="accent">◣ pie.sh</span></>} />

      <Section eyebrow="Template">
        <div className="tile-row">
          {order.map((id) => {
            const t = T[id];
            const G = Glyphs[t.glyph];
            const on = id === activeId;
            return (
              <button key={id} className={`tile ${on ? 'tile--active' : ''}`}
                      onClick={() => { setActiveId(id); setRecipe({ ...T[id] }); }}>
                <div className="tile__glyph"><G /></div>
                <div>
                  <div className="tile__name">{t.name}</div>
                  <div className="tile__sub">{t.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
        {activeId === 'custom' && (
          <CustomSaveBar template={T.custom} recipe={recipe}
                         onSave={saveCustom} onRename={renameCustom} />
        )}
      </Section>

      <Section eyebrow="Dough recipe" trailing={<span className="eyebrow" style={{textTransform:'none', letterSpacing:0, color:'var(--fg-faint)'}}>baker&rsquo;s %</span>}>
        <div className="rec-list">
          {ingredients.map((ing) => (
            <div key={ing.id} className="rec-row">
              <div className="rec-row__icon">{ing.icon}</div>
              <div className="rec-row__name">{ing.name}</div>
              <NumInput value={recipe[ing.id]} unit="g"
                        onChange={(v) => updateField(ing.id, v)} />
              <PctCell grams={recipe[ing.id]} flour={recipe.flour}
                       editable={ing.id !== 'flour'}
                       accent={ing.id === 'flour'}
                       onChange={(v) => updateField(ing.id, v)} />
            </div>
          ))}
        </div>
      </Section>

      <div className="timing">
        <div className="timing__icon"><IconClock size={22} /></div>
        <div className="timing__cell timing__cell--input">
          <span className="timing__label">Fermentation</span>
          <NumInput value={recipe.fermentHours} unit="h"
                    onChange={updateFermentHours} />
        </div>
      </div>

      <Section eyebrow="Template notes">
        <textarea className="notes" placeholder="Anything weird about this batch…"
                  value={recipe.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)} />
      </Section>

      <div style={{height: 24}} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Calculator screen — live baker's math
// ─────────────────────────────────────────────────────────────
function CalculatorScreen({ recipe, setRecipe }) {
  const [pies, setPies] = useState(4);
  const [ballWeight, setBallWeight] = useState(280);

  const totalDough = pies * ballWeight;

  // Compute current ratios
  const ratios = useMemo(() => ({
    water: recipe.water / recipe.flour,
    salt:  recipe.salt  / recipe.flour,
    oil:   recipe.oil   / recipe.flour,
    yeast: recipe.yeast / recipe.flour,
  }), [recipe.water, recipe.salt, recipe.oil, recipe.yeast, recipe.flour]);

  const sumRatio = 1 + ratios.water + ratios.salt + ratios.oil + ratios.yeast;
  const targetFlour = Math.round(totalDough / sumRatio);
  const out = {
    flour: targetFlour,
    water: Math.round(targetFlour * ratios.water),
    salt:  Math.round(targetFlour * ratios.salt * 10) / 10,
    oil:   Math.round(targetFlour * ratios.oil  * 10) / 10,
    yeast: Math.round(targetFlour * ratios.yeast * 10) / 10,
  };

  const setHydration = (h) => {
    const newWater = Math.round((h / 100) * recipe.flour);
    setRecipe({ ...recipe, water: newWater });
  };
  const setSaltPct = (p) => setRecipe({ ...recipe, salt: Math.round((p/100) * recipe.flour * 10) / 10 });
  const setOilPct  = (p) => setRecipe({ ...recipe, oil:  Math.round((p/100) * recipe.flour * 10) / 10 });
  const setYeastPct = (p) => setRecipe({ ...recipe, yeast: Math.round((p/100) * recipe.flour * 100) / 100 });

  // Reset ratios to Roman baker's % (keeps current flour weight).
  const resetToRoman = () => {
    const r = TEMPLATES.roman;
    const f = recipe.flour || r.flour;
    setRecipe({
      ...recipe,
      water: Math.round(f * (r.water / r.flour)),
      salt:  Math.round(f * (r.salt  / r.flour) * 10) / 10,
      oil:   Math.round(f * (r.oil   / r.flour) * 10) / 10,
      yeast: Math.round(f * (r.yeast / r.flour) * 100) / 100,
    });
  };

  const hyd = (recipe.water / recipe.flour) * 100;
  const saltPct = (recipe.salt / recipe.flour) * 100;
  const oilPct  = (recipe.oil  / recipe.flour) * 100;
  const yeastPct = (recipe.yeast / recipe.flour) * 100;

  return (
    <>
      <PageHeader title="Calculator" tag={<>Dough math, live. <span className="accent">{Math.round(hyd*10)/10}% hydration</span></>} />

      <Section eyebrow="Batch">
        <div className="rec-list">
          <div className="rec-row" style={{gridTemplateColumns:'28px 1fr auto'}}>
            <div className="rec-row__icon"><IconList /></div>
            <div className="rec-row__name">Pizzas</div>
            <div className="stepper">
              <button onClick={() => setPies(Math.max(1, pies - 1))}>−</button>
              <div className="stepper__val">{pies}</div>
              <button onClick={() => setPies(Math.min(20, pies + 1))}>+</button>
            </div>
          </div>
          <div className="rec-row" style={{gridTemplateColumns:'28px 1fr auto'}}>
            <div className="rec-row__icon"><IconOil /></div>
            <div className="rec-row__name">Ball weight</div>
            <NumInput value={ballWeight} unit="g" onChange={setBallWeight} min={120} max={600} />
          </div>
        </div>
      </Section>

      <Section eyebrow="Ratios" trailing={
        <button className="btn btn--ghost" onClick={resetToRoman}
                style={{padding:'6px 10px', fontSize:11}}>
          <IconReset size={12} stroke={2} /> Reset to Roman
        </button>
      }>
        <div style={{display:'flex', flexDirection:'column', gap: 18}}>
          <SliderRow label="Hydration" val={hyd.toFixed(1) + '%'} min={50} max={90} step={0.5}
                     value={hyd} onChange={setHydration} />
          <SliderRow label="Salt" val={saltPct.toFixed(1) + '%'} min={0} max={4} step={0.1}
                     value={saltPct} onChange={setSaltPct} />
          <SliderRow label="Oil" val={oilPct.toFixed(1) + '%'} min={0} max={6} step={0.1}
                     value={oilPct} onChange={setOilPct} />
          <SliderRow label="Yeast" val={yeastPct.toFixed(2) + '%'} min={0.05} max={2} step={0.05}
                     value={yeastPct} onChange={setYeastPct} />
        </div>
      </Section>

      <div style={{height: 24}} />

      <div className="totals">
        <div className="totals__head">
          <span className="wedge">◣</span>
          <span>$ pie.sh — {pies} × {ballWeight}g</span>
        </div>
        <div className="totals__row"><span className="lbl">flour</span><span className="val">{out.flour} g</span></div>
        <div className="totals__row"><span className="lbl">water</span><span className="val">{out.water} g</span></div>
        <div className="totals__row"><span className="lbl">salt </span><span className="val">{out.salt} g</span></div>
        <div className="totals__row"><span className="lbl">oil  </span><span className="val">{out.oil} g</span></div>
        <div className="totals__row"><span className="lbl">yeast</span><span className="val">{out.yeast} g</span></div>
        <div className="totals__row totals__row--big"><span className="lbl">total</span><span className="val">{totalDough} g</span></div>
      </div>

      <div style={{height: 24}} />
    </>
  );
}

function SliderRow({ label, val, value, onChange, min, max, step }) {
  return (
    <div className="slider-row">
      <div className="slider-row__hd">
        <span className="slider-row__lbl">{label}</span>
        <span className="slider-row__val">{val}</span>
      </div>
      <input type="range" className="slider"
             min={min} max={max} step={step}
             value={value}
             onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Timeline screen — vertical step list with running clock
// ─────────────────────────────────────────────────────────────
function TimelineScreen({ recipe }) {
  const [running, setRunning] = useState(false);
  const [startMs, setStartMs] = useState(null);
  const [now, setNow] = useState(Date.now());

  // tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  // build steps relative to start
  const baseStart = startMs || Date.now();
  const steps = useMemo(() => buildTimeline(recipe, baseStart),
    [recipe, baseStart]);

  // determine status
  let activeIdx = -1;
  if (running && startMs) {
    activeIdx = steps.findIndex((s) => now >= s.start && now < s.end);
    if (activeIdx === -1 && now >= steps[steps.length - 1].end) activeIdx = -2; // done
  }

  const start = () => {
    setStartMs(Date.now());
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const resume = () => {
    // shift start so elapsed matches "paused" cursor — simple impl: just resume
    setRunning(true);
  };
  const reset = () => { setRunning(false); setStartMs(null); setNow(Date.now()); };

  // current step countdown
  let countdownText = '—';
  let stepName = 'Ready when you are';
  let eyebrow = 'STANDBY';
  if (running && activeIdx >= 0) {
    const s = steps[activeIdx];
    const remMs = Math.max(0, s.end - now);
    const m = Math.floor(remMs / 60000);
    const sec = Math.floor((remMs % 60000) / 1000);
    countdownText = `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    stepName = s.name;
    eyebrow = `STEP ${activeIdx + 1} OF ${steps.length}`;
  } else if (activeIdx === -2) {
    countdownText = 'DONE';
    stepName = 'Eat the pizza.';
    eyebrow = 'COMPLETE';
  }

  // total elapsed for running label
  const totalMin = steps.reduce((acc, s) => acc + s.dur, 0);
  const totalH = Math.floor(totalMin / 60);
  const totalR = totalMin % 60;
  const totalLabel = totalH ? `${totalH}h ${totalR}m total` : `${totalR}m total`;

  return (
    <>
      <PageHeader title="Timeline" tag={<>Mix to bake. <span className="accent">{totalLabel}</span></>} />

      <div className="tl-hero">
        <span className="tl-hero__dot" style={{ visibility: running && activeIdx >= 0 ? 'visible' : 'hidden' }} />
        <div className="tl-hero__col">
          <span className="tl-hero__step">{eyebrow}</span>
          <span className="tl-hero__name">{stepName}</span>
        </div>
        <div style={{textAlign: 'right'}}>
          <div className="tl-hero__time">{countdownText}</div>
          <div className="tl-hero__sub">{running && activeIdx >= 0 ? 'remaining' : (running ? '' : '$ pie.sh start')}</div>
        </div>
      </div>

      <div className="tl-actions">
        {!running && !startMs && (
          <button className="btn btn--primary" onClick={start}>
            <IconPlay size={14} /> Start bake
          </button>
        )}
        {running && (
          <button className="btn btn--primary" onClick={pause}>
            <IconPause size={14} /> Pause
          </button>
        )}
        {!running && startMs && (
          <button className="btn btn--primary" onClick={resume}>
            <IconPlay size={14} /> Resume
          </button>
        )}
        {startMs && (
          <button className="btn btn--secondary" onClick={reset}>
            <IconReset size={14} /> Reset
          </button>
        )}
      </div>

      <Section eyebrow="Steps">
        <div className="tl-list" style={{padding:0}}>
          {steps.map((s, i) => {
            const done = running && now >= s.end;
            const active = i === activeIdx;
            const cls = done ? 'tl-step--done' : active ? 'tl-step--active' : '';
            const dur = fmtMin(s.dur);
            const durLabel = typeof dur === 'object' ? `${dur.val} ${dur.unit}` : `${dur}`;
            return (
              <div key={s.id} className={`tl-step ${cls}`}>
                <div className="tl-step__rail" />
                <div className="tl-step__node">
                  {done ? <IconCheck size={14} stroke={2.4} /> : (i + 1)}
                </div>
                <div className="tl-step__body">
                  <div className="tl-step__name">{s.name}</div>
                  <div className="tl-step__sub">{s.sub}</div>
                </div>
                <div className="tl-step__time">{durLabel}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <div style={{height: 24}} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Guide screen
// ─────────────────────────────────────────────────────────────
function GuideScreen() {
  const cards = [
    { eb: 'Yeast',   h: 'Yeast is alive. Treat it nice.',
      b: 'Below 27°C, slow. Above 35°C, dead. Use the thermometer, not the wrist.' },
    { eb: 'Hydration', h: 'More water = more open crumb.',
      b: 'Roman runs ~58%. Sheet-pan goes 80%+. Above 70% you stop kneading and start folding.' },
    { eb: 'Salt',    h: 'Salt slows fermentation.',
      b: 'Don’t mix salt directly into the yeast. Add it after the autolyse, not before.' },
    { eb: 'Heat',    h: 'Hotter is better. Up to a point.',
      b: 'Home oven: max it. Stone or steel for 45 min before the pie hits. 250°C floor, 300°C broiler from above.' },
    { eb: 'Toppings', h: '<em>Pineapple</em> is fine.',
      b: 'We’re scientists, not snobs. Pre-cook anything wet. No raw onions on a hot pie.' },
    { eb: 'Cold ferment', h: '24 hours minimum.',
      b: 'Flavor needs time. Mix in the morning, bake the next night. The fridge does the work.' },
  ];
  return (
    <>
      <PageHeader title="Guide" tag={<>The math, plain spoken.</>} />
      <div style={{padding: '0 24px'}}>
        {cards.map((c, i) => (
          <div key={i} className="guide-card">
            <div className="guide-card__eb">{c.eb}</div>
            <h3 className="guide-card__h" dangerouslySetInnerHTML={{__html: c.h}} />
            <p className="guide-card__b" dangerouslySetInnerHTML={{__html: c.b}} />
          </div>
        ))}
      </div>
      <div style={{height: 24}} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Settings screen
// ─────────────────────────────────────────────────────────────
function SettingsScreen({ tweaks, setTweak }) {
  return (
    <>
      <PageHeader title="Settings" tag={<>Few knobs. <span className="accent">Strong opinions.</span></>} />

      <Section eyebrow="Display">
        <div className="set-list">
          <div className="set-row">
            <span className="set-row__lbl">Theme</span>
            <div className="seg">
              <button className={tweaks.theme === 'latte' ? 'on' : ''}
                      onClick={() => setTweak('theme', 'latte')}>LATTE</button>
              <button className={tweaks.theme === 'char' ? 'on' : ''}
                      onClick={() => setTweak('theme', 'char')}>CHAR</button>
            </div>
          </div>
          <div className="set-row">
            <span className="set-row__lbl">Accent</span>
            <div className="seg">
              {[
                { id:'tomato', label:'TOMATO' },
                { id:'basil',  label:'BASIL' },
                { id:'yeast',  label:'YEAST' },
              ].map((a) => (
                <button key={a.id} className={tweaks.accent === a.id ? 'on' : ''}
                        onClick={() => setTweak('accent', a.id)}>{a.label}</button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span className="set-row__lbl">Mono numerics</span>
            <button className={`toggle ${tweaks.monoNumbers ? 'toggle--on' : ''}`}
                    onClick={() => setTweak('monoNumbers', !tweaks.monoNumbers)} />
          </div>
        </div>
      </Section>

      <Section eyebrow="Units">
        <div className="set-list">
          <div className="set-row">
            <span className="set-row__lbl">Weight</span>
            <span className="set-row__val">grams</span>
          </div>
          <div className="set-row">
            <span className="set-row__lbl">Temperature</span>
            <span className="set-row__val">°C</span>
          </div>
          <div className="set-row">
            <span className="set-row__lbl">Time</span>
            <span className="set-row__val">24h</span>
          </div>
        </div>
      </Section>

      <Section eyebrow="About">
        <div className="set-list">
          <div className="set-row">
            <span className="set-row__lbl">Version</span>
            <span className="set-row__val">1.0.0</span>
          </div>
          <div className="set-row">
            <span className="set-row__lbl">Made with</span>
            <span className="set-row__val">flour, water, salt</span>
          </div>
        </div>
      </Section>

      <div style={{height: 24}} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab bar
// ─────────────────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'templates',  label: 'Templates',  icon: IconList },
    { id: 'calculator', label: 'Calculator', icon: IconCalc },
    { id: 'timeline',   label: 'Timeline',   icon: IconClock },
    { id: 'guide',      label: 'Guide',      icon: IconBook },
    { id: 'settings',   label: 'Settings',   icon: IconCog },
  ];
  return (
    <div className="tabbar">
      {tabs.map((t) => {
        const I = t.icon;
        const on = tab === t.id;
        return (
          <button key={t.id} className={`tab ${on ? 'tab--active' : ''}`}
                  onClick={() => setTab(t.id)}>
            <I size={22} stroke={on ? 2 : 1.6} />
            <span className="tab__label">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main app
// ─────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "latte",
  "accent": "tomato",
  "monoNumbers": true,
  "showWedge": true
}/*EDITMODE-END*/;

const ACCENT_HEX = { tomato: '#d20f39', basil: '#40a02b', yeast: '#df8e1d' };

const LS_CUSTOMS = 'pie.sh:customs-v1';
const LS_CUSTOM_LEGACY = 'pie.sh:custom-template'; // pre-v1 single-custom slot

function newCustomId() {
  return 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

function migrateCustom(c) {
  if (!c || typeof c !== 'object') return c;
  const out = { ...c };
  if (out.fermentHours == null) {
    out.fermentHours = out.bulkMin ? Math.round(out.bulkMin / 60) : 20;
  }
  if (!out.yeastCurve) out.yeastCurve = YEAST_CURVES.custom;
  return out;
}

function loadCustoms() {
  try {
    const raw = localStorage.getItem(LS_CUSTOMS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map(migrateCustom);
    }
    // migrate legacy single-custom into the array
    const legacy = localStorage.getItem(LS_CUSTOM_LEGACY);
    if (legacy) {
      const obj = JSON.parse(legacy);
      if (obj && obj.flour) {
        const c = migrateCustom({ ...obj, id: newCustomId(), glyph: 'GlyphCustom', sub: obj.sub || 'Saved spec' });
        try { localStorage.setItem(LS_CUSTOMS, JSON.stringify([c])); } catch (e) {}
        return [c];
      }
    }
  } catch (e) {}
  return [];
}

function persistCustoms(list) {
  try { localStorage.setItem(LS_CUSTOMS, JSON.stringify(list)); } catch (e) {}
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function recipeEquals(a, b) {
  if (!a || !b) return false;
  return RECIPE_FIELDS.every((k) => a[k] === b[k]);
}

function App() {
  const native = useNativeMode();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useState('templates');
  const [activeId, setActiveId] = useState('roman');

  // Templates dict with custom overrides from localStorage.
  const [templates, setTemplates] = useState(() => {
    const saved = loadCustoms()[0];
    return saved ? { ...TEMPLATES, custom: { ...TEMPLATES.custom, ...saved } } : { ...TEMPLATES };
  });
  const [recipe, setRecipe] = useState(() => ({ ...TEMPLATES.roman }));

  // Save current recipe as the custom template.
  const saveCustom = (name) => {
    const custom = {
      ...templates.custom,
      ...recipe,
      id: 'custom',
      glyph: 'GlyphCustom',
      name: name || templates.custom.name || 'Custom',
      sub: templates.custom.sub || 'Your spec',
    };
    const next = { ...templates, custom };
    setTemplates(next);
    persistCustoms([custom]);
  };
  const renameCustom = (name) => {
    const custom = { ...templates.custom, name };
    setTemplates({ ...templates, custom });
    persistCustoms([custom]);
  };

  // Apply accent + mono via CSS vars on the app root
  const appStyle = {
    '--tomato': ACCENT_HEX[tweaks.accent] || ACCENT_HEX.tomato,
  };

  const appShell = (
    <div className={`app ${native ? 'app--native' : ''}`} data-theme={tweaks.theme} style={appStyle}>
      <div className="app__scroll">
        {tab === 'templates'  && <TemplatesScreen  recipe={recipe} setRecipe={setRecipe} activeId={activeId} setActiveId={setActiveId} templates={templates} saveCustom={saveCustom} renameCustom={renameCustom} />}
        {tab === 'calculator' && <CalculatorScreen recipe={recipe} setRecipe={setRecipe} />}
        {tab === 'timeline'   && <TimelineScreen   recipe={recipe} />}
        {tab === 'guide'      && <GuideScreen />}
        {tab === 'settings'   && <SettingsScreen   tweaks={tweaks} setTweak={setTweak} />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );

  return (
    <>
      {native ? appShell : <IOSDevice width={402} height={874}>{appShell}</IOSDevice>}

      {!native && <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={tweaks.theme}
                    options={[{value:'latte',label:'Latte'},{value:'char',label:'Char'}]}
                    onChange={(v) => setTweak('theme', v)} />
        <TweakColor label="Accent" value={ACCENT_HEX[tweaks.accent]}
                    options={['#d20f39','#40a02b','#df8e1d','#179299']}
                    onChange={(hex) => {
                      const map = {'#d20f39':'tomato','#40a02b':'basil','#df8e1d':'yeast','#179299':'olive'};
                      setTweak('accent', map[hex] || 'tomato');
                    }} />

        <TweakSection label="Behavior" />
        <TweakToggle label="Mono numerics" value={tweaks.monoNumbers}
                     onChange={(v) => setTweak('monoNumbers', v)} />
        <TweakToggle label="Show ◣ mark" value={tweaks.showWedge}
                     onChange={(v) => setTweak('showWedge', v)} />

        <TweakSection label="Jump to" />
        <TweakRadio label="Tab" value={tab}
                    options={['templates','calculator','timeline','guide','settings']}
                    onChange={setTab} />
        <TweakRadio label="Template" value={activeId}
                    options={[{value:'roman',label:'Roman'},{value:'sheet',label:'Sheet'},{value:'custom',label:'Custom'}]}
                    onChange={(id) => { setActiveId(id); setRecipe({...TEMPLATES[id]}); }} />
      </TweaksPanel>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
