/**
 * 02-02-creation-advanced.ts
 *
 * PURPOSE: A few more creation operators that solve "when should this actually run?" problems.
 *
 * range(start, count)
 *   - Emit a sequence of numbers synchronously.
 *
 * defer(() => someObservable)
 *   - The factory function is called for EVERY new subscriber.
 *   - Use this when you want fresh state / a fresh HTTP call / new Date.now() per subscription.
 *   - Without defer, the inner observable would be created at declaration time (eager).
 *
 * iif(() => condition, trueObs$, falseObs$)
 *   - Choose which Observable to subscribe to at subscription time.
 *   - The "reactive if".
 *
 * fromFetch (rxjs/fetch)
 *   - Modern replacement for ajax when you have native fetch (browser or Node 18+).
 *   - No extra polyfills needed for basic use.
 *
 * EXPECTED:
 *   [range] 10
 *   [range] 11
 *   [range] 12
 *   [defer] created at subscribe time: <timestamp>
 *   [iif] chose the TRUE branch
 *   [fromFetch] status: 200   (or network error in some envs)
 *
 * RUN: npx ts-node 02-02-creation-advanced.ts
 */

import { range, defer, iif, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map, catchError } from 'rxjs/operators';

console.log('=== range ===');
range(10, 3).subscribe(v => console.log('[range]', v));

console.log('\n=== defer (factory per subscriber) ===');
const now$ = defer(() => {
  const ts = Date.now();
  console.log('[defer] created at subscribe time:', ts);
  return of(ts);
});

now$.subscribe(); // factory runs here
setTimeout(() => now$.subscribe(), 30); // factory runs again with a new timestamp

console.log('\n=== iif (reactive choice) ===');
const isAdmin = true;
iif(
  () => isAdmin,
  of('admin data'),
  of('regular data')
).subscribe(v => console.log('[iif] chose the', v.includes('admin') ? 'TRUE' : 'FALSE', 'branch'));

console.log('\n=== fromFetch (modern fetch-based) ===');
fromFetch('https://jsonplaceholder.typicode.com/users/1')
  .pipe(
    map(res => ({ status: res.status, ok: res.ok })),
    catchError(err => of({ error: true, message: err.message }))
  )
  .subscribe(result => console.log('[fromFetch]', result));