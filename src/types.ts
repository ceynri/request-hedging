export type AsyncFunction = (...args: unknown[]) => Promise<unknown>;

/**
 * 对冲策略配置选项
 */
export interface IHedgingOptions {
  /** 对冲子请求的最大数量 */
  maxAttempts?: number;
  /** 对冲延迟时间 */
  hedgingDelay?: number;
  /** 超时时间 */
  timeout?: number;
  /** 报错时，判断是否为可重试的错误 */
  retryableError?: boolean | ((error: unknown) => boolean);
}
