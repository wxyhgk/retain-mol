import { fireEvent, render, screen } from '@testing-library/react';
import { getMacromoleculesUI, initMacromoleculesUI, Icon } from './uiBridge';

const originalUI = getMacromoleculesUI();

afterEach(() => {
  initMacromoleculesUI(originalUI);
});

it('fails explicitly when the host has not supplied UI components', () => {
  jest.isolateModules(() => {
    const bridge =
      jest.requireActual<typeof import('./uiBridge')>('./uiBridge');
    expect(() => bridge.getMacromoleculesUI()).toThrow(
      'Pass `ui` to the macromolecules Editor.',
    );
  });
});

it('renders the host component and preserves its styling and click handler', () => {
  const onClick = jest.fn();
  initMacromoleculesUI({
    ...originalUI,
    Icon: ({ name, className, onClick }) => (
      <button className={className} onClick={onClick}>
        {name}
      </button>
    ),
  });

  render(<Icon name="open" className="host-icon" onClick={onClick} />);

  const button = screen.getByRole('button', { name: 'open' });
  expect(button).toHaveClass('host-icon');
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});
