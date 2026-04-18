/**
 * API Retry Utility
 * Implements exponential backoff for failed requests
 */

interface RetryOptions {
  retries?: number;
  delay?: number;
  factor?: number;
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { retries = 3, delay = 1000, factor = 2 } = options;
  let currentDelay = delay;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      console.warn(`Attempt ${i + 1} failed. Retrying in ${currentDelay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= factor;
    }
  }

  throw new Error('Retry failed');
};
