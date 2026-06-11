/**
 * 12-polling.ts
 *
 * PURPOSE: The "reactive polling + manual refresh" enterprise pattern.
 *
 * How it works:
 * - A timer$ that fires every N seconds (auto-refresh)
 * - A click$ (user pressed "Refresh now")
 * - merge the two triggers
 * - switchMap the trigger into the data fetch
 *   → any pending request is cancelled when a new trigger arrives
 *   → a manual refresh also resets the "next auto refresh" cadence
 *
 * This is the standard way to build dashboards that poll but also allow
 * instant user-driven refresh without double-fetching or complex setInterval logic.
 *
 * EXPECTED:
 *   Dashboard UI Updated: { ... }   ← initial timer(0, ...)
 *   (after ~3.5s)
 *   Dashboard UI Updated: ...       ← from the manual click
 *   (then it would continue auto-refreshing every 10s)
 *
 * RUN: npx ts-node 12-polling.ts
 */

import { timer, fromEvent, merge, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { switchMap, catchError } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter();
const refreshBtn = document;

// 1. A stream that ticks every 10 seconds (first tick immediately)
const interval$ = timer(0, 10000); 

// 2. A stream that ticks on user clicks
const click$ = fromEvent((refreshBtn as any), 'click');

// 3. Merge them and map to our API call
const data$ = merge(interval$, click$).pipe(
  // Every time a click OR timer fires, switchMap cancels the previous 
  // request (if pending) and restarts the timer logic internally.
  switchMap(() => ajax.getJSON('https://jsonplaceholder.typicode.com/users/1').pipe(
    catchError(() => of({ status: 'offline' }))
  ))
);

data$.subscribe(v => console.log('Dashboard UI Updated:', v));

// Simulate user clicking "Refresh" early
setTimeout(() => (refreshBtn as any).emit('click', 'Manual Refresh'), 3500);