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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var highlight = require('../operations/highlight.js');
var action = require('./action.js');

function fromHighlightCreate(restruct, highlights) {
  var action$1 = new action.Action();
  highlights.forEach(function (highlight$1) {
    var atoms = highlight$1.atoms,
      bonds = highlight$1.bonds,
      rgroupAttachmentPoints = highlight$1.rgroupAttachmentPoints,
      color = highlight$1.color,
      outline = highlight$1.outline;
    action$1.addOp(new highlight.HighlightAdd(atoms, bonds, rgroupAttachmentPoints, color, undefined, outline));
  });
  return action$1.perform(restruct);
}
function fromHighlightClear(restruct) {
  var action$1 = new action.Action();
  var highlights = restruct.molecule.highlights;
  highlights.forEach(function (_, key) {
    action$1.addOp(new highlight.HighlightDelete(key));
  });
  return action$1.perform(restruct);
}

exports.fromHighlightClear = fromHighlightClear;
exports.fromHighlightCreate = fromHighlightCreate;
//# sourceMappingURL=highlight.js.map
