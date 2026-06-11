/**
 * 13-state-service.ts
 *
 * PURPOSE: The "lightweight state service" pattern (no NgRx / Redux needed for many apps).
 *
 * Core ideas:
 * - One private BehaviorSubject holds the single source of truth.
 * - Expose a read-only `state$` (asObservable) so consumers cannot .next() directly.
 * - Derive "sliced" observables (theme$, user$, etc.) with map + distinctUntilChanged.
 *   This gives you memoized, efficient views that only emit on actual change.
 * - All mutations go through explicit methods (toggleTheme, setUser, etc.).
 *   This keeps writes controlled and easy to audit / log / test.
 *
 * This pattern scales surprisingly far before you need a full state machine.
 *
 * EXPECTED:
 *   Current Theme is now: light
 *   Current Theme is now: dark
 *   Current Theme is now: light
 *
 * RUN: npx ts-node 13-state-service.ts
 */

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