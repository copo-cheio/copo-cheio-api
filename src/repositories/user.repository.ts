import {Getter,inject} from '@loopback/core';
import {HasOneRepositoryFactory,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {ShoppingCart,User,UserRelations} from '../models';
import {BaseRepository} from './base.repository.base';
import {ShoppingCartRepository} from './shopping-cart.repository';

export class UserRepository extends BaseRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly shoppingCart: HasOneRepositoryFactory<ShoppingCart, typeof User.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('ShoppingCartRepository') protected shoppingCartRepositoryGetter: Getter<ShoppingCartRepository>,
    // @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    // protected readonly getCurrentUser?: Getter<User | undefined>,
  ) {


    super(User, dataSource);
    this.shoppingCart = this.createHasOneRepositoryFactoryFor('shoppingCart', shoppingCartRepositoryGetter);
    this.registerInclusionResolver('shoppingCart', this.shoppingCart.inclusionResolver);
  }
}


/*
    "deleted": false,
    "deletedOn": null,
    "deletedBy": null,
    "name": "Filipe",
    "avatar": "https://lh3.googleusercontent.com/a/ACg8ocI-GCGkmacL9DIKSmik1s-asg3Tib0F62HU4s0VfbmmgFwA9g=s96-c",
    "email": "pihh.backup@gmail.com",
    "firebaseUserId": "IrU8vmqxK8R9qcp1EP2Yl4Ddvx92",
    "id": "e5ed35ae-f951-4a70-a129-e298a92c07cc",
    "created_at": "2024-09-30T04:30:23.982Z",
    "updated_at": "2024-09-30T04:30:23.982Z",
    "isDeleted": false
    */
