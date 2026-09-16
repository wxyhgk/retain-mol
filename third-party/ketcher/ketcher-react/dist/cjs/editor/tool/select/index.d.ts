import type { Tool } from '../Tool';
import type { IToolContext } from '../IToolContext';
export * from './select.helpers';
export declare class SelectCommonTool implements Tool {
    constructor(editor: IToolContext, ...args: unknown[]);
}
