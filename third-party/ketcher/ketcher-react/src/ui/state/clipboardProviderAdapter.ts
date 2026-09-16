import {
  getStructure,
  ketcherProvider,
  runAsyncAction,
  SupportedFormat,
  type Struct,
} from 'ketcher-core';
import type { IToolContext } from '../../editor/tool/IToolContext';
import {
  createClipboardController,
  type ClipboardDependencies,
  type ClipboardDispatch,
  type ClipboardGetState,
} from './clipboard';

function requireKetcherId(ctx: IToolContext): string {
  if (!ctx.ketcherId) {
    throw new Error('Ketcher id is required for clipboard operations');
  }
  return ctx.ketcherId;
}

export function createProviderClipboardDependencies(
  ketcherId: string,
): ClipboardDependencies {
  return {
    runAsyncAction(action) {
      const { eventBus } = ketcherProvider.getKetcher(ketcherId);
      return runAsyncAction(action, eventBus);
    },
    serializeStructure(struct: Struct) {
      const { formatterFactory } = ketcherProvider.getKetcher(ketcherId);
      return getStructure(
        ketcherId,
        formatterFactory,
        struct,
        SupportedFormat.molAuto,
      );
    },
  };
}

export function initClipboardForKetcher(ketcherId: string) {
  const dependencies = createProviderClipboardDependencies(ketcherId);
  return (dispatch: ClipboardDispatch, getState: ClipboardGetState) =>
    createClipboardController(dispatch, getState, dependencies);
}

/**
 * Backward-compatible Redux thunk entry. New composition roots should prefer
 * initClipboardForKetcher so the editor identity is explicit.
 */
export function initClipboard(
  dispatch: ClipboardDispatch,
  getState: ClipboardGetState,
) {
  const resolveDependencies = () =>
    createProviderClipboardDependencies(requireKetcherId(getState().editor));
  const dependencies: ClipboardDependencies = {
    runAsyncAction(action) {
      return resolveDependencies().runAsyncAction(action);
    },
    serializeStructure(struct) {
      return resolveDependencies().serializeStructure(struct);
    },
  };

  return createClipboardController(dispatch, getState, dependencies);
}
