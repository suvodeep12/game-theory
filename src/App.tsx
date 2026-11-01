import { useEffect, useMemo, useRef, useState } from 'react';
import type { Action, Result, Round, Mode } from './engine.ts';
import { IDS, NAMES, RULES, PAIRS, EQUAL, MODES, VERSION, encounter, normalized, payoff, play, mean } from './engine.ts';
import { COPY, DEFAULT, TOPICS, conditions, readLink, shareURL, validateConfig } from './experiments.ts';
import type { Config, Topic } from './experiments.ts';
import type { WorkerReply } from './worker.ts';
import { Avatar } from './Avatar.tsx';
import { roundTotals, tournamentScores } from './scores.ts';

const format = (n: number) => n.toFixed(3);
const percent = (n: number) => `${(n * 100).toFixed(1)}%`;
const integer = (n: number) => n.toLocaleString('en-US');
const modeNames: Record<Mode, string> = { none: 'No mistakes', action: 'Accidental actions', observation: 'Misunderstood actions', both: 'Both kinds of mistake' };
const conditionName = (result: Result, config: Config) => config.topic === 'mistakes' ? modeNames[result.condition.mode] : result.condition.label;
const initialPair = PAIRS.findIndex(([a, b]) => a === 1 && b === 2);
const illustration = play('titfortat', 'defect', 5, 'illustration', [0, 0], .1, true).trace;
function Symbol({ action }: { action: Action }) { return <span className={`symbol ${action ? 'defect' : ''}`} aria-label={action ? 'Defect' : 'Cooperate'}>{action ? 'D' : 'C'}</span>; }
function ActionStage({ trace, players, title, caption }: { trace: Round[]; players: number[]; title: string; caption: string }) {
  return <section className="stage" aria-label={title}>
    <div className="stage-head"><div><h2>{title}</h2><p className="muted">{caption}</p></div><p className="legend"><span>C means cooperate</span><span>D means defect</span></p></div>

    <div className="table-scroll" tabIndex={0}><p className="scroll-hint">Scroll sideways to see every column.</p><table className="encounter-table"><caption className="visually-hidden">Actual actions and earned points, round by round</caption><thead><tr><th scope="col">Strategy</th>{trace.map(r => <th scope="col" key={r.round}>Round {r.round}</th>)}</tr></thead><tbody>{players.map((strategy, player) => <tr key={player}><th scope="row"><span className="strategy-identity"><Avatar strategy={strategy} /><span>{NAMES[strategy]}{players[0] === players[1] && `, player ${player + 1}`}</span></span></th>{trace.map(r => <td key={r.round}><div className="move"><Symbol action={r.actual[player]} /><span>{r.points[player]} {r.points[player] === 1 ? 'point' : 'points'}</span></div></td>)}</tr>)}</tbody></table></div>
  </section>;
}
function Payoffs() {
  return <div className="table-scroll" tabIndex={0}><p className="scroll-hint">Scroll sideways to see every column.</p><table className="payoffs"><caption>Points per round, yours first</caption><thead><tr><th scope="col">Your choice</th><th scope="col">They cooperate</th><th scope="col">They defect</th></tr></thead><tbody><tr><th scope="row">Cooperate</th><td>3 and 3</td><td>0 and 5</td></tr><tr><th scope="row">Defect</th><td>5 and 0</td><td>1 and 1</td></tr></tbody></table></div>;
}
function Introduction({ explore }: { explore: () => void }) {
  const [choices, setChoices] = useState<Action[]>([]);
  const turns = choices.map((choice, i) => ({ choice, opponent: (i === 0 ? 0 : choices[i - 1]) as Action }));
  const scores = turns.map(r => payoff(r.choice, r.opponent));
  return <>
    <section className="intro"><div><h1>Two choices. A shared consequence.</h1><p>Try a short interaction. Then explore what changes when the same rules meet again and again.</p></div><button type="button" className="text-button" onClick={explore}>Skip to experiments</button></section>
    <section className="stage learn"><div><h2>What will you choose?</h2><p>You and another player choose at the same time. Cooperating helps both of you when it is mutual. Defecting earns more immediately, whatever the other player chooses.</p><Payoffs /></div><div className="learn-play"><h3>Meet Tit for Tat</h3><p>It cooperates first, then copies your last action. No errors in this five-round introduction. These are illustrative rounds, not a tournament.</p><div className="actions"><button type="button" disabled={choices.length >= 5} onClick={() => setChoices([...choices, 0])}>Cooperate</button><button type="button" className="secondary" disabled={choices.length >= 5} onClick={() => setChoices([...choices, 1])}>Defect</button></div><div aria-live="polite">{choices.length ? <><p>Round {choices.length}: you {choices.at(-1) ? 'defected' : 'cooperated'}; they {turns.at(-1)!.opponent ? 'defected' : 'cooperated'}.</p><p>You earned {scores.at(-1)![0]}; they earned {scores.at(-1)![1]}.</p><p className="strong">Total: you {scores.reduce((s, p) => s + p[0], 0)}, them {scores.reduce((s, p) => s + p[1], 0)}.</p></> : <p>Choose an action to play round 1.</p>}</div><button type="button" className="text-button" onClick={() => setChoices([])} disabled={!choices.length}>Start again</button>{choices.length === 5 && <p>These five rounds illustrate a rule. A tournament tests all six rules over many longer encounters.</p>}</div></section>
    <section className="explanation"><h2>Why repeat the game?</h2><p>Your choice can affect what happens next. Retaliation, forgiveness, mistakes, and the mix of opponents can change the outcome. There is more than one kind of success: earning points yourself, creating shared benefit, and sustaining cooperation.</p><button type="button" onClick={explore}>Explore the experiments</button></section>
  </>;
}
function Results({ results, config, onInspect }: { results: Result[]; config: Config; onInspect: (index: number) => void }) {
  const [selected, setSelected] = useState(config.topic === 'mistakes' ? MODES.indexOf(config.mode) : 0);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const index = Math.min(selected, results.length - 1), current = results[index];
  const totalRounds = current.encounters.reduce((sum, e) => sum + e.rounds, 0);
  const rounds = Math.min(selectedRound ?? totalRounds, totalRounds);
  const cumulative = useMemo(() => tournamentScores(current, config.seed, rounds), [current, config.seed, rounds]);
  const chooseRound = (value: number) => setSelectedRound(Math.min(totalRounds, Math.max(0, Math.trunc(value))));
  const top = Math.max(...current.scores), leaders = NAMES.filter((_, i) => Math.abs(current.scores[i] - top) < 1e-12);
  const ordering = new Set(current.repetitions.map(r => r.scores.map((score, i) => ({ score, i })).sort((a, b) => b.score - a.score || a.i - b.i).map(x => x.i).join(',')));
  const weights = normalized(current.condition.weights);
  const differences = index ? current.repetitions.map((r, i) => r.collective - results[0].repetitions[i].collective) : [];
  const first = results[0], last = results[results.length - 1];
  return <section className="results" aria-labelledby="results-title">
    <h2 id="results-title" tabIndex={-1}>Tournament scores</h2>
    <label className="select-label">Which situation would you like to examine? <select value={index} onChange={e => { setSelected(Number(e.target.value)); setSelectedRound(null); }}>{results.map((r, i) => <option key={i} value={i}>{conditionName(r, config)}</option>)}</select></label>
    <h3>Points after {integer(rounds)} rounds</h3>
    <p>These are accumulated points across all scheduled games in this situation, combining 100 tournament repetitions.</p>
    <div className="tournament-timeline"><label>Rounds completed across all games<input aria-label="Tournament round" type="range" min="0" max={totalRounds} value={rounds} onChange={e => chooseRound(Number(e.target.value))} /></label><label>Go to round<input aria-label="Go to tournament round" type="number" min="0" max={totalRounds} step="1" value={rounds} onChange={e => chooseRound(Number(e.target.value))} /></label><p className="helper">{integer(rounds)} of {integer(totalRounds)} rounds. Each round is one pair making a simultaneous move.</p></div>
    <ul className="player-scores" aria-label="Cumulative tournament points">{NAMES.map((name, i) => <li className="player-score" key={name} data-strategy={IDS[i]}><Avatar strategy={i} /><div><h4>{name}</h4><p className="strategy-family">{i === 1 ? 'Nasty · defects first' : 'Nice · never defects first'}</p><p className="helper">{integer(cumulative.played[i])} player-rounds played</p></div><p className="player-points"><strong>{integer(cumulative.points[i])}</strong><span>points</span></p></li>)}</ul>
    <p className="helper">“Nice” describes the rule in error-free play, not forgiveness. Mistakes can change actual actions. Both player instances count in self-play games. Scores also depend on how many rounds each strategy has played.</p>
    <p className="helper">These raw points count the fixed schedule. Opponent mixes reweight the averages below; changing only a mix does not change these raw totals.</p>
    <details className="cooperation-details"><summary>How often did players cooperate?</summary>
    <p className="finding">{results.length > 1 ? <>Players cooperated on <strong>{percent(first.cooperation)}</strong> of moves with {conditionName(first, config).toLowerCase()}, compared with <strong>{percent(last.cooperation)}</strong> with {conditionName(last, config).toLowerCase()}.</> : <>Players cooperated on <strong>{percent(first.cooperation)}</strong> of moves in these runs.</>}</p>
    <p>Cooperation means choosing to help the other player. These percentages average the simulated population across 100 tournament runs for each situation.</p>
    {results.length > 1 && <dl className="outcome-comparison" aria-label="How often players cooperated">{results.map((r, i) => <div key={i}><dt>{conditionName(r, config)}</dt><dd>{percent(r.cooperation)} <span>of moves were cooperative</span></dd></div>)}</dl>}
    <p className="result-limit">This describes these simulated runs. Different opponents or settings can change the outcome; it does not establish what people will do.</p>
    {results.length === 1 && <p>{config.topic === 'length' ? 'Encounter lengths varied naturally from 200 to 500 rounds. To explore length and score together, open “Follow a single encounter” below.' : 'The rewards stayed fixed: this demonstrates the dilemma, rather than comparing different incentives.'}</p>}
    </details>
    <details className="score-details"><summary>Compare strategy scores and variation</summary>
    <p>Cooperation and earning points are different outcomes. These tables show who earned more, how much results varied, and the shared benefit.</p>
    <p className="finding"><strong>{leaders.join(' and ')}</strong> {leaders.length === 1 ? 'had the highest average' : 'shared the highest average'} in {current.condition.label.toLowerCase()}: <strong>{format(top)} points per move</strong>. This is a measured average, not statistically proven superiority.</p>
    <p>{ordering.size > 1 ? `The strategy ordering varied across repetitions (${ordering.size} distinct orderings). There is no single ordering shared by every run.` : 'The strategy ordering was unchanged across these repetitions. That does not establish robustness to other settings or opponents.'}</p>
    <div className="table-scroll" tabIndex={0}><p className="scroll-hint">Scroll sideways to see every column.</p><table><caption>Individual performance and observed variation in this condition</caption><thead><tr><th scope="col">Strategy</th><th scope="col">Mean points</th><th scope="col">Range across 100 runs</th><th scope="col">Population share</th></tr></thead><tbody>{NAMES.map((name, i) => { const values = current.repetitions.map(r => r.scores[i]); return <tr key={name}><th scope="row">{name}</th><td className="num">{format(current.scores[i])}</td><td className="num">{format(Math.min(...values))} to {format(Math.max(...values))}</td><td>{percent(weights[i])}{weights[i] === 0 ? ' (counterfactual)' : ''}</td></tr>; })}</tbody></table></div>
    <div className="table-scroll" tabIndex={0}><p className="scroll-hint">Scroll sideways to see every column.</p><table><caption>Collective outcomes, with the selected population proportions</caption><thead><tr><th scope="col">Condition</th><th scope="col">Points per player-move</th><th scope="col">Actual cooperation</th><th scope="col">Strategy score gap</th></tr></thead><tbody>{results.map((r, i) => <tr key={i}><th scope="row">{r.condition.label}</th><td className="num">{format(r.collective)}</td><td className="num">{percent(r.cooperation)}</td><td className="num">{format(r.gap)}</td></tr>)}</tbody></table></div>
    <p className="helper">The score gap is the highest minus the lowest strategy mean, including counterfactual strategies with zero population share. It is not a measure of inequality among people. Ranges show observed minima and maxima, not confidence intervals.</p>
    {differences.length > 0 && <p className="comparison">Compared with {results[0].condition.label.toLowerCase()}, the mean paired change in collective score was <strong>{format(mean(differences))}</strong> points per player-move. Across paired repetitions: {format(Math.min(...differences))} to {format(Math.max(...differences))}.</p>}
    <button type="button" className="secondary" onClick={() => onInspect(index)}>Look inside this condition</button>
    <details><summary>Inspect all 100 repetition values</summary><div className="table-scroll tall" tabIndex={0}><p className="scroll-hint">Scroll sideways to see every column.</p><table><caption>{current.condition.label}; each row is one tournament repetition</caption><thead><tr><th scope="col">Repetition</th>{NAMES.map(name => <th scope="col" key={name}>{name}</th>)}<th scope="col">Collective</th><th scope="col">Cooperation</th></tr></thead><tbody>{current.repetitions.map((r, i) => <tr key={i}><th scope="row">{i + 1}</th>{r.scores.map((value, j) => <td className="num" key={j}>{format(value)}</td>)}<td className="num">{format(r.collective)}</td><td>{percent(r.cooperation)}</td></tr>)}</tbody></table></div></details>
    <details><summary>Read every strategy rule</summary><dl className="rule-list">{NAMES.map((name, i) => <div key={name}><dt>{name}</dt><dd>{RULES[i]}{i === 4 && ` Forgiveness: ${percent(current.condition.forgiveness)}.`}</dd></div>)}</dl></details>
    <p className="helper">Seed: {config.seed}. Rules version {VERSION}. No rankings outside these tested conditions are implied.</p>
    </details>
  </section>;
}
function Inspector({ results, config, view, setView }: { results: Result[]; config: Config; view: NonNullable<Config['view']>; setView: (view: NonNullable<Config['view']>) => void }) {
  const conditionIndex = Math.min(view.condition, results.length - 1), condition = results[conditionIndex].condition;
  const replay = useMemo(() => encounter(config.seed, view.repetition, view.pair, condition, true), [config.seed, view.repetition, view.pair, condition]);
  const row = Math.min(view.round, replay.trace.length - 1), page = Math.floor(row / 5) * 5;
  const [a, b] = PAIRS[view.pair], selected = replay.trace[row];
  const totals = roundTotals(replay.trace, row + 1);
  const update = (change: Partial<NonNullable<Config['view']>>) => setView({ ...view, ...change });
  const lengths = results[conditionIndex].encounters.filter(e => e.pair === view.pair);
  return <section className="inspection" id="inspect"><h2>Look inside an encounter</h2><p>This is a reproducible encounter from the completed tournament, not a representative proof.</p>
    <div className="inspector-controls"><label>Condition<select value={conditionIndex} onChange={e => update({ condition: Number(e.target.value), round: 0 })}>{results.map((r, i) => <option key={i} value={i}>{r.condition.label}</option>)}</select></label><label>Strategy pair<select value={view.pair} onChange={e => update({ pair: Number(e.target.value), round: 0 })}>{PAIRS.map(([i, j], pair) => <option key={pair} value={pair}>{NAMES[i]} / {NAMES[j]}</option>)}</select></label><label>Repetition<input type="number" min="1" max="100" value={view.repetition + 1} onChange={e => update({ repetition: Math.min(99, Math.max(0, Number(e.target.value) - 1)), round: 0 })} /></label></div>
    <p className="helper">{replay.summary.rounds} rounds. Action-error probability: {percent(replay.summary.rates[0])}; observation-error probability: {percent(replay.summary.rates[1])}. The two players use these same rates, with independent flips. No state carries over from earlier encounters.</p>
    <div className="encounter-scores" aria-label={`Encounter totals after round ${row + 1}`}>{[a, b].map((strategy, player) => <div className="encounter-player" key={player}><Avatar strategy={strategy} /><div><strong>{NAMES[strategy]}, player {player + 1}</strong><p>{integer(totals[player])} points after round {row + 1}</p></div></div>)}</div>
    <ActionStage title={`Rounds ${page + 1} to ${Math.min(page + 5, replay.trace.length)}`} caption="Actual actions and their payoffs in the selected encounter." trace={replay.trace.slice(page, page + 5)} players={[a, b]} />
    <label className="round-slider">Select round {row + 1} of {replay.trace.length}<input type="range" min="0" max={replay.trace.length - 1} value={row} onChange={e => update({ round: Number(e.target.value) })} /></label>
    <div className="actions"><button type="button" className="secondary" disabled={page === 0} onClick={() => update({ round: Math.max(0, page - 5) })}>Previous five rounds</button><button type="button" className="secondary" disabled={page + 5 >= replay.trace.length} onClick={() => update({ round: page + 5 })}>Next five rounds</button></div>
    <div className="table-scroll" tabIndex={0}><p className="scroll-hint">Scroll sideways to see every column.</p><table><caption>What each player knew in round {row + 1}</caption><thead><tr><th scope="col">Player</th><th scope="col">Intended</th><th scope="col">Actual</th><th scope="col">Perceived opponent</th><th scope="col">Earned</th></tr></thead><tbody>{[a, b].map((id, player) => <tr key={player}><th scope="row">{NAMES[id]}{a === b ? `, player ${player + 1}` : ''}</th><td>{selected.intended[player] ? 'Defect' : 'Cooperate'}</td><td>{selected.actual[player] ? 'Defect' : 'Cooperate'}</td><td>{selected.observed[player] ? 'Defect' : 'Cooperate'}</td><td>{selected.points[player]}</td></tr>)}</tbody></table></div>
    {config.topic === 'length' && <div className="length-study"><h3>Length and score for this pair</h3><p>Each point is one sampled encounter. Compare within the same pair; the sampled error rates may differ. This is an association, not a controlled duration experiment.</p><svg viewBox="0 0 640 250" role="img" aria-label={`Points per move for ${NAMES[a]} against ${NAMES[b]}, plotted against encounter length`}><line x1="50" y1="210" x2="610" y2="210" /><line x1="50" y1="20" x2="50" y2="210" />{lengths.map((e, i) => <circle key={i} cx={50 + (e.rounds - 200) / 300 * 560} cy={210 - e.totals[0] / e.rounds / 5 * 180} r="4"><title>{e.rounds} rounds; {format(e.totals[0] / e.rounds)} points; action error {percent(e.rates[0])}; observation error {percent(e.rates[1])}</title></circle>)}<text x="50" y="235">200 rounds</text><text x="510" y="235">500 rounds</text><text x="8" y="32">5</text><text x="8" y="210">0</text></svg><details><summary>Read the plotted values as a table</summary><div className="table-scroll tall" tabIndex={0}><p className="scroll-hint">Scroll sideways to see every column.</p><table><caption>{NAMES[a]} against {NAMES[b]}</caption><thead><tr><th>Repetition</th><th>Rounds</th><th>Points per move</th><th>Action error</th><th>Observation error</th></tr></thead><tbody>{lengths.map(e => <tr key={e.repetition}><td>{e.repetition + 1}</td><td>{e.rounds}</td><td>{format(e.totals[0] / e.rounds)}</td><td>{percent(e.rates[0])}</td><td>{percent(e.rates[1])}</td></tr>)}</tbody></table></div></details></div>}
  </section>;
}
function boot() {
  if (!location.hash || ['#main', '#model', '#illustration', '#inspect', '#'].includes(location.hash)) return { config: structuredClone(DEFAULT), error: '', shared: false };
  try { return { config: readLink(location.hash), error: '', shared: true }; }
  catch (e) { return { config: structuredClone(DEFAULT), error: (e as Error).message, shared: false }; }
}
export default function App() {
  const [initial] = useState(boot), [config, setConfig] = useState(initial.config), [error, setError] = useState(initial.error);
  const [completed, setCompleted] = useState<{ config: Config; results: Result[]; milliseconds: number } | null>(null);
  const [running, setRunning] = useState(false), [progress, setProgress] = useState(0), [prediction, setPrediction] = useState('');
  const [view, setView] = useState<NonNullable<Config['view']>>(initial.config.view ?? { condition: 0, pair: initialPair, repetition: 0, round: 0 });
  const [link, setLink] = useState(''), [notice, setNotice] = useState('');
  const worker = useRef<Worker | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = () => { worker.current?.terminate(); worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; };
  const update = (value: Partial<Config>) => { setConfig(c => ({ ...c, ...value, view: undefined })); setError(''); setLink(''); };
  function run(input = config) {
    let snapshot: Config;
    try { snapshot = validateConfig(input); } catch (e) { setError((e as Error).message); return; }
    stop(); setRunning(true); setProgress(0); setError(''); setCompleted(null); setLink(''); setNotice('');
    try {
      const next = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }); worker.current = next;
      next.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
        if (worker.current !== next) return;
        if (data.type === 'progress') setProgress(data.done / data.total);
        else if (data.type === 'error') { stop(); setRunning(false); setError(data.message); }
        else {
          stop(); setRunning(false); setProgress(1); setCompleted({ config: snapshot, results: data.results, milliseconds: data.milliseconds });
          setView(snapshot.view ?? { condition: snapshot.topic === 'mistakes' ? MODES.indexOf(snapshot.mode) : 0, pair: initialPair, repetition: 0, round: 0 });
          history.pushState(null, '', shareURL(snapshot, location.href));
          setNotice('Experiment complete. Results are ready below.');
        }
      };
      next.onerror = () => { if (worker.current === next) { stop(); setRunning(false); setError('The simulation worker failed. Try running the experiment again.'); } };
      timer.current = setTimeout(() => { stop(); setRunning(false); setError('The experiment exceeded 30 seconds and was cancelled. No partial result is shown. Try again on a faster device.'); }, 30000);
      next.postMessage(snapshot);
    } catch { stop(); setRunning(false); setError('This browser could not start a simulation worker. Use a browser with Web Worker support.'); }
  }
  useEffect(() => {
    if (initial.shared && initial.config.topic !== 'intro') run(initial.config);
    const navigate = () => { if (location.hash && !location.hash.startsWith('#run=')) return; const state = boot(); stop(); setRunning(false); setConfig(state.config); setError(state.error); setCompleted(null); setLink(''); setNotice('Settings restored. Run the experiment to regenerate results.'); };
    window.addEventListener('popstate', navigate); window.addEventListener('hashchange', navigate);
    return () => { stop(); window.removeEventListener('popstate', navigate); window.removeEventListener('hashchange', navigate); };
  }, []);
  useEffect(() => {
    if (!completed) return;
    document.getElementById('results-title')?.focus({ preventScroll: true });
    document.getElementById('results-title')?.scrollIntoView({ block: 'start' });
  }, [completed]);
  function navigate(topic: Topic) { stop(); setRunning(false); update({ topic }); setCompleted(null); setNotice(''); setPrediction(''); history.pushState(null, '', shareURL({ ...config, topic, view: undefined }, location.href)); }
  async function share() {
    const target = completed ? { ...completed.config, view } : config;
    try { const url = shareURL(target, location.href); setLink(url); try { await navigator.clipboard.writeText(url); setNotice('Reproducible experiment link copied.'); } catch { setNotice('Copy the experiment link below.'); } }
    catch (e) { setError((e as Error).message); }
  }
  const stale = completed && JSON.stringify({ ...completed.config, view: undefined }) !== JSON.stringify({ ...config, view: undefined });
  const topic = config.topic === 'intro' ? null : COPY[config.topic];
  let mix: number[] = []; try { mix = normalized(config.weights); } catch { /* The Run validation displays an all-zero mix error. */ }
  return <div className="shell">
    <a className="skip" href="#main">Skip to content</a>
    <header className="top"><a className="wordmark" href="#" onClick={e => { e.preventDefault(); navigate('intro'); }}>Game Theory</a><nav className="topnav" aria-label="Main"><button type="button" className={`nav-link ${!topic ? 'active' : ''}`} onClick={() => navigate('intro')}>Introduction</button><button type="button" className={`nav-link ${topic ? 'active' : ''}`} onClick={() => navigate('mistakes')}>Explore</button><a href="#model" onClick={() => { const model = document.getElementById('model') as HTMLDetailsElement | null; if (model) model.open = true; }}>How it works</a><button type="button" className="secondary small" onClick={() => navigate('intro')}>New here?</button></nav></header>
    {topic && <label className="topic-picker">Choose a question<select value={config.topic} onChange={e => navigate(e.target.value as Topic)}>{TOPICS.filter(t => t !== 'intro').map(t => <option key={t} value={t}>{COPY[t].question}</option>)}</select></label>}
    {error && <div role="alert" className="error"><p>{error}</p><button type="button" className="secondary small" onClick={() => { history.replaceState(null, '', location.pathname + location.search); setError(''); setConfig(structuredClone(DEFAULT)); }}>Use default settings</button></div>}
    <main id="main">
      {!topic ? <Introduction explore={() => navigate('mistakes')} /> : <>
        <section className="intro experiment-intro"><div><h1>{topic.question}</h1><p>{topic.description}</p></div></section>
        {config.topic === 'incentives' && <section className="explanation"><h2>The immediate gain and the shared cost</h2><Payoffs /><p>Defection earns more in either column. Yet mutual cooperation gives each player 3 points rather than the 1 point from mutual defection. The tournament below repeats these same incentives; it does not test different rewards.</p></section>}
        <section className="setup" aria-label="Experiment settings">
          <h2>What we’ll test</h2>
          <p>Six strategies use fixed rules to decide whether to cooperate. Some always cooperate, some never do, and others respond to the other player.</p>
          <p>{config.topic === 'mistakes' ? 'The same six strategies play in four situations: no mistakes, accidental actions, misunderstood actions, and both. Follow their points, then explore how often they cooperate.' : config.topic === 'opponents' ? 'The games stay the same. We’ll compare averages for an equal opponent mix and your chosen mix. The raw point totals remain unchanged when only the mix changes.' : config.topic === 'forgiveness' ? 'One strategy sometimes cooperates after the other player defects. We’ll compare its usual 10% chance of forgiving with the chance you choose.' : config.topic === 'length' ? 'The same six strategies meet for different lengths of time. Follow their points, then explore how length and score relate within a pair.' : 'The six strategies play with the rewards you saw above. Follow their points, then explore how often they cooperate.'}</p>
          <p className="helper">Each pair plays 200–500 rounds. The tournament runs 100 times per situation. After it finishes, follow each strategy’s accumulated points with the round slider. No setup needed to try the defaults.</p>
          {config.topic === 'opponents' && <fieldset><legend>Choose the second opponent mix</legend><p className="helper">“Always Defect” never cooperates. Its share can help you explore what changes when you meet it more often.</p><div className="actions"><button type="button" className="secondary small" onClick={() => update({ weights: [...EQUAL] })}>Equal shares</button><button type="button" className="secondary small" onClick={() => update({ weights: [10, 50, 10, 10, 10, 10] })}>50% Always Defect</button></div><p className="helper">Current mix: {NAMES.map((name, i) => `${name} ${mix.length ? percent(mix[i]) : '0%'}`).join('; ')}.</p><details><summary>Set each strategy’s share</summary><p className="helper">Relative weights are normalized into encounter chances. Zero-share rules remain visible as counterfactual strategies.</p><div className="weights">{NAMES.map((name, i) => <label key={name}>{name}<input type="number" min="0" max="100" step="1" value={config.weights[i]} onChange={e => update({ weights: config.weights.map((w, j) => i === j ? Number(e.target.value) : w) })} /><span>{mix.length ? percent(mix[i]) : 'No population'}</span></label>)}</div></details></fieldset>}
          {config.topic === 'forgiveness' && <label className="wide round-slider">Forgiveness after an observed defection: {Math.round(config.forgiveness * 100)}%<input type="range" min="0" max="100" value={Math.round(config.forgiveness * 100)} onChange={e => update({ forgiveness: Number(e.target.value) / 100 })} /><span className="helper">Only Generous Tit for Tat changes. Compare your choice with the 10% baseline; accidental errors stay separate.</span></label>}
          <div className="run"><button type="button" onClick={() => run()} disabled={running}>{running ? 'Running experiment…' : completed ? 'Run experiment again' : 'Run experiment'}</button>{running && <button type="button" className="text-button" onClick={() => { stop(); setRunning(false); setNotice('Cancelled. No partial result is shown.'); }}>Cancel experiment</button>}</div>
          <details className="experiment-options"><summary>Optional settings and prediction</summary>
            {config.topic !== 'mistakes' && <fieldset><legend>Allow mistakes during play</legend><div className="segment">{MODES.map(mode => <label key={mode}><input type="radio" name="errors" value={mode} checked={config.mode === mode} onChange={() => update({ mode })} />{modeNames[mode]}</label>)}</div><p className="helper">An accidental action flips the intended choice. A misunderstood action flips what the opponent thinks they saw. Enabled probabilities are sampled separately from 0 to 10% once per encounter.</p></fieldset>}
            <fieldset><legend>Record a prediction <span className="helper">Optional</span></legend><div className="predictions">{['Cooperation becomes harder to maintain', 'Forgiving rules recover more easily', 'I’m not sure yet'].map(option => <label key={option}><input type="radio" name="prediction" checked={prediction === option} onChange={() => setPrediction(option)} />{option}</label>)}</div><p className="helper">Your prediction does not change the simulation.</p></fieldset>
            <label className="seed-label">Random sample name (seed)<input value={config.seed} maxLength={64} onChange={e => update({ seed: e.target.value })} autoComplete="off" spellCheck={false} /></label><p className="helper">The same seed and settings regenerate the same events. Another seed draws a new sample, not a new model.</p><button type="button" className="secondary small" onClick={() => update({ seed: Array.from(crypto.getRandomValues(new Uint32Array(2)), n => n.toString(16).padStart(8, '0')).join('') })}>Draw a new sample</button>
          </details>
        </section>
        <div role="status" aria-live="polite" className="status">{notice}{running && <><p>Completed {Math.floor(progress * conditions(config).length * 100)} of {conditions(config).length * 100} repetitions.</p><progress aria-label="Tournament progress" max="1" value={progress} /></>}</div>
        {completed && <>{stale && <p role="status" className="warning">Settings changed. The results below still describe the previous run. Run again to evaluate your new settings.</p>}<Results key={completed.config.seed + completed.milliseconds} results={completed.results} config={completed.config} onInspect={condition => { setView(v => ({ ...v, condition })); const details = document.getElementById('encounter-details') as HTMLDetailsElement; details.open = true; document.getElementById('inspect')?.scrollIntoView({ behavior: 'auto', block: 'start' }); }} /><details id="encounter-details" open={Boolean(completed.config.view)}><summary>Follow a single encounter, round by round</summary><Inspector results={completed.results} config={completed.config} view={view} setView={setView} /></details>
        <section className="interpretation"><h2>What could you take away?</h2><p>{topic.application}</p><p className="helper">{topic.limit}</p></section>
        <div className="sharing"><button type="button" className="secondary" onClick={share}>Share this experiment</button><p className="helper">Others can rerun the same experiment from this link.{stale ? ' Sharing uses the completed run’s settings.' : ''}</p>{link && <label className="wide">Reproducible link<input readOnly value={link} onFocus={e => e.target.select()} /></label>}</div></>}
        <details id="illustration"><summary>Meet the strategies and see how they play</summary><p>Each strategy is a fixed rule for choosing whether to cooperate. Rounded characters are “nice”: they never defect first in error-free play. The angular character is “nasty”: it defects first. This short example has no mistakes and is not a tournament result.</p><ActionStage title="Tit for Tat meets Always Defect" caption="Tit for Tat cooperates first, then copies its opponent. Always Defect never cooperates." trace={illustration} players={[2, 1]} /><dl className="rule-list">{NAMES.map((name, i) => <div key={name}><dt><span className="strategy-identity"><Avatar strategy={i} /><span>{name}</span></span></dt><dd>{RULES[i]}{i === 4 && ` Forgiveness: ${percent(config.forgiveness)}.`}</dd></div>)}</dl></details>
      </>}
      <details className="model" id="model"><summary>How the model works, and what it leaves out</summary><p>Every rule meets every other rule, including an independent instance of itself. That is 21 encounters per repetition. Both players choose simultaneously. Every encounter lasts a uniformly random 200 to 500 rounds. Strategy memory resets between encounters.</p><p>Scores are points per move averaged across encounters, not raw totals. Self-play averages both players once. Opponent proportions determine expected encounter frequencies; collective outcomes also weight each focal strategy by its population share. There is no evolution.</p><p>Enabled action and observation probabilities are sampled independently and uniformly from 0 to 10% once per encounter. Both players then use those same rates, with independent flips. Win-Stay, Lose-Shift sees its true payoff and actual action.</p><p>Matched comparisons share encounter lengths and underlying random draws. Variation is measured across 100 repetitions, not independent rounds. No significance tests or universal winner claims are made. Randomness is deterministic under rules version {VERSION}; unsupported versions cannot be silently replayed.</p><p>People can communicate, leave, change their intentions, and learn. These fixed strategies cannot. Future opponent memory and learning are outside v1.</p><p>Historical context: <a href="https://esp.mit.edu/download/2dd80247-be60-4e73-b49d-91b5b6988ff0/S12850_axelrod_1980.pdf" target="_blank" rel="noreferrer">Axelrod (1980)</a> and <a href="https://arxiv.org/abs/2001.05911" target="_blank" rel="noreferrer">Broader tournaments</a>.</p></details>
    </main>
    <footer><span>A model of behaviour, with limits.</span><span>Runs in your browser. No account, analytics, or result uploads.</span></footer>
  </div>;
}
