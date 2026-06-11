/**
 * 06-01-mergeMap.ts
 *
 * PURPOSE: mergeMap (aka flatMap) — run inner Observables CONCURRENTLY.
 *
 * When the source emits a value, mergeMap immediately subscribes to the
 * inner Observable returned by the project function.
 * All inner streams run at the same time. Results are interleaved as they arrive.
 *
 * Best for:
 *   - Independent requests (load 5 user profiles in parallel)
 *   - Fire-and-forget side effects where order doesn't matter
 *
 * WARNING: You can easily create many in-flight requests. Use with care on large arrays.
 *
 * In this demo we fire three "API calls" with different artificial delays.
 * You will see results appear out of order (fastest first).
 *
 * EXPECTED (order is non-deterministic but typically B then A then C because of delays):
 *   [mergeMap] starting id=1 (slow)
 *   [mergeMap] starting id=2 (medium)
 *   [mergeMap] starting id=3 (fast)
 *   [mergeMap] result id=3 → fast
 *   [mergeMap] result id=2 → medium
 *   [mergeMap] result id=1 → slow
 *   [mergeMap complete]
 *
 * RUN: npx ts-node 06-01-mergeMap.ts
 */

import { from, of } from 'rxjs';
import { mergeMap, delay, tap } from 'rxjs/operators';

interface User { id: number; name: string }

function fakeUserApi(id: number) {
  const delayMs = id === 1 ? 600 : id === 2 ? 300 : 100;
  const name = id === 1 ? 'slow' : id === 2 ? 'medium' : 'fast';
  return of({ id, name: `User-${name}` }).pipe(
    delay(delayMs),
    tap(() => console.log(`[mergeMap] starting id=${id} (${name})`))
  );
}

console.log('=== mergeMap (concurrent) ===');

from([1, 2, 3]).pipe(
  mergeMap(id => fakeUserApi(id)),
  tap(user => console.log('[mergeMap] result id=' + user.id + ' →', user.name))
).subscribe({
  next: user => {},
  complete: () => console.log('[mergeMap complete]')
});