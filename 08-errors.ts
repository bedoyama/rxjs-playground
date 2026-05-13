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