import { describe, expect, test } from 'vitest';

import { HedgingPolicy } from '@/hedging-policy';

import { willFailTarget, willSucceedTarget } from './mocks';

describe.concurrent('最终成功', () => {
  test('原始请求成功，未触发对冲', async ({ expect }) => {
    expect.assertions(3);

    const targets = [
      willSucceedTarget(1, 500),
      willSucceedTarget(2, 500),
    ];
    const options = { hedgingDelay: 1000 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).resolves.toBe(1);
    expect(targets[0]).toHaveBeenCalled();
    expect(targets[1]).toHaveBeenCalledTimes(0);
  });

  test('原始请求触发对冲后成功', async ({ expect }) => {
    expect.assertions(3);

    const targets = [
      willSucceedTarget(1, 500),
      willSucceedTarget(2, 500),
    ];
    const options = { hedgingDelay: 400 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).resolves.toBe(1);
    expect(targets[0]).toHaveBeenCalled();
    expect(targets[1]).toHaveBeenCalled();
  });

  test('原始请求触发对冲后成功，对冲失败也不影响结果', async ({ expect }) => {
    expect.assertions(3);
    const targets = [
      willSucceedTarget(1, 500),
      willFailTarget(2, 500),
    ];
    const options = { hedgingDelay: 400 };
    const promise = new HedgingPolicy(targets, options).execute();
    await expect(promise).resolves.toBe(1);

    expect(targets[0]).toHaveBeenCalled();
    expect(targets[1]).toHaveBeenCalled();
  });

  test('原始请求报错，对冲请求成功', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willFailTarget(1, 500),
      willSucceedTarget(2, 500),
    ];
    const options = { hedgingDelay: 1000 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).resolves.toBe(2);
  });

  test('原始请求在发出对冲后报错，对冲请求成功', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willFailTarget(1, 500),
      willSucceedTarget(2, 500),
    ];
    const options = { hedgingDelay: 400 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).resolves.toBe(2);
  });

  test('原始请求超时，对冲请求超过对冲时延后成功', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willSucceedTarget(1, 2000),
      willSucceedTarget(2, 500),
    ];
    const options = {
      hedgingDelay: 400,
      timeout: 1000,
    };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).resolves.toBe(2);
  });
});

describe.concurrent('对冲失败', () => {
  test('原始请求报错触发对冲，对冲请求报错', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willFailTarget(1, 250),
      willFailTarget(2, 250),
    ];
    const options = { hedgingDelay: 500 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).rejects.toBe(2);
  });

  test('原始请求发出对冲后报错，对冲请求最后报错', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willFailTarget(1, 500),
      willFailTarget(2, 500),
    ];
    const options = { hedgingDelay: 400 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).rejects.toBe(2);
  });

  test('原始请求最后报错，对冲请求报错', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willFailTarget(1, 1000),
      willFailTarget(2, 250),
    ];
    const options = { hedgingDelay: 400 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).rejects.toBe(1);
  });

  test('超过所有对冲时延后，原始请求和对冲请求都报错', async ({ expect }) => {
    expect.assertions(3);

    const targets = [
      willFailTarget(1, 1000),
      willFailTarget(2, 500),
    ];
    const options = { hedgingDelay: 400 };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).rejects.toBe(1);
    expect(targets[0]).toHaveBeenCalled();
    expect(targets[1]).toHaveBeenCalled();
  });
});

describe.concurrent('options参数测试', () => {
  test('[timeout] 原始请求超时，对冲请求报错', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willSucceedTarget(1, 1000),
      willFailTarget(2, 100),
    ];
    const options = {
      hedgingDelay: 300,
      timeout: 500,
    };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).rejects.toEqual(2);
  });

  test('[timeout] 原始请求和对冲请求都超时', async ({ expect }) => {
    expect.assertions(1);

    const targets = [
      willSucceedTarget(1, 1000),
      willSucceedTarget(2, 1000),
    ];
    const options = {
      hedgingDelay: 400,
      timeout: 500,
    };
    const promise = new HedgingPolicy(targets, options).execute();

    await expect(promise).rejects.toMatchInlineSnapshot('[TimeoutError: timeout of 500ms exceeded]');
  });

  test.each([
    (error: unknown) => error === 1,
    true,
    undefined,
  ])('[retryableError] 可重试的错误: %s', async (retryableError) => {
    const targets = [
      willFailTarget(1, 100),
      willSucceedTarget(2, 100),
    ];
    const promise = new HedgingPolicy(targets, {
      hedgingDelay: 500,
      retryableError,
    }).execute();

    await expect(promise).resolves.toBe(2);
    expect(targets[1]).toHaveBeenCalled();
  });

  test.each([
    (error: unknown) => error !== 1,
    false,
  ])('[retryableError] 不可重试的错误: %s', async (retryableError) => {
    const targets = [
      willFailTarget(1, 100),
      willSucceedTarget(2, 100),
    ];
    const promise = new HedgingPolicy(targets, {
      hedgingDelay: 500,
      retryableError,
    }).execute();

    await expect(promise).rejects.toBe(1);
    expect(targets[1]).toHaveBeenCalledTimes(0);
  });

  test('[retryableError] 超过对冲时延后出现不可重试的报错，最终失败', async () => {
    const targets = [
      willFailTarget(1, 300),
      willFailTarget(2, 300),
      willSucceedTarget(3, 300),
    ];
    const promise = new HedgingPolicy(targets, {
      hedgingDelay: 200,
      retryableError: error => error !== 1,
    }).execute();

    await expect(promise).rejects.toBe(2);
    expect(targets[2]).toHaveBeenCalledTimes(0);
  });

  test('[retryableError] 超过对冲时延后出现不可重试的报错，最终成功', async () => {
    const targets = [
      willFailTarget(1, 300),
      willSucceedTarget(2, 300),
      willSucceedTarget(3, 300),
    ];
    const promise = new HedgingPolicy(targets, {
      hedgingDelay: 200,
      retryableError: error => error !== 1,
    }).execute();

    await expect(promise).resolves.toBe(2);
    expect(targets[2]).toHaveBeenCalledTimes(0);
  });
});
