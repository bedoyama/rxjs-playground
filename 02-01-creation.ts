/**
 * 02-01-creation.ts
 *
 * PURPOSE: Show the most common "factory" / creation operators.
 * These are how you normally create Observables instead of using `new Observable(...)`.
 *
 * COVERED:
 * - of(...values)          → emit given values synchronously then complete
 * - from(array|promise|iterable) → convert something into an Observable
 * - interval(ms)           → emit 0,1,2... forever every ms (cold)
 * - timer(delay, period?)  → emit after delay, then optionally repeat
 * - fromEvent(target, name)→ bridge DOM / EventEmitter / Node events
 * - ajax.getJSON(url)      → simple HTTP (from 'rxjs/ajax')
 * - throwError(() => err)  → immediately error
 * - EMPTY                  → immediately complete with no values
 *
 * WHY USE THESE?
 * - They are the "entry points". Almost every real stream starts from one of these.
 *
 * EXPECTED (abbreviated, timings approximate):
 *   of: 1
 *   of: 2
 *   of: 3
 *   from array: 1
 *   from array: 2
 *   from array: 3
 *   from promise: done
 *   interval: 0
 *   interval: 1
 *   interval: 2
 *   (timer waits 3s then 0,1,2)
 *   Clicked! ...
 *   User API response: {id:1, ...}
 *   Caught an error: boom
 *   EMPTY completes immediately with no values
 *
 * RUN: npx ts-node 02-01-creation.ts
 */

// ==================== POLYFILLS FOR NODE.JS ====================
import { of, from, interval, timer, fromEvent, throwError, EMPTY } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { take } from 'rxjs/operators';
import { EventEmitter } from 'events';

(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter(); // Mock document as an EventEmitter

// 1. Static values (synchronous emission)
of(1, 2, 3).subscribe(v => console.log('of:', v));                    // emits 1→2→3→complete
from([1,2,3]).subscribe(v => console.log('from array:', v));          // same, but from array/iterable
from(Promise.resolve('done')).subscribe(v => console.log('from promise:', v));

// 2. Time-based (using take(3) so they don't run forever in testing)
interval(1000).pipe(take(3)).subscribe(v => console.log('interval:', v));                 // 0→1→2 then complete
timer(3000, 1000).pipe(take(3)).subscribe(v => console.log('timer:', v));                 // wait 3s, then emit 0,1,2 every 1s

// 3. DOM / external events + real HTTP
fromEvent((document as any), 'click').subscribe(e => console.log('Clicked!', e));   
// Actual JSON request (uses the xhr2 polyfill)
ajax.getJSON('https://jsonplaceholder.typicode.com/users/1')
  .subscribe(res => console.log('User API response:', res));

// Simulate a click event after 1 second so we can see it working
setTimeout(() => {
  (document as any).emit('click', { type: 'MockClickEvent' });
}, 1000);

// 4. Error / empty edge cases
throwError(() => new Error('boom'))
  .subscribe({ error: err => console.error('Caught an error:', err.message) });
EMPTY.subscribe({ complete: () => console.log('EMPTY completes immediately with no values') });