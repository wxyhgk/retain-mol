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

var image = require('../../../domain/entities/image.js');
var imageMove = require('../operations/image/imageMove.js');
var imageResize = require('../operations/image/imageResize.js');
var imageUpsertDelete = require('../operations/image/imageUpsertDelete.js');
var action = require('./action.js');

function fromImageCreation(reStruct, bitmap, center, halfSize) {
  var action$1 = new action.Action();
  var image$1 = new image.Image(bitmap, center, halfSize);
  action$1.addOp(new imageUpsertDelete.ImageUpsert(image$1));
  return action$1.perform(reStruct);
}
function fromImageDeletion(reStruct, id) {
  var action$1 = new action.Action();
  action$1.addOp(new imageUpsertDelete.ImageDelete(id));
  return action$1.perform(reStruct);
}
function fromImageMove(reStruct, id, offset) {
  var action$1 = new action.Action();
  action$1.addOp(new imageMove.ImageMove(id, offset));
  return action$1.perform(reStruct);
}
function fromImageResize(reStruct, id, position, referencePositionInfo) {
  var action$1 = new action.Action();
  var positionWithOffset = position.add(referencePositionInfo.offset);
  action$1.addOp(new imageResize.ImageResize(id, positionWithOffset, referencePositionInfo.name));
  return action$1.perform(reStruct);
}

exports.fromImageCreation = fromImageCreation;
exports.fromImageDeletion = fromImageDeletion;
exports.fromImageMove = fromImageMove;
exports.fromImageResize = fromImageResize;
//# sourceMappingURL=image.js.map
