import type { Tool } from './Tool';
import type { IToolContext } from './IToolContext';
declare class CreateMonomerTool implements Tool {
    private readonly editor;
    constructor(editor: IToolContext);
    mousemove(): void;
}
export default CreateMonomerTool;
