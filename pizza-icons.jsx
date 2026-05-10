// Lucide-style line icons for the pizza app. 1.5px stroke, 20px default.

const Icon = ({ children, size = 20, stroke = 1.5, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       style={style}>
    {children}
  </svg>
);

// Ingredient glyphs — match the dotted/circle motifs from the screenshot
const IconYeast = (p) => (
  <Icon {...p}>
    <circle cx="6.5" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="11" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="11.5" cy="17" r="1" fill="currentColor" stroke="none" />
  </Icon>
);
const IconWater = (p) => (
  <Icon {...p}>
    <path d="M12 3.5c3 4 6 7 6 10.5a6 6 0 11-12 0c0-3.5 3-6.5 6-10.5z" />
  </Icon>
);
const IconFlour = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="7" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="10" cy="6" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="14" cy="7" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="18" cy="6" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="7" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="17" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="9" cy="15" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13" cy="14" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="11" cy="18" r="0.8" fill="currentColor" stroke="none" />
  </Icon>
);
const IconSalt = (p) => (
  <Icon {...p}>
    <circle cx="8" cy="9" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13" cy="8" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="10" cy="13" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="13" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13" cy="17" r="0.8" fill="currentColor" stroke="none" />
  </Icon>
);
const IconOil = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="7" />
  </Icon>
);
const IconThermo = (p) => (
  <Icon {...p}>
    <path d="M14 4.5a2 2 0 10-4 0V14a4 4 0 104 0V4.5z" />
    <circle cx="12" cy="17" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
);
const IconOven = (p) => (
  <Icon {...p}>
    <rect x="4" y="5" width="16" height="14" rx="1.5" />
    <path d="M4 10h16" />
    <circle cx="7.5" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
    <path d="M9 14h6" />
  </Icon>
);
const IconClock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2.5" />
  </Icon>
);

// Template tile glyphs — tiny pizza shapes
const GlyphRoman = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="22" stroke="#4c4f69" strokeWidth="1.4" />
    <circle cx="32" cy="32" r="18" stroke="#4c4f69" strokeWidth="0.8" strokeDasharray="1 2" opacity="0.5" />
    {[[26,25],[38,26],[24,34],[34,32],[40,36],[28,40],[36,42],[30,30],[20,30]].map((p,i)=>(
      <circle key={i} cx={p[0]} cy={p[1]} r="1" fill="#4c4f69" />
    ))}
  </svg>
);
const GlyphSheetPan = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="11" y="13" width="42" height="38" rx="2" stroke="#4c4f69" strokeWidth="1.4" />
    <rect x="14" y="16" width="36" height="32" rx="1" stroke="#4c4f69" strokeWidth="0.8" opacity="0.4" />
    {Array.from({length: 18}).map((_,i)=>{
      const x = 17 + (i%6)*5.5; const y = 19 + Math.floor(i/6)*9;
      return <circle key={i} cx={x} cy={y} r="0.9" fill="#4c4f69" />
    })}
  </svg>
);
const GlyphCustom = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="22" stroke="#4c4f69" strokeWidth="1.4" strokeDasharray="3 3" />
    <path d="M32 24v16M24 32h16" stroke="#4c4f69" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const GlyphPlus = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 22v20M22 32h20" stroke="#9ca0b0" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// Tab icons
const IconList = (p) => (
  <Icon {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </Icon>
);
const IconCalc = (p) => (
  <Icon {...p}>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <rect x="7.5" y="5.5" width="9" height="3" rx="0.5" />
    <circle cx="9" cy="13" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="13" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="15" cy="13" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="9" cy="16" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="0.7" fill="currentColor" stroke="none" />
  </Icon>
);
const IconTimeline = (p) => IconClock(p);
const IconBook = (p) => (
  <Icon {...p}>
    <path d="M5 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3V4z" />
    <path d="M5 17a3 3 0 013-3h9" />
  </Icon>
);
const IconCog = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34h0a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.55h0a1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87v0a1.7 1.7 0 001.55 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.55 1z" />
  </Icon>
);
const IconMore = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
);
const IconPlay = (p) => (
  <Icon {...p}>
    <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
  </Icon>
);
const IconPause = (p) => (
  <Icon {...p}>
    <rect x="7" y="5" width="3.5" height="14" fill="currentColor" stroke="none" />
    <rect x="13.5" y="5" width="3.5" height="14" fill="currentColor" stroke="none" />
  </Icon>
);
const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Icon>
);
const IconReset = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 109-9c-2.5 0-4.7 1-6.4 2.6L3 8" />
    <path d="M3 4v4h4" />
  </Icon>
);

Object.assign(window, {
  Icon, IconYeast, IconWater, IconFlour, IconSalt, IconOil,
  IconThermo, IconOven, IconClock,
  GlyphRoman, GlyphSheetPan, GlyphCustom, GlyphPlus,
  IconList, IconCalc, IconTimeline, IconBook, IconCog, IconMore,
  IconPlay, IconPause, IconCheck, IconReset,
});
