import { describe, test } from 'vitest';
import { willSucceedTarget } from './mocks';
import { useHedging } from '@/use-hedging';

describe.concurrent('useHedging方法', () => {
  test('正常调用', async ({ expect }) => {
    expect.assertions(3);
    const targets = [
      willSucceedTarget(1, 800),
      willSucceedTarget(2, 200),
    ];
    const hedging = useHedging({ hedgingDelay: 1000 });
    const result = await hedging(targets, {
      hedgingDelay: 300,
    });
    expect(result).toBe(2);
    expect(targets[0]).toHaveBeenCalled();
    expect(targets[1]).toHaveBeenCalled();
  });
});
