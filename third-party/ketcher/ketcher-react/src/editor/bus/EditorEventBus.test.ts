import { EditorEventBus } from './EditorEventBus';

describe('editor event busy boundary', () => {
  it('is busy from primary down through every mouseup subscriber and releases after dispatch', () => {
    const area = document.createElement('div');
    const bus = new EditorEventBus(area);
    const observed: boolean[] = [];
    bus.on('mousedown', () => {
      observed.push(bus.isMoleculeEditBusy);
    });
    bus.on('mouseup', () => {
      observed.push(bus.isMoleculeEditBusy);
    });
    bus.on('mouseup', () => {
      observed.push(bus.isMoleculeEditBusy);
    });
    area.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(bus.isMoleculeEditBusy).toBe(true);
    area.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
    expect(bus.isMoleculeEditBusy).toBe(true);
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
    expect(observed).toEqual([true, true, true]);
    expect(bus.isMoleculeEditBusy).toBe(false);
    bus.destroy();
  });

  it('also guards direct event dispatch and releases after a throwing mouseup handler', () => {
    const bus = new EditorEventBus(document.createElement('div'));
    bus.on('mouseup', () => {
      expect(bus.isMoleculeEditBusy).toBe(true);
      throw new Error('handler failed');
    });
    bus
      .getSubscription('mousedown')
      ?.dispatch(new MouseEvent('mousedown', { button: 0 }));
    expect(() =>
      bus
        .getSubscription('mouseup')
        ?.dispatch(new MouseEvent('mouseup', { button: 0 })),
    ).toThrow('handler failed');
    expect(bus.isMoleculeEditBusy).toBe(false);
    bus.destroy();
  });
});
