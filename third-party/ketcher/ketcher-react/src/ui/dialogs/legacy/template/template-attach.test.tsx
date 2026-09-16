import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import modalReducer from '../../../state/modal';
import templatesReducer from '../../../state/templates';
import { initLib } from '../../../state/templates/init-lib';
import TemplateAttach from './template-attach';

const mockKetcher = { editor: {}, addEditor: jest.fn() };

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  ketcherProvider: { getKetcher: () => mockKetcher },
}));

jest.mock('../../../components', () => ({
  Dialog: jest.requireActual('src/components/Dialog').Dialog,
  StructEditor: ({ onAttachEdit }) => (
    <button
      type="button"
      onClick={() => onAttachEdit({ atomid: 1, bondid: 1 })}
    >
      Select second attachment
    </button>
  ),
}));

function makeTemplate(name: string) {
  const struct = new Struct();
  struct.name = name;
  for (let i = 0; i < 3; i++) {
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(i, 0) }));
  }
  struct.bonds.add(new Bond({ begin: 0, end: 1, type: 1 }));
  struct.bonds.add(new Bond({ begin: 1, end: 2, type: 1 }));
  return { struct, props: { group: 'User Templates', atomid: 0, bondid: 0 } };
}

function setup(mode: 'save' | 'edit' = 'edit') {
  const original = makeTemplate('Original');
  const other = makeTemplate('Other');
  const tmpl =
    mode === 'edit' ? original : { struct: original.struct, props: {} };
  const store = createStore(
    combineReducers({
      templates: templatesReducer,
      modal: modalReducer,
      options: (state = { settings: {} }) => state,
    }),
  );
  store.dispatch(initLib([original, other]));
  store.dispatch({ type: 'MODAL_OPEN', data: { name: 'attach' } });
  const onOk = jest.fn();
  const onCancel = jest.fn();
  const view = render(
    <Provider store={store}>
      <TemplateAttach
        tmpl={tmpl}
        ketcherId="template-attach-test"
        onOk={onOk}
        onCancel={onCancel}
      />
    </Provider>,
  );
  return { ...view, onOk, onCancel, original };
}

describe('Template attachment name validation', () => {
  it('allows changing attachment points while keeping the original name', () => {
    const { onOk, original } = setup();

    fireEvent.click(
      screen.getByRole('button', { name: 'Select second attachment' }),
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onOk).toHaveBeenCalledWith({
      name: 'Original',
      attach: { atomid: 1, bondid: 1 },
    });
    expect(original.props).toEqual({
      group: 'User Templates',
      atomid: 0,
      bondid: 0,
    });
  });

  it.each(['Other', '  Other  ', '   '])(
    'rejects the invalid name %p',
    (name) => {
      setup();
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: name },
      });
      expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
    },
  );

  it('allows surrounding whitespace around its own name', () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '  Original  ' },
    });
    expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled();
  });

  it('does not exclude an existing template when saving a new one', () => {
    setup('save');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('cancels without submitting edits and restores the main editor on unmount', () => {
    const { onOk, onCancel, unmount } = setup();
    fireEvent.click(
      screen.getByRole('button', { name: 'Select second attachment' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOk).not.toHaveBeenCalled();
    unmount();
    expect(mockKetcher.addEditor).toHaveBeenCalledWith(mockKetcher.editor);
  });
});
