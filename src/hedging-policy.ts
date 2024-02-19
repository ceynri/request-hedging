import { pending, TimeoutError, allSettled } from './utils';
import { DEFAULT_HEDGING_DELAY, MIN_ATTEMPTS, NO_ERROR } from './const';
import type { AsyncFunction, IHedgingOptions } from './types';

/**
 * 对冲策略
 */
export class HedgingPolicy<T extends AsyncFunction> {
  /** 执行目标函数列表 */
  private targets: T[] = [];

  /** 最大尝试次数 */
  private maxAttempts = MIN_ATTEMPTS;

  /** 对冲延迟时间 */
  private hedgingDelay = DEFAULT_HEDGING_DELAY;

  /** 超时时间 */
  private timeout = 0;

  /** 超时定时器 */
  private timer: NodeJS.Timeout | number = 0;

  /** 请求 Promise */
  private promise: Promise<ReturnType<T>>;

  /** 子请求 Promise 队列 */
  private subPromises: Promise<unknown>[] = [];

  /** 已尝试次数 */
  private attempts = 0;

  /** 是否已经获得结果 */
  private done = false;

  /** 错误结果 */
  private errorResult: unknown = NO_ERROR;

  constructor(
    target: T[] | T,
    options: IHedgingOptions = {},
  ) {
    this.handleParams(target, options);
    this.promise = new Promise((resolve, reject) => {
      this.succeed = (...args) => {
        this.done = true;
        clearTimeout(this.timer);
        resolve(...args);
      };
      this.fail = (...args) => {
        this.done = true;
        clearTimeout(this.timer);
        reject(...args);
      };
    });
  }

  /**
   * 执行策略
   */
  public async execute(): Promise<ReturnType<T>> {
    this.main();
    this.setTimeoutTimer();
    return this.promise;
  }

  /** 判断是否为可重试的错误（默认都可重试） */
  private isRetryableError: (error: unknown) => boolean = () => true;

  /** 返回结果 */
  private succeed: (value: ReturnType<T>) => void = () => {};

  /** 抛出错误 */
  private fail: (err: unknown) => unknown = () => {};

  /**
   * 执行对冲策略的主要逻辑
   */
  private async main() {
    const subPromise = this.executeTarget(this.attempts);
    this.subPromises.push(subPromise);
    // 在限制时间内执行目标函数
    await Promise.race([
      subPromise,
      pending(this.hedgingDelay),
    ]);
    // 已完成，直接结束
    if (this.done) {
      return;
    }
    // 检查尝试次数
    this.attempts += 1;
    if (
      this.attempts < this.maxAttempts
      && this.isRetryableError(this.errorResult)
    ) {
      this.main();
      return;
    }
    // 不可继续尝试，则等待所有正在处理的 promise 结束
    await allSettled(this.subPromises);
    if (!this.done) {
      this.fail(this.errorResult);
    }
  }

  /**
   * 执行目标函数
   * @param index 执行次数的下标
   * @returns 执行是否成功返回
   */
  private async executeTarget(index: number) {
    try {
      const target = this.targets[index % this.targets.length];
      const result = await target() as ReturnType<T>;
      if (!this.done) {
        this.succeed(result);
      }
    } catch (error) {
      // 暂存错误结果
      this.errorResult = error;
    }
  }

  /**
   * 设置超时定时限制
   */
  private setTimeoutTimer() {
    // 无 timeout 选项，不处理超时
    if (!this.timeout) {
      return;
    }
    this.timer = setTimeout(() => {
      if (this.hasErrorResult()) {
        this.fail(this.errorResult);
        return;
      }
      this.fail(new TimeoutError(`timeout of ${this.timeout}ms exceeded`));
    }, this.timeout);
  }

  /**
   * 处理策略配置选项，检查参数合法性
   */
  private handleParams(target: T[] | T, options: IHedgingOptions) {
    this.targets = Array.isArray(target) ? target : [target];
    if (this.targets.some((target) => typeof target !== 'function')) {
      throw new TypeError('hedging target must be a function or an array of function');
    }

    this.maxAttempts = (
      typeof options.maxAttempts === 'number'
        ? options.maxAttempts
        // 默认次数正好执行完目标函数队列。最少也会尝试 MIN_ATTEMPTS 次
        : Math.max(this.targets.length, MIN_ATTEMPTS)
    );

    this.hedgingDelay = options.hedgingDelay ?? DEFAULT_HEDGING_DELAY;

    this.timeout = options.timeout ?? 0;

    if (options.retryableError !== undefined) {
      this.isRetryableError = (error: unknown) => {
        // 当前没报错，可继续对冲
        if (!this.hasErrorResult()) {
          return true;
        }
        // 有报错，根据配置决定是否可继续对冲
        if (typeof options.retryableError === 'function') {
          return options.retryableError(error);
        }
        return !!options.retryableError;
      };
    }
  }

  /**
   * 是否存在错误结果
   */
  private hasErrorResult() {
    return this.errorResult !== NO_ERROR;
  }
}
