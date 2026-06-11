/**
 * 06-flattening.ts
 *
 * PURPOSE: switchMap — the "cancel previous" higher-order mapping operator.
 * This is the single most important flattening operator for UI work.
 *
 * switchMap(projectFn):
 *   - When source emits, unsubscribe from the PREVIOUS inner Observable
 *     and subscribe to the new one returned by projectFn.
 *   - Only the LATEST inner stream stays active.
 *
 * Classic use case: type-ahead search. If the user types "Br" then quickly "Bret",
 * you don't want results for the stale "Br" query — you want to cancel it.
 *
 * COMPARISON (see also 06-01/02/03):
 *   switchMap   → cancel previous (most UI "read" operations)
 *   mergeMap    → run all concurrently (independent fire-and-forget)
 *   concatMap   → run one after another, preserve order
 *   exhaustMap  → ignore new source values while current inner is still running
 *
 * EXPECTED:
 *   (first two inputs are close together → the 'Bret' one should cancel the 'Delphine' attempt)
 *   (Samantha arrives later and gets its own request)
 *   Render Results: ... (for Bret or Samantha)
 *
 * RUN: npx ts-node 06-flattening.ts
 */

import { fromEvent } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter();
const input = document;

// Classic example: search input → API call
fromEvent((input as any), 'input').pipe(
  debounceTime(300),
  map((e: any) => e.target.value),
  // switchMap cancels the previous ajax request if a new keystroke happens
  switchMap(query => ajax.getJSON(`https://jsonplaceholder.typicode.com/users?username=${query}`))
).subscribe(results => console.log('Render Results:', results));

// Trigger simulation — note the close timing of first two
setTimeout(() => (input as any).emit('input', { target: { value: 'Bret' } }), 500);
setTimeout(() => (input as any).emit('input', { target: { value: 'Delphine' } }), 530);
setTimeout(() => (input as any).emit('input', { target: { value: 'Samantha' } }), 1500);

