/**
 * 01-core.ts
 *
 * PURPOSE: Demonstrate the fundamental mental model of RxJS.
 * - Observables are LAZY: the function passed to `new Observable(...)` does NOT run
 *   until someone subscribes.
 * - They are UNICAST by default: each subscriber gets its own independent execution.
 * - `subscribe({ next, error, complete })` or the shorter `.subscribe(nextFn)` forms.
 *
 * KEY TAKEAWAYS:
 * - No subscription → no work happens (unlike Promises).
 * - Calling subscribe() "turns on the tap".
 * - The producer (the function) can call next() zero or more times, then either
 *   error() or complete() exactly once.
 *
 * EXPECTED OUTPUT (when you run this file):
 *   Observable started
 *   1
 *   2
 *
 * RUN: npx ts-node 01-core.ts
 */

import { Observable } from 'rxjs';

const obs$ = new Observable(subscriber => {
  console.log('Observable started'); // Only runs on subscribe
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

obs$.subscribe({ next: v => console.log(v) }); // → starts now