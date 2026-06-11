/**
 * 05-combination.ts
 *
 * PURPOSE: combineLatest (and merge) — emit based on "latest from all".
 *
 * combineLatest([a$, b$])
 *   - Emits an array [latestA, latestB] EVERY TIME any of the sources emits
 *     (after ALL sources have emitted at least once).
 *   - Very useful for "form state + validation" or "multiple data sources that
 *     should be rendered together".
 *
 * merge is shown again here for contrast (already covered in 04-02).
 *
 * EXPECTED:
 *   (timer starts ticking 0,1,2 every second)
 *   merge emits: 0
 *   merge emits: 1
 *   merge emits: User Click!     ← click can arrive in between
 *   merge emits: 2
 *   combineLatest emits: [ 'User Click!', 0 ]  ← note: click value + the latest timer
 *   (later timer ticks would also cause combineLatest to re-emit with latest click)
 *
 * RUN: npx ts-node 05-combination.ts
 */

import { merge, combineLatest, fromEvent, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).document = new EventEmitter();

const clicks$ = fromEvent((document as any), 'click');
const timer$ = interval(1000).pipe(take(3)); // taking 3 to avoid infinite loop in testing

merge(clicks$, timer$).subscribe(v => console.log('merge emits:', v));           // whichever fires first
combineLatest([clicks$, timer$]).subscribe(([c,t]) => console.log('combineLatest emits:', c,t));

// Trigger to see it work
setTimeout(() => (document as any).emit('click', 'User Click!'), 1500);