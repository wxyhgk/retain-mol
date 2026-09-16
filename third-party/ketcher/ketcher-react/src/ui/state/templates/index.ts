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

import initTmplLib, { initLib } from './init-lib';

import { KetcherLogger, KetSerializer, Struct } from 'ketcher-core';
import { omit } from 'lodash/fp';
import { openDialog } from '../modal';
import { storage } from '../../storage-ext';
import type { TemplatesState } from '../store.types';

type Template = TemplatesState['lib'][number];

interface TemplateEditData {
  name: string;
  attach?: { atomid: number; bondid: number };
}

export { initTmplLib };

/* TEMPLATES */
export function selectTmpl(tmpl) {
  return {
    type: 'TMPL_SELECT',
    data: { selected: tmpl },
  };
}

export function changeGroup(group) {
  return {
    type: 'TMPL_CHANGE_GROUP',
    data: { group, selected: null },
  };
}

export function changeFilter(filter) {
  return {
    type: 'TMPL_CHANGE_FILTER',
    data: { filter, selected: null },
  };
}

export function changeTab(tab) {
  return {
    type: 'TMPL_CHANGE_TAB',
    data: { tab },
  };
}

/* TEMPLATE-ATTACH-EDIT */
export function initAttach(name, attach) {
  return {
    type: 'INIT_ATTACH',
    data: {
      name,
      atomid: attach.atomid,
      bondid: attach.bondid,
    },
  };
}

export function setAttachPoints(attach) {
  return {
    type: 'SET_ATTACH_POINTS',
    data: {
      atomid: attach.atomid,
      bondid: attach.bondid,
    },
  };
}

export function setTmplName(name) {
  return {
    type: 'SET_TMPL_NAME',
    data: { name },
  };
}

export function editUserTmpl(tmpl: Template, data: TemplateEditData) {
  return {
    type: 'TMPL_EDIT',
    data: { tmpl, ...data },
  };
}

export function editTmpl(tmpl: Template) {
  return (dispatch, getState) => {
    return openDialog(dispatch, 'attach', { tmpl })
      .then(
        (formData) => {
          const data = formData as TemplateEditData | null;
          if (!data) return;

          const previousLib = getState().templates.lib;
          dispatch(editUserTmpl(tmpl, data));
          const lib = getState().templates.lib;
          if (tmpl.props.group === 'User Templates' && lib !== previousLib)
            updateLocalStore(lib);
        },
        () => null,
      )
      .then(() =>
        openDialog(dispatch, 'templates').catch((e) => {
          KetcherLogger.error('index.ts::editTmpl', e);
        }),
      );
  };
}

export function deleteUserTmpl(tmpl) {
  return {
    type: 'TMPL_DELETE',
    data: {
      tmpl,
    },
  };
}

export function deleteTmpl(tmpl) {
  return (dispatch, getState) => {
    const lib = getState().templates.lib.filter((value) => value !== tmpl);
    dispatch(deleteUserTmpl(tmpl));
    updateLocalStore(lib);
  };
}

/* SAVE */
export function saveUserTmpl(struct) {
  // TODO: structStr can be not in mol format => structformat.toString ...
  const tmpl = { struct: struct.clone(), props: {} };

  return (dispatch, getState) => {
    openDialog(dispatch, 'attach', { tmpl })
      .then((result) => {
        const { name, attach } = result as {
          name: string;
          attach?: Record<string, unknown>;
        };
        tmpl.struct.name = name.trim();
        tmpl.props = { ...attach, group: 'User Templates' };

        const lib = getState().templates.lib.concat(tmpl);
        dispatch(initLib(lib));
        updateLocalStore(lib);
      })
      .catch((e) => {
        KetcherLogger.error('index.ts::saveUserTmpl', e);
      });
  };
}

function updateLocalStore(lib) {
  const ketSerializer = new KetSerializer();
  const userLib = lib
    .filter((item) => item.props.group === 'User Templates')
    .map((item) => ({
      struct: ketSerializer.serialize(item.struct),
      props: { ...(omit(['group'], item.props) || {}) },
    }));

  storage.setItem('ketcher-tmpls', userLib);
}

/* REDUCER */
export const initTmplsState = {
  lib: [] as Template[],
  selected: null as Template | null,
  filter: '',
  group: null,
  attach: {},
  mode: 'classic',
  tab: 0,
};

const tmplActions = [
  'TMPL_INIT',
  'TMPL_SELECT',
  'TMPL_CHANGE_GROUP',
  'TMPL_CHANGE_FILTER',
  'TMPL_CHANGE_TAB',
];

const attachActions = ['INIT_ATTACH', 'SET_ATTACH_POINTS', 'SET_TMPL_NAME'];

function templatesReducer(state = initTmplsState, action) {
  if (tmplActions.includes(action.type))
    return { ...state, ...(action.data || {}) };

  if (attachActions.includes(action.type)) {
    const attach = { ...state.attach, ...(action.data || {}) };
    return { ...state, attach };
  }

  if (action.type === 'TMPL_EDIT') {
    const { tmpl, name, attach } = action.data as TemplateEditData & {
      tmpl: Template;
    };
    const index = state.lib.indexOf(tmpl);
    const trimmedName = name.trim();
    if (
      index === -1 ||
      (trimmedName === tmpl.struct.name &&
        Object.entries(attach || {}).every(
          ([key, value]) => tmpl.props[key] === value,
        ))
    )
      return state;

    const updated = {
      ...tmpl,
      // Only the name changes; retain the graph and its attachment point IDs.
      struct:
        trimmedName === tmpl.struct.name
          ? tmpl.struct
          : Object.assign(new Struct(), tmpl.struct, { name: trimmedName }),
      props: { ...tmpl.props, ...attach },
    };
    return {
      ...state,
      lib: state.lib.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
      selected: state.selected === tmpl ? updated : state.selected,
    };
  }

  if (action.type === 'TMPL_DELETE') {
    const currentState = { ...state };
    const lib = currentState.lib.filter((value) => value !== action.data.tmpl);
    return { ...currentState, lib };
  }

  return state;
}

export default templatesReducer;
