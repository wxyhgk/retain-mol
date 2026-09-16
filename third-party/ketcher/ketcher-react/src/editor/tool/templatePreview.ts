/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  Vec2,
  fromItemsFuse,
  fromTemplateOnAtom,
  fromTemplateOnBondAction,
  getItemsToFuse,
  Action,
  fromTemplateOnCanvas,
  fromMultipleMove,
  CoordinateTransformation,
  ActionTransaction,
  KetcherLogger,
} from 'ketcher-core';
import { MODES } from 'src/constants';
import { getAngleFromEvent, getBondFlipSign } from './template.helpers';
import type {
  InternalTemplate,
  TemplatePreviewContext,
} from './template.types';

const PREVIEW_DELAY = 300;
type ClosestItemType = { map: string; id: number; dist: number };

function getUniqueCiId(ci: ClosestItemType) {
  return `${ci.id}-${ci.map}`;
}

class TemplatePreview {
  private readonly editor: TemplatePreviewContext;
  private readonly template: InternalTemplate;
  private readonly mode: string | null;
  private floatingPreviewAction: Action | null;
  private connectedPreviewAction: Action | null;
  private connectedPreviewTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectedPreviewGeneration = 0;
  private lastPreviewId: string | null;

  private floatingPreview: {
    atoms: number[];
    bonds: number[];
    rxnArrows: number[];
    rxnPluses: number[];
    texts: number[];
    images: number[];
    simpleObjects: number[];
    multitailArrows: number[];
  } | null;

  private position: Vec2;
  private previousPosition: Vec2;

  constructor(
    editor: TemplatePreviewContext,
    template: InternalTemplate,
    mode: string | null,
  ) {
    this.editor = editor;
    this.template = template;
    this.floatingPreviewAction = new Action();
    this.connectedPreviewAction = null;
    this.connectedPreviewTimeout = null;
    this.lastPreviewId = null;
    this.mode = mode;
    this.floatingPreview = null;
    this.position = new Vec2();
    this.previousPosition = new Vec2();
  }

  private get struct() {
    return this.restruct.molecule;
  }

  private get restruct() {
    return this.editor.render.ctab;
  }

  private get isModeFunctionalGroup(): boolean {
    return this.mode === MODES.FG;
  }

  hidePreview() {
    this.hideConnectedPreview();
    this.hideFloatingPreview();
  }

  private getPreviewTarget(event: PointerEvent) {
    const ci: ClosestItemType | null = this.editor.findItem(event, [
      'atoms',
      'bonds',
    ]);

    if (ci && this.restruct.molecule[ci.map].get(ci.id)?.isPreview === false) {
      return ci;
    } else {
      return null;
    }
  }

  movePreview(event: PointerEvent) {
    this.position = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );

    const struct = this.editor.struct();
    const previewTarget = this.getPreviewTarget(event);
    const isMouseAwayFromAtomsAndBonds = !previewTarget;
    const isPreviewTargetChanged =
      previewTarget && this.lastPreviewId !== getUniqueCiId(previewTarget);

    const shouldHidePreview =
      isMouseAwayFromAtomsAndBonds || isPreviewTargetChanged;

    const shouldShowPreview =
      previewTarget &&
      !struct.isTargetFromMacromolecule(previewTarget) &&
      !this.connectedPreviewAction &&
      !this.connectedPreviewTimeout;

    if (shouldHidePreview) {
      this.hideConnectedPreview();
    }
    if (shouldShowPreview) {
      this.lastPreviewId = getUniqueCiId(previewTarget);
      this.connectedPreviewTimeout = setTimeout(() => {
        this.previousPosition = this.position;
        this.hideFloatingPreview();
        this.showConnectedPreview(event, previewTarget);
      }, PREVIEW_DELAY);
    } else if (shouldHidePreview) {
      if (!this.floatingPreview) {
        this.showFloatingPreview(this.position);
        this.previousPosition = this.position;
        this.editor.render.update(false, null);
      } else {
        this.moveFloatingPreview();
      }
    }
  }

  private moveFloatingPreview() {
    const dist = this.position.sub(this.previousPosition);
    this.previousPosition = this.position;
    fromMultipleMove(
      this.restruct,
      {
        ...this.floatingPreview,
        enhancedFlags: this.getFloatingPreviewFragmentIds(),
      },
      dist,
    );
    this.editor.render.update(false, null);
  }

  private getFloatingPreviewFragmentIds(): number[] {
    const fragmentIds = new Set<number>();
    this.floatingPreview?.atoms.forEach((atomId) => {
      const atom = this.struct.atoms.get(atomId);
      if (atom) {
        fragmentIds.add(atom.fragment);
      }
    });
    return Array.from(fragmentIds);
  }

  private showFloatingPreview(position: Vec2) {
    [this.floatingPreviewAction, , this.floatingPreview] = fromTemplateOnCanvas(
      this.restruct,
      this.template,
      position,
    );

    this.editor.render.update(true, null);
  }

  private hideFloatingPreview() {
    if (this.floatingPreviewAction) {
      const action = this.floatingPreviewAction.perform(this.restruct);
      this.editor.update(action, true);
      this.floatingPreviewAction = null;
      this.floatingPreview = null;
    }
  }

  public hideConnectedPreview() {
    this.connectedPreviewGeneration++;
    if (this.connectedPreviewAction) {
      this.connectedPreviewAction.perform(this.restruct);
      this.connectedPreviewAction = null;
      this.editor.render.update();
    }
    if (this.connectedPreviewTimeout) {
      clearTimeout(this.connectedPreviewTimeout);
      this.connectedPreviewTimeout = null;
    }
  }

  private showConnectedPreview(event: MouseEvent, ci: ClosestItemType) {
    const previewGeneration = ++this.connectedPreviewGeneration;
    if (ci.map === 'bonds' && !this.isModeFunctionalGroup) {
      const bond = this.struct.bonds.get(ci.id);

      if (!bond) {
        return;
      }

      const sign1 = getBondFlipSign(this.struct, bond);
      const sign2 = this.template.sign;
      const shouldFlip = sign1 * sign2 > 0;

      const promise = fromTemplateOnBondAction(
        this.restruct,
        this.template,
        ci.id,
        this.editor.event,
        shouldFlip,
        true,
        true,
      );

      promise
        .then(([templateAction, pasteItems]) => {
          const transaction = new ActionTransaction(this.restruct);
          try {
            transaction.capture(templateAction);
            if (previewGeneration !== this.connectedPreviewGeneration) {
              transaction.rollback();
              return;
            }

            const mergeItems = getItemsToFuse(
              this.editor.render.ctab.molecule,
              this.editor.findMerge(pasteItems, ['atoms', 'bonds']),
            );
            const fuseAction = fromItemsFuse(this.restruct, mergeItems);
            transaction.capture(fuseAction);
            const action = new Action([
              ...fuseAction.operations,
              ...templateAction.operations,
            ]);

            if (previewGeneration !== this.connectedPreviewGeneration) {
              transaction.rollback();
              return;
            }

            this.editor.update(action, true);
            transaction.commit();
            this.connectedPreviewAction = action;
          } catch (cause) {
            try {
              transaction.rollback();
            } catch (rollbackCause) {
              KetcherLogger.error(
                'templatePreview.ts::showConnectedPreview rollback',
                rollbackCause,
              );
            }
            KetcherLogger.error(
              'templatePreview.ts::showConnectedPreview',
              cause,
            );
          }
        })
        .catch((cause) => {
          KetcherLogger.error(
            'templatePreview.ts::showConnectedPreview',
            cause,
          );
        });
    } else if (ci.map === 'atoms') {
      const angle = getAngleFromEvent(event, ci, this.restruct);

      let [action, pasteItems] = fromTemplateOnAtom(
        this.restruct,
        this.template,
        ci.id,
        angle,
        false,
        true,
      );

      if (pasteItems && !this.isModeFunctionalGroup) {
        const mergeItems = getItemsToFuse(
          this.editor.render.ctab.molecule,
          this.editor.findMerge(pasteItems, ['atoms', 'bonds']),
        );
        action = fromItemsFuse(this.restruct, mergeItems).mergeWith(action);
      }

      this.editor.update(action, true);
      this.connectedPreviewAction = action;
    }
  }
}

export default TemplatePreview;
