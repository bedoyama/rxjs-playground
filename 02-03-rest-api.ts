/**
 * 02-03-rest-api.ts
 *
 * PURPOSE: Focused examples of calling REST APIs — the most common real-world use of RxJS.
 *
 * This file demonstrates clean, standalone HTTP calls without being mixed into
 * other operators (debounce, switchMap, polling, etc.).
 *
 * TWO MAIN APPROACHES:
 *
 * 1. `ajax` (from 'rxjs/ajax')
 *    - Very convenient for JSON APIs.
 *    - `ajax.getJSON<T>(url)` directly gives you the parsed body.
 *    - Still widely used (especially in Angular codebases that use HttpClient under the hood).
 *
 * 2. `fromFetch` (from 'rxjs/fetch')
 *    - Uses the native Fetch API.
 *    - Gives you a standard `Response` object (you decide how to read the body).
 *    - Preferred for new code in modern browsers / Node 18+ (no extra polyfills needed for fetch itself).
 *
 * PATTERNS SHOWN:
 * - Typing the response with an interface
 * - Basic GET request
 * - Handling HTTP errors gracefully with catchError
 * - Using the emitted data
 *
 * EXPECTED OUTPUT (approximate):
 *   === ajax.getJSON (GET single resource) ===
 *   Loaded user: Leanne Graham (Sincere@april.biz)
 *
 *   === fromFetch + .json() ===
 *   Loaded via fromFetch: Ervin Howell
 *
 * RUN: npx ts-node 02-03-rest-api.ts
 */

import { ajax } from 'rxjs/ajax';
import { fromFetch } from 'rxjs/fetch';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Required for 'rxjs/ajax' when running in Node.js
(global as any).XMLHttpRequest = require('xhr2');

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

// We stagger the requests slightly so the console output appears in a
// predictable order for learning purposes. In real code you would often
// run multiple requests concurrently with mergeMap / forkJoin etc.

// 1. ajax.getJSON — the easiest way to fetch JSON
setTimeout(() => {
  console.log('=== 1. ajax.getJSON (GET single resource) ===');

  ajax.getJSON<User>('https://jsonplaceholder.typicode.com/users/1')
    .pipe(
      catchError(err => {
        console.error('ajax request failed:', err.message || err);
        return of(null);
      })
    )
    .subscribe(user => {
      if (user) {
        console.log(`Loaded user: ${user.name} (${user.email})`);
      }
    });
}, 0);

// 2. fromFetch — modern approach using native fetch
setTimeout(() => {
  console.log('\n=== 2. fromFetch + response.json() ===');

  fromFetch('https://jsonplaceholder.typicode.com/users/2')
    .pipe(
      switchMap(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        // fromFetch gives a raw Response — call .json() yourself
        return response.json() as Promise<User>;
      }),
      catchError(err => {
        console.error('fromFetch failed:', err.message);
        return of(null);
      })
    )
    .subscribe(user => {
      if (user) {
        console.log(`Loaded via fromFetch: ${user.name}`);
      }
    });
}, 150);

// 3. Fetching a collection (very common)
setTimeout(() => {
  console.log('\n=== 3. ajax.getJSON (GET collection) ===');

  ajax.getJSON<User[]>('https://jsonplaceholder.typicode.com/users?_limit=3')
    .pipe(
      catchError(() => of([] as User[]))
    )
    .subscribe(users => {
      console.log(`Loaded ${users.length} users:`);
      users.forEach(u => console.log(`  - ${u.name}`));
    });
}, 300);
