import { ajax } from 'rxjs/ajax';
import { shareReplay } from 'rxjs/operators';

// POLYFILL FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');

// Expensive HTTP call – share it!
const shared$ = ajax.getJSON('https://jsonplaceholder.typicode.com/users/1').pipe(shareReplay(1));

shared$.subscribe(v => console.log('Sub 1:', v)); // first sub triggers the request
shared$.subscribe(v => console.log('Sub 2:', v)); // second sub gets cached value instantly without a new network request