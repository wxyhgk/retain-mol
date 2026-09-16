import type { LayoutMode } from './types';
import type { BaseMode } from './BaseMode';
type ModeConstructor = new (previousMode?: LayoutMode) => BaseMode;
export declare function registerMode(mode: LayoutMode, ctor: ModeConstructor): void;
export declare function getModeConstructor(mode: LayoutMode): ModeConstructor;
export {};
