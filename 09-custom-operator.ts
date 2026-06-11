/**
 * 09-custom-operator.ts
 *
 * PURPOSE: How to write your own reusable pipeable operator.
 *
 * OperatorFunction<Input, Output> is the type for anything you can pass to .pipe().
 * A custom operator is just a function that returns another function:
 *   (source: Observable<T>) => Observable<R>
 *
 * This is extremely powerful for:
 * - Domain-specific operators (e.g. "validateUser", "toCurrency")
 * - Encapsulating complex combinations of map/filter/scan that you repeat
 * - Keeping your component / service pipes readable
 *
 * EXPECTED:
 *   Custom Operator Emit: 6
 *   Custom Operator Emit: 8
 *   (1 and 2 were filtered out, 3→6, 4→8)
 *
 * RUN: npx ts-node 09-custom-operator.ts
 */

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