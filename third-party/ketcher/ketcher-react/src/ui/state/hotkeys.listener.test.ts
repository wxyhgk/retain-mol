import { initKeydownListener, removeKeydownListener } from './hotkeys';

const firstDispatch = jest.fn();
const secondDispatch = jest.fn();
const firstGetState = jest.fn();
const secondGetState = jest.fn();

describe('keydown listener lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps listeners for different editor elements isolated', () => {
    const firstElement = document.createElement('div');
    const secondElement = document.createElement('div');
    const firstRemoveSpy = jest.spyOn(firstElement, 'removeEventListener');
    const secondRemoveSpy = jest.spyOn(secondElement, 'removeEventListener');

    initKeydownListener(firstElement)(firstDispatch, firstGetState);
    initKeydownListener(secondElement)(secondDispatch, secondGetState);
    removeKeydownListener(firstElement)(firstDispatch, firstGetState);

    expect(firstRemoveSpy).toHaveBeenCalledTimes(1);
    expect(secondRemoveSpy).not.toHaveBeenCalled();

    removeKeydownListener(secondElement)(secondDispatch, secondGetState);

    expect(secondRemoveSpy).toHaveBeenCalledTimes(1);
  });

  it('replaces a previous listener when the same element is initialized again', () => {
    const element = document.createElement('div');
    const addSpy = jest.spyOn(element, 'addEventListener');
    const removeSpy = jest.spyOn(element, 'removeEventListener');

    initKeydownListener(element)(firstDispatch, firstGetState);
    const firstListener = addSpy.mock.calls[0][1];

    initKeydownListener(element)(firstDispatch, firstGetState);
    const secondListener = addSpy.mock.calls[1][1];

    expect(firstListener).not.toBe(secondListener);
    expect(removeSpy).toHaveBeenNthCalledWith(1, 'keydown', firstListener);

    removeKeydownListener(element)(firstDispatch, firstGetState);
    removeKeydownListener(element)(firstDispatch, firstGetState);

    expect(removeSpy).toHaveBeenCalledTimes(2);
    expect(removeSpy).toHaveBeenNthCalledWith(2, 'keydown', secondListener);
  });

  it('does not remove another editor listener sharing the same element', () => {
    const element = document.createElement('div');
    const addSpy = jest.spyOn(element, 'addEventListener');
    const removeSpy = jest.spyOn(element, 'removeEventListener');

    initKeydownListener(element)(firstDispatch, firstGetState);
    initKeydownListener(element)(secondDispatch, secondGetState);
    const firstListener = addSpy.mock.calls[0][1];
    const secondListener = addSpy.mock.calls[1][1];

    removeKeydownListener(element)(firstDispatch, firstGetState);

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith('keydown', firstListener);
    expect(removeSpy).not.toHaveBeenCalledWith('keydown', secondListener);

    removeKeydownListener(element)(secondDispatch, secondGetState);

    expect(removeSpy).toHaveBeenCalledTimes(2);
    expect(removeSpy).toHaveBeenLastCalledWith('keydown', secondListener);
  });
});
