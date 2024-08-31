import {injectable, /* inject, */ BindingScope, Provider} from '@loopback/core';

/*
 * Fix the service type. Possible options can be:
 * - import {User} from 'your-module';
 * - export type User = string;
 * - export interface User {}
 */
export type User = unknown;

@injectable({scope: BindingScope.TRANSIENT})
export class UserProvider implements Provider<User> {
  constructor(/* Add @inject to inject parameters */) {}

  value() {
    // Add your implementation here
    throw new Error('To be implemented');
  }
}
