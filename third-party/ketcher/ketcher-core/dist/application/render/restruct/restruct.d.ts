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
import { Struct } from '../../../domain/entities/struct';
import { Box2Abs } from '../../../domain/entities/box2Abs';
import { Pile } from '../../../domain/entities/pile';
import { Pool } from '../../../domain/entities/pool';
import type { Vec2 } from '../../../domain/entities/vec2';
import { LayerMap } from './generalEnumTypes';
import ReAtom from './reatom';
import ReBond from './rebond';
import ReDataSGroupData from './redatasgroupdata';
import ReEnhancedFlag from './reenhancedFlag';
import ReFrag from './refrag';
import ReLoop from './reloop';
import ReRGroup from './rergroup';
import ReRxnArrow from './rerxnarrow';
import ReRxnPlus from './rerxnplus';
import ReSGroup from './resgroup';
import ReSimpleObject from './resimpleObject';
import ReText from './retext';
import type { Render } from '../raphaelRender';
import type Visel from './visel';
import { ReRGroupAttachmentPoint } from './rergroupAttachmentPoint';
import { ReImage } from '../../render/restruct/reImage';
import { ReMultitailArrow } from './remultitailArrow';
declare class ReStruct {
    static readonly maps: {
        readonly atoms: typeof ReAtom;
        readonly bonds: typeof ReBond;
        readonly rxnPluses: typeof ReRxnPlus;
        readonly rxnArrows: typeof ReRxnArrow;
        readonly frags: typeof ReFrag;
        readonly rgroups: typeof ReRGroup;
        readonly rgroupAttachmentPoints: typeof ReRGroupAttachmentPoint;
        readonly sgroupData: typeof ReDataSGroupData;
        readonly enhancedFlags: typeof ReEnhancedFlag;
        readonly sgroups: typeof ReSGroup;
        readonly reloops: typeof ReLoop;
        readonly simpleObjects: typeof ReSimpleObject;
        readonly texts: typeof ReText;
        readonly images: typeof ReImage;
        readonly multitailArrows: typeof ReMultitailArrow;
    };
    render: Render;
    molecule: Struct;
    atoms: Map<number, ReAtom>;
    bonds: Map<number, ReBond>;
    visibleAtoms: Map<number, ReAtom>;
    visibleBonds: Map<number, ReBond>;
    reloops: Map<number, ReLoop>;
    rxnPluses: Map<number, ReRxnPlus>;
    rxnArrows: Map<number, ReRxnArrow>;
    frags: Pool<ReFrag>;
    rgroups: Pool<ReRGroup>;
    rgroupAttachmentPoints: Pool<ReRGroupAttachmentPoint>;
    sgroups: Map<number, ReSGroup>;
    sgroupData: Map<number, ReDataSGroupData>;
    enhancedFlags: Map<number, ReEnhancedFlag>;
    simpleObjects: Map<number, ReSimpleObject>;
    texts: Map<number, ReText>;
    images: Map<number, ReImage>;
    multitailArrows: Map<number, ReMultitailArrow>;
    private initialized;
    private layers;
    connectedComponents: Pool<Pile>;
    private readonly ccFragmentType;
    private structChanged;
    needRecalculateVisibleAtomsAndBonds: boolean;
    private readonly atomsChanged;
    private readonly simpleObjectsChanged;
    private readonly rxnArrowsChanged;
    private readonly rxnPlusesChanged;
    private readonly enhancedFlagsChanged;
    private readonly bondsChanged;
    private readonly textsChanged;
    private readonly imagesChanged;
    private readonly multitailArrowsChanged;
    private snappingBonds;
    private highlightOutlinePaths;
    constructor(molecule: any, render: Render | {
        skipRaphaelInitialization: boolean;
        theme: any;
    });
    get visibleRGroupAttachmentPoints(): Pool<ReRGroupAttachmentPoint>;
    connectedComponentRemoveAtom(aid: number, reAtom?: ReAtom): void;
    clearConnectedComponents(): void;
    getConnectedComponent(aid: Array<number> | number, adjacentComponents: Pile): Pile;
    addConnectedComponent(idSet: Pile<number>): number;
    removeConnectedComponent(ccid: number): boolean;
    assignConnectedComponents(): void;
    initLayers(): void;
    addReObjectPath(group: LayerMap, visel: Visel, path: any, pos?: Vec2 | null, visible?: boolean): void;
    moveReObjectOnTopOfLayer(visel: Visel, layerKey: LayerMap): void;
    movePathOnTopOfLayer(path: any, layerKey: LayerMap): void;
    clearMarks(): void;
    markItemRemoved(): void;
    markBond(bid: number, mark: number): void;
    markAtom(aid: number, mark: number): void;
    markRgroupAttachmentPoint(rgAPid: number, mark: number): void;
    markItem(map: string, id: number, mark: number): void;
    clearVisel(visel: Visel): void;
    eachItem(func: any): void;
    /**
     * Why?
     * we can't use just getVBoxObj and the center for atoms
     * because this will lead incorrect center position for the move atom around it
     * because of atom's vBox contain text label with is not constant after flip/rotate
     * and this lead to unstable flip tool work
     */
    getSelectionBoxCenter(selection: SelectionMap): Vec2 | undefined;
    getVBoxObj(selection?: SelectionMap): Box2Abs;
    private getAllElementsAsSelectionMap;
    private getBoundingBoxForSelection;
    translate(d: any): void;
    scale(s: number): void;
    /** Visel is a shorthand for VISual ELement */
    clearVisels(): void;
    /** Release a replaced render structure, including its SVG layer anchors. */
    dispose(): void;
    recalculateVisibleAtomsAndBonds(): void;
    update(force: boolean): boolean;
    /**
     * Draws RNA preset components whose tab is not active (#9441) as a single
     * clean outline. Each "outline" highlight's per-atom/bond selection contours
     * are merged into one path, and an SVG feMorphology filter turns the filled
     * union into a single perimeter stroke (so the structure stays visible
     * inside). Rebuilt every render since it spans many atoms/bonds.
     */
    showHighlightOutlines(): void;
    private ensureHighlightOutlineFilter;
    updateLoops(): void;
    showLoops(): void;
    showSimpleObjects(): void;
    showTexts(): void;
    showReactionSymbols(): void;
    showSGroups(): void;
    showFragments(): void;
    showRGroups(): void;
    loopRemove(loopId: number): void;
    verifyLoops(): void;
    getRGroupAttachmentPointsVBoxByAtomIds(atomsIds: number[]): Box2Abs | null;
    private showRgroupAttachmentPoints;
    private showAtoms;
    showEnhancedFlags(): void;
    showBonds(): void;
    showImages(): void;
    showMultitailArrows(): void;
    setSelection(selection?: any): void;
    showItemSelection(item: any, selected: any): void;
    addSnappingBonds(bondId: number): void;
    clearSnappingBonds(): void;
    isSnappingBond(bondId: number): boolean;
}
type SelectionMap = Partial<Record<keyof typeof ReStruct.maps, number[] | undefined>>;
export default ReStruct;
