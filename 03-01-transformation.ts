/**
 * 03-transformation.ts
 *
 * PURPOSE: Core transformation operators — they take values from the source and
 * produce new values (or accumulated state) downstream.
 *
 * map      → 1-to-1 projection (like Array.prototype.map)
 * scan     → running accumulator (like Array.prototype.reduce, but emits on EVERY value)
 *
 * scan vs reduce:
 * - scan: emits intermediate results (great for "live total", counters, etc.)
 * - reduce: only emits the final value on completion (like Promise.reduce)
 *
 * EXPECTED OUTPUT:
 *   10
 *   30
 *   60
 *   100
 *
 * RUN: npx ts-node 03-transformation.ts
 */

import { of } from 'rxjs';
import { map, scan } from 'rxjs/operators';

of(1,2,3,4).pipe(
  map(x => x * 10),
  scan((acc, val) => acc + val, 0) // 10 → 30 → 60 → 100
).subscribe(console.log);