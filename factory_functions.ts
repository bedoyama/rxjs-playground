import { of, from, interval, timer, fromEvent, throwError, EMPTY } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { take } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter(); // Mock document as an EventEmitter

// 1. Static values
of(1, 2, 3).subscribe(v => console.log('of:', v));                    // emits 1→2→3→complete
from([1,2,3]).subscribe(v => console.log('from array:', v));          // same, but from array/iterable
from(Promise.resolve('done')).subscribe(v => console.log('from promise:', v));

// 2. Time-based (using take(3) so they don't run forever in testing)
interval(1000).pipe(take(3)).subscribe(v => console.log('interval:', v));                 // 0→1→2 then complete
timer(3000, 1000).pipe(take(3)).subscribe(v => console.log('timer:', v));                 // wait 3s, then emit 0,1,2 every 1s

// 3. DOM / external 
fromEvent(document, 'click').subscribe(e => console.log('Clicked!', e));   
// Actual JSON request
ajax.getJSON('https://jsonplaceholder.typicode.com/users/1')
  .subscribe(res => console.log('User API response:', res));

// Simulate a click event after 1 second so we can see it working
setTimeout(() => {
  (document as any).emit('click', { type: 'MockClickEvent' });
}, 1000);

// 4. Error / empty
throwError(() => new Error('boom'))
  .subscribe({ error: err => console.error('Caught an error:', err.message) });
EMPTY.subscribe({ complete: () => console.log('EMPTY completes immediately with no values') });