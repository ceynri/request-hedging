import { hedging } from '@/hedging';
import { describe, test } from 'vitest';
import { willSucceedTarget } from './mocks';

describe.concurrent('hedging方法', () => {
  test('正常调用', async ({ expect }) => {
    expect.assertions(3);
    const targets = [
      willSucceedTarget(1, 800),
      willSucceedTarget(2, 200),
    ];
    const options = { hedgingDelay: 300 };
    const result = await hedging(targets, options);
    expect(result).toBe(2);
    expect(targets[0]).toHaveBeenCalled();
    expect(targets[1]).toHaveBeenCalled();
  });
});
