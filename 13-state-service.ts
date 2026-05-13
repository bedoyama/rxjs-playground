import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

interface User { id: string, name: string }

interface AppState {
  theme: 'light' | 'dark';
  user: User | null;
}

export class AppStateService {
  private initialState: AppState = { theme: 'light', user: null };
  
  // 1. Private BehaviorSubject (The single source of truth)
  private stateSubj = new BehaviorSubject<AppState>(this.initialState);
  
  // 2. Public Read-Only Observable
  public state$: Observable<AppState> = this.stateSubj.asObservable();

  // 3. Sliced derived state (Memoized via distinctUntilChanged)
  public theme$ = this.state$.pipe(
    map(state => state.theme),
    distinctUntilChanged()
  );

  // 4. Safe modifier method
  public toggleTheme() {
    const currentState = this.stateSubj.getValue();
    const newTheme = currentState.theme === 'light' ? 'dark' : 'light';
    this.stateSubj.next({ ...currentState, theme: newTheme });
  }
}

// Demo usage
const stateService = new AppStateService();
stateService.theme$.subscribe(theme => console.log('Current Theme is now:', theme));

stateService.toggleTheme(); // logs: Current Theme is now: dark
stateService.toggleTheme(); // logs: Current Theme is now: light