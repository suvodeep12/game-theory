import type { CSSProperties } from 'react';
import type { Custom } from './engine.ts';

// The six game pieces plus the one you design. Round heads never defect first; spiky or square ones do. Each carries a tell for its rule.
export const COLORS = ['#ffc23d', '#e5383b', '#17b0a3', '#6f3fd0', '#8ccf4d', '#ff85b8', '#c07a3c'];
export const PLAIN = [
  'Cooperates every round, no matter what.',
  'Defects every round, no matter what.',
  'Starts with C, then copies your last move.',
  'Plays C until you defect once. Then D forever.',
  'Copies your last move, but sometimes forgives a D.',
  'Keeps its move after 3 or 5 points; switches after 0 or 1.',
];
export const YOURS = 'Your piece';
const L = (a: 0 | 1) => (a ? 'D' : 'C');
export const describe = (c: Custom) => `Starts with ${L(c.first)}; answers C with ${L(c.afterC)} and D with ${L(c.afterD)}${c.forgives && c.afterD ? ', sometimes forgiving' : ''}.`;
// Never defects first in error-free play: opens with C and answers C with C.
export const isNice = (c: Custom) => !c.first && !c.afterC;
// Which of the six the design behaves exactly like, or -1 (Grim and Win-Stay are not reactive, so no design matches them).
const TWINS: Record<string, number> = { '000': 0, '111': 1, '001': 2, '001f': 4 };
export const twin = (c: Custom) => TWINS[`${c.first}${c.afterC}${c.afterD}${c.afterD && c.forgives ? 'f' : ''}`] ?? -1;

const INK = '#10173a';
const BASE = 'M15 33c0-3 4-4 9-4s9 1 9 4l4 14c1 3-3 5-13 5S10 50 11 47z';
const PAWN = BASE + 'M24 9a10 10 0 1 1 0 20a10 10 0 1 1 0-20z';
const LOOKS: { body: string; extra?: string; extraFill?: string; eyes: number; mouth: string }[] = [
  { body: PAWN, eyes: 18, mouth: 'M19.5 22.5q4.5 4 9 0' },
  { body: 'M24 5L37 46c1 4-3 6-13 6s-14-2-13-6z', eyes: 31, mouth: 'M17.5 26.5l5 2M30.5 26.5l-5 2M21 37h6' },
  { body: 'M14 6.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9zM34 6.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9z' + PAWN, eyes: 18, mouth: 'M22 23.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0' },
  { body: BASE + 'M15 9h18a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4z', extra: 'M11 12h26v4H11z', extraFill: INK, eyes: 20.5, mouth: 'M21 25h6' },
  { body: PAWN, extra: 'M15 5.5a9 2.8 0 1 0 18 0a9 2.8 0 1 0-18 0z', extraFill: '#ffd23a', eyes: 18, mouth: 'M19 21.5q5 5 10 0' },
  { body: PAWN, extra: 'M17 7a7 4 0 0 1 14 0M31 7l-4.5-.8M31 7l.6-4.4', extraFill: 'none', eyes: 18, mouth: 'M19.5 23q2.25-2 4.5 0t4.5 0' },
  { body: PAWN, extra: 'M24 0l2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7z', extraFill: '#ffd23a', eyes: 18, mouth: 'M20 23h8' },
];

export function Piece({ s, size = 40, stroke = 2, face = true }: { s: number; size?: number; stroke?: number; face?: boolean }) {
  const l = LOOKS[s], line = { stroke: INK, strokeWidth: stroke, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
  return <svg className="piece" viewBox="0 0 48 60" width={size} height={size * 1.25} aria-hidden="true" style={{ '--i': s } as CSSProperties}>
    <path d={l.body} fill={COLORS[s]} {...line} />
    {l.extra && <path d={l.extra} fill={l.extraFill} {...line} />}
    <g className="eyes"><circle cx="20.5" cy={l.eyes} r={stroke + .3} fill={INK} /><circle cx="27.5" cy={l.eyes} r={stroke + .3} fill={INK} /></g>
    {face && <path d={l.mouth} fill="none" {...line} />}
  </svg>;
}
