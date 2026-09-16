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

var atom = require('../../domain/entities/atom.js');
var vec2 = require('../../domain/entities/vec2.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');
var generalEnumTypes = require('./restruct/generalEnumTypes.js');
var render_constants = require('./render.constants.js');

function relBox(box) {
  return {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height
  };
}
function shiftRayBox(p, d, bb) {
  assert.assert(!!p);
  assert.assert(!!d);
  assert.assert(!!bb);
  var b = [bb.p0, new vec2.Vec2(bb.p1.x, bb.p0.y), bb.p1, new vec2.Vec2(bb.p0.x, bb.p1.y)];
  var r = b.map(function (v) {
    return v.sub(p);
  });
  d = d.normalized();
  var rc = r.map(function (v) {
    return vec2.Vec2.cross(v, d);
  });
  var rd = r.map(function (v) {
    return vec2.Vec2.dot(v, d);
  });
  var pid = -1;
  var nid = -1;
  for (var i = 0; i < 4; ++i) {
    if (rc[i] > 0) {
      if (pid < 0 || rd[pid] < rd[i]) pid = i;
    } else if (nid < 0 || rd[nid] < rd[i]) {
      nid = i;
    }
  }
  if (nid < 0 || pid < 0) {
    return 0;
  }
  var id0 = rd[pid] > rd[nid] ? nid : pid;
  var id1 = rd[pid] > rd[nid] ? pid : nid;
  return rd[id0] + Math.abs(rc[id0]) * (rd[id1] - rd[id0]) / (Math.abs(rc[id0]) + Math.abs(rc[id1]));
}
function calcCoordinates(aPoint, bPoint, lengthHyp) {
  var obj = {
    pos1: null,
    pos2: null
  };
  var oPos2 = {
    x: bPoint.x - aPoint.x,
    y: bPoint.y - aPoint.y
  };
  var c = (Math.pow(lengthHyp, 2) - oPos2.x * oPos2.x - oPos2.y * oPos2.y - Math.pow(lengthHyp, 2)) / -2;
  var a = oPos2.x * oPos2.x + oPos2.y * oPos2.y;
  if (oPos2.x !== 0) {
    var b = -2 * oPos2.y * c;
    var e = c * c - lengthHyp * lengthHyp * oPos2.x * oPos2.x;
    var D = b * b - 4 * a * e;
    if (D > 0) {
      obj.pos1 = {
        x: 0,
        y: 0
      };
      obj.pos2 = {
        x: 0,
        y: 0
      };
      obj.pos1.y = (-b + Math.sqrt(D)) / (2 * a);
      obj.pos2.y = (-b - Math.sqrt(D)) / (2 * a);
      obj.pos1.x = (c - obj.pos1.y * oPos2.y) / oPos2.x;
      obj.pos2.x = (c - obj.pos2.y * oPos2.y) / oPos2.x;
    }
  } else {
    obj.pos1 = {
      x: 0,
      y: 0
    };
    obj.pos2 = {
      x: 0,
      y: 0
    };
    obj.pos1.y = c / oPos2.y;
    obj.pos2.y = c / oPos2.y;
    obj.pos1.x = -Math.sqrt(Math.pow(lengthHyp, 2) - Math.pow(c, 2) / Math.pow(oPos2.y, 2));
    obj.pos2.x = Math.sqrt(Math.pow(lengthHyp, 2) - Math.pow(c, 2) / Math.pow(oPos2.y, 2));
  }
  if (obj.pos1 !== null) {
    obj.pos1.x += aPoint.x;
    obj.pos1.y += aPoint.y;
  }
  if (obj.pos2 !== null) {
    obj.pos2.x += aPoint.x;
    obj.pos2.y += aPoint.y;
  }
  return obj;
}
function getCIPValuePath(_ref) {
  var paper = _ref.paper,
    cipLabelPosition = _ref.cipLabelPosition,
    atomOrBond = _ref.atomOrBond,
    options = _ref.options;
  var text = paper.text(cipLabelPosition.x, cipLabelPosition.y, "(".concat(atomOrBond.cip, ")")).attr({
    font: options.font,
    'font-size': options.fontszInPx
  });
  var box = text.getBBox();
  var path = paper.set();
  var rect = paper.rect(box.x - 1, box.y - 1, box.width + 2, box.height + 2, 3, 3).attr({
    fill: '#fff',
    stroke: '#fff'
  });
  path.push(rect.toFront(), text.toFront());
  return {
    path: path,
    text: text,
    rectangle: rect
  };
}
function drawCIPLabel(_ref2) {
  var atomOrBond = _ref2.atomOrBond,
    position = _ref2.position,
    restruct = _ref2.restruct,
    visel = _ref2.visel;
  var _restruct$render = restruct.render,
    options = _restruct$render.options,
    paper = _restruct$render.paper;
  var path = paper.set();
  var cipLabelPosition = position.scaled(options.microModeScale);
  var cipValuePath = getCIPValuePath({
    paper: paper,
    cipLabelPosition: cipLabelPosition,
    atomOrBond: atomOrBond,
    options: options
  });
  if (atomOrBond instanceof atom.Atom) {
    var box = relBox(cipValuePath.path.getBBox());
    cipValuePath.path.translateAbs(0.5 * box.width, -0.5 * box.height);
  }
  path.push(cipValuePath.path.toFront());
  restruct.addReObjectPath(generalEnumTypes.LayerMap.additionalInfo, visel, path, null, true);
  return cipValuePath;
}
function updateHalfBondCoordinates(hb1, hb2, xShift) {
  if (hb1.p.y !== hb2.p.y) return [hb1, hb2];
  if (hb1.p.x < hb2.p.x && hb1.p.y === hb2.p.y) {
    hb1.p.x = hb1.p.x + xShift;
  } else if (hb1.p.x > hb2.p.x) {
    hb1.p.x = hb1.p.x - xShift;
  }
  return [hb1, hb2];
}
function escapeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function useLabelStyles(attachmentPointSelected, attachmentPointUsed, usageInMacromolecule) {
  var color = '#585858';
  var fill = '#FFF';
  var stroke = '#7C7C7F';
  switch (usageInMacromolecule) {
    case render_constants.UsageInMacromolecule.MonomerPreview:
      stroke = 'none';
      if (attachmentPointUsed) {
        fill = '#E1E5EA';
        color = '#B4B9D6';
      }
      break;
    case render_constants.UsageInMacromolecule.MonomerConnectionsModal:
      if (attachmentPointSelected) {
        fill = '#167782';
        color = '#FFF';
      } else if (attachmentPointUsed) {
        fill = '#E1E5EA';
        color = '#B4B9D6';
        stroke = '#B4B9D6';
      }
      break;
    case render_constants.UsageInMacromolecule.BondPreview:
      if (attachmentPointSelected) {
        fill = '#CDF1FC';
      } else if (attachmentPointUsed) {
        fill = '#E1E5EA';
        color = '#B4B9D6';
      }
      stroke = 'none';
      break;
  }
  return {
    color: color,
    fill: fill,
    stroke: stroke
  };
}
var util = {
  relBox: relBox,
  shiftRayBox: shiftRayBox,
  calcCoordinates: calcCoordinates,
  drawCIPLabel: drawCIPLabel,
  updateHalfBondCoordinates: updateHalfBondCoordinates,
  escapeHtml: escapeHtml,
  useLabelStyles: useLabelStyles
};

exports["default"] = util;
//# sourceMappingURL=util.js.map
