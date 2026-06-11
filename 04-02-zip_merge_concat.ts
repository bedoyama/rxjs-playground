/**
 * 04-02-zip_merge_concat.ts
 *
 * PURPOSE: Visual timing comparison of three fundamental combination operators.
 * These control HOW multiple streams are joined in time.
 *
 * merge     → "Fire and forget" — values from any source are emitted as soon as they arrive.
 * concat    → Strict sequential — second stream only starts after first completes.
 * zip       → Pair by index — waits for BOTH to have a value at the same "position".
 *             (Think "zipper" — one from each, in lockstep.)
 *
 * This file uses controlled timing so you can see the difference in the console.
 *
 * EXPECTED ORDER (approximate):
 *   [MERGE]  A1     (100ms)
 *   [MERGE]  B1     (150ms)
 *   [MERGE]  A2     (200ms)
 *   [MERGE]  A3     (300ms)
 *   [MERGE]  B2     (300ms)
 *   [CONCAT] A1
 *   [CONCAT] A2
 *   [CONCAT] A3
 *   [CONCAT] B1
 *   [CONCAT] B2
 *   [ZIP]    ['A1','B1']
 *   [ZIP]    ['A2','B2']   ← B only had 2 values so zip stops
 *
 * RUN: npx ts-node 04-02-zip_merge_concat.ts
 */

import { merge, concat, zip, of, interval } from 'rxjs';
import { take, map, delay } from 'rxjs/operators';

// Emits A1 at 100ms, A2 at 200ms, A3 at 300ms
const a$ = interval(100).pipe(take(3), map(i => 'A' + (i + 1)));
// Emits B1 at 150ms, B2 at 300ms
const b$ = interval(150).pipe(take(2), map(i => 'B' + (i + 1)));

console.log('=== Subscribing to MERGE, CONCAT, and ZIP ===');

merge(a$, b$).subscribe(v => console.log('[MERGE] ', v));
// Arrival order (interleaved)

concat(a$, b$).subscribe(v => console.log('[CONCAT]', v));
// whole A then whole B (B is "queued" until A finishes)

zip(a$, b$).subscribe(v => console.log('[ZIP]   ', v));
// paired by position — emits only when it has a value from EVERY source at that index