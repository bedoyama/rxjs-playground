/**
 * 03-02-transformation.ts
 *
 * PURPOSE: Additional extremely common transformation / utility operators
 * that every serious RxJS user reaches for.
 *
 * OPERATORS COVERED:
 * - tap           → side effects / debugging without changing the value
 * - startWith     → emit an initial seed value synchronously
 * - pairwise      → emit [previous, current] pairs (great for "what changed?")
 * - reduce        → like scan but only emits the final accumulated value on complete
 * - delay(ms)     → time-shift every value by a fixed amount
 *
 * These are small but incredibly useful in real code:
 *   startWith('loading') + switchMap(...)  → show loading state immediately
 *   pairwise()                              → implement "undo", diffing, etc.
 *   tap(console.log) or tap({ next, error }) → non-intrusive tracing
 *
 * EXPECTED OUTPUT:
 *   [tap] before delay: 1
 *   [startWith] loading
 *   [startWith] 10
 *   [startWith] 20
 *   [pairwise] [10,20]
 *   [pairwise] [20,30]
 *   [reduce] final total: 60
 *   (delay example prints ~1000ms later)
 *
 * RUN: npx ts-node 03-02-transformation.ts
 */

import { of, interval } from 'rxjs';
import { tap, startWith, pairwise, reduce, delay, take, map } from 'rxjs/operators';

// 1. tap — perfect for logging, analytics, or triggering imperative side effects
of(1, 2, 3).pipe(
  tap(v => console.log('[tap] before delay:', v)),
  delay(300)
).subscribe(v => console.log('[after tap+delay]', v));

// 2. startWith — seed an initial value (extremely common for UI "initial state")
of(10, 20).pipe(
  startWith('loading'),
  startWith('idle')   // you can chain multiple
).subscribe(v => console.log('[startWith]', v));

// 3. pairwise — gives you previous + current on every emission after the first
of(10, 20, 30).pipe(
  pairwise()
).subscribe(pair => console.log('[pairwise]', pair));

// 4. reduce — only emits once, on completion (compare to scan in 03-transformation.ts)
of(10, 20, 30).pipe(
  reduce((acc, v) => acc + v, 0)
).subscribe(total => console.log('[reduce] final total:', total));

// 5. delay — shifts the entire stream in time (useful for demos, retry backoff, etc.)
interval(100).pipe(
  take(2),
  map(i => i + 1),
  delay(1000),
  tap(v => console.log('[delay] emitted after 1s shift:', v))
).subscribe();