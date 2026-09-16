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
import { Vec2 } from '../../domain/entities/vec2.modern.js';
import { Scale } from '../../domain/helpers/scale.modern.js';
import '../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../domain/constants/generics.modern.js';
import '../../domain/helpers/attachmentPointCalculations.modern.js';

var canvasToView = function canvasToView(point, render) {
  var offset = new Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.sub(offset).scaled(render.options.zoom);
};
var modelToView = function modelToView(vector, render) {
  var pointInCanvas = Scale.modelToCanvas(vector, render.options);
  return canvasToView(pointInCanvas, render);
};
var viewToCanvas = function viewToCanvas(point, render) {
  var offset = new Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.scaled(1 / render.options.zoom).add(offset);
};
var pageToView = function pageToView(event, renderClientArea) {
  var _renderClientArea$get = renderClientArea.getBoundingClientRect(),
    offsetTop = _renderClientArea$get.top,
    offsetLeft = _renderClientArea$get.left;
  return new Vec2(event.clientX - offsetLeft, event.clientY - offsetTop);
};
var pageToCanvas = function pageToCanvas(event, render) {
  var pointInViewBox = pageToView(event, render.clientArea);
  return viewToCanvas(pointInViewBox, render);
};
var pageToModel = function pageToModel(event, render) {
  var pointInCanvas = pageToCanvas(event, render);
  return Scale.canvasToModel(pointInCanvas, render.options);
};
var CoordinateTransformation = {
  modelToView: modelToView,
  canvasToView: canvasToView,
  viewToCanvas: viewToCanvas,
  pageToCanvas: pageToCanvas,
  pageToModel: pageToModel
};

export { CoordinateTransformation };
//# sourceMappingURL=coordinateTransformation.modern.js.map
