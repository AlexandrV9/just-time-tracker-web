// // 4. RetryStrategy (Стратегия повторов)

// class RetryStrategy {
//   private maxAttempts: number;
//   private baseDelay: number;

//   async executeWithRetry<T>(
//     operation: () => Promise<T>,
//     context: RetryContext
//   ): Promise<T> {
//     for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
//       try {
//         return await operation();
//       } catch (error) {
//         if (this.shouldRetry(error, attempt)) {
//           await this.delay(this.getBackoffDelay(attempt));
//           continue;
//         }
//         throw error;
//       }
//     }
//   }

//   private getBackoffDelay(attempt: number): number {
//     return Math.min(this.baseDelay * Math.pow(2, attempt), 30000);
//   }
// }
