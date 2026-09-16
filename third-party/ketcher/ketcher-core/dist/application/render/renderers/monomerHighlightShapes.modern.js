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
import _toArray from '@babel/runtime/helpers/toArray';

var HIGHLIGHT_CORNER_RADIUS = 13;
var DIAMOND_HIGHLIGHT_CORNER_RADIUS = 6;
var HEXAGON_HIGHLIGHT_CORNER_RADIUS = 6;
var PENTAGON_HIGHLIGHT_CORNER_RADIUS = 6;
var HEXAGON_INNER_X_RATIO = 0.5 - 18.6583 / 70;
var PENTAGON_TIP_DY_RATIO = -14.701 / 42;
var PENTAGON_SIDE_DX_RATIO = 16.606 / 42;
var PENTAGON_SIDE_DY_RATIO = -4.815 / 42;
var PENTAGON_FLAT_DX_RATIO = 11.706 / 42;
var PENTAGON_FLAT_DY_RATIO = 15.0 / 42;
var formatCoordinate = function formatCoordinate(value) {
  var roundedValue = Number(value.toFixed(2));
  return Object.is(roundedValue, -0) ? '0' : String(roundedValue);
};
var pointToPath = function pointToPath(point) {
  return "".concat(formatCoordinate(point.x), " ").concat(formatCoordinate(point.y));
};
var getDistance = function getDistance(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y);
};
var getPointTowards = function getPointTowards(from, to, distance) {
  var fullDistance = getDistance(from, to);
  if (fullDistance === 0) {
    return from;
  }
  var ratio = distance / fullDistance;
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio
  };
};
var createPolygonHighlightPath = function createPolygonHighlightPath(points) {
  return "".concat(points.map(function (point, index) {
    return "".concat(index === 0 ? 'M' : 'L', " ").concat(pointToPath(point));
  }).join(' '), " Z");
};
var createRoundedPolygonHighlightPath = function createRoundedPolygonHighlightPath(points, cornerRadius) {
  if (points.length < 3 || cornerRadius <= 0) {
    return createPolygonHighlightPath(points);
  }
  var roundedCorners = points.map(function (point, index) {
    var previous = points[(index - 1 + points.length) % points.length];
    var next = points[(index + 1) % points.length];
    var maxDistance = Math.min(cornerRadius, getDistance(point, previous) / 2, getDistance(point, next) / 2);
    return {
      point: point,
      incoming: getPointTowards(point, previous, maxDistance),
      outgoing: getPointTowards(point, next, maxDistance)
    };
  });
  var _roundedCorners = _toArray(roundedCorners),
    firstCorner = _roundedCorners[0],
    restCorners = _roundedCorners.slice(1);
  return "M ".concat(pointToPath(firstCorner.outgoing), " ").concat(restCorners.map(function (_ref) {
    var point = _ref.point,
      incoming = _ref.incoming,
      outgoing = _ref.outgoing;
    return "L ".concat(pointToPath(incoming), " Q ").concat(pointToPath(point), " ").concat(pointToPath(outgoing));
  }).join(' '), " L ").concat(pointToPath(firstCorner.incoming), " Q ").concat(pointToPath(firstCorner.point), " ").concat(pointToPath(firstCorner.outgoing), " Z");
};
var createRectHighlightPath = function createRectHighlightPath(center, width, height) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var halfWidth = width / 2 + offset;
  var halfHeight = height / 2 + offset;
  var left = center.x - halfWidth;
  var right = center.x + halfWidth;
  var top = center.y - halfHeight;
  var bottom = center.y + halfHeight;
  return createRoundedPolygonHighlightPath([{
    x: left,
    y: top
  }, {
    x: right,
    y: top
  }, {
    x: right,
    y: bottom
  }, {
    x: left,
    y: bottom
  }], HIGHLIGHT_CORNER_RADIUS);
};
var createCircleHighlightPath = function createCircleHighlightPath(center, radius) {
  var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var inflatedRadius = radius + offset;
  var left = center.x - inflatedRadius;
  var right = center.x + inflatedRadius;
  var radiusPath = formatCoordinate(inflatedRadius);
  return "M ".concat(formatCoordinate(right), " ").concat(formatCoordinate(center.y), " A ").concat(radiusPath, " ").concat(radiusPath, " 0 1 0 ").concat(formatCoordinate(left), " ").concat(formatCoordinate(center.y), " A ").concat(radiusPath, " ").concat(radiusPath, " 0 1 0 ").concat(formatCoordinate(right), " ").concat(formatCoordinate(center.y), " Z");
};
var expandPolygon = function expandPolygon(points, offset) {
  var n = points.length;
  var shiftedEdges = points.map(function (point, index) {
    var next = points[(index + 1) % n];
    var dx = next.x - point.x;
    var dy = next.y - point.y;
    var len = Math.hypot(dx, dy);
    var nx = dy / len;
    var ny = -dx / len;
    return {
      x1: point.x + offset * nx,
      y1: point.y + offset * ny,
      x2: next.x + offset * nx,
      y2: next.y + offset * ny
    };
  });
  return shiftedEdges.map(function (edge, index) {
    var prev = shiftedEdges[(index - 1 + n) % n];
    var denom = (prev.x1 - prev.x2) * (edge.y1 - edge.y2) - (prev.y1 - prev.y2) * (edge.x1 - edge.x2);
    if (Math.abs(denom) < 1e-10) {
      return {
        x: (prev.x2 + edge.x1) / 2,
        y: (prev.y2 + edge.y1) / 2
      };
    }
    var t = ((prev.x1 - edge.x1) * (edge.y1 - edge.y2) - (prev.y1 - edge.y1) * (edge.x1 - edge.x2)) / denom;
    return {
      x: prev.x1 + t * (prev.x2 - prev.x1),
      y: prev.y1 + t * (prev.y2 - prev.y1)
    };
  });
};
var createHexagonHighlightPath = function createHexagonHighlightPath(center, width, height) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var halfW = width / 2;
  var halfH = height / 2;
  var innerX = HEXAGON_INNER_X_RATIO * width;
  var baseVerts = [{
    x: center.x - innerX,
    y: center.y - halfH
  },
  {
    x: center.x + innerX,
    y: center.y - halfH
  },
  {
    x: center.x + halfW,
    y: center.y
  },
  {
    x: center.x + innerX,
    y: center.y + halfH
  },
  {
    x: center.x - innerX,
    y: center.y + halfH
  },
  {
    x: center.x - halfW,
    y: center.y
  }
  ];
  var verts = offset === 0 ? baseVerts : expandPolygon(baseVerts, offset);
  return createRoundedPolygonHighlightPath(verts, HEXAGON_HIGHLIGHT_CORNER_RADIUS);
};
var createNucleotideHighlightPath = function createNucleotideHighlightPath(center, width, height) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var baseVerts = [{
    x: center.x,
    y: center.y + PENTAGON_TIP_DY_RATIO * height
  },
  {
    x: center.x + PENTAGON_SIDE_DX_RATIO * width,
    y: center.y + PENTAGON_SIDE_DY_RATIO * height
  },
  {
    x: center.x + PENTAGON_FLAT_DX_RATIO * width,
    y: center.y + PENTAGON_FLAT_DY_RATIO * height
  },
  {
    x: center.x - PENTAGON_FLAT_DX_RATIO * width,
    y: center.y + PENTAGON_FLAT_DY_RATIO * height
  },
  {
    x: center.x - PENTAGON_SIDE_DX_RATIO * width,
    y: center.y + PENTAGON_SIDE_DY_RATIO * height
  }
  ];
  var verts = offset === 0 ? baseVerts : expandPolygon(baseVerts, offset);
  return createRoundedPolygonHighlightPath(verts, PENTAGON_HIGHLIGHT_CORNER_RADIUS);
};
var createDiamondHighlightPath = function createDiamondHighlightPath(center, width, height) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var halfWidth = width / 2 + offset;
  var halfHeight = height / 2 + offset;
  var top = {
    x: center.x,
    y: center.y - halfHeight
  };
  var right = {
    x: center.x + halfWidth,
    y: center.y
  };
  var bottom = {
    x: center.x,
    y: center.y + halfHeight
  };
  var left = {
    x: center.x - halfWidth,
    y: center.y
  };
  return createRoundedPolygonHighlightPath([top, right, bottom, left], DIAMOND_HIGHLIGHT_CORNER_RADIUS);
};
var createSegmentHighlightPath = function createSegmentHighlightPath(start, end, halfWidth) {
  var dx = end.x - start.x;
  var dy = end.y - start.y;
  var length = Math.hypot(dx, dy);
  if (length === 0) {
    return createCircleHighlightPath(start, halfWidth);
  }
  var normalX = -dy / length * halfWidth;
  var normalY = dx / length * halfWidth;
  var startTop = {
    x: start.x + normalX,
    y: start.y + normalY
  };
  var endTop = {
    x: end.x + normalX,
    y: end.y + normalY
  };
  var endBottom = {
    x: end.x - normalX,
    y: end.y - normalY
  };
  var startBottom = {
    x: start.x - normalX,
    y: start.y - normalY
  };
  var radiusPath = formatCoordinate(halfWidth);
  return "M ".concat(pointToPath(startTop), " L ").concat(pointToPath(endTop), " A ").concat(radiusPath, " ").concat(radiusPath, " 0 0 1 ").concat(pointToPath(endBottom), " L ").concat(pointToPath(startBottom), " A ").concat(radiusPath, " ").concat(radiusPath, " 0 0 1 ").concat(pointToPath(startTop), " Z");
};

export { createCircleHighlightPath, createDiamondHighlightPath, createHexagonHighlightPath, createNucleotideHighlightPath, createRectHighlightPath, createSegmentHighlightPath };
//# sourceMappingURL=monomerHighlightShapes.modern.js.map
