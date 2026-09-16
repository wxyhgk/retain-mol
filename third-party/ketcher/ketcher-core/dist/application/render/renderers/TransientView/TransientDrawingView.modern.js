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
import { select } from 'd3';
import { ZoomTool } from '../../../editor/tools/Zoom.modern.js';
import { drawnStructuresSelector } from '../../../editor/constants.modern.js';
import { BondSnapView } from './BondSnapView.modern.js';
import { AngleSnapView } from './AngleSnapView.modern.js';
import { DistanceSnapView } from './DistanceSnapView.modern.js';
import { ModifyAminoAcidsView } from './ModifyAminoAcidsView.modern.js';
import { LineLengthHighlightView } from './LineLengthHighlightView.modern.js';
import { AutochainPreviewView } from './AutochainPreviewView.modern.js';
import { SelectionView } from './SelectionView.modern.js';
import { GroupCentersnapView } from './GroupCenterSnapView.modern.js';
import { RotationView } from './RotationView.modern.js';
import { ReplacementHighlightView } from './ReplacementHighlightView.modern.js';

var TransientDrawingView = function () {
  function TransientDrawingView() {
    var _ZoomTool$instance$ca, _ZoomTool$instance;
    _classCallCheck(this, TransientDrawingView);
    _defineProperty(this, "views", new Map());
    _defineProperty(this, "topLayer", void 0);
    _defineProperty(this, "defaultLayer", void 0);
    var canvas = (_ZoomTool$instance$ca = (_ZoomTool$instance = ZoomTool.instance) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.canvas) !== null && _ZoomTool$instance$ca !== void 0 ? _ZoomTool$instance$ca : select(drawnStructuresSelector);
    this.defaultLayer = canvas.append('g').attr('class', 'transient-views-layer');
    this.topLayer = canvas.append('g').attr('class', 'transient-views-top-layer');
    this.topLayer.raise();
  }
  _createClass(TransientDrawingView, [{
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
      this.addView(BondSnapView.viewName, {
        show: BondSnapView.show,
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
      this.removeView(BondSnapView.viewName);
    }
  }, {
    key: "showAngleSnap",
    value: function showAngleSnap(params) {
      var polymerBond = params.polymerBond;
      this.addView(AngleSnapView.viewName, {
        show: AngleSnapView.show,
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
      this.removeView(AngleSnapView.viewName);
    }
  }, {
    key: "showDistanceSnap",
    value: function showDistanceSnap(params) {
      this.addView(DistanceSnapView.viewName, {
        show: DistanceSnapView.show,
        params: params
      });
    }
  }, {
    key: "hideDistanceSnap",
    value: function hideDistanceSnap() {
      this.removeView(DistanceSnapView.viewName);
    }
  }, {
    key: "showGroupCenterSnap",
    value: function showGroupCenterSnap(params) {
      this.addView(GroupCentersnapView.viewName, {
        show: GroupCentersnapView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideGroupCenterSnap",
    value: function hideGroupCenterSnap() {
      this.removeView(GroupCentersnapView.viewName);
    }
  }, {
    key: "showModifyAminoAcidsView",
    value: function showModifyAminoAcidsView(params) {
      this.addView(ModifyAminoAcidsView.viewName, {
        show: ModifyAminoAcidsView.show,
        topLayer: true,
        params: params
      });
    }
  }, {
    key: "hideModifyAminoAcidsView",
    value: function hideModifyAminoAcidsView() {
      this.removeView(ModifyAminoAcidsView.viewName);
    }
  }, {
    key: "showLineLengthHighlight",
    value: function showLineLengthHighlight(params) {
      this.addView(LineLengthHighlightView.viewName, {
        show: LineLengthHighlightView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideLineLengthHighlight",
    value: function hideLineLengthHighlight() {
      this.removeView(LineLengthHighlightView.viewName);
    }
  }, {
    key: "showAutochainPreview",
    value: function showAutochainPreview(monomerOrRnaItem, position, selectedMonomerToConnect) {
      this.addView(AutochainPreviewView.viewName, {
        show: AutochainPreviewView.show,
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
      this.removeView(AutochainPreviewView.viewName);
    }
  }, {
    key: "showSelection",
    value: function showSelection(params) {
      this.addView(SelectionView.viewName, {
        show: SelectionView.show,
        params: params
      });
    }
  }, {
    key: "hideSelection",
    value: function hideSelection() {
      this.removeView(SelectionView.viewName);
    }
  }, {
    key: "showRotation",
    value: function showRotation(params) {
      this.addView(RotationView.viewName, {
        show: RotationView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideRotation",
    value: function hideRotation() {
      this.removeView(RotationView.viewName);
    }
  }, {
    key: "showReplacementHighlight",
    value: function showReplacementHighlight(params) {
      this.addView(ReplacementHighlightView.viewName, {
        show: ReplacementHighlightView.show,
        params: params,
        topLayer: true
      });
    }
  }, {
    key: "hideReplacementHighlight",
    value: function hideReplacementHighlight() {
      this.removeView(ReplacementHighlightView.viewName);
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

export { TransientDrawingView };
//# sourceMappingURL=TransientDrawingView.modern.js.map
