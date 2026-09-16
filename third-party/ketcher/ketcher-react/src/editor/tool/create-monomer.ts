import type { Tool } from './Tool';
import type { IToolContext } from './IToolContext';

class CreateMonomerTool implements Tool {
  constructor(private readonly editor: IToolContext) {
    this.editor.openMonomerCreationWizard();
    setTimeout(() => {
      this.editor.tool('select');
    }, 0);
  }

  mousemove() {
    // No action needed on mouse move for this tool
  }
}

export default CreateMonomerTool;
