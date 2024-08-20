import { Entity, model, property } from "@loopback/repository";
import { v4 as uuid } from "uuid";
@model()
export class BaseModel extends Entity {
  @property({
    type: "string",
    id: true,
    default: () => uuid(),
    generated: false,
    required: true,
  })
  id: string;

  constructor(data?: Partial<BaseModel>) {
    super(data);
  }
}

export interface BaseModelRelations {
  // describe navigational properties here
}

export type BaseModelWithRelations = BaseModel & BaseModelRelations;
