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

var vec2 = require('../../../domain/entities/vec2.js');
var _ = require('lodash');

var FRAC = Math.PI / 12;
function setFracAngle(angle) {
  FRAC = Math.PI / 180 * angle;
}
function calcAngle(pos0, pos1) {
  var v = vec2.Vec2.diff(pos1, pos0);
  return Math.atan2(v.y, v.x);
}
function fracAngle(angle, angle2) {
  if (angle2) angle = calcAngle(angle, angle2);
  return Math.round(angle / FRAC) * FRAC;
}
function calcNewAtomPos(pos0, pos1, ctrlKey) {
  var vector = new vec2.Vec2(1, 0).rotate(ctrlKey ? calcAngle(pos0, pos1) : fracAngle(pos0, pos1));
  vector.add_(pos0);
  return vector;
}
function degrees(angle) {
  var degree = Math.round(angle / Math.PI * 180);
  if (degree > 180) degree -= 360;else if (degree <= -180) degree += 360;
  return degree;
}
var BONDS_MERGE_ANGLE = 10;
var BONDS_MERGE_SCALE = 0.2;
function mergeBondsParams(struct1, bond1, struct2, bond2) {
  var begin1 = struct1.atoms.get(bond1.begin);
  var begin2 = struct2.atoms.get(bond2.begin);
  var end1 = struct1.atoms.get(bond1.end);
  var end2 = struct2.atoms.get(bond2.end);
  if (!begin1 || !begin2 || !end1 || !end2) {
    return null;
  }
  var angle = calcAngle(begin1.pp, end1.pp) - calcAngle(begin2.pp, end2.pp);
  var mergeAngle = Math.abs(degrees(angle) % 180);
  var scale = vec2.Vec2.dist(begin1.pp, end1.pp) / vec2.Vec2.dist(begin2.pp, end2.pp);
  var merged = !_.inRange(mergeAngle, BONDS_MERGE_ANGLE, 180 - BONDS_MERGE_ANGLE) && _.inRange(scale, 1 - BONDS_MERGE_SCALE, 1 + BONDS_MERGE_SCALE);
  return {
    merged: merged,
    angle: angle,
    scale: scale,
    cross: Math.abs(degrees(angle)) > 90
  };
}
var rotateDelta = function rotateDelta(v, center, angle) {
  var v1 = v.sub(center);
  v1 = v1.rotate(angle);
  v1.add_(center);
  return v1.sub(v);
};
var flipPointByCenter = function flipPointByCenter(pointToFlip, center, flipDirection) {
  var d = new vec2.Vec2();
  if (flipDirection === 'horizontal') {
    d.x = center.x > pointToFlip.x ? 2 * (center.x - pointToFlip.x) : -2 * (pointToFlip.x - center.x);
  } else {
    d.y = center.y > pointToFlip.y ? 2 * (center.y - pointToFlip.y) : -2 * (pointToFlip.y - center.y);
  }
  return d;
};
var utils = {
  calcAngle: calcAngle,
  fracAngle: fracAngle,
  degrees: degrees,
  setFracAngle: setFracAngle,
  mergeBondsParams: mergeBondsParams,
  calcNewAtomPos: calcNewAtomPos
};

exports["default"] = utils;
exports.flipPointByCenter = flipPointByCenter;
exports.rotateDelta = rotateDelta;
//# sourceMappingURL=utils.js.map
