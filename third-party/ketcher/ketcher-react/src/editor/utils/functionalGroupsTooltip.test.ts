import { Struct } from 'ketcher-core';
import {
  setFunctionalGroupsTooltip,
  TOOLTIP_DELAY,
  type FunctionalGroupsTooltipContext,
} from './functionalGroupsTooltip';

function createContext() {
  const dispatch = jest.fn();
  const context: FunctionalGroupsTooltipContext = {
    event: { showInfo: { dispatch } },
    findItem: jest.fn().mockReturnValue(null),
    struct: () => new Struct(),
  };

  return { context, dispatch };
}

describe('functional group tooltip timer lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('does not cancel another editor tooltip timer', () => {
    const first = createContext();
    const second = createContext();

    setFunctionalGroupsTooltip({ editor: first.context, isShow: true });
    setFunctionalGroupsTooltip({ editor: second.context, isShow: true });
    setFunctionalGroupsTooltip({ editor: first.context, isShow: false });

    jest.advanceTimersByTime(TOOLTIP_DELAY);

    // Each show hides the current tooltip immediately. Only the second
    // editor's delayed dispatch survives after the first editor is hidden.
    expect(first.dispatch).toHaveBeenCalledTimes(2);
    expect(second.dispatch).toHaveBeenCalledTimes(2);
  });

  it('replaces only the timer belonging to the same editor', () => {
    const first = createContext();
    const second = createContext();

    setFunctionalGroupsTooltip({ editor: first.context, isShow: true });
    setFunctionalGroupsTooltip({ editor: second.context, isShow: true });
    setFunctionalGroupsTooltip({ editor: first.context, isShow: true });

    jest.advanceTimersByTime(TOOLTIP_DELAY);

    expect(first.dispatch).toHaveBeenCalledTimes(3);
    expect(second.dispatch).toHaveBeenCalledTimes(2);
  });
});
