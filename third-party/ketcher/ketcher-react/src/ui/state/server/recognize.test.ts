import {
  Atom,
  createRecognizedMolecule,
  Ketcher,
  ketcherProvider,
  Struct,
  Vec2,
} from 'ketcher-core';
import { recognize } from './index';

function recognizedStructure() {
  const structure = new Struct();
  structure.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  return structure;
}

describe('recognize state action', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('routes an injected Ketcher provider result into the preview', async () => {
    const structure = recognizedStructure();
    const recognizeImage = jest
      .fn()
      .mockResolvedValue(createRecognizedMolecule('test-ai', structure));
    const ketcher = new Ketcher({} as never, {} as never);
    ketcher.setRecognitionAdapter({
      provider: 'test-ai',
      recognize: recognizeImage,
    });
    ketcherProvider.addKetcherInstance(ketcher);
    const dispatch = jest.fn();
    const errorHandler = jest.fn();
    const image = new Blob(['image'], { type: 'image/png' });

    recognize(image, '2')(dispatch, () => ({
      editor: { errorHandler, ketcherId: ketcher.id },
    }));

    const pending = dispatch.mock.calls[0][0].data.structStr;
    try {
      await pending;
    } finally {
      ketcherProvider.removeKetcherInstance(ketcher.id);
    }

    expect(recognizeImage).toHaveBeenCalledWith({ image, version: '2' });
    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'SET_RECOGNIZE_STRUCT',
        data: { structStr: expect.any(Struct) },
      }),
    );
    expect(errorHandler).not.toHaveBeenCalled();
  });

  it('clears the preview without calling a provider when no image is set', () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({ editor: { ketcherId: 'test' } }));

    recognize(null, '2')(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_RECOGNIZE_STRUCT',
      data: { structStr: null },
    });
    expect(getState).toHaveBeenCalled();
  });

  it('ignores a stale recognition result after a newer image finishes', async () => {
    let resolveFirst;
    const firstResult = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const newerStructure = recognizedStructure();
    const staleStructure = recognizedStructure();
    const recognizeImage = jest
      .fn()
      .mockReturnValueOnce(firstResult)
      .mockResolvedValueOnce(
        createRecognizedMolecule('test-ai', newerStructure),
      );
    const ketcher = new Ketcher({} as never, {} as never);
    ketcher.setRecognitionAdapter({
      provider: 'test-ai',
      recognize: recognizeImage,
    });
    ketcherProvider.addKetcherInstance(ketcher);
    const dispatch = jest.fn();
    const errorHandler = jest.fn();
    const getState = () => ({
      editor: { errorHandler, ketcherId: ketcher.id },
    });

    try {
      recognize(new Blob(['first']), '2')(dispatch, getState);
      recognize(new Blob(['second']), '2')(dispatch, getState);
      const newerPending = dispatch.mock.calls[1][0].data.structStr;
      await newerPending;
      const callsAfterNewerResult = dispatch.mock.calls.length;

      resolveFirst(createRecognizedMolecule('test-ai', staleStructure));
      await firstResult;
      await Promise.resolve();

      expect(dispatch.mock.calls).toHaveLength(callsAfterNewerResult);
      expect(dispatch).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'SET_RECOGNIZE_STRUCT',
          data: { structStr: newerStructure },
        }),
      );
    } finally {
      ketcherProvider.removeKetcherInstance(ketcher.id);
    }
  });
});
