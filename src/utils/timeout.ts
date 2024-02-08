/**
 * 暂停函数（超过时间自动 resolve）
 * @param timeout 单位 ms
 */
export function pending(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), timeout);
  });
}

/**
 * 超时错误
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}
