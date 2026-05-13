import { Subject, BehaviorSubject, ReplaySubject } from 'rxjs';

const subject = new Subject<number>();
subject.subscribe(v => console.log('A:', v));
subject.subscribe(v => console.log('B:', v));
subject.next(42); // Both A and B receive it

// BehaviorSubject (holds current value)
const bs = new BehaviorSubject('initial');
bs.subscribe(console.log); // immediately logs 'initial'

// ReplaySubject (remembers history)
const rs = new ReplaySubject(2); // remembers last 2 values