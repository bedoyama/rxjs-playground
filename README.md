# RxJS Cheat Sheet & Playground

**Target**: RxJS 7+ (concepts identical in v8)  
**Style**: Small, focused, runnable files you can open in any order.  
**Goal**: A practical, git-friendly reference you can skim in the file tree or read top-to-bottom.

## How to Use This Repo

```bash
# One-time setup (already done if you're in the folder)
npm install

# Run any example directly (they are all self-contained)
npx ts-node 01-core.ts
npx ts-node 06-02-mergeMap.ts
npx ts-node 13-state-service.ts
```

Every file starts with a big comment block explaining:
- What it teaches
- Expected console output / timing
- Why the operators behave that way
- How to run it

## Flattening Operators — The #1 Decision You Make in Real Apps

| Operator     | Concurrency     | Cancels previous? | Ignores new while busy? | Typical use case                     | File                  |
|--------------|-----------------|-------------------|--------------------------|--------------------------------------|-----------------------|
| `switchMap`  | 1 (latest)      | Yes               | No                       | Search-as-you-type, route params     | `06-01-flattening.ts` |
| `mergeMap`   | Many            | No                | No                       | Load many independent things in parallel | `06-02-mergeMap.ts` |
| `concatMap`  | 1 (queued)      | No                | No                       | Sequential writes, ordered processing | `06-03-concatMap.ts` |
| `exhaustMap` | 1 (block)       | No                | **Yes**                  | "Submit" buttons, prevent double-save | `06-04-exhaustMap.ts` |

**Rule of thumb** (memorize this):
- 80% of the time you want `switchMap` for user-driven reads.
- Use `mergeMap` when order and "all results" matter and load is low.
- Use `concatMap` when you must preserve strict order.
- Use `exhaustMap` on any "do this action" button.

---

## File Index (Organized by Section)

### 1. Core Mental Model
- **[01-core.ts](01-core.ts)** — `new Observable(...)`, laziness, unicast by default, subscribe contract

### 2. Creation Operators (Entry Points)
- **[02-01-creation.ts](02-01-creation.ts)** — `of`, `from` (array/promise), `interval`, `timer`, `fromEvent`, `ajax`, `throwError`, `EMPTY`
- **[02-02-creation-advanced.ts](02-02-creation-advanced.ts)** — `range`, `defer` (lazy per-subscriber), `iif`, `fromFetch`
- **[02-03-rest-api.ts](02-03-rest-api.ts)** — **Dedicated REST API calls**: clean GET single resource + collection using `ajax.getJSON` and modern `fromFetch`, with response typing and `catchError` handling

### 3. Transformation Operators
- **[03-01-transformation.ts](03-01-transformation.ts)** — `map`, `scan` (running accumulator)
- **[03-02-transformation.ts](03-02-transformation.ts)** — `tap` (side effects), `startWith`, `pairwise`, `reduce` (final only), `delay`

### 4. Filtering, Rate Limiting & Flow Control
- **[04-01-filtering.ts](04-01-filtering.ts)** — `debounceTime`, `distinctUntilChanged` (search box classic)
- **[04-02-zip_merge_concat.ts](04-02-zip_merge_concat.ts)** — Timing demo of `merge` / `concat` / `zip`
- **[04-03-filtering.ts](04-03-filtering.ts)** — `take*`, `first`/`last`, `skip`, `takeUntil` (lifecycle), `throttleTime`/`auditTime`/`sampleTime`

### 5. Combination Operators (Joining Multiple Streams)
- **[05-01-combination.ts](05-01-combination.ts)** — `merge` + `combineLatest` (live "latest from all")
- **[05-02-combination.ts](05-02-combination.ts)** — `forkJoin` (Promise.all), `withLatestFrom` (source + latest other), `race`

### 6. Higher-Order Mapping / Flattening (The Most Important Section)
- **[06-01-flattening.ts](06-01-flattening.ts)** — `switchMap` (cancel previous) — typeahead search
- **[06-02-mergeMap.ts](06-02-mergeMap.ts)** — concurrent inner subscriptions
- **[06-03-concatMap.ts](06-03-concatMap.ts)** — sequential, order-preserving
- **[06-04-exhaustMap.ts](06-04-exhaustMap.ts)** — ignore new source values while inner is busy

### 7. Subjects & Multicasting (Hot vs Cold)
- **[07-01-subjects.ts](07-01-subjects.ts)** — `Subject`, `BehaviorSubject`, `ReplaySubject` fundamentals + late subscriber behavior
- **[07-02-subjects.ts](07-02-subjects.ts)** — realistic composition: search + state subjects + replay for late joiners

### 8. Error Handling
- **[08-errors.ts](08-errors.ts)** — `retry`, `catchError`, `finalize`. Shows safe placement of `catchError`.

### 9. Custom Operators
- **[09-custom-operator.ts](09-custom-operator.ts)** — `OperatorFunction` — write your own reusable `.pipe()` operators

### 10. Sharing (Performance & Multicasting)
- **[10-share.ts](10-share.ts)** — `shareReplay({ bufferSize: 1, refCount: true })` — share expensive work (HTTP, computation) across many subscribers

### 11–13. Real-World Enterprise Patterns
- **[11-mini-project.ts](11-mini-project.ts)** — Full typeahead: `debounceTime` + `filter` + `switchMap` + `catchError` (inside) + result mapping
- **[12-polling.ts](12-polling.ts)** — Reactive polling + manual refresh button using `merge` + `switchMap`
- **[13-state-service.ts](13-state-service.ts)** — Lightweight state management with `BehaviorSubject` + `asObservable()` + derived slices + `distinctUntilChanged`

### Quick Smoke Test
- **[index.ts](index.ts)** — Trivial hello world

---

## Best Practices & Gotchas (From the Files)

1. **Observables are lazy** — nothing happens until `subscribe()`.
2. **Prefer `pipe()`** — never chain operators directly on the prototype.
3. **Unsubscribe responsibly** — use `takeUntil(destroy$)` in long-lived components (see 04-03).
4. **Put `catchError` close to the failure point** — especially inside `switchMap`/`mergeMap` (see 11).
5. **Choose the right flattener** — see the table at the top of this file.
6. **Use `shareReplay({ bufferSize: 1, refCount: true })`** for most shared expensive streams.
7. **Expose `asObservable()`** from state services; never let consumers call `.next()` on your subjects directly (see 13).
8. **Use `tap`** for debugging/side effects instead of doing work inside `map` or `subscribe`.
9. **Seed with `startWith`** when you need an immediate "loading" or "initial" value for the UI.

---

## Quick Reference (Cheat Sheet)

**Creation**  
`of`, `from`, `interval`, `timer`, `fromEvent`, `ajax` / `fromFetch`, `defer`, `EMPTY`, `throwError`, `range`

**Transform**  
`map`, `scan` / `reduce`, `startWith`, `pairwise`, `delay`, `tap`

**Filter / Flow**  
`filter`, `debounceTime`, `throttleTime`/`auditTime`, `distinctUntilChanged`, `take`/`takeUntil`/`first`/`last`, `skip`

**Combine**  
`merge`, `concat`, `combineLatest`, `zip`, `forkJoin`, `withLatestFrom`, `race`

**Flatten (Higher-Order)**  
`switchMap`, `mergeMap`, `concatMap`, `exhaustMap`

**Multicast**  
`Subject`, `BehaviorSubject`, `ReplaySubject`, `shareReplay`

**Error / Teardown**  
`catchError`, `retry`, `finalize`, `takeUntil`

---

## Learning Path Recommendation

1. Start with `01-core.ts` → `02-01-creation.ts`
2. Master the four flattening files (`06-*`)
3. Read `04-03-filtering.ts` for `takeUntil` (you will use this constantly)
4. Study `11-mini-project.ts`, `12-polling.ts`, `13-state-service.ts` as complete patterns
5. Use the rest as reference when you hit a specific need (`forkJoin`, `withLatestFrom`, custom operators, etc.)

Happy reactive coding! This structure should make it easy to find the exact small example you need while browsing the repo in Git or your editor.