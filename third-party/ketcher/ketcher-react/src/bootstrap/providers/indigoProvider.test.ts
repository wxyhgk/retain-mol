import {
  IndigoProvider as CoreIndigoProvider,
  type StructService,
} from 'ketcher-core';
import { IndigoProvider } from './indigoProvider';

const loadIndigoProvider = async (): Promise<typeof IndigoProvider> => {
  jest.resetModules();

  const module = await import('./indigoProvider');

  return module.IndigoProvider;
};

describe('IndigoProvider', () => {
  it('returns undefined before the Indigo service instance is set', async () => {
    const IndigoProvider = await loadIndigoProvider();

    expect(IndigoProvider.getIndigo()).toBeUndefined();
  });

  it('returns the Indigo service instance that was set', async () => {
    const IndigoProvider = await loadIndigoProvider();
    const indigo = {
      info: jest.fn(),
    } as unknown as StructService;

    IndigoProvider.setIndigo(indigo);

    expect(IndigoProvider.getIndigo()).toBe(indigo);
    expect(IndigoProvider.getIndigo()?.info).toBe(indigo.info);
  });
});

it('keeps the legacy provider export identical to the core singleton', () => {
  expect(IndigoProvider).toBe(CoreIndigoProvider);
});
