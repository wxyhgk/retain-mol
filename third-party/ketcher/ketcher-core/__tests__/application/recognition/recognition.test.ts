import {
  ImagoRecognitionAdapter,
  MoleculeRecognitionError,
  OpenAICompatibleRecognitionAdapter,
  RECOGNIZED_MOLECULE_SCHEMA_VERSION,
  createRecognizedMolecule,
  validateRecognizedStructure,
  parseAiRecognitionPayload,
  createMoleculeEditPlanFromStruct,
} from 'application/recognition';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import { Ketcher } from 'application/ketcher';

function validStructure() {
  const structure = new Struct();
  const begin = structure.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const end = structure.atoms.add(new Atom({ label: 'O', pp: new Vec2(1, 0) }));
  structure.bonds.add(new Bond({ begin, end, type: 2 }));
  return structure;
}

describe('recognized molecule contract', () => {
  it('wraps a valid structure in the versioned provider-neutral contract', () => {
    const structure = validStructure();

    expect(createRecognizedMolecule('test-ai', structure)).toEqual({
      schemaVersion: RECOGNIZED_MOLECULE_SCHEMA_VERSION,
      provider: 'test-ai',
      structure,
      issues: [],
    });
  });

  it('rejects an empty recognition result', () => {
    expect(() => createRecognizedMolecule('test-ai', new Struct())).toThrow(
      MoleculeRecognitionError,
    );
  });

  it('reports malformed atoms and bonds before they reach the canvas', () => {
    const structure = new Struct();
    const atomId = structure.atoms.add(
      new Atom({ label: '', pp: new Vec2(0, 0) }),
    );
    const atom = structure.atoms.get(atomId) as Atom;
    atom.pp.x = Number.NaN;
    structure.bonds.add(new Bond({ begin: atomId, end: atomId, type: 0 }));
    structure.bonds.add(new Bond({ begin: atomId, end: 99, type: 1 }));

    expect(
      validateRecognizedStructure(structure).map(({ code }) => code),
    ).toEqual([
      'invalid-atom-label',
      'invalid-atom-coordinate',
      'self-bond',
      'invalid-bond-order',
      'dangling-bond',
    ]);
  });
});

describe('molecule edit plan', () => {
  it('turns a structure into stable atom/bond batches with ring closure last', () => {
    const structure = new Struct();
    const first = structure.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const second = structure.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const third = structure.atoms.add(
      new Atom({ label: 'O', pp: new Vec2(0.5, 0.87) }),
    );
    structure.bonds.add(new Bond({ begin: first, end: second, type: 1 }));
    structure.bonds.add(new Bond({ begin: second, end: third, type: 1 }));
    structure.bonds.add(new Bond({ begin: third, end: first, type: 1 }));

    const plan = createMoleculeEditPlanFromStruct(structure);

    expect(plan.schema).toBe('retainmol.molecule-edit-plan.v1');
    expect(plan.atomCount).toBe(3);
    expect(plan.bondCount).toBe(3);
    expect(plan.steps).toHaveLength(4);
    expect(plan.steps.at(-1)?.commands.map(({ type }) => type)).toEqual([
      'addBond',
    ]);
    expect(
      plan.steps
        .flatMap(({ commands }) => commands)
        .filter(({ type }) => type === 'addAtom'),
    ).toHaveLength(3);
  });
});

describe('ImagoRecognitionAdapter', () => {
  it('normalizes Imago output into the shared recognition contract', async () => {
    const structure = validStructure();
    const recognizeImage = jest.fn().mockResolvedValue({ struct: 'raw-mol' });
    const deserialize = jest.fn().mockReturnValue(structure);
    const adapter = new ImagoRecognitionAdapter(recognizeImage, {
      deserialize,
    });
    const image = new Blob(['image'], { type: 'image/png' });

    await expect(adapter.recognize({ image, version: '2' })).resolves.toEqual({
      schemaVersion: RECOGNIZED_MOLECULE_SCHEMA_VERSION,
      provider: 'imago',
      structure,
      issues: [],
    });
    expect(recognizeImage).toHaveBeenCalledWith(image, '2');
    expect(deserialize).toHaveBeenCalledWith('raw-mol');
  });

  it('deserializes the molfile returned by Imago by default', async () => {
    const molfile = [
      'Recognized structure',
      '  RetainMol',
      '',
      '  2  1  0  0  0  0  0  0  0  0999 V2000',
      '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
      '    1.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0',
      '  1  2  2  0  0  0  0',
      'M  END',
    ].join('\n');
    const adapter = new ImagoRecognitionAdapter(
      jest.fn().mockResolvedValue({ struct: molfile }),
    );

    const result = await adapter.recognize({ image: new Blob(['image']) });

    expect(result.structure.atoms.size).toBe(2);
    expect(result.structure.bonds.size).toBe(1);
    expect(result.structure.atoms.get(1)?.label).toBe('O');
    expect(result.structure.bonds.get(0)?.type).toBe(2);
  });

  it('rejects invalid provider output through the shared validator', async () => {
    const recognizeImage = jest.fn().mockResolvedValue({ struct: 'empty' });
    const adapter = new ImagoRecognitionAdapter(recognizeImage, {
      deserialize: () => new Struct(),
    });

    await expect(
      adapter.recognize({ image: new Blob(['image']) }),
    ).rejects.toBeInstanceOf(MoleculeRecognitionError);
  });
});

describe('OpenAICompatibleRecognitionAdapter', () => {
  it.each([
    ['{"smiles":"CC","confidence":0.8}'],
    ['```json\n{"smiles":"CC","confidence":0.8}\n```'],
    ['result: {"smiles":"CC","confidence":0.8}'],
  ])('parses a JSON recognition payload from %s', (content) => {
    expect(parseAiRecognitionPayload(content)).toEqual({
      smiles: 'CC',
      confidence: 0.8,
    });
  });

  it('sends a vision request and validates the parsed structure', async () => {
    const structure = validStructure();
    const parseSmiles = jest.fn().mockResolvedValue(structure);
    const fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"smiles":"C=O","confidence":0.75}',
            },
          },
        ],
      }),
    });
    const adapter = new OpenAICompatibleRecognitionAdapter({
      baseUrl: 'http://recognizer.test/v1/',
      apiKey: 'test-key',
      model: 'test-vision',
      parseSmiles,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    await expect(
      adapter.recognize({
        image: new Blob(['image'], { type: 'image/png' }),
      }),
    ).resolves.toEqual({
      schemaVersion: RECOGNIZED_MOLECULE_SCHEMA_VERSION,
      provider: 'openai-compatible-vision',
      structure,
      issues: [],
      confidence: 0.75,
    });
    expect(parseSmiles).toHaveBeenCalledWith('C=O');
    expect(fetch).toHaveBeenCalledWith(
      'http://recognizer.test/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  it('rejects a response without SMILES', () => {
    expect(() => parseAiRecognitionPayload('{"confidence":0.5}')).toThrow(
      'does not contain SMILES',
    );
  });

  it('rejects confidence outside the documented range', () => {
    expect(() =>
      parseAiRecognitionPayload('{"smiles":"CC","confidence":1.2}'),
    ).toThrow('confidence must be between 0 and 1');
  });

  it('does not add an authorization header when no API key is configured', async () => {
    const fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: '{"smiles":"C=O"}' } }],
      }),
    });
    const adapter = new OpenAICompatibleRecognitionAdapter({
      baseUrl: 'http://recognizer.test/v1',
      model: 'test-vision',
      parseSmiles: async () => validStructure(),
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    await adapter.recognize({ image: new Blob(['image']) });

    expect(fetch.mock.calls[0][1].headers).toEqual({
      'Content-Type': 'application/json',
    });
  });
});

describe('Ketcher recognition provider injection', () => {
  it('routes recognition through the instance adapter without coupling the UI to a provider', async () => {
    const structure = validStructure();
    const recognize = jest
      .fn()
      .mockResolvedValue(createRecognizedMolecule('test-ai', structure));
    const ketcher = new Ketcher({} as never, {} as never);
    ketcher.setRecognitionAdapter({ provider: 'test-ai', recognize });

    const image = new Blob(['image'], { type: 'image/png' });
    await expect(ketcher.recognize(image, 'v1')).resolves.toBe(structure);
    expect(recognize).toHaveBeenCalledWith({ image, version: 'v1' });
  });

  it('keeps the instance adapter when Indigo is reinitialized', async () => {
    const structure = validStructure();
    const recognize = jest
      .fn()
      .mockResolvedValue(createRecognizedMolecule('test-ai', structure));
    const ketcher = new Ketcher({} as never, {} as never);
    ketcher.setRecognitionAdapter({ provider: 'test-ai', recognize });

    ketcher.reinitializeIndigo({} as never);

    await expect(ketcher.recognize(new Blob(['image']))).resolves.toBe(
      structure,
    );
  });

  it('restores the current Imago-backed Indigo provider when cleared', async () => {
    const structure = validStructure();
    const ketcher = new Ketcher({} as never, {} as never);
    ketcher.setRecognitionAdapter({
      provider: 'test-ai',
      recognize: jest.fn(),
    });
    const defaultRecognize = jest
      .spyOn(ketcher.indigo, 'recognize')
      .mockResolvedValue(structure);

    ketcher.setRecognitionAdapter(null);

    const image = new Blob(['image']);
    await expect(ketcher.recognize(image, 'v2')).resolves.toBe(structure);
    expect(defaultRecognize).toHaveBeenCalledWith(image, { version: 'v2' });
  });
});
