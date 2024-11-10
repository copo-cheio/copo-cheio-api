import {hasOne,model,property} from "@loopback/repository";
import {IUser} from "loopback4-soft-delete";
import {Base} from "./base.model";
import {ShoppingCart} from "./shopping-cart.model";

@model()
export class User extends Base implements IUser {
  @property({
    type: "string",
  })
  name: string;

  @property({
    type: "string",
  })
  avatar: string;
  @property({
    type: "string",
  })
  email: string;
  @property({
    type: "string",
  })
  firebaseUserId: string;

  @hasOne(() => ShoppingCart)
  shoppingCart: ShoppingCart;

  @property({
    type: "number",
    required: false,
    postgresql: {
      dataType: "NUMERIC", // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  latitude: number;

  @property({
    type: "number",
    required: false,
    postgresql: {
      dataType: "NUMERIC", // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  longitude: number;

  @property({
    type: "boolean",
    default: false,
  })
  isDeleted?: boolean;

  getIdentifier() {
    return this.id;
  }

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
