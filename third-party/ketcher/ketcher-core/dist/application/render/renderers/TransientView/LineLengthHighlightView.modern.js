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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';

var LineLengthHighlightView = function () {
  function LineLengthHighlightView() {
    _classCallCheck(this, LineLengthHighlightView);
  }
  _createClass(LineLengthHighlightView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      var currentPosition = params.currentPosition;
      var VERY_LARGE_VALUE = 100000;
      transientLayer.append('rect').attr('x', -VERY_LARGE_VALUE).attr('y', -VERY_LARGE_VALUE).attr('width', VERY_LARGE_VALUE).attr('height', VERY_LARGE_VALUE * 2).attr('fill', '#333333').style('opacity', 0.05);
      transientLayer.append('rect').attr('x', currentPosition).attr('y', -VERY_LARGE_VALUE).attr('width', VERY_LARGE_VALUE).attr('height', VERY_LARGE_VALUE * 2).attr('fill', '#333333').style('opacity', 0.05);
    }
  }]);
  return LineLengthHighlightView;
}();
_defineProperty(LineLengthHighlightView, "viewName", 'LineLengthHighlightView');

export { LineLengthHighlightView };
//# sourceMappingURL=LineLengthHighlightView.modern.js.map
