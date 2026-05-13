import { fromEvent, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { debounceTime, map, filter, switchMap, catchError } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter();
const input = document;

fromEvent((input as any), 'input').pipe(
  debounceTime(300), // wait 300ms after last keystroke
  map((e: any) => e.target.value.trim()), // extract text
  filter(query => query.length > 2), // only search if 3+ chars
  switchMap(query =>
    // switchMap cancels pending requests!
    ajax.getJSON<{ items: any[] }>(`https://api.github.com/search/users?q=${query}`).pipe(
      // CRITICAL: catchError is INSIDE the switchMap (attached to the inner observable).
      // This prevents the main pipe from dying if the API fails.
      catchError(err => {
        console.error('API Error', err.message);
        return of({ items: [] }); // return safe empty fallback
      })
    )
  ),
  map(res => res.items)
).subscribe(users => {
  console.log('--- Search Results ---');
  console.log(users.slice(0, 5));
});

// Simulate typing in the input
setTimeout(() => (input as any).emit('input', { target: { value: 'ngrx' } }), 500);