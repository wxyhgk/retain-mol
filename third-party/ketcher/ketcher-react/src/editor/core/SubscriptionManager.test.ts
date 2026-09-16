import {
  SubscriptionManager,
  type SubscriptionManagerDependencies,
} from './SubscriptionManager';

const createFixture = () => {
  const localEvent = {
    add: jest.fn(),
    remove: jest.fn(),
  };
  const dependencies: SubscriptionManagerDependencies = {
    addChangeHandler: jest.fn(),
    removeChangeHandler: jest.fn(),
    addLibraryUpdateHandler: jest.fn(),
    removeLibraryUpdateHandler: jest.fn(),
  };
  const manager = new SubscriptionManager(
    { event: { selectionChange: localEvent } },
    dependencies,
  );

  return { dependencies, localEvent, manager };
};

describe('SubscriptionManager', () => {
  it('uses the injected change event and removes the wrapped handler', () => {
    const { dependencies, manager } = createFixture();
    const handler = jest.fn();

    const subscriber = manager.subscribe('change', handler);

    expect(dependencies.addChangeHandler).toHaveBeenCalledWith(
      subscriber.handler,
    );
    expect(subscriber.handler).not.toBe(handler);

    (subscriber.handler as (data?: unknown) => void)(undefined);
    expect(handler).toHaveBeenCalledWith();

    manager.unsubscribe('change', subscriber);
    expect(dependencies.removeChangeHandler).toHaveBeenCalledWith(
      subscriber.handler,
    );
  });

  it('uses the injected library update event without wrapping the handler', () => {
    const { dependencies, manager } = createFixture();
    const handler = jest.fn();

    const subscriber = manager.subscribe('libraryUpdate', handler);
    manager.unsubscribe('libraryUpdate', subscriber);

    expect(subscriber.handler).toBe(handler);
    expect(dependencies.addLibraryUpdateHandler).toHaveBeenCalledWith(handler);
    expect(dependencies.removeLibraryUpdateHandler).toHaveBeenCalledWith(
      handler,
    );
  });

  it('continues to subscribe editor-local events directly', () => {
    const { localEvent, manager } = createFixture();
    const handler = jest.fn();

    const subscriber = manager.subscribe('selectionChange', handler);
    manager.unsubscribe('selectionChange', subscriber);

    expect(localEvent.add).toHaveBeenCalledWith(handler);
    expect(localEvent.remove).toHaveBeenCalledWith(handler);
  });
});
