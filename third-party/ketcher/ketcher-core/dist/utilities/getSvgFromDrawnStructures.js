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

var KetcherLogger = require('./KetcherLogger.js');

var SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
var DEFAULT_MARGIN = 10;
var getSvgFromDrawnStructures = function getSvgFromDrawnStructures(canvas, type) {
  var _wrapper$querySelecto, _wrapper$querySelecto2, _wrapper$querySelecto3, _wrapper$querySelecto4, _wrapper$querySelecto5, _svgInnerHTML, _canvas$getElementsBy;
  var margin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_MARGIN;
  var svgInnerHTML = (canvas === null || canvas === void 0 ? void 0 : canvas.innerHTML) || '';
  var wrapper = document.createElementNS(SVG_NAMESPACE_URI, 'svg');
  wrapper.innerHTML = svgInnerHTML;
  (_wrapper$querySelecto = wrapper.querySelector('#rectangle-selection-area')) === null || _wrapper$querySelecto === void 0 || _wrapper$querySelecto.remove();
  (_wrapper$querySelecto2 = wrapper.querySelectorAll('.dynamic-element')) === null || _wrapper$querySelecto2 === void 0 || _wrapper$querySelecto2.forEach(function (el) {
    return el.remove();
  });
  (_wrapper$querySelecto3 = wrapper.querySelectorAll('text')) === null || _wrapper$querySelecto3 === void 0 || _wrapper$querySelecto3.forEach(function (el) {
    return el.setAttribute('cursor', 'default');
  });
  (_wrapper$querySelecto4 = wrapper.querySelectorAll('rect')) === null || _wrapper$querySelecto4 === void 0 || _wrapper$querySelecto4.forEach(function (el) {
    if (el.getAttribute('cursor') === 'text') el.removeAttribute('cursor');
  });
  (_wrapper$querySelecto5 = wrapper.querySelectorAll('g')) === null || _wrapper$querySelecto5 === void 0 || _wrapper$querySelecto5.forEach(function (el) {
    if (el.hasAttribute('opacity')) el.removeAttribute('opacity');
  });
  svgInnerHTML = wrapper.innerHTML;
  svgInnerHTML = (_svgInnerHTML = svgInnerHTML) === null || _svgInnerHTML === void 0 ? void 0 : _svgInnerHTML.replace(/\bcursor:\s*pointer;\s*/g, '');
  var drawStructureClientRect = canvas === null || canvas === void 0 || (_canvas$getElementsBy = canvas.getElementsByClassName('drawn-structures')[0]) === null || _canvas$getElementsBy === void 0 ? void 0 : _canvas$getElementsBy.getBoundingClientRect();
  if (!drawStructureClientRect || !svgInnerHTML) {
    var errorMessage = 'Cannot get drawn structures!';
    KetcherLogger.KetcherLogger.error(errorMessage);
    return;
  }
  var canvasClientRect = canvas.getBoundingClientRect();
  var viewBoxX = drawStructureClientRect.x - canvasClientRect.x - margin;
  var viewBoxY = drawStructureClientRect.y - canvasClientRect.y - margin;
  var viewBoxWidth = drawStructureClientRect.width + margin * 2;
  var viewBoxHeight = drawStructureClientRect.height + margin * 2;
  var viewBox = "".concat(viewBoxX, " ").concat(viewBoxY, " ").concat(viewBoxWidth, " ").concat(viewBoxHeight);
  if (type === 'preview') return "<svg width='100%' height='100%' style='position: absolute' viewBox='".concat(viewBox, "'>").concat(svgInnerHTML, "</svg>");else if (type === 'file') return "<svg width='".concat(viewBoxWidth, "' height='").concat(viewBoxHeight, "' viewBox='").concat(viewBox, "' xmlns='").concat(SVG_NAMESPACE_URI, "'>").concat(svgInnerHTML, "</svg>");else return "<svg xmlns='".concat(SVG_NAMESPACE_URI, "' />");
};

exports.getSvgFromDrawnStructures = getSvgFromDrawnStructures;
//# sourceMappingURL=getSvgFromDrawnStructures.js.map
