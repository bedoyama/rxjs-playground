/**
 * 10-share.ts
 *
 * PURPOSE: shareReplay — turn a cold (expensive) source into a hot shared one.
 *
 * Without sharing:
 *   Every new subscriber would cause the ajax call to be made again.
 * With shareReplay({ bufferSize: 1, refCount: true }):
 *   - First subscriber triggers the work.
 *   - Subsequent subscribers get the last emitted value(s) instantly.
 *   - When the last subscriber unsubscribes, the shared subscription is torn down
 *     (refCount behavior). This prevents memory leaks in long-lived apps.
 *
 * shareReplay(1) (the number shorthand) is common but the object form gives you
 * more control (refCount, windowTime, etc.).
 *
 * EXPECTED:
 *   Sub 1: {id:1, name: ...}   ← network actually happens here
 *   Sub 2: {id:1, name: ...}   ← instant, no second request
 *
 * RUN: npx ts-node 10-share.ts
 */

import { ajax } from 'rxjs/ajax';
import { shareReplay } from 'rxjs/operators';

// POLYFILL FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');

// Expensive HTTP call – share it!
// Using the modern config form (recommended in RxJS 7+)
const shared$ = ajax.getJSON('https://jsonplaceholder.typicode.com/users/1').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);

shared$.subscribe(v => console.log('Sub 1:', v)); // first sub triggers the request
shared$.subscribe(v => console.log('Sub 2:', v)); // second sub gets cached value instantly without a new network request