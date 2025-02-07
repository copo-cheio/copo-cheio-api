import {Entity, model, property} from '@loopback/repository';

@model()
export class SignInV2 extends Entity {

  constructor(data?: Partial<SignInV2>) {
    super(data);
  }
}

export interface SignInV2Relations {
  // describe navigational properties here
}

export type SignInV2WithRelations = SignInV2 & SignInV2Relations;
