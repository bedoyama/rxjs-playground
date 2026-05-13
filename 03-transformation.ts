import { of } from 'rxjs';
import { map, scan } from 'rxjs/operators';

of(1,2,3,4).pipe(
  map(x => x * 10),
  scan((acc, val) => acc + val, 0) // 10 → 30 → 60 → 100
).subscribe(console.log);