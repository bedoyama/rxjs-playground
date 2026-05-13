import { timer, fromEvent, merge, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { switchMap, catchError } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');
(global as any).document = new EventEmitter();
const refreshBtn = document;

// 1. A stream that ticks every 10 seconds
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