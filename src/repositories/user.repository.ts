import {Getter,inject} from '@loopback/core';
import {HasManyRepositoryFactory,HasOneRepositoryFactory,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Favorite,ShoppingCart,User,UserRelations} from '../models';
import {BaseRepository} from './base.repository.base';
import {FavoriteRepository} from './favorite.repository';
import {ShoppingCartRepository} from './shopping-cart.repository';

export class UserRepository extends BaseRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly shoppingCart: HasOneRepositoryFactory<ShoppingCart, typeof User.prototype.id>;

  public readonly favorites: HasManyRepositoryFactory<Favorite, typeof User.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('ShoppingCartRepository') protected shoppingCartRepositoryGetter: Getter<ShoppingCartRepository>, @repository.getter('FavoriteRepository') protected favoriteRepositoryGetter: Getter<FavoriteRepository>,
    // @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    // protected readonly getCurrentUser?: Getter<User | undefined>,
  ) {


    super(User, dataSource);
    this.favorites = this.createHasManyRepositoryFactoryFor('favorites', favoriteRepositoryGetter,);
    this.registerInclusionResolver('favorites', this.favorites.inclusionResolver);
    this.shoppingCart = this.createHasOneRepositoryFactoryFor('shoppingCart', shoppingCartRepositoryGetter);
    this.registerInclusionResolver('shoppingCart', this.shoppingCart.inclusionResolver);
  }

  async getFavorites(userId:string){
    let favorites:any = await this.favorites(userId).find()


    let result:any = {
      events:[],
      places:[]
    }
    for(let i =0; i < favorites.length; i++){
      let fav:any = favorites[i]
      let id:any = fav.eventId || fav.placeId
      if(fav.eventId && result.events.indexOf(id) ==-1) result.events.push(id)
      if(fav.placeId && result.places.indexOf(id) ==-1) result.places.push(id)
    }

    return result
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
