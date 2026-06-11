/**
 * 06-03-exhaustMap.ts
 *
 * PURPOSE: exhaustMap — ignore new source values while an inner Observable is still active.
 *
 * When the source emits:
 *   - If NO inner is currently running → subscribe to the new inner.
 *   - If an inner IS still running → drop the new source value completely.
 *
 * Perfect for:
 *   - "Submit" / "Save" buttons (prevent double-submits while the request is in flight)
 *   - Any action that should be "one at a time and ignore extra clicks during work"
 *
 * Note the opposite behavior of switchMap (which would cancel the previous).
 *
 * In this demo, rapid clicks during the long "save" will be ignored.
 *
 * EXPECTED:
 *   [exhaust] click → starting save...
 *   (more clicks while saving are ignored)
 *   [exhaust] save complete
 *   (a click after completion will start a new one)
 *
 * RUN: npx ts-node 06-03-exhaustMap.ts
 */

import { fromEvent, of } from 'rxjs';
import { exhaustMap, delay, tap } from 'rxjs/operators';
import { EventEmitter } from 'events';

// Polyfill
(global as any).document = new EventEmitter();
const button = (global as any).document;

function fakeSave() {
  console.log('[exhaust] click → starting save...');
  return of('saved!').pipe(
    delay(700),
    tap(() => console.log('[exhaust] save complete'))
  );
}

fromEvent(button as any, 'click').pipe(
  exhaustMap(() => fakeSave())
).subscribe(result => console.log('[exhaust] result:', result));

// Simulate user hammering the button
setTimeout(() => button.emit('click', {}), 100);   // starts the work
setTimeout(() => button.emit('click', {}), 200);   // ignored
setTimeout(() => button.emit('click', {}), 300);   // ignored
setTimeout(() => button.emit('click', {}), 900);   // should start a NEW save (previous finished)