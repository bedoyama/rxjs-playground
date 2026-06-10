# RxJS Mastery: Fast and Deep Dive

**Version targeted**: RxJS 7.x (stable as of 2026; core concepts are identical in v8 development).  
**Time to complete**: 2–4 hours if you code along.  
**Goal**: Go from zero to advanced in one document. You’ll understand *why* RxJS works, not just *how*.

Copy this entire response into a Markdown file (`rxjs-mastery.md`) or Notion page and follow along in a fresh project.

## 1. Setup (2 minutes)

```bash
mkdir rxjs-playground && cd rxjs-playground
npm init -y
npm install rxjs xhr2 @types/node
# Optional: for browser quick tests
npm install -D typescript ts-node
```

Create `tsconfig.json` so TypeScript knows how to resolve the Node polyfills:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"]
  }
}
```

Create `index.ts`:

```ts
import { of, map } from 'rxjs';

of('Hello RxJS').pipe(map(v => v.toUpperCase())).subscribe(console.log);
```

Run: `npx ts-node index.ts`

## 2. Core Mental Model (The 4 Pillars)

| Concept       | Analogy                  | What it is                              | Key methods / properties          |
|---------------|--------------------------|-----------------------------------------|-----------------------------------|
| **Observable** | Water pipe               | Lazy stream of values over time         | `subscribe()`, `pipe()`           |
| **Observer**   | Person drinking from pipe| Receives values, errors, completion     | `{ next, error, complete }`       |
| **Subscription**| Valve                 | Controls the flow (unsubscribe)         | `unsubscribe()`                   |
| **Operator**   | Filter / valve / mixer   | Pure function that returns a new Observable | Pipeable (`.pipe(op())`)         |

**Key rule**: Observables are **lazy** and **unicast** by default (cold). They only start producing values when someone subscribes.

Create `01-core.ts`:

```ts
import { Observable } from 'rxjs';

const obs$ = new Observable(subscriber => {
  console.log('Observable started'); // Only runs on subscribe
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

obs$.subscribe({ next: v => console.log(v) }); // → starts now
```

## 3. Creation Operators (Factory functions)

**Most useful ones** (memorize these 8):

Create `02-creation.ts`:

```ts
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
fromEvent((document as any), 'click').subscribe(e => console.log('Clicked!', e));   
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
```

## 4. The `pipe()` and Operators (The real power)

All operators are **pure** and return a **new** Observable.

### 4.1 Transformation
- `map` → like Array.map
- `pluck` → deep property (deprecated in favor of `map`)
- `scan` → running accumulator (like reduce but emits every step)

Create `03-transformation.ts`:

```ts
import { of } from 'rxjs';
import { map, scan } from 'rxjs/operators';

of(1,2,3,4).pipe(
  map(x => x * 10),
  scan((acc, val) => acc + val, 0) // 10 → 30 → 60 → 100
).subscribe(console.log);
```

### 4.2 Filtering
- `filter`
- `take(n)` / `takeLast(n)` / `first` / `last`
- `debounceTime(ms)` / `throttleTime(ms)`
- `distinct` / `distinctUntilChanged`

Create `04-filtering.ts`:

```ts
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
setTimeout(() => (document as any).emit('input', { target: { value: 'testang' } }), 1199);

// Emit a new value to show it processes again
setTimeout(() => (document as any).emit('input', { target: { value: 'testing' } }), 1200);
```

### 4.3 Combination (the magic)

| Operator          | Use case                              | Behavior                     |
|-------------------|---------------------------------------|------------------------------|
| `merge`           | Fire-and-forget multiple streams      | Concurrent                  |
| `concat`          | Sequential execution                  | One after another           |
| `combineLatest`   | Latest values from all streams        | Emits when any changes      |
| `zip`             | Pair values by index                  | Strict pairing              |
| `forkJoin`        | Wait for all to complete (like Promise.all) | Only on complete       |

Create `05-combination.ts`:

```ts
import { merge, combineLatest, fromEvent, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { EventEmitter } from 'events';

// POLYFILLS FOR NODE.JS
(global as any).document = new EventEmitter();

const clicks$ = fromEvent((document as any), 'click');
const timer$ = interval(1000).pipe(take(3)); // taking 3 to avoid infinite loop in testing

merge(clicks$, timer$).subscribe(v => console.log('merge emits:', v));           // whichever fires first
combineLatest([clicks$, timer$]).subscribe(([c,t]) => console.log('combineLatest emits:', c,t));

// Trigger to see it work
setTimeout(() => (document as any).emit('click', 'User Click!'), 1500);
```

### 4.4 Higher-order mapping (the “flatten” operators)

These are the **most important** for real apps (HTTP + user actions). They take a value, return an Observable, and *flatten* it so the subscriber just gets the final emitted values, not an Observable of an Observable. 

- `mergeMap` (aka `flatMap`) → **Concurrent**. It subscribes to all inner Observables simultaneously. Best for independent requests where order doesn't matter (e.g., fetching details for multiple users in a loop).
- `concatMap` → **Sequential**. It waits for the previous inner Observable to complete before subscribing to the next one. Best when order strictly matters (e.g., sending updates one by one to a database).
- `switchMap` → **Cancel previous**. It unsubscribes from the previous inner Observable as soon as a new value arrives. Best for read operations like "Search as you type" or route parameter changes (you only care about the latest result).
- `exhaustMap` → **Ignore new**. It ignores new incoming values until the current inner Observable finishes. Best for "Submit" buttons to prevent double-submitting a form while an API call is in progress.

Create `06-flattening.ts`:

```ts
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
```

**Rule of thumb**:
- Use `switchMap` 80% of the time when mapping to another Observable.
- Use `mergeMap` when you want *all* requests to run.
- Use `concatMap` when order matters.

## 5. Subjects (Multicasting)

Normal Observables are **unicast**. Subjects are **multicast** (hot).

Create `07-subjects.ts`:

```ts
import { Subject, BehaviorSubject, ReplaySubject } from 'rxjs';

const subject = new Subject<number>();
subject.subscribe(v => console.log('A:', v));
subject.subscribe(v => console.log('B:', v));
subject.next(42); // Both A and B receive it

// BehaviorSubject (holds current value)
const bs = new BehaviorSubject('initial');
bs.subscribe(console.log); // immediately logs 'initial'

// ReplaySubject (remembers history)
const rs = new ReplaySubject(2); // remembers last 2 values
```

## 6. Error Handling & Completion

Create `08-errors.ts`:

```ts
import { of, throwError } from 'rxjs';
import { catchError, retry, finalize, mergeMap } from 'rxjs/operators';

// Fake observable that throws an error
const obs$ = of(1).pipe(mergeMap(() => throwError(() => new Error('boom'))));

obs$.pipe(
  retry(3),                    // retry up to 3 times on error
  catchError(err => of('fallback value instead of error')), // replace error with value
  finalize(() => console.log('Finalize: Done or errored'))
).subscribe({
  next: v => console.log('Next:', v),
  error: e => console.error('Error block:', e),
  complete: () => console.log('Complete')
});
```

## 7. Advanced Patterns (Deep Knowledge)

### 7.1 Custom operators (super powerful)

Create `09-custom-operator.ts`:

```ts
import { of, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

function filterAndDouble<T>(predicate: (v: T) => boolean): OperatorFunction<T, number> {
  return source => source.pipe(
    filter(predicate),
    map(v => (v as any) * 2)
  );
}

// Usage
of(1,2,3,4).pipe(filterAndDouble(x => x > 2)).subscribe(v => console.log('Custom Operator Emit:', v));
```

### 7.2 share() / shareReplay() (performance)

Create `10-share.ts`:

```ts
import { ajax } from 'rxjs/ajax';
import { shareReplay } from 'rxjs/operators';

// POLYFILL FOR NODE.JS
(global as any).XMLHttpRequest = require('xhr2');

// Expensive HTTP call – share it!
const shared$ = ajax.getJSON('https://jsonplaceholder.typicode.com/users/1').pipe(shareReplay(1));

shared$.subscribe(v => console.log('Sub 1:', v)); // first sub triggers the request
shared$.subscribe(v => console.log('Sub 2:', v)); // second sub gets cached value instantly without a new network request
```

### 7.3 Testing (marble diagrams in your head)

RxJS has `TestScheduler` for perfect time control, but for quick mental model:
- `of(1,2,3)` → marble: `1-2-3|`
- `interval(1000)` → `0-1-2-3...`
- `switchMap` cancels previous stream.

## 8. Real-World Mini Project (Code Along)

Create `11-mini-project.ts`:

```ts
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
```

## 8.5 Essential Enterprise RxJS Patterns 

These are the two most heavily tested RxJS patterns in technical interviews:

### Example 1: The Reactive Polling Pattern (Auto-Refresh)
This pattern is used to fetch data every X seconds, allowing manual triggers (like a "Refresh" button) to reset the timer.

Create `12-polling.ts`:

```ts
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
```

### Example 2: The "State Service" Pattern (No NgRx required)
Using a `BehaviorSubject` to hold state and `Observable` to expose it safely, keeping the write-operations strictly encapsulated.

Create `13-state-service.ts`:

```ts
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

interface User { id: string, name: string }

interface AppState {
  theme: 'light' | 'dark';
  user: User | null;
}

export class AppStateService {
  private initialState: AppState = { theme: 'light', user: null };
  
  // 1. Private BehaviorSubject (The single source of truth)
  private stateSubj = new BehaviorSubject<AppState>(this.initialState);
  
  // 2. Public Read-Only Observable
  public state$: Observable<AppState> = this.stateSubj.asObservable();

  // 3. Sliced derived state (Memoized via distinctUntilChanged)
  public theme$ = this.state$.pipe(
    map(state => state.theme),
    distinctUntilChanged()
  );

  // 4. Safe modifier method
  public toggleTheme() {
    const currentState = this.stateSubj.getValue();
    const newTheme = currentState.theme === 'light' ? 'dark' : 'light';
    this.stateSubj.next({ ...currentState, theme: newTheme });
  }
}

// Demo usage
const stateService = new AppStateService();
stateService.theme$.subscribe(theme => console.log('Current Theme is now:', theme));

stateService.toggleTheme(); // logs: Current Theme is now: dark
stateService.toggleTheme(); // logs: Current Theme is now: light
```

## 9. Best Practices & Gotchas

1. **Always unsubscribe** (or use `takeUntil` + destroy$ in Angular).
2. Prefer `pipe()` over chaining.
3. Use `switchMap` for most user-triggered async.
4. Never nest `subscribe()` inside `subscribe()`.
5. `shareReplay({ bufferSize: 1, refCount: true })` is usually better than plain `share()`.
6. For state → `BehaviorSubject` + `asObservable()`.

## 10. Quick Reference Cheat Sheet

**Creation** → `of`, `from`, `interval`, `fromEvent`, `ajax`  
**Transform** → `map`, `scan`, `mergeMap`/`switchMap`/`concatMap`  
**Filter** → `filter`, `debounceTime`, `take`, `distinctUntilChanged`  
**Combine** → `merge`, `combineLatest`, `forkJoin`  
**Multicast** → `Subject`, `BehaviorSubject`, `shareReplay`  
**Error** → `catchError`, `retry`, `finalize`

## Next Steps (Deepen Further)

1. Official docs: https://rxjs.dev/guide/overview
2. Practice: https://www.learnrxjs.io (interactive marbles)
3. Book: “RxJS in Action” (still excellent)
4. Angular-specific: `HttpClient` returns Observables by default – you already know everything.

You now know **80% of what professional developers use daily** and the mental models to understand the remaining 20%.  

Start building something with it today — the only way to truly master RxJS is to feel the flow.

Happy reactive coding! 🚀

If you want:
- A PDF version
- Angular-specific deep dive
- Marble diagram visuals
- Quiz + exercises

…just say the word and I’ll generate the next part instantly.