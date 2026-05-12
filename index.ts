import { of, map } from 'rxjs';

of('Hello RxJS').pipe(map(v => v.toUpperCase())).subscribe(console.log);