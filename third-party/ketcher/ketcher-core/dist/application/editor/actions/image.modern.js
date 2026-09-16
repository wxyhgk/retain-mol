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
import { Image } from '../../../domain/entities/image.modern.js';
import { ImageMove } from '../operations/image/imageMove.modern.js';
import { ImageResize } from '../operations/image/imageResize.modern.js';
import { ImageUpsert, ImageDelete } from '../operations/image/imageUpsertDelete.modern.js';
import { Action } from './action.modern.js';

function fromImageCreation(reStruct, bitmap, center, halfSize) {
  var action = new Action();
  var image = new Image(bitmap, center, halfSize);
  action.addOp(new ImageUpsert(image));
  return action.perform(reStruct);
}
function fromImageDeletion(reStruct, id) {
  var action = new Action();
  action.addOp(new ImageDelete(id));
  return action.perform(reStruct);
}
function fromImageMove(reStruct, id, offset) {
  var action = new Action();
  action.addOp(new ImageMove(id, offset));
  return action.perform(reStruct);
}
function fromImageResize(reStruct, id, position, referencePositionInfo) {
  var action = new Action();
  var positionWithOffset = position.add(referencePositionInfo.offset);
  action.addOp(new ImageResize(id, positionWithOffset, referencePositionInfo.name));
  return action.perform(reStruct);
}

export { fromImageCreation, fromImageDeletion, fromImageMove, fromImageResize };
//# sourceMappingURL=image.modern.js.map
