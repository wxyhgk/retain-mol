import type { IToolContext } from './IToolContext';
export type AtomHotspotCommand = 'single-bond' | 'carbonyl' | 'ring' | 'gem-dimethyl' | 'stereo-gem-dimethyl';
export type AtomHotspotOptions = {
    command: AtomHotspotCommand;
    struct?: unknown;
};
export declare function shouldAddConnectorBeforeRing(atomDegree: number): boolean;
export declare function executeAtomHotspotCommand(ctx: IToolContext, atomId: number, options: AtomHotspotOptions): void;
