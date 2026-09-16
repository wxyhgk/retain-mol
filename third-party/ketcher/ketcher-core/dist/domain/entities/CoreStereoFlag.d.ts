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
import { DrawingEntity } from '../entities/DrawingEntity';
import type { Vec2 } from '../entities/vec2';
import type { BaseMonomer } from '../entities/BaseMonomer';
import type { StereoFlag as StereoFlagEnum } from '../entities/fragment';
import type { StereoFlagRenderer } from '../../application/render/renderers/StereoFlagRenderer';
export declare class CoreStereoFlag extends DrawingEntity {
    flagType: StereoFlagEnum;
    relatedMonomer: BaseMonomer;
    renderer?: StereoFlagRenderer;
    constructor(position: Vec2, flagType: StereoFlagEnum, relatedMonomer: BaseMonomer);
    get center(): Vec2;
    setRenderer(renderer: StereoFlagRenderer): void;
}
