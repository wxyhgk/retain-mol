import { type MoleculeEditPlanStep, type MoleculeEditPlanV1 } from '../recognition/moleculeEditPlan.types';
import type { Editor } from './editor.types';
export type MoleculeEditPlanErrorCode = 'schema-mismatch' | 'duplicate-reference' | 'missing-reference' | 'invalid-coordinate' | 'invalid-bond' | 'unsupported-step-shape' | 'count-mismatch' | 'playback-in-progress';
export declare class MoleculeEditPlanError extends Error {
    readonly code: MoleculeEditPlanErrorCode;
    constructor(code: MoleculeEditPlanErrorCode, message: string);
}
type ExecutionContext = Pick<Editor, 'render' | 'update' | 'notifyDocumentChange'>;
export type MoleculeEditPlanStepResult = {
    step: MoleculeEditPlanStep;
    stepIndex: number;
    atomIds: ReadonlyMap<string, number>;
    bondIds: ReadonlyMap<string, number>;
};
export type MoleculeEditPlanPlaybackOptions = {
    delayMs?: number;
    signal?: AbortSignal;
    positionOffset?: {
        x: number;
        y: number;
    };
    onStep?: (result: MoleculeEditPlanStepResult) => void;
    wait?: (delayMs: number) => Promise<void>;
};
export declare function validateMoleculeEditPlan(plan: MoleculeEditPlanV1): void;
export declare class MoleculeEditPlanExecutor {
    #private;
    private readonly context;
    readonly plan: MoleculeEditPlanV1;
    private readonly positionOffset;
    readonly atomIds: Map<string, number>;
    readonly bondIds: Map<string, number>;
    constructor(context: ExecutionContext, plan: MoleculeEditPlanV1, positionOffset?: {
        x: number;
        y: number;
    });
    get nextStepIndex(): number;
    get isComplete(): boolean;
    applyNextStep(): MoleculeEditPlanStepResult | null;
    play(options?: MoleculeEditPlanPlaybackOptions): Promise<void>;
}
export {};
