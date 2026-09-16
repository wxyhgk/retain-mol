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

import isHidden from './isHidden';
import { serverTransform } from '../state/server';
import type { UiAction } from './action.types';

type ServerConfig = {
  [key: string]: UiAction;
};

const config: ServerConfig = {
  layout: {
    title: 'Layout',
    action: {
      thunk: serverTransform('layout'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'layout'),
  },
  clean: {
    title: 'Clean Up',
    action: {
      thunk: serverTransform('clean'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'clean'),
  },
  arom: {
    title: 'Aromatize',
    action: {
      thunk: serverTransform('aromatize'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'arom'),
  },
  dearom: {
    title: 'Dearomatize',
    action: {
      thunk: serverTransform('dearomatize'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'dearom'),
  },
  cip: {
    title: 'Calculate CIP',
    action: {
      thunk: serverTransform('calculateCip'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'cip'),
  },
  check: {
    enabledInViewOnly: true,
    title: 'Check Structure',
    action: { dialog: 'check' },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'check'),
  },
  analyse: {
    enabledInViewOnly: true,
    title: 'Calculated Values',
    action: { dialog: 'analyse' },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'analyse'),
  },
  'calculation-readiness': {
    enabledInViewOnly: true,
    title: 'Calculation Readiness',
    action: { dialog: 'calculation-readiness' },
    hidden: (options) => isHidden(options, 'calculation-readiness'),
  },
  recognize: {
    title: 'Recognize Molecule',
    action: { dialog: 'recognize' },
    disabled: (_editor, _server, options) =>
      !options.app.server ||
      !(options.app as { imagoVersions?: unknown[] }).imagoVersions?.length,
    hidden: (options) => isHidden(options, 'recognize'),
  },
  miew: {
    title: '3D Viewer',
    enabledInViewOnly: true,
    action: { dialog: 'miew' },
    hidden: (options) => isHidden(options, 'miew'),
  },
  'explicit-hydrogens': {
    title: 'Add/Remove explicit hydrogens',
    action: {
      thunk: serverTransform('toggleExplicitHydrogens'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'explicit-hydrogens'),
  },
};

export default config;
