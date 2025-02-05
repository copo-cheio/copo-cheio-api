import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import * as bcrypt from 'bcrypt';
/*
 * Fix the service type. Possible options can be:
 * - import {Encryption} from 'your-module';
 * - export type Encryption = string;
 * - export interface Encryption {}
 */
export type Encryption = unknown;

@injectable({scope: BindingScope.TRANSIENT})
export class EncryptionProvider {
  constructor(/* Add @inject to inject parameters */) {}

  value() {
    // Add your implementation here
    throw new Error('To be implemented');
  }

  async hashPassword(password: string, rounds: number = 10): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  async comparePassword(
    providedPass: string,
    storedPass: string,
  ): Promise<boolean> {
    console.log({providedPass, storedPass});
    return bcrypt.compare(providedPass, storedPass);
  }
}
