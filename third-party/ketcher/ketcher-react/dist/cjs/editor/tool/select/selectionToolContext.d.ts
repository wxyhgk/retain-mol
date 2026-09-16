import type { IToolContext } from '../IToolContext';
import type { Atom, Bond, Vec2 } from 'ketcher-core';
interface TextEditPayload {
    type: 'text';
    content?: string;
    [key: string]: unknown;
}
type SelectionToolEvents = IToolContext['event'] & {
    bondEdit: {
        dispatch(payload: Bond[]): Promise<Bond>;
    };
    elementEdit: {
        dispatch(payload: Atom[]): Promise<Atom>;
        dispatch(payload: TextEditPayload): Promise<{
            content?: string;
        }>;
    };
};
type SelectionToolBaseContext = Pick<IToolContext, 'errorHandler' | 'explicitSelected' | 'findItem' | 'findMerge' | 'hover' | 'options' | 'render' | 'selection' | 'struct' | 'update'>;
/**
 * Capabilities shared by selection and rotation interactions.
 *
 * This contract intentionally follows the subsystem boundary rather than the
 * concrete Editor class. Narrow helper contracts should Pick only the members
 * they use from this type.
 */
export type SelectionToolContext = SelectionToolBaseContext & {
    event: SelectionToolEvents;
    rotateController: IToolContext['rotateController'] & {
        reposition(delta: Vec2): void;
    };
};
export type EditableSelectionToolContext = SelectionToolContext & {
    structSelected: NonNullable<IToolContext['structSelected']>;
};
export type SelectionStateContext = Pick<SelectionToolContext, 'render' | 'selection' | 'struct'>;
export type RotationToolContext = Pick<SelectionToolContext, 'event' | 'explicitSelected' | 'findMerge' | 'hover' | 'render' | 'rotateController' | 'selection' | 'update'>;
export type SelectionRotationContext = RotationToolContext & Pick<IToolContext, 'tool'>;
export {};
