import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { DependencyList } from 'react';

/**
 * Shared loader for API data in screens — the CLAUDE.md "no useState for API data" rule.
 *
 * Wraps one repository call in a useReducer state machine using the same
 * LOAD_START / LOAD_SUCCESS / LOAD_ERROR actions as the Level 1 screens
 * (e.g. ChildDetailScreen), so every screen gets loading → success → error-with-retry.
 *
 * - Pass `loader = null` to skip loading (e.g. no familyId yet); `isLoading` is then false.
 * - Stale responses are ignored: only the latest request may write state.
 * - `setData` replaces the loaded value after a successful save (no refetch needed).
 *
 * Form input state (text fields, toggles, selected tabs) stays in useState — only API data belongs here.
 */
type ResourceState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

type ResourceAction<T> =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; data: T }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SET_DATA'; data: T }
  | { type: 'IDLE' };

function resourceReducer<T>(state: ResourceState<T>, action: ResourceAction<T>): ResourceState<T> {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { data: action.data, isLoading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.error };
    case 'SET_DATA':
      return { ...state, data: action.data };
    case 'IDLE':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

export interface ApiResource<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  setData: (data: T) => void;
}

export function useApiResource<T>(
  loader: (() => Promise<T>) | null,
  deps: DependencyList,
  errorMessage: string,
): ApiResource<T> {
  const [state, dispatch] = useReducer(
    resourceReducer as (s: ResourceState<T>, a: ResourceAction<T>) => ResourceState<T>,
    { data: null, isLoading: loader !== null, error: null },
  );
  const requestIdRef = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(() => {
    const currentLoader = loaderRef.current;
    const requestId = ++requestIdRef.current;
    if (!currentLoader) {
      dispatch({ type: 'IDLE' });
      return;
    }
    dispatch({ type: 'LOAD_START' });
    currentLoader().then(
      (data) => { if (requestId === requestIdRef.current) dispatch({ type: 'LOAD_SUCCESS', data }); },
      () => { if (requestId === requestIdRef.current) dispatch({ type: 'LOAD_ERROR', error: errorMessage }); },
    );
  }, [errorMessage]);

  useEffect(() => {
    run();
    // Invalidate in-flight requests when deps change or the screen unmounts.
    return () => { requestIdRef.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((data: T) => dispatch({ type: 'SET_DATA', data }), []);

  return { data: state.data, isLoading: state.isLoading, error: state.error, reload: run, setData };
}
