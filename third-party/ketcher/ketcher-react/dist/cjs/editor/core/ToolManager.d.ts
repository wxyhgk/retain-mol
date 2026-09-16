import type { Tool } from '../tool/Tool';
import type { IToolContext } from '../tool/IToolContext';
interface ToolManagerContext extends IToolContext {
    _tool: Tool | null;
    hoverIcon: {
        hide(force: boolean): void;
    };
}
export interface IToolManager {
    tool(name?: string, opts?: unknown): Tool | null;
    getTool(): Tool | null;
}
export declare class ToolManager implements IToolManager {
    private readonly editor;
    constructor(editor: ToolManagerContext);
    getTool(): Tool | null;
    tool(name?: string, opts?: unknown): Tool | null;
}
export {};
