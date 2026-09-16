import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { StoreState } from './store.types';
export type AppDispatch = ThunkDispatch<StoreState, undefined, AnyAction>;
export declare const useAppDispatch: import("react-redux").UseDispatch<AppDispatch>;
export declare const useAppSelector: import("react-redux").UseSelector<StoreState>;
