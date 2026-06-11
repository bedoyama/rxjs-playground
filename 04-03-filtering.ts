/**
 * 04-03-filtering.ts
 *
 * PURPOSE: The rest of the "control the flow of values" operators you will use daily.
 *
 * take(n) / takeLast(n) / first() / last()
 *   - Limit how many values (or which position) you care about.
 *
 * takeUntil(notifier$)
 *   - THE standard way to unsubscribe in long-lived apps (Angular components, etc.).
 *   - When notifier$ emits, the source is unsubscribed automatically.
 *   - Pair this with a `destroy$` Subject in your component's ngOnDestroy.
 *
 * throttleTime / auditTime / sampleTime
 *   - Different flavors of "rate limit emissions".
 *     - throttleTime: emit first, then ignore for duration (leading edge)
 *     - auditTime:   emit the last one after the window (trailing edge)
 *     - sampleTime:  emit whatever is the latest at exact intervals
 *
 * skip(n)
 *   - Ignore the first N values.
 *
 * EXPECTED (timing sensitive — watch the console order):
 *   [take] 0
 *   [take] 1
 *   [take] 2
 *   [takeUntil] 0
 *   [takeUntil] 1
 *   [first] 100
 *   [skip] 2
 *   [skip] 3
 *   [throttle] 0
 *   [audit] 3          ← last value seen in the 400ms window
 *   [sample] ... (periodic)
 *   [takeUntil complete via notifier]
 *
 * RUN: npx ts-node 04-03-filtering.ts
 */

import { interval, Subject, of } from 'rxjs';
import {
  take, takeLast, first, last, takeUntil, skip,
  throttleTime, auditTime, sampleTime
} from 'rxjs/operators';

console.log('=== take / first / last / takeLast ===');
of(100, 200, 300).pipe(first()).subscribe(v => console.log('[first]', v));
of(100, 200, 300).pipe(last()).subscribe(v => console.log('[last]', v));
of(100, 200, 300).pipe(takeLast(2)).subscribe(v => console.log('[takeLast]', v));

console.log('\n=== take(3) on interval ===');
interval(100).pipe(take(3)).subscribe({
  next: v => console.log('[take]', v),
  complete: () => console.log('[take complete]')
});

console.log('\n=== takeUntil (auto-unsubscribe pattern) ===');
const stop$ = new Subject<void>();
interval(150).pipe(
  takeUntil(stop$)
).subscribe({
  next: v => console.log('[takeUntil]', v),
  complete: () => console.log('[takeUntil complete via notifier]')
});

// Stop the takeUntil stream after ~500ms
setTimeout(() => stop$.next(), 520);

console.log('\n=== skip(2) ===');
of(0,1,2,3,4).pipe(skip(2)).subscribe(v => console.log('[skip]', v));

console.log('\n=== throttleTime vs auditTime (400ms windows) ===');
// Throttle: emit the first, then block for 400ms
interval(100).pipe(
  take(5),
  throttleTime(400, undefined, { leading: true, trailing: false })
).subscribe(v => console.log('[throttle]', v));

// Audit: wait 400ms, then emit the most recent value seen in the window
setTimeout(() => {
  interval(100).pipe(
    take(5),
    auditTime(400)
  ).subscribe(v => console.log('[audit]', v));
}, 800);

console.log('\n=== sampleTime (emit latest every 350ms) ===');
setTimeout(() => {
  interval(80).pipe(
    take(12),
    sampleTime(350)
  ).subscribe(v => console.log('[sample]', v));
}, 1600);