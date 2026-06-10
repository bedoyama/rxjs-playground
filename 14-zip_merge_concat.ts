import { merge, concat, zip, of, interval } from 'rxjs';
import { take, map, delay } from 'rxjs/operators';

// Emits A1 at 100ms, A2 at 200ms, A3 at 300ms
const a$ = interval(100).pipe(take(3), map(i => 'A' + (i + 1)));
// Emits B1 at 150ms, B2 at 300ms
const b$ = interval(150).pipe(take(2), map(i => 'B' + (i + 1)));

console.log('=== Subscribing to MERGE, CONCAT, and ZIP ===');

merge(a$, b$).subscribe(v => console.log('[MERGE] ', v));
// Arrival order

concat(a$, b$).subscribe(v => console.log('[CONCAT]', v));
// whole A then whole B

zip(a$, b$).subscribe(v => console.log('[ZIP]   ', v));
// paired by position