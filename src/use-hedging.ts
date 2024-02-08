import { HedgingPolicy } from './hedging-policy';
import type { AsyncFunction, IHedgingOptions } from './types';

/**
 * 对冲策略方法
 *
 * @example
 * // 单种请求重试对冲样例
 * const hedging = useHedging({
 *   maxAttempts: 3, // 最多尝试请求 3 次
 *   hedgingDelay: 1000,
 * });
 * const result = await hedging(() => fetch('https://example.com/apis/getData'));
 *
 * @example
 * // 多种请求重试对冲样例
 * const hedging = useHedging({ hedgingDelay: 1000 });
 * const result = await hedging([
 *   () => fetch('https://example.com/apis/getData'),
 *   () => fetch('https://example.com/backup-apis/getData'),
 * ]);
 */
export function useHedging(initOptions: IHedgingOptions = {}) {
  return function<T extends AsyncFunction> (
    target: T[] | T,
    tempOptions: IHedgingOptions = {},
  ): Promise<ReturnType<T>> {
    const options = { ...initOptions, ...tempOptions };
    return new HedgingPolicy(target, options).execute();
  };
}
