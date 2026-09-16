import {
  ChemicalMimeType,
  type ClipboardData,
  formatProperties,
  getStructStringFromClipboardData,
  KetSerializer,
  KetcherLogger,
  type LegacyClipboardData,
  MolSerializer,
  type Struct,
} from 'ketcher-core';
import { debounce } from 'lodash/fp';
import { isIE } from 'react-device-detect';
import type { IToolContext } from '../../editor/tool/IToolContext';
import { load, onAction } from './shared';

const rxnTextPlain = /\$RXN\n+\s+0\s+0\s+0\n*/;

export interface ClipboardResult {
  'text/plain': string;
  [mimeType: string]: string;
}

export interface ClipboardDependencies {
  runAsyncAction<T>(action: () => Promise<T>): Promise<T | undefined>;
  serializeStructure(struct: Struct): Promise<string>;
}

export type ClipboardDispatch = (action: unknown) => unknown;

export interface ClipboardState {
  editor: IToolContext;
  modal: unknown;
}

export type ClipboardGetState = () => ClipboardState;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isAbleToCopy(ctx: IToolContext): boolean {
  const struct = ctx.structSelected?.() ?? ctx.struct();
  const errorHandler = ctx.errorHandler;

  if (struct.isBlank()) {
    return false;
  }
  const simpleObjectOrText = Boolean(
    struct.simpleObjects.size || struct.texts.size,
  );
  if (simpleObjectOrText && isIE && errorHandler) {
    errorHandler(
      'The structure you are trying to copy contains Simple object or/and Text object.' +
        'To copy Simple object or Text object in Internet Explorer try "Copy as KET" button',
    );
    return false;
  }

  return true;
}

async function clipData(
  ctx: IToolContext,
  dependencies: ClipboardDependencies,
): Promise<ClipboardResult | null> {
  if (!isAbleToCopy(ctx)) {
    return null;
  }

  const struct = ctx.structSelected?.() ?? ctx.struct();
  const errorHandler = ctx.errorHandler;

  try {
    const ket = new KetSerializer().serialize(struct);
    const data = await dependencies.serializeStructure(struct);
    const type = struct.isReaction
      ? ChemicalMimeType.Mol
      : ChemicalMimeType.Rxn;

    return {
      [ChemicalMimeType.KET]: ket,
      'text/plain': data,
      [type]: data,
    };
  } catch (error: unknown) {
    KetcherLogger.error('clipboard.ts::clipData', error);
    errorHandler?.(getErrorMessage(error));
  }

  return null;
}

function legacyClipData(ctx: IToolContext): ClipboardResult | null {
  if (!isAbleToCopy(ctx)) {
    return null;
  }

  const struct = ctx.structSelected?.() ?? ctx.struct();
  const errorHandler = ctx.errorHandler;
  try {
    const ket = new KetSerializer().serialize(struct);
    const data = new MolSerializer().serialize(struct);
    const type = struct.isReaction
      ? ChemicalMimeType.Mol
      : ChemicalMimeType.Rxn;

    return {
      [ChemicalMimeType.KET]: ket,
      'text/plain': data,
      [type]: data,
    };
  } catch (error: unknown) {
    KetcherLogger.error('clipboard.ts::legacyClipData', error);
    errorHandler?.(getErrorMessage(error));
  }

  return null;
}

export function createClipboardController(
  dispatch: ClipboardDispatch,
  getState: ClipboardGetState,
  dependencies: ClipboardDependencies,
) {
  const formats = Object.values(formatProperties).map(({ mime }) => mime);
  const debAction = debounce(0, (action) => dispatch(onAction(action)));
  const loadStruct = debounce(0, (structStr, opts) =>
    dispatch(load(structStr, opts)),
  );

  return {
    formats,
    focused() {
      const state = getState();
      return !state.modal && !window.isPolymerEditorTurnedOn;
    },
    onLegacyCopy() {
      const ctx = getState().editor;
      const data = legacyClipData(ctx);
      ctx.selection(null);
      return data;
    },
    onLegacyCut() {
      const ctx = getState().editor;
      const data = legacyClipData(ctx);
      if (data) debAction({ tool: 'eraser', opts: 1 });
      else ctx.selection(null);
      return data;
    },
    async onCut() {
      return dependencies.runAsyncAction(async () => {
        const ctx = getState().editor;
        const data = await clipData(ctx, dependencies);
        if (data) debAction({ tool: 'eraser', opts: 1 });
        else ctx.selection(null);
        return data;
      });
    },
    async onCopy() {
      return dependencies.runAsyncAction(async () => {
        const ctx = getState().editor;
        const data = await clipData(ctx, dependencies);
        ctx.selection(null);
        return data;
      });
    },
    async onPaste(data: ClipboardData, isSmarts = false) {
      return dependencies.runAsyncAction(async () => {
        const structStr = await getStructStringFromClipboardData(data);
        const plainText = Array.isArray(data) ? undefined : data['text/plain'];
        if (structStr || !rxnTextPlain.test(plainText ?? '')) {
          const opts = isSmarts
            ? {
                fragment: true,
                isPaste: true,
                'input-format': ChemicalMimeType.DaylightSmarts,
              }
            : { fragment: true, isPaste: true };
          await dispatch(load(structStr, opts));
        }
      });
    },
    onLegacyPaste(data: LegacyClipboardData, isSmarts = false) {
      const structStr =
        data[ChemicalMimeType.KET] ||
        data[ChemicalMimeType.Mol] ||
        data[ChemicalMimeType.Rxn] ||
        data['text/plain'];

      if (structStr || !rxnTextPlain.test(data['text/plain'] ?? '')) {
        const opts = isSmarts
          ? {
              fragment: true,
              isPaste: true,
              'input-format': ChemicalMimeType.DaylightSmarts,
            }
          : { fragment: true, isPaste: true };
        loadStruct(structStr, opts);
      }
    },
  };
}
