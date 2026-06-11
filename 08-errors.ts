/**
 * 08-errors.ts
 *
 * PURPOSE: Error handling pipeline — how to survive failures without killing the stream.
 *
 * retry(n)       → Resubscribe to the source up to n times when it errors.
 * catchError(fn) → Replace the error with a new Observable (or throw a different error).
 * finalize(fn)   → Run side-effect on completion OR error (like a finally block).
 *
 * CRITICAL RULE:
 *   Place catchError as close as possible to the operation that can fail.
 *   In the mini-project (11) you will see catchError INSIDE the switchMap so that
 *   a failed search does not kill the whole outer input stream.
 *
 * EXPECTED:
 *   (the inner observable throws 4 times total: 1 initial + 3 retries)
 *   Next: fallback value instead of error
 *   Finalize: Done or errored
 *   Complete
 *   (the outer error handler is never called because we swallowed it with catchError)
 *
 * RUN: npx ts-node 08-errors.ts
 */

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