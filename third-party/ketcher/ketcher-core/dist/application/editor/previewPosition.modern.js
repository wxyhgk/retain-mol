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
import { ZoomTool } from './tools/Zoom.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from './shared/constants.modern.js';

var preview = {
  width: 345,
  height: 345,
  gap: 5,
  topPadding: 16,
  heightForNucleotide: 105,
  widthForBond: 358,
  heightForBond: 268
};
var PresetPosition;
(function (PresetPosition) {
  PresetPosition["Library"] = "library";
  PresetPosition["ChainStart"] = "chainStart";
  PresetPosition["ChainMiddle"] = "chainMiddle";
  PresetPosition["ChainEnd"] = "chainEnd";
})(PresetPosition || (PresetPosition = {}));
function calculateTop(target, height) {
  var _ketcherEditorRootBou, _ketcherEditorRootBou2, _ketcherEditorRootBou3;
  var ketcherEditorRoot = document.querySelector(KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR);
  var ketcherEditorRootBoundingClientRect = ketcherEditorRoot === null || ketcherEditorRoot === void 0 ? void 0 : ketcherEditorRoot.getBoundingClientRect();
  var relativeTargetTop = target.top - ((_ketcherEditorRootBou = ketcherEditorRootBoundingClientRect === null || ketcherEditorRootBoundingClientRect === void 0 ? void 0 : ketcherEditorRootBoundingClientRect.top) !== null && _ketcherEditorRootBou !== void 0 ? _ketcherEditorRootBou : 0);
  var relativeTargetBottom = target.bottom - ((_ketcherEditorRootBou2 = ketcherEditorRootBoundingClientRect === null || ketcherEditorRootBoundingClientRect === void 0 ? void 0 : ketcherEditorRootBoundingClientRect.top) !== null && _ketcherEditorRootBou2 !== void 0 ? _ketcherEditorRootBou2 : 0);
  var topPreviewPosition = relativeTargetTop - preview.gap - height - preview.topPadding;
  var bottomPreviewPosition = relativeTargetBottom + preview.gap;
  if (relativeTargetTop > height + preview.gap + preview.topPadding) {
    return topPreviewPosition;
  }
  var editorRootHeight = (_ketcherEditorRootBou3 = ketcherEditorRootBoundingClientRect === null || ketcherEditorRootBoundingClientRect === void 0 ? void 0 : ketcherEditorRootBoundingClientRect.height) !== null && _ketcherEditorRootBou3 !== void 0 ? _ketcherEditorRootBou3 : 0;
  var exceedsBottomBoundary = target.top + height > editorRootHeight;
  var isLowerHalf = target.top > editorRootHeight / 2;
  if (exceedsBottomBoundary && isLowerHalf) {
    return topPreviewPosition;
  }
  return bottomPreviewPosition;
}
function createCalculatePreviewTopFunction(height) {
  return function calculatePreviewTop(target) {
    if (!target) {
      return '';
    }
    var top = calculateTop(target, height);
    return "".concat(top, "px");
  };
}
var calculateMonomerPreviewTop = createCalculatePreviewTopFunction(preview.height);
var calculateNucleoElementPreviewTop = createCalculatePreviewTopFunction(preview.heightForNucleotide);
var calculateAmbiguousPreviewHeight = function calculateAmbiguousPreviewHeight(monomersCount) {
  var headingHeight = 16;
  var monomersHeight = 35 * monomersCount;
  return headingHeight + monomersHeight;
};
var calculateAmbiguousMonomerPreviewTop = function calculateAmbiguousMonomerPreviewTop(monomer) {
  var shouldHaveOneLine = monomer.label === 'X' || monomer.label === 'N';
  var monomersCount = shouldHaveOneLine ? 1 : monomer.monomers.length;
  var monomersCountToUse = Math.min(5, monomersCount);
  var height = calculateAmbiguousPreviewHeight(monomersCountToUse);
  return createCalculatePreviewTopFunction(height);
};
function calculateAmbiguousMonomerPreviewLeft(initialLeft) {
  var _ZoomTool$instance$ca, _canvasWrapperBoundin, _canvasWrapperBoundin2;
  var canvasWrapperBoundingClientRect = (_ZoomTool$instance$ca = ZoomTool.instance.canvasWrapper.node()) === null || _ZoomTool$instance$ca === void 0 ? void 0 : _ZoomTool$instance$ca.getBoundingClientRect();
  var PREVIEW_WIDTH = 70;
  var canvasWrapperRight = (_canvasWrapperBoundin = canvasWrapperBoundingClientRect === null || canvasWrapperBoundingClientRect === void 0 ? void 0 : canvasWrapperBoundingClientRect.right) !== null && _canvasWrapperBoundin !== void 0 ? _canvasWrapperBoundin : 0;
  var canvasWrapperLeft = (_canvasWrapperBoundin2 = canvasWrapperBoundingClientRect === null || canvasWrapperBoundingClientRect === void 0 ? void 0 : canvasWrapperBoundingClientRect.left) !== null && _canvasWrapperBoundin2 !== void 0 ? _canvasWrapperBoundin2 : 0;
  if (initialLeft + PREVIEW_WIDTH / 2 > canvasWrapperRight) {
    return canvasWrapperRight - PREVIEW_WIDTH;
  }
  if (initialLeft - PREVIEW_WIDTH / 2 < canvasWrapperLeft) {
    return canvasWrapperLeft;
  }
  return initialLeft - PREVIEW_WIDTH / 2;
}
var calculateBondPreviewPosition = function calculateBondPreviewPosition(bond, bondCoordinates) {
  var _firstMonomer$rendere, _secondMonomer$render, _ZoomTool$instance, _canvasWrapperBoundin3, _canvasWrapperBoundin4, _canvasWrapperBoundin5;
  var firstMonomer = bond.firstMonomer,
    secondMonomer = bond.secondMonomer;
  assert(secondMonomer);
  var firstMonomerCoordinates = (_firstMonomer$rendere = firstMonomer.renderer) === null || _firstMonomer$rendere === void 0 ? void 0 : _firstMonomer$rendere.rootBoundingClientRect;
  var secondMonomerCoordinates = (_secondMonomer$render = secondMonomer.renderer) === null || _secondMonomer$render === void 0 ? void 0 : _secondMonomer$render.rootBoundingClientRect;
  var canvasWrapperBoundingClientRect = (_ZoomTool$instance = ZoomTool.instance) === null || _ZoomTool$instance === void 0 || (_ZoomTool$instance = _ZoomTool$instance.canvasWrapper.node()) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.getBoundingClientRect();
  var canvasWrapperBottom = (_canvasWrapperBoundin3 = canvasWrapperBoundingClientRect === null || canvasWrapperBoundingClientRect === void 0 ? void 0 : canvasWrapperBoundingClientRect.bottom) !== null && _canvasWrapperBoundin3 !== void 0 ? _canvasWrapperBoundin3 : 0;
  var canvasWrapperTop = (_canvasWrapperBoundin4 = canvasWrapperBoundingClientRect === null || canvasWrapperBoundingClientRect === void 0 ? void 0 : canvasWrapperBoundingClientRect.top) !== null && _canvasWrapperBoundin4 !== void 0 ? _canvasWrapperBoundin4 : 0;
  var canvasWrapperRight = (_canvasWrapperBoundin5 = canvasWrapperBoundingClientRect === null || canvasWrapperBoundingClientRect === void 0 ? void 0 : canvasWrapperBoundingClientRect.right) !== null && _canvasWrapperBoundin5 !== void 0 ? _canvasWrapperBoundin5 : 0;
  assert(firstMonomerCoordinates);
  assert(secondMonomerCoordinates);
  var left = Math.min(bondCoordinates.left, firstMonomerCoordinates.left, secondMonomerCoordinates.left);
  var top = Math.min(bondCoordinates.top, firstMonomerCoordinates.top, secondMonomerCoordinates.top);
  var right = Math.max(bondCoordinates.right, firstMonomerCoordinates.right, secondMonomerCoordinates.right);
  var bottom = Math.max(bondCoordinates.bottom, firstMonomerCoordinates.bottom, secondMonomerCoordinates.bottom);
  var width = right - left;
  var height = bottom - top;
  var style = {};
  if (width > height) {
    var leftValue = left + width / 2;
    var topValue;
    if (top + canvasWrapperTop > preview.height) {
      topValue = top - preview.heightForBond - preview.gap;
    } else {
      topValue = bottom + preview.gap;
    }
    var horizontalTranslate = '0';
    if (leftValue + preview.width > canvasWrapperRight) {
      horizontalTranslate = '-100%';
    } else if (leftValue > preview.width / 2) {
      horizontalTranslate = '-50%';
    }
    style = {
      top: "".concat(topValue, "px"),
      left: "".concat(leftValue, "px"),
      transform: "translate(".concat(horizontalTranslate, ", 0)")
    };
  } else {
    var _topValue = top + height / 2;
    var _leftValue;
    if (left > preview.widthForBond + preview.gap) {
      _leftValue = left - preview.widthForBond / 2 - preview.gap;
    } else {
      _leftValue = right + preview.widthForBond / 2 + preview.gap;
    }
    var _horizontalTranslate = _leftValue > preview.width / 2 ? '-50%' : '0';
    var verticalTranslate = '0';
    if (_topValue + preview.height / 2 > canvasWrapperBottom) {
      verticalTranslate = '-100%';
    } else if (_topValue > preview.height / 2) {
      verticalTranslate = '-50%';
    }
    style = {
      top: "".concat(_topValue, "px"),
      left: "".concat(_leftValue, "px"),
      transform: "translate(".concat(_horizontalTranslate, ", ").concat(verticalTranslate, ")")
    };
  }
  return style;
};

export { PresetPosition, calculateAmbiguousMonomerPreviewLeft, calculateAmbiguousMonomerPreviewTop, calculateBondPreviewPosition, calculateMonomerPreviewTop, calculateNucleoElementPreviewTop, preview };
//# sourceMappingURL=previewPosition.modern.js.map
