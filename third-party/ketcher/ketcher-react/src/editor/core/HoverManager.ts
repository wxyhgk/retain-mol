import {
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
  LayerMap,
  Visel,
  paperPathFromSVGElement,
  type Render,
} from 'ketcher-core';
import paperjs from 'paper';
import {
  setFunctionalGroupsTooltip,
  type FunctionalGroupsTooltipContext,
} from '../utils/functionalGroupsTooltip';
import type { HoverTarget, Tool } from '../tool/Tool';

const highlightTargets = [
  'atoms',
  'bonds',
  'rxnArrows',
  'rxnPluses',
  'functionalGroups',
  'frags',
  'merge',
  'rgroups',
  'rgroupAttachmentPoints',
  'sgroups',
  'sgroupData',
  'enhancedFlags',
  'simpleObjects',
  'texts',
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
];

export interface IHoverManager {
  hover(
    ci: HoverTarget | null,
    newTool?: Tool | null,
    event?: PointerEvent,
  ): void;
}

interface HoverManagerContext extends FunctionalGroupsTooltipContext {
  render: Render;
  _tool: Tool | null;
}

type HoverableReObject = {
  item?: { type: string };
  makeHoverPlate?: (render: Render) => { node?: Element } | undefined;
  setHover(visible: boolean, render: Render, drawOutline?: boolean): void;
};

function getReStructMap(
  render: Render,
  map: string,
): Map<number, HoverableReObject> {
  return (
    render.ctab as unknown as Record<string, Map<number, HoverableReObject>>
  )[map];
}

function setHover(ci: HoverTarget, visible: boolean, render: Render) {
  if (highlightTargets.indexOf(ci.map) === -1) {
    return false;
  }

  let item: HoverableReObject | null = null;

  if (ci.map === 'merge') {
    const mergeCi = ci as {
      id: string;
      map: 'merge';
      items: Record<string, number[]>;
    };
    Object.keys(mergeCi.items).forEach((mp) => {
      mergeCi.items[mp].forEach((dstId) => {
        item = getReStructMap(render, mp).get(dstId) ?? null;

        if (item) {
          item.setHover(visible, render, false);
        }
      });
    });

    if (visible) {
      const hoveredRenderers = Object.keys(mergeCi.items).flatMap((mp) => {
        return mergeCi.items[mp].flatMap((dstId) => {
          return getReStructMap(render, mp).get(dstId);
        });
      });

      const hoversToCombine = hoveredRenderers
        .map((r) => r?.makeHoverPlate?.(render))
        .filter(Boolean);

      paperjs.setup(document.createElement('canvas'));

      let combinedPath: paper.PathItem | null = null;
      const options = render.options;
      const hoverVisel = new Visel('mergedHover');
      const elements: SVGElement[] = [];

      hoversToCombine.forEach((item) => {
        if (item?.node instanceof SVGElement) {
          elements.push(item.node);
          item.node.remove();
        }
      });

      for (const element of elements) {
        const paperPath = paperPathFromSVGElement(element) as
          | paper.Path
          | paper.CompoundPath
          | undefined;

        if (!paperPath) {
          continue;
        }

        if (!paperPath.closed) {
          paperPath.closePath();
        }

        if (!combinedPath) {
          combinedPath = paperPath;
        } else {
          combinedPath = combinedPath.unite(paperPath);
        }
      }

      if (!combinedPath) {
        return;
      }

      const combinedPathD = combinedPath.pathData;

      render.ctab.addReObjectPath(
        LayerMap.hovering,
        hoverVisel,
        render.paper.path(combinedPathD).attr({
          stroke: options.hoverStyle.stroke,
          'stroke-width': options.hoverStyle['stroke-width'],
        }),
      );

      render.combinedHover = hoverVisel;
    } else {
      render.combinedHover?.paths.forEach((path) => {
        path.remove();
      });

      render.combinedHover = null;
    }

    return true;
  }

  const targetCi = ci as { id: number; map: string };
  if (targetCi.map === 'functionalGroups') targetCi.map = 'sgroups';

  item = getReStructMap(render, targetCi.map).get(targetCi.id) ?? null;
  if (!item) {
    return true;
  }

  if (
    (targetCi.map === 'sgroups' && item.item?.type === 'DAT') ||
    targetCi.map === 'sgroupData'
  ) {
    const item1 = render.ctab.sgroups.get(targetCi.id);
    if (item1) {
      item1.setHover(visible, render);
    }

    const item2 = render.ctab.sgroupData.get(targetCi.id);
    if (item2) {
      item2.setHover(visible, render);
    }
  } else {
    item.setHover(visible, render);
  }

  return true;
}

export class HoverManager implements IHoverManager {
  private readonly editor: HoverManagerContext;

  constructor(editor: HoverManagerContext) {
    this.editor = editor;
  }

  private getHoverId(target: HoverTarget | null | undefined) {
    return target && 'id' in target ? target.id : undefined;
  }

  hover(ci: HoverTarget | null, newTool?: Tool | null, event?: PointerEvent) {
    const tool = newTool ?? this.editor._tool; // eslint-disable-line

    const hoverState = (tool as unknown as { ci?: HoverTarget })?.ci;
    let isSameHoverTarget = false;

    if (hoverState) {
      const previousId = this.getHoverId(hoverState);
      const nextId = this.getHoverId(ci);
      isSameHoverTarget = Boolean(
        ci && hoverState.map === ci.map && previousId === nextId,
      );

      if (!isSameHoverTarget) {
        setHover(hoverState, false, this.editor.render);
        delete (tool as unknown as { ci?: HoverTarget }).ci;
      }
    }

    if (ci && !isSameHoverTarget && setHover(ci, true, this.editor.render)) {
      (tool as unknown as { ci: HoverTarget }).ci = ci;
    }

    if (!ci) {
      setFunctionalGroupsTooltip({
        editor: this.editor,
        isShow: false,
      });
      return;
    }

    if (event) {
      setFunctionalGroupsTooltip({
        editor: this.editor,
        event,
        isShow: true,
      });
    }
  }
}
