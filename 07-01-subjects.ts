/**
 * 07-01-subjects.ts
 *
 * PURPOSE: The three most important multicast primitives.
 *
 * Subject
 *   - "Pure" multicast. New subscribers only receive FUTURE values.
 *   - No replay of history.
 *
 * BehaviorSubject<T>(initialValue)
 *   - Always has a "current value".
 *   - Every new subscriber immediately receives the current value (then future ones).
 *   - Ideal for "state" or "current selection".
 *
 * ReplaySubject(bufferSize)
 *   - Remembers the last N values and replays them to late subscribers.
 *   - Great for "last few search results", "recent events", etc.
 *
 * KEY DIFFERENCE FROM NORMAL OBSERVABLES:
 *   Normal Observables = unicast (each sub gets its own producer run).
 *   Subjects = multicast (one producer, many consumers).
 *
 * EXPECTED:
 *   === Subject (only future values) ===
 *   Subject A: First
 *   Subject B: First
 *   Subject A: Second
 *   Subject B: Second
 *   Subject C (late): Second     ← missed "First"
 *
 *   === BehaviorSubject ...
 *   BS A: initial-state
 *   BS B: initial-state
 *   BS A: loading...
 *   ...
 *   BS C (late): results-found   ← still gets the latest
 *
 *   === ReplaySubject ...
 *   RS A: search-2
 *   RS A: search-3
 *   RS B (late): search-2
 *   RS B (late): search-3
 *   RS A: search-4
 *   RS B (late): search-4
 *
 * RUN: npx ts-node 07-01-subjects.ts
 */

import { fromEvent, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { EventEmitter } from 'events';

// ==================== POLYFILLS FOR NODE.JS ====================
(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter();
const input = document;

// ==================== SUBJECT DEMOS ====================

console.log('=== Subject (only future values) ===');
const subject = new Subject<string>();

subject.subscribe(v => console.log('Subject A:', v));
subject.subscribe(v => console.log('Subject B:', v));

subject.next('First');           // Both receive it
// Late subscriber misses previous values
setTimeout(() => {
  subject.subscribe(v => console.log('Subject C (late):', v));
}, 100);

subject.next('Second');

// ==================== BEHAVIORSUBJECT DEMO ====================

console.log('\n=== BehaviorSubject (current value + future) ===');
const bs = new BehaviorSubject<string>('initial-state');

bs.subscribe(v => console.log('BS A:', v));           // Gets initial immediately
bs.subscribe(v => console.log('BS B:', v));           // Also gets initial

bs.next('loading...');
bs.next('results-found');

// Late subscriber still gets the latest value immediately
setTimeout(() => {
  bs.subscribe(v => console.log('BS C (late):', v));
}, 200);

// ==================== REPLAYSUBJECT DEMO ====================

console.log('\n=== ReplaySubject (remembers last N values) ===');
const rs = new ReplaySubject<string>(2); // buffer size = 2

rs.next('search-1');   // will be remembered
rs.next('search-2');   // will be remembered
rs.next('search-3');   // oldest is dropped, now keeps 2+3

rs.subscribe(v => console.log('RS A:', v));           // Gets last 2 immediately: search-2, search-3

setTimeout(() => {
  rs.subscribe(v => console.log('RS B (late):', v));  // Also gets last 2
}, 150);

rs.next('search-4');