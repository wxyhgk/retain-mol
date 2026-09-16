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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var d3 = require('d3');
var Zoom = require('../../../editor/tools/Zoom.js');
var constants = require('../../../editor/constants.js');
var BondSnapView = require('./BondSnapView.js');
var AngleSnapView = require('./AngleSnapView.js');
var DistanceSnapView = require('./DistanceSnapView.js');
var ModifyAminoAcidsView = require('./ModifyAminoAcidsView.js');
var LineLengthHighlightView = require('./LineLengthHighlightView.js');
var AutochainPreviewView = require('./AutochainPreviewView.js');
var SelectionView = require('./SelectionView.js');
var GroupCenterSnapView = require('./GroupCenterSnapView.js');
var RotationView = require('./RotationView.js');
var ReplacementHighlightView = require('./ReplacementHighlightView.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var TransientDrawingView = function () {
  function TransientDrawingView() {
    var _ZoomTool$instance$ca, _ZoomTool$instance;
    _classCallCheck__default["default"](this, TransientDrawingView);
    _defineProperty__default["default"](this, "views", new Map());
    _defineProperty__default["default"](this, "topLayer", void 0);
    _defineProperty__default["default"](this, "defaultLayer", void 0);
    var canvas = (_ZoomTool$instance$ca = (_ZoomTool$instance = Zoom.ZoomTool.instance) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.canvas) !== null && _ZoomTool$instance$ca !== void 0 ? _ZoomTool$instance$ca : d3.select(constants.drawnStructuresSelector);
    this.defaultLayer = canvas.append('g').attr('class', 'transient-views-layer');
    this.topLayer = canvas.append('g').attr('class', 'transient-views-top-layer');
    this.topLayer.raise();
  }
  _createClass__default["default"](TransientDrawingView, [{
    key: "addView",
    value: function addView(viewName, viewData) {
      if (this.views.has(viewName)) {
        this.removeView(viewName);
      }
      this.views.set(viewName, {
        render: function render(layer) {
          return viewData.show(layer, viewData.params);
        },
        onShow: viewData.onShow,
        onHide: viewData.onHide,
        topLayer: viewData.topLayer
      });
    }
  }, {
    key: "removeView",
    value: function removeView(viewName) {
      var viewData = this.views.get(viewName);
      if (viewData !== null && viewData !== void 0 && viewData.onHide) {
        viewData.onHide();
      }
      this.views["delete"](viewName);
    }
  }, {
    key: "showBondSnap",
    value: function showBondSnap(bond) {
      this.addView(BondSnapView.BondSnapView.viewName, {
        show: BondSnapView.BondSnapView.show,
        params: bond,
        topLayer: true,
        onShow: function onShow() {
          var _bond$renderer, _bond$secondMonomer;
          (_bond$renderer = bond.renderer) === null || _bond$renderer === void 0 || _bond$renderer.setVisibility(false);
          if (bond.firstMonomer.renderer) {
            bond.firstMonomer.renderer.setLabelVisibility(false);
          }
          if ((_bond$secondMonomer = bond.secondMonomer) !== null && _bond$secondMonomer !== void 0 && _bond$secondMonomer.renderer) {
            bond.secondMonomer.renderer.setLabelVisibility(false);
          }
        },
        onHide: function onHide() {
          var _bond$renderer2, _bond$secondMonomer2;
          (_bond$renderer2 = bond.renderer) === null || _bond$renderer2 === void 0 || _bond$renderer2.setVisibility(true);
          if (bond.firstMonomer.renderer) {
            bond.firstMonomer.renderer.setLabelVisibility(true);
          }
          if ((_bond$secondMonomer2 = bond.secondMonomer) !== null && _bond$secondMonomer2 !== void 0 && _bond$secondMonomer2.renderer) {
            bond.secondMonomer.renderer.setLabelVisibility(true);
          }
        }
      });
    }
  }, {
    key: "hideBondSnap",
    value: function hideBondSnap() {
      this.removeView(BondSnapView.BondSnapView.viewName);
    }
  }, {
    key: "showAngleSnap",
    value: function showAngleSnap(params) {
      var polymerBond = params.polymerBond;
      this.addView(AngleSnapView.AngleSnapView.viewName, {
        show: AngleSnapView.AngleSnapView.show,
        params: params,
        onShow: function onShow() {
          var _polymerBond$renderer;
          (_polymerBond$renderer = polymerBond.renderer) === null || _polymerBond$renderer === void 0 || _polymerBond$renderer.setVisibility(false);
        },
        onHide: function onHide() {
          var _polymerBond$renderer2;
          (_polymerBond$renderer2 = polymerBond.renderer) === null || _polymerBond$renderer2 === void 0 || _polymerBond$renderer2.setVisibility(true);
        }
      });
    }
  }, {
    key: "hideAngleSnap",
    value: function hideAngleSnap() {
      this.removeView(AngleSnapView.AngleSnapView.viewName);
    }
  }, {
    key: "showDistanceSnap",
    value: function showDistanceSnap(params) {
      this.addView(DistanceSnapView.DistanceSnapView.viewName, {
        show: DistanceSnapView.DistanceSnapView.show,
        params: params
      });
    }
  }, {
    key: "hideDistanceSnap",
    value: function hideDistanceSnap() {
      this.removeView(DistanceSnapView.DistanceSnapView.viewName);
    }
  }, {
    key: "showGroupCenterSnap",
    value: function showGroupCenterSnap(params) {
      this.addView(GroupCenterSnapView.GroupCentersnapView.viewName, {
        show: GroupCenterSnapView.GroupCentersnapView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideGroupCenterSnap",
    value: function hideGroupCenterSnap() {
      this.removeView(GroupCenterSnapView.GroupCentersnapView.viewName);
    }
  }, {
    key: "showModifyAminoAcidsView",
    value: function showModifyAminoAcidsView(params) {
      this.addView(ModifyAminoAcidsView.ModifyAminoAcidsView.viewName, {
        show: ModifyAminoAcidsView.ModifyAminoAcidsView.show,
        topLayer: true,
        params: params
      });
    }
  }, {
    key: "hideModifyAminoAcidsView",
    value: function hideModifyAminoAcidsView() {
      this.removeView(ModifyAminoAcidsView.ModifyAminoAcidsView.viewName);
    }
  }, {
    key: "showLineLengthHighlight",
    value: function showLineLengthHighlight(params) {
      this.addView(LineLengthHighlightView.LineLengthHighlightView.viewName, {
        show: LineLengthHighlightView.LineLengthHighlightView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideLineLengthHighlight",
    value: function hideLineLengthHighlight() {
      this.removeView(LineLengthHighlightView.LineLengthHighlightView.viewName);
    }
  }, {
    key: "showAutochainPreview",
    value: function showAutochainPreview(monomerOrRnaItem, position, selectedMonomerToConnect) {
      this.addView(AutochainPreviewView.AutochainPreviewView.viewName, {
        show: AutochainPreviewView.AutochainPreviewView.show,
        params: {
          monomerOrRnaItem: monomerOrRnaItem,
          position: position,
          selectedMonomerToConnect: selectedMonomerToConnect
        }
      });
    }
  }, {
    key: "hideAutochainPreview",
    value: function hideAutochainPreview() {
      this.removeView(AutochainPreviewView.AutochainPreviewView.viewName);
    }
  }, {
    key: "showSelection",
    value: function showSelection(params) {
      this.addView(SelectionView.SelectionView.viewName, {
        show: SelectionView.SelectionView.show,
        params: params
      });
    }
  }, {
    key: "hideSelection",
    value: function hideSelection() {
      this.removeView(SelectionView.SelectionView.viewName);
    }
  }, {
    key: "showRotation",
    value: function showRotation(params) {
      this.addView(RotationView.RotationView.viewName, {
        show: RotationView.RotationView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideRotation",
    value: function hideRotation() {
      this.removeView(RotationView.RotationView.viewName);
    }
  }, {
    key: "showReplacementHighlight",
    value: function showReplacementHighlight(params) {
      this.addView(ReplacementHighlightView.ReplacementHighlightView.viewName, {
        show: ReplacementHighlightView.ReplacementHighlightView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideReplacementHighlight",
    value: function hideReplacementHighlight() {
      this.removeView(ReplacementHighlightView.ReplacementHighlightView.viewName);
    }
  }, {
    key: "clear",
    value: function clear() {
      var _this = this;
      this.views.forEach(function (_, viewName) {
        return _this.removeView(viewName);
      });
      this.update();
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;
      this.topLayer.selectAll('*').remove();
      this.defaultLayer.selectAll('*').remove();
      this.views.forEach(function (viewData) {
        var _viewData$onShow;
        viewData.render(viewData.topLayer ? _this2.topLayer : _this2.defaultLayer);
        viewData === null || viewData === void 0 || (_viewData$onShow = viewData.onShow) === null || _viewData$onShow === void 0 || _viewData$onShow.call(viewData);
      });
      this.topLayer.raise();
    }
  }]);
  return TransientDrawingView;
}();

exports.TransientDrawingView = TransientDrawingView;
//# sourceMappingURL=TransientDrawingView.js.map
