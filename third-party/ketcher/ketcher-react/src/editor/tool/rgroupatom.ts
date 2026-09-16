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
  Atom,
  type AtomAttributes,
  fromAtomAddition,
  fromAtomsAttrs,
  FunctionalGroup,
  KetcherLogger,
  CoordinateTransformation,
  type Vec2,
} from 'ketcher-core';
import type { IToolContext } from './IToolContext';
import type { Tool } from './Tool';

type RGroupAtomDialogInput = {
  fragId: number | null;
  label: string;
  rglabel: number | null;
};

type RGroupAtomToolContext = Omit<
  Pick<
    IToolContext,
    'event' | 'findItem' | 'hover' | 'render' | 'selection' | 'update'
  >,
  'event'
> & {
  event: Pick<IToolContext['event'], 'removeFG'> & {
    elementEdit: {
      dispatch(
        payload: RGroupAtomDialogInput,
      ): Promise<Partial<AtomAttributes>>;
    };
  };
};

class RGroupAtomTool implements Tool {
  private readonly editor: RGroupAtomToolContext;

  constructor(editor: RGroupAtomToolContext) {
    // TODO: map atoms with labels
    editor.selection(null);
    this.editor = editor;
  }

  mousemove(event: PointerEvent) {
    const struct = this.editor.render.ctab.molecule;
    const ci = this.editor.findItem(event, ['atoms']);

    if (ci) {
      const atom = struct.atoms.get(ci.id);
      if (atom?.attachmentPoints === null) {
        this.editor.hover(ci, null, event);
      }
    } else {
      this.editor.hover(null);
    }
  }

  click(event: PointerEvent) {
    const struct = this.editor.render.ctab;
    const molecule = struct.molecule;
    const functionalGroups = molecule.functionalGroups;
    const rnd = this.editor.render;
    const ci = this.editor.findItem(event, ['atoms']);
    const atomResult: Array<number> = [];
    const result: Array<number> = [];

    if (ci && functionalGroups && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id,
      );
      const isAtomSuperatomLeavingGroup = Atom.isSuperatomLeavingGroupAtom(
        molecule,
        ci.id,
      );
      if (isAtomSuperatomLeavingGroup) {
        return;
      }
      if (atomId !== null) {
        atomResult.push(atomId);
      }
    }

    if (atomResult.length > 0) {
      for (const id of atomResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id,
        );

        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId);
        }
      }
      if (result.length > 0) {
        this.editor.event.removeFG.dispatch({ fgIds: result });
        return;
      }
    }

    if (!ci) {
      //  ci.type == 'Canvas'
      this.editor.hover(null);
      propsDialog(
        this.editor,
        null,
        CoordinateTransformation.pageToModel(event, rnd),
      );
      return true;
    } else if (ci.map === 'atoms') {
      const struct = this.editor.render.ctab.molecule;
      const atom = struct.atoms.get(ci.id);
      this.editor.hover(this.editor.findItem(event, ['atoms']), null, event);

      if (atom?.attachmentPoints !== null) {
        return;
      }

      propsDialog(this.editor, ci.id, null);
      return true;
    }
    return true;
  }
}

function propsDialog(
  editor: RGroupAtomToolContext,
  id: number | null,
  pos: Vec2 | null,
) {
  const struct = editor.render.ctab.molecule;
  const atom = id || id === 0 ? struct.atoms.get(id) : null;
  const rglabel = atom ? atom.rglabel : 0;
  const label = atom ? atom.label : 'R#';

  const res = editor.event.elementEdit.dispatch({
    label: 'R#',
    rglabel,
    fragId: atom ? atom.fragment : null,
  });

  Promise.resolve(res)
    .then((dialogResult) => {
      // TODO review: using Atom.attrlist as a source of default property values
      const elem: AtomAttributes = { ...Atom.attrlist, ...dialogResult };

      if (id === null) {
        if (elem.rglabel) {
          editor.update(fromAtomAddition(editor.render.ctab, pos, elem));
        }
        return;
      }

      if (rglabel !== elem.rglabel) {
        if (!atom) return;

        elem.aam = atom.aam;
        elem.attachmentPoints = atom.attachmentPoints;

        if (!elem.rglabel && label !== 'R#') {
          elem.label = label;
        }

        editor.update(fromAtomsAttrs(editor.render.ctab, id, elem, false));
      }
    })
    .catch((e) => {
      KetcherLogger.error('rgroupatom.ts:propsDialog', e);
    }); // w/o changes
}

export default RGroupAtomTool;
