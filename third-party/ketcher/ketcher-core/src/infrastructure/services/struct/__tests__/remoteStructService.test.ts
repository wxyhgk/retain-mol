import { RemoteStructService } from '../remoteStructService';

describe('RemoteStructService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    Reflect.deleteProperty(globalThis, 'fetch');
  });

  it('preserves a numeric API port when polling recognition status', async () => {
    jest.useFakeTimers();
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ upload_id: 'fixture-1' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          state: 'SUCCESS',
          metadata: { mol_str: 'recognized molfile' },
        }),
      } as Response);
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
    const service = new RemoteStructService('http://127.0.0.1:8099/', {});

    const recognition = service.recognize(
      new Blob(['image'], { type: 'image/png' }),
      'mock-v2',
    );
    await jest.advanceTimersByTimeAsync(300);

    await expect(recognition).resolves.toEqual({
      struct: 'recognized molfile',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://127.0.0.1:8099/imago/uploads/fixture-1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
