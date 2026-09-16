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
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import Visel from './visel.modern.js';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import { IMAGE_KEY } from '../../../domain/constants/image.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';

var ReObject = function () {
  function ReObject(viselType) {
    _classCallCheck(this, ReObject);
    _defineProperty(this, "visel", void 0);
    _defineProperty(this, "hover", false);
    _defineProperty(this, "hovering", null);
    _defineProperty(this, "selected", false);
    _defineProperty(this, "selectionPlate", null);
    this.visel = new Visel(viselType);
  }
  _createClass(ReObject, [{
    key: "changeSelectionStyle",
    value: function changeSelectionStyle(options) {
      var drawOutline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var hoverStyle = options.hoverStyle;
      if (['simpleObject', IMAGE_KEY].includes(this.visel.type)) {
        var _this$hovering;
        (_this$hovering = this.hovering) === null || _this$hovering === void 0 || _this$hovering.attr({
          'fill-opacity': this.selected ? 1 : 0
        });
      } else {
        var _this$hovering2;
        (_this$hovering2 = this.hovering) === null || _this$hovering2 === void 0 || _this$hovering2.attr({
          fill: hoverStyle.fill,
          'fill-opacity': this.selected ? 1 : 0,
          stroke: drawOutline ? hoverStyle.stroke : 'none'
        });
      }
    }
  }, {
    key: "getVBoxObj",
    value: function getVBoxObj(render) {
      var vbox = this.visel.boundingBox;
      if (vbox === null) return null;
      if (render.options.offset) {
        vbox = vbox.translate(render.options.offset.negated());
      }
      return vbox.transform(Scale.canvasToModel, render.options);
    }
  }, {
    key: "setHover",
    value: function setHover(hover, render) {
      var drawOutline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var options = render.options;
      if (hover) {
        var noredraw = 'hovering' in this && this.hovering !== null;
        if (noredraw) {
          if (this.hovering.type === 'set') {
            if (!this.hovering[0]) return;
            noredraw = !this.hovering[0].removed;
          } else {
            noredraw = !this.hovering.removed;
          }
        }
        if (noredraw) {
          this.changeSelectionStyle(options, drawOutline);
          this.hovering.show();
        } else {
          render.paper.setStart();
          this.drawHover(render, drawOutline);
          this.hovering = render.paper.setFinish();
        }
      } else if (this.hovering) {
        this.changeSelectionStyle(options, drawOutline);
        this.hovering.hide();
      }
      this.hover = hover;
    }
  }, {
    key: "drawHover",
    value: function drawHover(_render, _drawOutline) {
      throw new Error('ReObject.drawHover is not overridden.');
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(_restruct, _paper, _styles) {
      throw new Error('ReObject.makeSelectionPlate is not overridden');
    }
  }]);
  return ReObject;
}();

export { ReObject as default };
//# sourceMappingURL=reobject.modern.js.map
