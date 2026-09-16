import { Pool } from 'domain/entities/pool';

describe('restored pool IDs', () => {
  it('allocates beyond sparse restored slots without overwriting them', () => {
    const pool = new Pool<string>();
    pool.set(0, 'first');
    pool.set(7, 'last');
    pool.reserveId(7);
    expect(pool.add('next')).toBe(8);
    expect(pool.get(0)).toBe('first');
    expect(pool.get(7)).toBe('last');
  });

  it('retains deleted reservations across clones without lowering the counter', () => {
    const pool = new Pool<string>();
    pool.reserveId(19);
    pool.reserveId(0);
    const copy = pool.clone();
    expect(copy.add('copy')).toBe(20);
    expect(pool.size).toBe(0);
    expect(pool.add('source')).toBe(20);
  });

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])(
    'rejects invalid reservation %s without consuming an ID',
    (id) => {
      const pool = new Pool<string>();
      expect(() => pool.reserveId(id)).toThrow(RangeError);
      expect(pool.add('next')).toBe(0);
    },
  );
});
