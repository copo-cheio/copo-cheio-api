import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {
  Balcony,
  CheckInV2,
  CheckInV2Relations,
  Event,
  OrderV2,
  Place,
  PlaceInstance,
  User,
} from '../models';
import {BaseRepository} from './base.repository.base';
import {
  OrderV2Queries,
  OrderV2Repository,
  OrderV2Transformers,
} from './order-v2.repository';
import {BalconyRepository} from './v1/balcony.repository';
import {EventRepository} from './v1/event.repository';
import {PlaceInstanceRepository} from './v1/place-instance.repository';
import {PlaceRepository} from './v1/place.repository';
import {UserRepository} from './v1/user.repository';

export class CheckInV2Repository extends BaseRepository<
  CheckInV2,
  typeof CheckInV2.prototype.id,
  CheckInV2Relations
> {
  public readonly user: BelongsToAccessor<User, typeof CheckInV2.prototype.id>;

  public readonly balcony: BelongsToAccessor<
    Balcony,
    typeof CheckInV2.prototype.id
  >;

  public readonly event: BelongsToAccessor<
    Event,
    typeof CheckInV2.prototype.id
  >;

  public readonly place: BelongsToAccessor<
    Place,
    typeof CheckInV2.prototype.id
  >;

  public readonly orderV2: BelongsToAccessor<
    OrderV2,
    typeof CheckInV2.prototype.id
  >;

  public readonly placeInstance: BelongsToAccessor<
    PlaceInstance,
    typeof CheckInV2.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('BalconyRepository')
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @repository.getter('EventRepository')
    protected eventRepositoryGetter: Getter<EventRepository>,
    @repository.getter('PlaceRepository')
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter('OrderV2Repository')
    protected orderV2RepositoryGetter: Getter<OrderV2Repository>,
    @repository.getter('PlaceInstanceRepository')
    protected placeInstanceRepositoryGetter: Getter<PlaceInstanceRepository>,
  ) {
    super(CheckInV2, dataSource);
    this.placeInstance = this.createBelongsToAccessorFor(
      'placeInstance',
      placeInstanceRepositoryGetter,
    );
    this.registerInclusionResolver(
      'placeInstance',
      this.placeInstance.inclusionResolver,
    );
    this.orderV2 = this.createBelongsToAccessorFor(
      'orderV2',
      orderV2RepositoryGetter,
    );
    this.registerInclusionResolver('orderV2', this.orderV2.inclusionResolver);
    this.place = this.createBelongsToAccessorFor(
      'place',
      placeRepositoryGetter,
    );
    this.registerInclusionResolver('place', this.place.inclusionResolver);
    this.event = this.createBelongsToAccessorFor(
      'event',
      eventRepositoryGetter,
    );
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.balcony = this.createBelongsToAccessorFor(
      'balcony',
      balconyRepositoryGetter,
    );
    this.registerInclusionResolver('balcony', this.balcony.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }

  async findUserCheckIn(userId) {
    return this.findOne({where: {and: [{userId, app: 'user', active: true}]}});
  }
  async findUserCheckWithInOrder(userId) {
    const checkIn = await this.findUserCheckIn(userId);
    if (checkIn && checkIn?.orderV2Id) {
      const response = await this.findById(
        checkIn.id,
        CheckInV2Queries.userOnCheckInOrder(checkIn.placeInstanceId),
      );
      return CheckInV2Transformers.order(response);
    }
    return checkIn;
  }

  async findStaffCheckIn(userId) {
    return this.findOne({where: {and: [{userId, app: 'staff', active: true}]}});
  }
  async findManagerCheckIn(userId) {
    return this.findOne({where: {and: [{userId, app: 'admin', active: true}]}});
  }
}

export const CheckInV2Queries: any = {
  order: {
    include: [{relation: 'orderV2', scope: OrderV2Queries.full}],
  },
  userOnCheckInOrder(placeInstanceId: string) {
    return {
      include: [
        {
          relation: 'orderV2',
          scope: {
            ...OrderV2Queries.full,
            where: {...OrderV2Queries.where, placeInstanceId},
          },
        },
      ],
    };
  },
};

export const CheckInV2Transformers: any = {
  order: (data: any = {}) => {
    const transformer = (item: any = {}) => {
      return {
        ...item,
        order: item?.orderV2 ? OrderV2Transformers.full(item.orderV2) : null,
      };
    };
    return Array.isArray(data) ? data.map(transformer) : transformer(data);
  },
};
