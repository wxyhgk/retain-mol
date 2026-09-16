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
import { Coordinates } from '../../application/editor/shared/coordinates.modern.js';
import { Vec2 } from '../entities/vec2.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function canvasToMonomerCoordinates(coordinatesOnCanvas, centerOFMonomer, monomerWidth, monomerHeight) {
  var zeroPointCoord = {
    x: centerOFMonomer.x - monomerWidth / 2,
    y: centerOFMonomer.y - monomerHeight / 2
  };
  var monomerCoord = {
    x: coordinatesOnCanvas.x - zeroPointCoord.x,
    y: coordinatesOnCanvas.y - zeroPointCoord.y
  };
  return monomerCoord;
}
function findLabelPoint(pointOnBorder, angle, lineLength, lineOffset, labelSize, isUsed) {
  var angleRadians = Vec2.degrees_to_radians(angle);
  var pointOfAttachment = Vec2.findSecondPoint(pointOnBorder, lineLength, angleRadians);
  var attachmentVector = {
    x: pointOfAttachment.x - pointOnBorder.x,
    y: pointOfAttachment.y - pointOnBorder.y
  };
  var rotatedVector = {
    x: -attachmentVector.y,
    y: attachmentVector.x
  };
  var normalizedVector = {
    x: rotatedVector.x / lineLength,
    y: rotatedVector.y / lineLength
  };
  var normalizedAttachmentVector = {
    x: attachmentVector.x / lineLength,
    y: attachmentVector.y / lineLength
  };
  var addedOrtogonalOffset = 0;
  var addedParallelOffset = lineOffset + Math.max(labelSize.x, labelSize.y) + 1;
  if (isUsed) {
    if (angle >= -270 && angle <= 0) {
      addedOrtogonalOffset = 5;
    } else if (angle >= -360 && angle < -270) {
      addedOrtogonalOffset = -5;
    }
  }
  var ortogonalOffset = {
    x: normalizedVector.x * addedOrtogonalOffset,
    y: normalizedVector.y * addedOrtogonalOffset
  };
  var parallelOffset = {
    x: normalizedAttachmentVector.x * addedParallelOffset,
    y: normalizedAttachmentVector.y * addedParallelOffset
  };
  var labelCoordinates = {
    x: pointOfAttachment.x + ortogonalOffset.x + parallelOffset.x - labelSize.x,
    y: pointOfAttachment.y + ortogonalOffset.y + parallelOffset.y + labelSize.y
  };
  return [labelCoordinates, pointOfAttachment];
}
function getSearchFunction(initialAngle, canvasOffset, monomer) {
  return function findPointOnMonomerBorder(coordStart, length, applyZoomForPositionCalculation) {
    var angle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : initialAngle;
    var angleRadians = Vec2.degrees_to_radians(angle);
    var secondPoint = Vec2.findSecondPoint(coordStart, length, angleRadians);
    var diff = Vec2.diff(new Vec2(coordStart.x, coordStart.y), new Vec2(secondPoint.x, secondPoint.y));
    if (diff.length() < 1.01) {
      return secondPoint;
    }
    var newLength = Math.round(diff.length() / 1.4);
    var newCoordStart = {
      x: secondPoint.x,
      y: secondPoint.y
    };
    var zoomedCoordinateOfSecondPoint = applyZoomForPositionCalculation ? Coordinates.canvasToView(new Vec2(secondPoint)) : new Vec2(secondPoint);
    var newPointCoord = {
      x: Math.round(zoomedCoordinateOfSecondPoint.x) + canvasOffset.x,
      y: Math.round(zoomedCoordinateOfSecondPoint.y) + canvasOffset.y
    };
    var elementsAtPoint = document.elementsFromPoint(newPointCoord.x, newPointCoord.y);
    var isCurrentMonomerAtNewPoint = elementsAtPoint.some(function (element) {
      var _monomer$renderer;
      return element === ((_monomer$renderer = monomer.renderer) === null || _monomer$renderer === void 0 || (_monomer$renderer = _monomer$renderer.bodyElement) === null || _monomer$renderer === void 0 ? void 0 : _monomer$renderer.node());
    });
    var newAngle;
    if (isCurrentMonomerAtNewPoint) {
      newAngle = initialAngle;
    } else {
      newAngle = initialAngle - 180;
    }
    return findPointOnMonomerBorder(newCoordStart, newLength, applyZoomForPositionCalculation, newAngle);
  };
}
var anglesToSector = {
  '45': {
    min: 23,
    max: 68,
    center: 45
  },
  '90': {
    min: 68,
    max: 113,
    center: 90
  },
  '135': {
    min: 113,
    max: 148,
    center: 135
  },
  '180': {
    min: 148,
    max: 203,
    center: 180
  },
  '225': {
    min: 203,
    max: 248,
    center: 225
  },
  '270': {
    min: 248,
    max: 293,
    center: 270
  },
  '315': {
    min: 293,
    max: 228,
    center: 315
  },
  '360': {
    min: 338,
    max: 360,
    center: 360
  },
  '0': {
    min: 0,
    max: 23,
    center: 0
  }
};
var attachmentPointNumberToAngle;
(function (attachmentPointNumberToAngle) {
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R1"] = 0] = "R1";
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R2"] = 180] = "R2";
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R3"] = 270] = "R3";
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R4"] = 90] = "R4";
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R5"] = 45] = "R5";
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R6"] = 135] = "R6";
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R7"] = 315] = "R7";
  attachmentPointNumberToAngle[attachmentPointNumberToAngle["R8"] = 225] = "R8";
})(attachmentPointNumberToAngle || (attachmentPointNumberToAngle = {}));
var sectorsList = [45, 90, 135, 180, 225, 270, 315, 0, 360];
function checkFor0and360(sectorsList) {
  if (!sectorsList.includes(0) && sectorsList.includes(360)) {
    return sectorsList.filter(function (item) {
      return item !== 360;
    });
  }
  if (!sectorsList.includes(360) && sectorsList.includes(0)) {
    return sectorsList.filter(function (item) {
      return item !== 0;
    });
  }
  return sectorsList;
}
function getAttachmentPointLabelWithBinaryShift(attachmentPointNumber) {
  var attachmentPointLabel = '';
  for (var rgi = 0; rgi < 32; rgi++) {
    if (attachmentPointNumber & 1 << rgi) {
      attachmentPointLabel += getAttachmentPointLabel(rgi + 1);
    }
  }
  return attachmentPointLabel;
}
function isSingleRGroupAttachmentPoint(rGroupLabel) {
  if (rGroupLabel === 0) return false;
  var unsigned = rGroupLabel >>> 0;
  return (unsigned & unsigned - 1) === 0;
}
function getAttachmentPointLabel(attachmentPointNumber) {
  return "R".concat(attachmentPointNumber);
}
function getAttachmentPointNumberFromLabel(attachmentPointLabel) {
  return Number(attachmentPointLabel.replace('R', ''));
}
var getNextFreeAttachmentPoint = function getNextFreeAttachmentPoint(attachmentPoints) {
  var skipR1AndR2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var orderedAttachmentPointNumbers = attachmentPoints.map(getAttachmentPointNumberFromLabel).sort(function (a, b) {
    return a - b;
  });
  var nextFreeAttachmentPointNumber = skipR1AndR2 ? 3 : 1;
  var _iterator = _createForOfIteratorHelper(orderedAttachmentPointNumbers),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var number = _step.value;
      if (number === nextFreeAttachmentPointNumber) {
        nextFreeAttachmentPointNumber++;
      } else {
        break;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (nextFreeAttachmentPointNumber > 8) {
    throw new Error('Cannot assign more than 8 attachment points');
  }
  return getAttachmentPointLabel(nextFreeAttachmentPointNumber);
};

export { anglesToSector, attachmentPointNumberToAngle, canvasToMonomerCoordinates, checkFor0and360, findLabelPoint, getAttachmentPointLabel, getAttachmentPointLabelWithBinaryShift, getAttachmentPointNumberFromLabel, getNextFreeAttachmentPoint, getSearchFunction, isSingleRGroupAttachmentPoint, sectorsList };
//# sourceMappingURL=attachmentPointCalculations.modern.js.map
