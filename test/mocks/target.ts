import { Mock, vi } from 'vitest';

export function willSucceedTarget<T>(result: T, time: number): Mock<[], Promise<T>> {
  return vi.fn(() => new Promise((resolve) => {
    setTimeout(() => resolve(result), time);
  }));
}

export function willFailTarget<T>(error: T, time: number): Mock<[], Promise<never>> {
  return vi.fn(() => new Promise((_, reject) => {
    setTimeout(() => reject(error), time);
  }));
}
