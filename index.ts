/**
 * index.ts
 * Quick smoke test / "hello world".
 * For the full cheat sheet, run the numbered example files directly:
 *   npx ts-node 01-core.ts
 *   npx ts-node 06-flattening.ts
 *   etc.
 */

import { of, map } from 'rxjs';

of('Hello RxJS').pipe(map(v => v.toUpperCase())).subscribe(console.log);