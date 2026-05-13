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