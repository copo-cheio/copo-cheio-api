import {model} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Ingredient extends Base {

  constructor(data?: Partial<Ingredient>) {
    super(data);
  }
}

export interface IngredientRelations {
  // describe navigational properties here
}

export type IngredientWithRelations = Ingredient & IngredientRelations;
