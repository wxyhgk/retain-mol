import { type ItemsToFuse, Action } from 'ketcher-core';
import type { IToolContext } from '../IToolContext';
export type DropAndMergeContext = Pick<IToolContext, 'explicitSelected' | 'hover' | 'render' | 'selection' | 'struct' | 'update'> & Partial<Pick<IToolContext, 'options'>>;
export type MergeItems = Pick<ItemsToFuse, 'atoms' | 'bonds'> & Partial<Pick<ItemsToFuse, 'atomToFunctionalGroup'>>;
export declare function dropAndMerge(editor: DropAndMergeContext, mergeItems: MergeItems | null | undefined, action?: Action | null, copyAction?: Action): Action;
