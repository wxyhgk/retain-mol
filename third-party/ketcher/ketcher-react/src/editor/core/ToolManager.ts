import { toolsMap } from '../tool';
import type { Tool, ToolConstructorInterface } from '../tool/Tool';
import type { IToolContext } from '../tool/IToolContext';

interface ToolManagerContext extends IToolContext {
  _tool: Tool | null;
  hoverIcon: { hide(force: boolean): void };
}

export interface IToolManager {
  tool(name?: string, opts?: unknown): Tool | null;
  getTool(): Tool | null;
}

export class ToolManager implements IToolManager {
  private readonly editor: ToolManagerContext;

  constructor(editor: ToolManagerContext) {
    this.editor = editor;
  }

  getTool(): Tool | null {
    return this.editor._tool;
  }

  tool(name?: string, opts?: unknown): Tool | null {
    // eslint-disable-next-line no-underscore-dangle
    if (arguments.length === 0) {
      return this.editor._tool;
    }

    if (this.editor._tool?.cancel) {
      this.editor._tool.cancel();
    }

    const ToolConstructor: ToolConstructorInterface = toolsMap[name as string];

    const tool = new ToolConstructor(this.editor, opts);

    const isAtomToolChosen = name === 'atom';
    if (!isAtomToolChosen) {
      this.editor.hoverIcon.hide(true);
    }

    if (!tool || tool.isNotActiveTool) {
      return null;
    }

    const isSelectToolChosen =
      name === 'select' || name === 'fragmentSelection';
    if (!isSelectToolChosen) {
      this.editor.rotateController.clean();
    }

    // eslint-disable-next-line no-underscore-dangle
    this.editor._tool = tool;
    return this.editor._tool;
  }
}
