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
import { MultitailArrowAddTail, MultitailArrowRemoveTail } from '../operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import { MultitailArrowMove } from '../operations/multitailArrow/multitailArrowMove.modern.js';
import { MultitailArrowMoveHeadTail } from '../operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import { MultitailArrowResizeTailHead } from '../operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import { MultitailArrowUpsert, MultitailArrowDelete } from '../operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import { MultitailArrow } from '../../../domain/entities/multitailArrow.modern.js';
import { Action } from './action.modern.js';

function fromMultitailArrowCreation(reStruct, topLeft, bottomRight) {
  var action = new Action();
  var multitailArrow = MultitailArrow.fromTwoPoints(topLeft, bottomRight);
  action.addOp(new MultitailArrowUpsert(multitailArrow));
  return action.perform(reStruct);
}
function fromMultitailArrowDeletion(reStruct, id) {
  var action = new Action();
  action.addOp(new MultitailArrowDelete(id));
  return action.perform(reStruct);
}
function fromMultitailArrowMove(reStruct, id, offset) {
  var action = new Action();
  action.addOp(new MultitailArrowMove(id, offset));
  return action.perform(reStruct);
}
function fromMultitailArrowTailAdd(reStruct, id) {
  var action = new Action();
  action.addOp(new MultitailArrowAddTail(id));
  return action.perform(reStruct);
}
function fromMultitailArrowTailRemove(reStruct, id, tailId) {
  var action = new Action();
  action.addOp(new MultitailArrowRemoveTail(id, tailId));
  return action.perform(reStruct);
}
function fromMultitailArrowHeadTailsResize(reStruct, id, ref, offset) {
  var action = new Action();
  action.addOp(new MultitailArrowResizeTailHead(id, offset, ref.name === 'head'));
  return action.perform(reStruct);
}
function fromMultitailArrowHeadTailMove(reStruct, id, ref, offset, normalize) {
  var action = new Action();
  action.addOp(new MultitailArrowMoveHeadTail(id, offset, ref.name, ref.tailId, normalize));
  return action.perform(reStruct);
}

export { fromMultitailArrowCreation, fromMultitailArrowDeletion, fromMultitailArrowHeadTailMove, fromMultitailArrowHeadTailsResize, fromMultitailArrowMove, fromMultitailArrowTailAdd, fromMultitailArrowTailRemove };
//# sourceMappingURL=multitailArrow.modern.js.map
