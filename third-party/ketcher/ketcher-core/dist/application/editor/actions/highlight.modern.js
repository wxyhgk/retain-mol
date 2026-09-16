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
import { HighlightAdd, HighlightDelete } from '../operations/highlight.modern.js';
import { Action } from './action.modern.js';

function fromHighlightCreate(restruct, highlights) {
  var action = new Action();
  highlights.forEach(function (highlight) {
    var atoms = highlight.atoms,
      bonds = highlight.bonds,
      rgroupAttachmentPoints = highlight.rgroupAttachmentPoints,
      color = highlight.color,
      outline = highlight.outline;
    action.addOp(new HighlightAdd(atoms, bonds, rgroupAttachmentPoints, color, undefined, outline));
  });
  return action.perform(restruct);
}
function fromHighlightClear(restruct) {
  var action = new Action();
  var highlights = restruct.molecule.highlights;
  highlights.forEach(function (_, key) {
    action.addOp(new HighlightDelete(key));
  });
  return action.perform(restruct);
}

export { fromHighlightClear, fromHighlightCreate };
//# sourceMappingURL=highlight.modern.js.map
