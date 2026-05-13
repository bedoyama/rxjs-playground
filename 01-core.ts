import { Observable } from 'rxjs';

const obs$ = new Observable(subscriber => {
  console.log('Observable started'); // Only runs on subscribe
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

obs$.subscribe({ next: v => console.log(v) }); // → starts now