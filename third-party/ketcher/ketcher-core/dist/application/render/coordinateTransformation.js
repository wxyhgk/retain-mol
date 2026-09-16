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

var vec2 = require('../../domain/entities/vec2.js');
var scale = require('../../domain/helpers/scale.js');
require('../../domain/helpers/functionalGroupsProvider.js');
require('../../domain/helpers/saltsAndSolventsProvider.js');
require('../../domain/constants/generics.js');
require('../../domain/helpers/attachmentPointCalculations.js');

var canvasToView = function canvasToView(point, render) {
  var offset = new vec2.Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.sub(offset).scaled(render.options.zoom);
};
var modelToView = function modelToView(vector, render) {
  var pointInCanvas = scale.Scale.modelToCanvas(vector, render.options);
  return canvasToView(pointInCanvas, render);
};
var viewToCanvas = function viewToCanvas(point, render) {
  var offset = new vec2.Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.scaled(1 / render.options.zoom).add(offset);
};
var pageToView = function pageToView(event, renderClientArea) {
  var _renderClientArea$get = renderClientArea.getBoundingClientRect(),
    offsetTop = _renderClientArea$get.top,
    offsetLeft = _renderClientArea$get.left;
  return new vec2.Vec2(event.clientX - offsetLeft, event.clientY - offsetTop);
};
var pageToCanvas = function pageToCanvas(event, render) {
  var pointInViewBox = pageToView(event, render.clientArea);
  return viewToCanvas(pointInViewBox, render);
};
var pageToModel = function pageToModel(event, render) {
  var pointInCanvas = pageToCanvas(event, render);
  return scale.Scale.canvasToModel(pointInCanvas, render.options);
};
var CoordinateTransformation = {
  modelToView: modelToView,
  canvasToView: canvasToView,
  viewToCanvas: viewToCanvas,
  pageToCanvas: pageToCanvas,
  pageToModel: pageToModel
};

exports.CoordinateTransformation = CoordinateTransformation;
//# sourceMappingURL=coordinateTransformation.js.map
