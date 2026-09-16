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

var multitailArrowAddRemoveTail = require('../operations/multitailArrow/multitailArrowAddRemoveTail.js');
var multitailArrowMove = require('../operations/multitailArrow/multitailArrowMove.js');
var multitailArrowMoveHeadTail = require('../operations/multitailArrow/multitailArrowMoveHeadTail.js');
var multitailArrowResizeTailHead = require('../operations/multitailArrow/multitailArrowResizeTailHead.js');
var multitailArrowUpsertDelete = require('../operations/multitailArrow/multitailArrowUpsertDelete.js');
var multitailArrow = require('../../../domain/entities/multitailArrow.js');
var action = require('./action.js');

function fromMultitailArrowCreation(reStruct, topLeft, bottomRight) {
  var action$1 = new action.Action();
  var multitailArrow$1 = multitailArrow.MultitailArrow.fromTwoPoints(topLeft, bottomRight);
  action$1.addOp(new multitailArrowUpsertDelete.MultitailArrowUpsert(multitailArrow$1));
  return action$1.perform(reStruct);
}
function fromMultitailArrowDeletion(reStruct, id) {
  var action$1 = new action.Action();
  action$1.addOp(new multitailArrowUpsertDelete.MultitailArrowDelete(id));
  return action$1.perform(reStruct);
}
function fromMultitailArrowMove(reStruct, id, offset) {
  var action$1 = new action.Action();
  action$1.addOp(new multitailArrowMove.MultitailArrowMove(id, offset));
  return action$1.perform(reStruct);
}
function fromMultitailArrowTailAdd(reStruct, id) {
  var action$1 = new action.Action();
  action$1.addOp(new multitailArrowAddRemoveTail.MultitailArrowAddTail(id));
  return action$1.perform(reStruct);
}
function fromMultitailArrowTailRemove(reStruct, id, tailId) {
  var action$1 = new action.Action();
  action$1.addOp(new multitailArrowAddRemoveTail.MultitailArrowRemoveTail(id, tailId));
  return action$1.perform(reStruct);
}
function fromMultitailArrowHeadTailsResize(reStruct, id, ref, offset) {
  var action$1 = new action.Action();
  action$1.addOp(new multitailArrowResizeTailHead.MultitailArrowResizeTailHead(id, offset, ref.name === 'head'));
  return action$1.perform(reStruct);
}
function fromMultitailArrowHeadTailMove(reStruct, id, ref, offset, normalize) {
  var action$1 = new action.Action();
  action$1.addOp(new multitailArrowMoveHeadTail.MultitailArrowMoveHeadTail(id, offset, ref.name, ref.tailId, normalize));
  return action$1.perform(reStruct);
}

exports.fromMultitailArrowCreation = fromMultitailArrowCreation;
exports.fromMultitailArrowDeletion = fromMultitailArrowDeletion;
exports.fromMultitailArrowHeadTailMove = fromMultitailArrowHeadTailMove;
exports.fromMultitailArrowHeadTailsResize = fromMultitailArrowHeadTailsResize;
exports.fromMultitailArrowMove = fromMultitailArrowMove;
exports.fromMultitailArrowTailAdd = fromMultitailArrowTailAdd;
exports.fromMultitailArrowTailRemove = fromMultitailArrowTailRemove;
//# sourceMappingURL=multitailArrow.js.map
