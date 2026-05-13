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