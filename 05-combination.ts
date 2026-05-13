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