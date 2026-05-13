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

// Trigger simulation
setTimeout(() => (input as any).emit('input', { target: { value: 'Bret' } }), 500);