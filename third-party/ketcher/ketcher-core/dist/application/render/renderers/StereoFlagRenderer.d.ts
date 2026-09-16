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
import { BaseRenderer } from '../../render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from '../../render/types';
import type { CoreStereoFlag } from '../../../domain/entities/CoreStereoFlag';
export declare class StereoFlagRenderer extends BaseRenderer {
    stereoFlag: CoreStereoFlag;
    private selectionElement;
    private textElement?;
    constructor(stereoFlag: CoreStereoFlag);
    private get scaledPosition();
    private get flagLabel();
    show(): void;
    private shouldDisplayStereoFlag;
    private getTextBBox;
    private setSelectionContourAttributes;
    protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void;
    protected appendHoverAreaElement(): void;
    drawSelection(): void;
    appendSelection(): void;
    removeSelection(): void;
    move(): void;
    protected removeHover(): void;
    remove(): void;
    /**
     * Movement selection handling is done through move() method for stereo flags.
     * This empty implementation satisfies the base interface.
     */
    moveSelection(): void;
}
