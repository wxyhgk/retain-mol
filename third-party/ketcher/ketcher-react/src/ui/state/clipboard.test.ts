import { Atom, ketcherProvider, Struct } from 'ketcher-core';
import type { IToolContext } from '../../editor/tool/IToolContext';
import {
  createClipboardController,
  type ClipboardDependencies,
} from './clipboard';
import { createProviderClipboardDependencies } from './clipboardProviderAdapter';

function createEditor(struct: Struct) {
  const selection = jest.fn();
  const editor = {
    selection,
    struct: () => struct,
  } as unknown as IToolContext;

  return { editor, selection };
}

function createDependencies(serializedStructure: string) {
  const run = jest.fn();
  const serialize = jest.fn().mockResolvedValue(serializedStructure);
  const dependencies: ClipboardDependencies = {
    runAsyncAction(action) {
      run(action);
      return action();
    },
    serializeStructure(struct) {
      return serialize(struct);
    },
  };

  return { dependencies, run, serialize };
}

describe('clipboard runtime dependencies', () => {
  it('keeps async and serialization services isolated per editor', async () => {
    const firstStruct = new Struct();
    firstStruct.atoms.add(new Atom({ label: 'C' }));
    const secondStruct = new Struct();
    secondStruct.atoms.add(new Atom({ label: 'N' }));
    const firstEditor = createEditor(firstStruct);
    const secondEditor = createEditor(secondStruct);
    const firstServices = createDependencies('first-mol');
    const secondServices = createDependencies('second-mol');

    const firstClipboard = createClipboardController(
      jest.fn(),
      () => ({ editor: firstEditor.editor, modal: null }),
      firstServices.dependencies,
    );
    const secondClipboard = createClipboardController(
      jest.fn(),
      () => ({ editor: secondEditor.editor, modal: null }),
      secondServices.dependencies,
    );

    const [firstData, secondData] = await Promise.all([
      firstClipboard.onCopy(),
      secondClipboard.onCopy(),
    ]);

    expect(firstData?.['text/plain']).toBe('first-mol');
    expect(secondData?.['text/plain']).toBe('second-mol');
    expect(firstServices.serialize).toHaveBeenCalledWith(firstStruct);
    expect(firstServices.serialize).not.toHaveBeenCalledWith(secondStruct);
    expect(secondServices.serialize).toHaveBeenCalledWith(secondStruct);
    expect(secondServices.serialize).not.toHaveBeenCalledWith(firstStruct);
    expect(firstServices.run).toHaveBeenCalledTimes(1);
    expect(secondServices.run).toHaveBeenCalledTimes(1);
    expect(firstEditor.selection).toHaveBeenCalledWith(null);
    expect(secondEditor.selection).toHaveBeenCalledWith(null);
  });

  it('binds provider adapters to the requested Ketcher instance', async () => {
    const firstFormatter = {
      getStringFromStructureAsync: jest.fn().mockResolvedValue('first-mol'),
    };
    const secondFormatter = {
      getStringFromStructureAsync: jest.fn().mockResolvedValue('second-mol'),
    };
    const firstKetcher = {
      editor: { serverSettings: { source: 'first' } },
      eventBus: { emit: jest.fn() },
      formatterFactory: { create: jest.fn().mockReturnValue(firstFormatter) },
    };
    const secondKetcher = {
      editor: { serverSettings: { source: 'second' } },
      eventBus: { emit: jest.fn() },
      formatterFactory: { create: jest.fn().mockReturnValue(secondFormatter) },
    };
    const getKetcherSpy = jest
      .spyOn(ketcherProvider, 'getKetcher')
      .mockImplementation((ketcherId) => {
        return (ketcherId === 'first' ? firstKetcher : secondKetcher) as never;
      });
    const firstDependencies = createProviderClipboardDependencies('first');
    const secondDependencies = createProviderClipboardDependencies('second');
    const firstStruct = new Struct();
    const secondStruct = new Struct();

    await expect(
      firstDependencies.serializeStructure(firstStruct),
    ).resolves.toBe('first-mol');
    await expect(
      secondDependencies.serializeStructure(secondStruct),
    ).resolves.toBe('second-mol');
    await firstDependencies.runAsyncAction(async () => 'first-action');
    await secondDependencies.runAsyncAction(async () => 'second-action');

    expect(firstKetcher.formatterFactory.create).toHaveBeenCalledWith(
      expect.anything(),
      firstKetcher.editor.serverSettings,
      undefined,
      firstStruct,
    );
    expect(secondKetcher.formatterFactory.create).toHaveBeenCalledWith(
      expect.anything(),
      secondKetcher.editor.serverSettings,
      undefined,
      secondStruct,
    );
    expect(firstKetcher.eventBus.emit).toHaveBeenCalledWith('LOADING');
    expect(firstKetcher.eventBus.emit).toHaveBeenCalledWith('SUCCESS');
    expect(secondKetcher.eventBus.emit).toHaveBeenCalledWith('LOADING');
    expect(secondKetcher.eventBus.emit).toHaveBeenCalledWith('SUCCESS');

    getKetcherSpy.mockRestore();
  });
});
