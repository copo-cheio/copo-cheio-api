import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {IsolationLevel} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';

@injectable({scope: BindingScope.TRANSIENT})
export class TransactionService {
  constructor(
    @inject('datasources.PostgresSql') public dataSource: PostgresSqlDataSource,
  ) {}

  /**
   * Executes a function within a transaction.
   * @param fn The function to execute within the transaction.
   * @returns The result of the function if successful, otherwise rolls back.
   */
  async execute<T>(fn: (transaction: any) => Promise<T>): Promise<T> {
    const tx = await this.dataSource.beginTransaction({
      isolationLevel: IsolationLevel.READ_COMMITTED,
    });

    try {
      const result = await fn(tx);
      await tx.commit(); // Commit transaction if successful
      return result;
    } catch (error) {
      await tx.rollback(); // Rollback on error
      throw error;
    }
  }
}
