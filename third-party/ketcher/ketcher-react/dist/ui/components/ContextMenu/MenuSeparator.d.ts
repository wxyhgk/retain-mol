/****************************************************************************
 * Copyright 2025 EPAM Systems
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
import type { FC } from 'react';
import { type SeparatorProps } from 'react-contexify';
/**
 * react-contexify's own `Separator` never stops click propagation, so a
 * click on it bubbles to the `window`-level listener the menu uses to
 * detect outside clicks, closing the menu (see #3269). `Item`/`Submenu`
 * avoid this by stopping propagation themselves; this wrapper does the
 * same for separators.
 */
declare const MenuSeparator: FC<SeparatorProps>;
export default MenuSeparator;
