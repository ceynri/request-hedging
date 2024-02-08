type PromiseResult<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

export function allSettled<T>(promises: Promise<T>[]): Promise<PromiseResult<T>[]> {
  return new Promise((resolve) => {
    const results: PromiseResult<T>[] = [];
    let completed = 0;

    const handleSettled = (index: number, status: 'fulfilled' | 'rejected', value?: T, reason?: unknown) => {
      if (status === 'fulfilled' && value !== undefined) {
        results[index] = { status, value };
      } else if (status === 'rejected' && reason !== undefined) {
        results[index] = { status, reason };
      }
      completed += 1;

      if (completed === promises.length) {
        resolve(results);
      }
    };

    promises.forEach((promise, index) => {
      promise
        .then((value) => handleSettled(index, 'fulfilled', value))
        .catch((reason) => handleSettled(index, 'rejected', undefined, reason));
    });

    if (promises.length === 0) {
      resolve(results);
    }
  });
}
