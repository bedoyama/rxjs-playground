/**
 * 07-02-subjects.ts
 *
 * PURPOSE: Realistic composition — using Subjects + BehaviorSubject + ReplaySubject
 * together with switchMap for a "search with state + late joiners" scenario.
 *
 * Patterns shown:
 * - Raw input → Subject (or you can use the event stream directly)
 * - BehaviorSubject as "current query" state holder (any subscriber always sees latest)
 * - ReplaySubject to let "late" UI components (e.g. a second tab or debug panel)
 *   receive the last few results without re-triggering the network.
 *
 * This is the kind of pattern you see in real "smart search" or "global state + derived views".
 *
 * EXPECTED (high level):
 *   🔍 Searching for: Bret
 *   ✅ Results: ...
 *   🔍 Searching for: Samantha   ← previous request cancelled by switchMap
 *   (empty query is filtered)
 *   🔍 Searching for: Antonette
 *   ...
 *   Late subscriber to results:
 *   Late result replay: ... (the last 3)
 *
 * RUN: npx ts-node 07-02-subjects.ts
 */

import { fromEvent, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { EventEmitter } from 'events';

// ==================== POLYFILLS FOR NODE.JS ====================
(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter();
const input = document;

// ==================== REALISTIC SEARCH EXAMPLE ====================

console.log('\n=== Real Search with switchMap + State Subjects ===');

const searchSubject = new Subject<string>();           // Raw input stream
const searchState = new BehaviorSubject<string>('');   // Current search term
const resultsSubject = new ReplaySubject<any>(3);      // Last 3 search results

// Connect input → debounced search
fromEvent((input as any), 'input').pipe(
  debounceTime(300),
  map((e: any) => e.target.value.trim()),
  tap(query => {
    searchState.next(query);           // Update current search state
  }),
  switchMap(query => {
    if (!query) return []; // skip empty
    console.log(`🔍 Searching for: ${query}`);
    return ajax.getJSON(`https://httpbin.org/delay/1?username=${query}`);
  })
).subscribe(results => {
  console.log('✅ Results:', results);
  resultsSubject.next(results);   // Store in replay
});

// Simulation
setTimeout(() => (input as any).emit('input', { target: { value: 'Bret' } }), 400);
setTimeout(() => (input as any).emit('input', { target: { value: 'Samantha' } }), 700);   // cancels previous
setTimeout(() => (input as any).emit('input', { target: { value: '' } }), 1800);
setTimeout(() => (input as any).emit('input', { target: { value: 'Antonette' } }), 2200);

// Show late subscription to results
setTimeout(() => {
  console.log('\nLate subscriber to results:');
  resultsSubject.subscribe(r => console.log('Late result replay:', r));
}, 3000);