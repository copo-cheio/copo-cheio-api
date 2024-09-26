import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Order,OrderRelations, CartItem, User, Place, Image, Event, Balcony, OrderItem, Price, OrderTimeline} from '../models';
import {CartItemRepository} from './cart-item.repository';
import {UserRepository} from './user.repository';
import {PlaceRepository} from './place.repository';
import {ImageRepository} from './image.repository';
import {EventRepository} from './event.repository';
import {BalconyRepository} from './balcony.repository';
import {OrderItemRepository} from './order-item.repository';
import {PriceRepository} from './price.repository';
import {OrderTimelineRepository} from './order-timeline.repository';

export class OrderRepository extends DefaultCrudRepository<
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
