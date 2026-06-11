/**
 * 05-02-combination.ts
 *
 * PURPOSE: More combination operators that solve very specific "when do I emit?" problems.
 *
 * forkJoin([a$, b$, c$])
 *   - Waits for ALL to complete, then emits an array (or object) of their LAST values.
 *   - The RxJS equivalent of Promise.all.
 *   - Only useful when you truly need "everything finished".
 *
 * withLatestFrom(other$)
 *   - When the SOURCE emits, attach the most recent value from the other stream(s).
 *   - Does NOT emit when the "other" stream emits by itself.
 *   - Extremely common for: "user clicked Save → send current form + latest userId"
 *
 * race(...observables)
 *   - The first one to emit wins. All others are ignored/unsubscribed.
 *   - Useful for "timeout vs real response" or "multiple data sources, take fastest".
 *
 * EXPECTED (high level):
 *   [forkJoin] last values: [ 'A done', 'B done' ]
 *   [withLatestFrom] click with latest user: { click: 1, user: 'u42' }
 *   [race] winner: fast
 *
 * RUN: npx ts-node 05-02-combination.ts
 */

import { forkJoin, of, interval, fromEvent, race } from 'rxjs';
import { map, take, withLatestFrom, delay } from 'rxjs/operators';
import { EventEmitter } from 'events';

// Polyfill for fromEvent demo
(global as any).document = new EventEmitter();

console.log('=== forkJoin (like Promise.all) ===');
const a$ = of('A done').pipe(delay(200));
const b$ = of('B done').pipe(delay(350));

forkJoin([a$, b$]).subscribe(lastValues => {
  console.log('[forkJoin] last values:', lastValues);
});

// You can also pass an object for named results:
forkJoin({ user: of({ id: 1 }), posts: of([1, 2]).pipe(delay(100)) })
  .subscribe(obj => console.log('[forkJoin object]', obj));

console.log('\n=== withLatestFrom (source controls emission) ===');
const clicks$ = fromEvent((global as any).document as any, 'click').pipe(
  map((e: any) => ({ click: e })),
  take(2)
);

const currentUser$ = of('u42'); // in reality this would be a BehaviorSubject or store slice

clicks$.pipe(
  withLatestFrom(currentUser$),
  map(([click, user]) => ({ click: (click as any).click, user }))
).subscribe(combined => console.log('[withLatestFrom] click with latest user:', combined));

// Fire a simulated click
setTimeout(() => (global as any).document.emit('click', { type: 'click' }), 50);

console.log('\n=== race (first to emit wins) ===');
const slow$ = of('slow').pipe(delay(800));
const fast$ = of('fast').pipe(delay(120));

race(slow$, fast$).subscribe(winner => console.log('[race] winner:', winner));