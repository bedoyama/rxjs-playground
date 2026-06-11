/**
 * 06-03-concatMap.ts
 *
 * PURPOSE: concatMap — run inner Observables SEQUENTIALLY, preserving order.
 *
 * concatMap waits for the previous inner Observable to complete before
 * subscribing to the next one. Results are emitted in the exact order of
 * the source values.
 *
 * Best for:
 *   - Operations where order matters (e.g. "create folder, then create file inside it")
 *   - Database writes that must happen in a specific sequence
 *   - Any "do A then B then C" chain of async work
 *
 * Trade-off: slower total time because everything is queued.
 *
 * Same fake API calls as 06-02 (mergeMap), but you will see them complete strictly in source order.
 *
 * EXPECTED:
 *   [concatMap] starting id=1 (slow)
 *   [concatMap] result id=1 → slow
 *   [concatMap] starting id=2 (medium)
 *   [concatMap] result id=2 → medium
 *   [concatMap] starting id=3 (fast)
 *   [concatMap] result id=3 → fast
 *   [concatMap complete]
 *
 * RUN: npx ts-node 06-03-concatMap.ts
 */

import { from, of } from 'rxjs';
import { concatMap, delay, tap } from 'rxjs/operators';

interface User { id: number; name: string }

function fakeUserApi(id: number) {
  const delayMs = id === 1 ? 600 : id === 2 ? 300 : 100;
  const name = id === 1 ? 'slow' : id === 2 ? 'medium' : 'fast';
  return of({ id, name: `User-${name}` }).pipe(
    delay(delayMs),
    tap(() => console.log(`[concatMap] starting id=${id} (${name})`))
  );
}

console.log('=== concatMap (sequential, order preserved) ===');

from([1, 2, 3]).pipe(
  concatMap(id => fakeUserApi(id)),
  tap(user => console.log('[concatMap] result id=' + user.id + ' →', user.name))
).subscribe({
  next: user => {},
  complete: () => console.log('[concatMap complete]')
});