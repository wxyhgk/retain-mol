import { Action, type ReStruct } from 'ketcher-core';

/** The installation callback owns synchronous render/selection rollback. */
export class MoleculeStructSwapAction extends Action {
  // eslint-disable-next-line no-use-before-define -- reversible actions link to their paired action
  private inverseAction?: MoleculeStructSwapAction;

  constructor(private readonly swap: () => MoleculeStructSwapAction) {
    super();
  }

  perform(_restruct: ReStruct): Action {
    const inverse = this.swap();
    if (!this.inverseAction) {
      this.inverseAction = inverse;
      inverse.inverseAction = this;
    }
    return this.inverseAction;
  }

  isDummy(): boolean {
    return false;
  }
}
