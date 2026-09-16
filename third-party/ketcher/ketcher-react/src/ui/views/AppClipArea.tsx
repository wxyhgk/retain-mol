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

import ClipArea from '../primitives/cliparea/cliparea';
import { useContext, useMemo, type ComponentProps } from 'react';
import { useStore } from 'react-redux';
import { AppContext } from '../../contexts';
import { initClipboardForKetcher } from '../state/clipboardProviderAdapter';
import type { ClipboardDispatch, ClipboardGetState } from '../state/clipboard';

const AppClipArea = () => {
  const { ketcherId } = useContext(AppContext);
  const store = useStore();
  const clipboardProps = useMemo<ComponentProps<typeof ClipArea>>(() => {
    const initClipboard = initClipboardForKetcher(ketcherId);
    return initClipboard(
      store.dispatch as unknown as ClipboardDispatch,
      store.getState as ClipboardGetState,
    );
  }, [ketcherId, store]);

  return <ClipArea {...clipboardProps} />;
};

export default AppClipArea;
