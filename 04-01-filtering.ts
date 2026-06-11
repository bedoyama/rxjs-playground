/**
 * 04-01-filtering.ts
 *
 * PURPOSE: Rate-limiting + deduping user input (the classic "search as you type" setup).
 *
 * debounceTime(ms)      → Wait for a quiet period before emitting the LAST value.
 *                         Perfect for search boxes, resize handlers, etc.
 * distinctUntilChanged() → Only emit when the value is different from the previous one.
 *                         Prevents duplicate work when user types then backspaces to same text.
 *
 * EXPECTED (approximate timings):
 *   (nothing for the first rapid 't','te','test' — debounce waits)
 *   Search: test          ← after ~300ms quiet period
 *   Search: testing 0     ← new value after previous debounce window
 *   Search: testing 4     ← the 'testing 1/2/3' burst is debounced; only last distinct wins
 *   (the duplicate 'test' at 800ms is suppressed by distinctUntilChanged)
 *
 * WHY IMPORTANT:
 * - Without debounce you would fire an API call on every keystroke.
 * - distinctUntilChanged is cheap insurance against redundant network / rendering work.
 *
 * RUN: npx ts-node 04-01-filtering.ts
 */

import { fromEvent } from 'rxjs';
import { debounceTime, map, distinctUntilChanged } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).document = new EventEmitter();

fromEvent((document as any), 'input').pipe(
  debounceTime(300),
  map((e: any) => e.target.value),
  distinctUntilChanged()
).subscribe(searchTerm => console.log('Search:', searchTerm));

// Emit rapidly to test debounceTime (only the last one will be logged after 300ms)
setTimeout(() => (document as any).emit('input', { target: { value: 't' } }), 100);
setTimeout(() => (document as any).emit('input', { target: { value: 'te' } }), 200);
setTimeout(() => (document as any).emit('input', { target: { value: 'test' } }), 300);

// Emit the same value after the debounce resolves to test distinctUntilChanged (will be ignored)
setTimeout(() => (document as any).emit('input', { target: { value: 'test' } }), 800);

// Emit a new value to show it processes again
setTimeout(() => (document as any).emit('input', { target: { value: 'testing 0' } }), 1199);
setTimeout(() => (document as any).emit('input', { target: { value: 'testing 1' } }), 1200);
setTimeout(() => (document as any).emit('input', { target: { value: 'testing 2' } }), 1299);
setTimeout(() => (document as any).emit('input', { target: { value: 'testing 3' } }), 1300);
setTimeout(() => (document as any).emit('input', { target: { value: 'testing 4' } }), 1601);