import { HedgingPolicy } from './hedging-policy';
import type { AsyncFunction, IHedgingOptions } from './types';

/**
 * 对冲策略方法
 *
 * @example
 * // 单种请求重试对冲样例
 * const result = await hedging(() => fetch('https://example.com/apis/getData'));
 *
 * @example
 * // 多种请求重试对冲样例
 * const result = await hedging([
 *   () => fetch('https://example.com/apis/getData'),
 *   () => fetch('https://example.com/backup-apis/getData'),
 * ]);
 */
export function hedging<T extends AsyncFunction>(
  target: T[] | T,
  options: IHedgingOptions = {},
): Promise<ReturnType<T>> {
  return new HedgingPolicy(target, options).execute();
}
