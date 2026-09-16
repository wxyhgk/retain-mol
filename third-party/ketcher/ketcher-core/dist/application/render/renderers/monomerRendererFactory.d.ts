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
import { type ConcreteMonomerEntityClass } from '../../../domain/helpers/monomerEntityFactory';
import type { MonomerItemType } from '../../../domain/types';
import type { KetMonomerClass } from '../../../domain/constants/monomers';
import type { BaseMonomerRenderer } from './BaseMonomerRenderer';
type DerivedRendererClass = new (...args: unknown[]) => BaseMonomerRenderer;
/**
 * Maps a concrete monomer library item to its entity class, renderer class,
 * and KetMonomerClass. Does not handle ambiguous monomers — use
 * monomerFactory for those.
 */
export declare const monomerRendererFactory: (monomer: MonomerItemType) => [EntityClass: ConcreteMonomerEntityClass, RendererClass: DerivedRendererClass, ketMonomerClass: KetMonomerClass];
export {};
