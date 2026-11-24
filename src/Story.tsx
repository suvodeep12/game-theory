import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { NAMES } from './engine.ts';
import { PLAIN, Piece } from './Pieces.tsx';

const Arrow = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const SIX = [0, 1, 2, 3, 4, 5];

export function Opening() {
  return <main className="lid opening">
    <div className="frame">
      <p className="kicker"><span>A game of cooperation and conflict</span><span>1 curious player · 1 minute of rules</span></p>
      <div className="hero">
        <h1>Who inherits the world?</h1>
        <p className="lead">Six kinds of piece share one board. Every turn they play their neighbours and copy whoever scored best. Learn the rules, then rig the game.</p>
        <div className="shelf" aria-hidden="true">{SIX.map(s => <Piece key={s} s={s} size={92} />)}</div>
        <div className="actions">
          <a className="btn yellow big" href="#rules">Read the rules<Arrow /></a>
          <a className="btn ghost big" href="#board">Skip to the board</a>
        </div>
      </div>
      <ul className="facts"><li>6 strategies</li><li>2,304 squares</li><li>No winner is scripted</li></ul>
    </div>
  </main>;
}

const LABELS = ['The choice', 'Meet the six', 'Neighbours', 'Copy the best', 'Your turn'];
const POWERS = [
  { title: 'Paint pieces', text: 'Pick a piece and paint it anywhere on the board.', icon: 'M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3' },
  { title: 'Make storms', text: 'Paint weather where moves slip and get misread.', icon: 'M7 15a4 4 0 0 1 .5-8A5.5 5.5 0 0 1 18 8a3.5 3.5 0 0 1 0 7zM9 18l-1 3M13 18l-1 3M17 18l-1 3' },
  { title: 'Rewind', text: 'Drag the score track back, then change the past.', icon: 'M4 12a8 8 0 1 0 3-6.2M4 4v5h5M12 8v4l3 2' },
  { title: 'Inspect', text: 'Tap any piece to see why it is winning or losing.', icon: 'M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13zM15.5 15.5L20 20' },
];
// Illustrative neighbourhoods for rules 3 and 4; the scores are labelled as examples on the card.
const HOOD = [0, 2, 0, 1, 2, 0, 0, 4, 0];
const BEFORE = [2, 0, 3, 1, 0, 2, 2, 4, 0], AFTER = [2, 0, 3, 1, 2, 2, 2, 4, 0];
const SCORES = ['3.00', '2.88', '2.75', '1.50', '2.63', '2.75', '2.75', '2.88', '2.88'];

// mark: highlighted yellow (best or just changed); ring: outlined (the piece deciding).
function Hood({ kinds, mark, ring = -1, scores, compact, label }: { kinds: number[]; mark: number; ring?: number; scores?: string[]; compact?: boolean; label: string }) {
  return <div className={`hood${compact ? ' compact' : ''}`} role="img" aria-label={label}>
    {kinds.map((k, i) => <span key={i} className={i === mark ? 'mark' : i === ring ? 'ring' : undefined}>
      <Piece s={k} size={compact ? 34 : 40} stroke={2.4} face={!compact} />{scores && <b className="num">{scores[i]}</b>}
    </span>)}
  </div>;
}

// start: the label that sends a first-time visitor to the fresh board, or null once a game is under way.
export function Rules({ onHome, start }: { onHome: (e: MouseEvent) => void; start: string | null }) {
  const [card, setCard] = useState(0);
  const [move, setMove] = useState<'C' | 'D' | null>(null);
  const go = (n: number) => setCard(Math.max(0, Math.min(4, n)));
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || (e.target as HTMLElement).closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') setCard(c => Math.min(4, c + 1));
      if (e.key === 'ArrowLeft') setCard(c => Math.max(0, c - 1));
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, []);

  return <main className="lid rules">
    <header className="bar">
      <a className="wordmark" href="./" onClick={onHome}>Who inherits the world?</a>
      <a className="btn ghost" href="#board" aria-label={start ? 'Skip to the board' : 'Back to the board'}>
        <span className="hide-narrow">{start ? 'Skip to the board' : 'Back to the board'}</span><span className="only-narrow">{start ? 'Skip' : 'Board'}</span></a>
    </header>
    <h1 className="visually-hidden">The rules</h1>
    <p className="visually-hidden" aria-live="polite">Rule {card + 1} of 5: {LABELS[card]}</p>
    <div className="deck"><div className="stack">
      <span className="under u2" aria-hidden="true" /><span className="under u1" aria-hidden="true" />
      <article key={card} className="rule-card">
        <div className="rule-top"><span>Rule {card + 1}</span><span>{LABELS[card]}</span></div>

        {card === 0 && <>
          <h2>Two pieces meet. Each picks C or D, in secret.</h2>
          <p className="muted">C means cooperate. D means defect. Then both score points:</p>
          <table className="payoffs">
            <caption className="visually-hidden">Points for each pair of moves: yours first, theirs second</caption>
            <thead><tr><td /><th scope="col">They play C</th><th scope="col">They play D</th></tr></thead>
            <tbody>
              <tr><th scope="row">You play C</th>
                <td className={`cc${move === 'C' ? ' picked' : ''}`}><b>3 · 3</b><span>Both do well</span></td>
                <td className="cd"><b>0 · 5</b><span>You get taken</span></td></tr>
              <tr><th scope="row">You play D</th>
                <td className={`dc${move === 'D' ? ' picked' : ''}`}><b>5 · 0</b><span>You take them</span></td>
                <td className="dd"><b>1 · 1</b><span>Both lose out</span></td></tr>
            </tbody>
          </table>
          <div className="try">
            <span>Try it:</span>
            <button className="move" aria-pressed={move === 'C'} onClick={() => setMove('C')}>C · Cooperate</button>
            <button className="move" aria-pressed={move === 'D'} onClick={() => setMove('D')}>D · Defect</button>
          </div>
          {move && <p className="result" role="status">{move === 'C' ? 'They played C too. You score 3, they score 3.' : 'They played C. You score 5, they score 0. One win, but these pieces will meet again, round after round.'}</p>}
        </>}

        {card === 1 && <>
          <h2>Six pieces, six rules.</h2>
          <ul className="six">{SIX.map(s => <li key={s}><Piece s={s} size={52} /><span><strong>{NAMES[s]}</strong>{PLAIN[s]}</span></li>)}</ul>
          <p className="muted small">Round pieces never defect first. The spiky one always does.</p>
        </>}

        {card === 2 && <div className="split">
          <div className="text-col">
            <h2>Every turn, each piece plays all eight neighbours.</h2>
            <p className="muted">Each meeting is a long match of a few hundred rounds. A piece’s score is its average points per round across all eight.</p>
            <p className="muted">The board wraps around: a piece on the left edge neighbours the right edge.</p>
          </div>
          <Hood kinds={HOOD} mark={4} label="A Tit for Tat piece in the middle of its eight neighbours" />
        </div>}

        {card === 3 && <>
          <h2>Then every piece becomes the best scorer nearby.</h2>
          <div className="before-after">
            <Hood kinds={BEFORE} mark={0} ring={4} scores={SCORES} compact label="Before: the middle Always Cooperate scores 2.63; the Tit for Tat in the top left scores 3.00, the best nearby" />
            <svg viewBox="0 0 44 24" width="44" height="24" aria-hidden="true"><path d="M2 12h36M30 4l9 8-9 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <Hood kinds={AFTER} mark={4} compact label="After: the middle piece has become Tit for Tat" />
          </div>
          <p className="muted">Each piece compares itself with its eight neighbours and turns into whoever scored highest. If it already scores best, it stays. Now and then, mutation also turns a random piece into any of the six.</p>
          <p className="muted small">Example scores, in points per round.</p>
        </>}

        {card === 4 && <>
          <h2>Now it’s your board.</h2>
          <ul className="powers">{POWERS.map(p => <li key={p.title}>
            <span className="power-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.icon} /></svg></span>
            <span><strong>{p.title}</strong>{p.text}</span></li>)}</ul>
          <div className="try"><a className="btn yellow" href="#board">{start ?? 'Back to the board'}</a><span className="muted small">Or pick another setup on the board.</span></div>
        </>}
      </article>
    </div></div>
    <nav className="deck-nav" aria-label="Rules">
      <button className="btn ghost" onClick={() => go(card - 1)} disabled={card === 0}>Back</button>
      <div className="pips">{LABELS.map((l, i) => <button key={l} onClick={() => go(i)} aria-label={`Rule ${i + 1}: ${l}`} aria-current={i === card ? 'step' : undefined}><span className={i === card ? 'on' : i < card ? 'done' : undefined} /></button>)}</div>
      {card < 4 ? <button className="btn yellow" onClick={() => go(card + 1)}><span>Next<span className="hide-narrow">: {LABELS[card + 1].toLowerCase()}</span></span></button> : <span className="nav-spacer" />}
    </nav>
  </main>;
}
