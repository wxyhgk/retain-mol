import type { IToolContext } from '../../editor/tool/IToolContext';
import { attachTemplateToBond } from '../../editor/tool/templateAttachment';
import { executeAtomHotspotCommand } from '../../editor/tool/atomHotspot';
import { handleHotkeyOverItem } from './handleHotkeysOverItem';

jest.mock('../../editor/tool/templateAttachment', () => ({
  attachTemplateToBond: jest.fn(),
}));
jest.mock('../../editor/tool/atomHotspot', () => ({
  executeAtomHotspotCommand: jest.fn(),
}));

const mockAttachTemplateToBond = jest.mocked(attachTemplateToBond);
const mockExecuteAtomHotspotCommand = jest.mocked(executeAtomHotspotCommand);

describe('bond template hotkey routing', () => {
  it.each([0, 1])(
    'routes bond id %i to the dedicated async attachment command',
    (bondId) => {
      const pending = new Promise<boolean>(() => undefined);
      mockAttachTemplateToBond.mockReturnValueOnce(pending);
      const ctx = {} as IToolContext;
      const opts = { struct: { name: 'ring' } };

      const result = handleHotkeyOverItem({
        hoveredItem: { bonds: bondId },
        newAction: { tool: 'template', opts },
        ctx,
        dispatch: jest.fn(),
      });

      expect(mockAttachTemplateToBond).toHaveBeenCalledWith(ctx, opts, bondId);
      expect(result).toBe(pending);
    },
  );
});

describe('atom hotspot command routing', () => {
  it.each([0, 1])(
    'routes atom id %i to the atom command boundary',
    (atomId) => {
      const ctx = {} as IToolContext;
      const opts = { command: 'gem-dimethyl' as const };

      handleHotkeyOverItem({
        hoveredItem: { atoms: atomId },
        newAction: { tool: 'atom-hotspot', opts },
        ctx,
        dispatch: jest.fn(),
      });

      expect(mockExecuteAtomHotspotCommand).toHaveBeenCalledWith(
        ctx,
        atomId,
        opts,
      );
    },
  );
});
