import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,HasManyRepositoryFactory,HasOneRepositoryFactory,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Balcony,CartItem,Event,Image,Order,OrderItem,OrderRelations,OrderTimeline,Place,Price,User} from '../models';
import {BalconyRepository} from './balcony.repository';
import {CartItemRepository} from './cart-item.repository';
import {EventRepository} from './event.repository';
import {ImageRepository} from './image.repository';
import {OrderItemRepository} from './order-item.repository';
import {OrderTimelineRepository} from './order-timeline.repository';
import {PlaceRepository} from './place.repository';
import {PriceRepository} from './price.repository';
import {UserRepository} from './user.repository';

export class OrderRepository extends SoftCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {

  public readonly cartItems: HasManyRepositoryFactory<CartItem, typeof Order.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof Order.prototype.id>;

  public readonly place: BelongsToAccessor<Place, typeof Order.prototype.id>;

  public readonly qr: HasOneRepositoryFactory<Image, typeof Order.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof Order.prototype.id>;

  public readonly balcony: BelongsToAccessor<Balcony, typeof Order.prototype.id>;

  public readonly orderItems: HasManyRepositoryFactory<OrderItem, typeof Order.prototype.id>;

  public readonly price: BelongsToAccessor<Price, typeof Order.prototype.id>;

  public readonly orderTimelines: HasManyRepositoryFactory<OrderTimeline, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('CartItemRepository') protected cartItemRepositoryGetter: Getter<CartItemRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('PlaceRepository') protected placeRepositoryGetter: Getter<PlaceRepository>, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>, @repository.getter('BalconyRepository') protected balconyRepositoryGetter: Getter<BalconyRepository>, @repository.getter('OrderItemRepository') protected orderItemRepositoryGetter: Getter<OrderItemRepository>, @repository.getter('PriceRepository') protected priceRepositoryGetter: Getter<PriceRepository>, @repository.getter('OrderTimelineRepository') protected orderTimelineRepositoryGetter: Getter<OrderTimelineRepository>,
  ) {
    super(Order, dataSource);
    this.orderTimelines = this.createHasManyRepositoryFactoryFor('orderTimelines', orderTimelineRepositoryGetter,);
    this.registerInclusionResolver('orderTimelines', this.orderTimelines.inclusionResolver);
    this.price = this.createBelongsToAccessorFor('price', priceRepositoryGetter,);
    this.registerInclusionResolver('price', this.price.inclusionResolver);
    this.orderItems = this.createHasManyRepositoryFactoryFor('orderItems', orderItemRepositoryGetter,);
    this.registerInclusionResolver('orderItems', this.orderItems.inclusionResolver);
    this.balcony = this.createBelongsToAccessorFor('balcony', balconyRepositoryGetter,);
    this.registerInclusionResolver('balcony', this.balcony.inclusionResolver);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.qr = this.createHasOneRepositoryFactoryFor('qr', imageRepositoryGetter);
    this.registerInclusionResolver('qr', this.qr.inclusionResolver);
    this.place = this.createBelongsToAccessorFor('place', placeRepositoryGetter,);
    this.registerInclusionResolver('place', this.place.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.cartItems = this.createHasManyRepositoryFactoryFor('cartItems', cartItemRepositoryGetter,);
    this.registerInclusionResolver('cartItems', this.cartItems.inclusionResolver);
  }
}
