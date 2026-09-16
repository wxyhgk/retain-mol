import { KetcherLogger } from 'ketcher-core';
import type { Subscription } from 'subscription';

export function runMoleculeListener(callback: () => unknown): unknown {
  try {
    const result = callback();
    if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
      Promise.resolve(result).catch((error) => {
        KetcherLogger.error('Molecule commit listener failed', error);
      });
    }
    return result;
  } catch (error) {
    KetcherLogger.error('Molecule commit listener failed', error);
  }
  return undefined;
}

export function dispatchMoleculeListeners(
  subscription: Subscription,
  initialValue?: unknown,
  pipeline = false,
): void {
  let value = initialValue;
  for (const handler of subscription.handlersForDispatch() as Array<{
    f: (value: unknown) => unknown;
  }>) {
    runMoleculeListener(() => {
      const result = handler.f(value);
      if (pipeline) value = result;
      return result;
    });
  }
}
