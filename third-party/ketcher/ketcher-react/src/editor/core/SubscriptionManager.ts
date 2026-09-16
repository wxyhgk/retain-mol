import { customOnChangeHandler, type ChangeEventData } from '../utils';

interface SubscriptionManagerContext {
  event: object;
}

type SubscriptionHandler =
  | ((data?: unknown) => void)
  | ((data: ChangeEventData[]) => void);

export interface SubscriptionManagerDependencies {
  addChangeHandler(handler: (action?: unknown) => void): void;
  removeChangeHandler(handler: (action?: unknown) => void): void;
  addLibraryUpdateHandler(handler: SubscriptionHandler): void;
  removeLibraryUpdateHandler(handler: SubscriptionHandler): void;
}

export interface ISubscriptionManager {
  subscribe(
    eventName: string,
    handler: SubscriptionHandler,
  ): {
    handler: SubscriptionHandler;
  };
  unsubscribe(
    eventName: string,
    subscriber: {
      handler: SubscriptionHandler;
    },
  ): void;
}

export class SubscriptionManager implements ISubscriptionManager {
  private readonly editor: SubscriptionManagerContext;
  private readonly dependencies: SubscriptionManagerDependencies;

  constructor(
    editor: SubscriptionManagerContext,
    dependencies: SubscriptionManagerDependencies,
  ) {
    this.editor = editor;
    this.dependencies = dependencies;
  }

  subscribe(eventName: string, handler: SubscriptionHandler) {
    const subscriber: {
      handler: SubscriptionHandler;
    } = {
      handler,
    };

    switch (eventName) {
      case 'change': {
        const subscribeFuncWrapper = (action: unknown) => {
          customOnChangeHandler(
            action as unknown,
            handler as (data?: unknown) => void,
          );
        };
        subscriber.handler = subscribeFuncWrapper;
        this.dependencies.addChangeHandler(subscribeFuncWrapper);
        break;
      }

      case 'libraryUpdate': {
        this.dependencies.addLibraryUpdateHandler(handler);
        break;
      }

      default:
        (this.editor.event as Record<string, { add: (h: unknown) => void }>)[
          eventName
        ].add(handler);
    }

    return subscriber;
  }

  unsubscribe(
    eventName: string,
    subscriber: {
      handler: SubscriptionHandler;
    },
  ): void {
    switch (eventName) {
      case 'change': {
        this.dependencies.removeChangeHandler(
          subscriber.handler as (action?: unknown) => void,
        );
        break;
      }

      case 'libraryUpdate': {
        this.dependencies.removeLibraryUpdateHandler(subscriber.handler);
        break;
      }

      default:
        (this.editor.event as Record<string, { remove: (h: unknown) => void }>)[
          eventName
        ].remove(subscriber.handler as (action?: unknown) => void);
    }
  }
}
