import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';

import {PostgresSqlDataSource} from '../datasources';
import {
  Event,
  OrderDetailsV2,
  OrderItemsV2,
  OrderTimeline,
  OrderV2,
  OrderV2Relations,
  Place,
  Price,
  User,
} from '../models';
import {OrderDetailsV2Repository} from './order-details-v2.repository';

import {BaseRepository} from './base.repository.base';
import {OrderItemsV2Repository} from './order-items-v2.repository';

import {IncludeBalconyRelation} from '../blueprints/shared/balcony.include';
import {IncludeIngredientRelation} from '../blueprints/shared/ingredient.include';
import {IncludePriceRelation} from '../blueprints/shared/price.include';
import {QueryFilterBaseBlueprint} from '../blueprints/shared/query-filter.interface';
import {Balcony} from '../models';
import {BalconyRepository} from './v1/balcony.repository';
import {EventRepository} from './v1/event.repository';
import {OrderTimelineRepository} from './v1/order-timeline.repository';
import {PlaceRepository} from './v1/place.repository';
import {PriceRepository} from './v1/price.repository';
import {UserRepository} from './v1/user.repository';

export class OrderV2Repository extends BaseRepository<
  OrderV2,
  typeof OrderV2.prototype.id,
  OrderV2Relations
> {
  public readonly balcony: BelongsToAccessor<
    Balcony,
    typeof OrderV2.prototype.id
  >;

  public readonly details: HasOneRepositoryFactory<
    OrderDetailsV2,
    typeof OrderV2.prototype.id
  >;

  public readonly user: BelongsToAccessor<User, typeof OrderV2.prototype.id>;

  public readonly userV2: BelongsToAccessor<User, typeof OrderV2.prototype.id>;

  public readonly place: BelongsToAccessor<Place, typeof OrderV2.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof OrderV2.prototype.id>;

  public readonly price: BelongsToAccessor<Price, typeof OrderV2.prototype.id>;

  public readonly items: HasManyRepositoryFactory<
    OrderItemsV2,
    typeof OrderV2.prototype.id
  >;

  public readonly orderTimelines: HasManyRepositoryFactory<
    OrderTimeline,
    typeof OrderV2.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('BalconyRepository')
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @repository.getter('OrderDetailsV2Repository')
    protected orderDetailsV2RepositoryGetter: Getter<OrderDetailsV2Repository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('PlaceRepository')
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter('EventRepository')
    protected eventRepositoryGetter: Getter<EventRepository>,
    @repository.getter('PriceRepository')
    protected priceRepositoryGetter: Getter<PriceRepository>,
    @repository.getter('OrderItemsV2Repository')
    protected orderItemsV2RepositoryGetter: Getter<OrderItemsV2Repository>,
    @repository.getter('OrderTimelineRepository')
    protected orderTimelineRepositoryGetter: Getter<OrderTimelineRepository>,
  ) {
    super(OrderV2, dataSource);
    this.orderTimelines = this.createHasManyRepositoryFactoryFor(
      'orderTimelines',
      orderTimelineRepositoryGetter,
    );
    this.registerInclusionResolver(
      'orderTimelines',
      this.orderTimelines.inclusionResolver,
    );
    this.items = this.createHasManyRepositoryFactoryFor(
      'items',
      orderItemsV2RepositoryGetter,
    );
    this.registerInclusionResolver('items', this.items.inclusionResolver);
    this.price = this.createBelongsToAccessorFor(
      'price',
      priceRepositoryGetter,
    );
    this.registerInclusionResolver('price', this.price.inclusionResolver);
    this.event = this.createBelongsToAccessorFor(
      'event',
      eventRepositoryGetter,
    );
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.place = this.createBelongsToAccessorFor(
      'place',
      placeRepositoryGetter,
    );
    this.registerInclusionResolver('place', this.place.inclusionResolver);

    this.userV2 = this.createBelongsToAccessorFor(
      'userV2',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('userV2', this.userV2.inclusionResolver);

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);

    this.details = this.createHasOneRepositoryFactoryFor(
      'details',
      orderDetailsV2RepositoryGetter,
    );
    this.registerInclusionResolver('details', this.details.inclusionResolver);

    this.balcony = this.createBelongsToAccessorFor(
      'balcony',
      balconyRepositoryGetter,
    );
    this.registerInclusionResolver('balcony', this.balcony.inclusionResolver);
  }
}

export const OrderV2Queries: any = {
  full: {
    ...QueryFilterBaseBlueprint,
    include: [
      IncludeBalconyRelation,
      IncludePriceRelation,
      {relation: 'user'},
      {
        relation: 'orderTimelines',
        scope: {
          include: [{relation: 'staff'}],
        },
      },
      {relation: 'userV2'},
      {relation: 'details'},
      {
        relation: 'items',
        scope: {
          include: [
            {
              relation: 'options',
              scope: {
                include: [{relation: 'price'}, IncludeIngredientRelation],
              },
            },
            {
              relation: 'menuProduct',
              scope: {
                include: [
                  {relation: 'price'},
                  {
                    relation: 'product',
                    scope: {
                      include: [
                        {relation: 'thumbnail'},
                        {
                          relation: 'ingredients',
                          scope: {
                            include: [
                              {
                                relation: 'ingredient',
                                scope: {
                                  include: [{relation: 'thumbnail'}],
                                },
                              },
                            ],
                          },
                        },
                        {relation: 'tags'},
                        //IncludeIngredientRelation
                        //IncludePriceRelation,
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
};

const _input = {
  balcony: {
    id: '09f763fa-eea6-48b1-bb6b-fd8cfd69b069',
    created_at: '2024-10-05T02:18:53.743Z',
    updated_at: '2025-02-10T03:23:35.871Z',
    name: 'Balcony #2',
    description:
      'balcão de teste #2 , supostamente devia ter aqui instruções para dar com ele xxxxxxxx',
    placeId: 'adc41def-3c60-4995-8365-f2a8a1990f96',
    coverId: 'd0f32b18-cd2b-48bd-8184-ba6fcdbb278a',
    menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
    cover: {
      deleted: false,
      deletedOn: null,
      deletedBy: null,
      id: 'd0f32b18-cd2b-48bd-8184-ba6fcdbb278a',
      created_at: '2024-10-05T02:30:08.706Z',
      updated_at: '2024-10-05T02:30:08.707Z',
      url: 'https://minio-server-xqnl.onrender.com/copo-cheio/e018c019-9719-4885-807e-4c378ee01f8e-image.jpeg',
      type: 'cover',
      refId: '09f763fa-eea6-48b1-bb6b-fd8cfd69b069',
      description: null,
      orderId: null,
    },
  },
  details: {
    id: 'af877213-37f8-4316-a275-f407dc0c5d84',
    created_at: '2025-02-14T02:14:36.618Z',
    updated_at: '2025-02-14T02:14:36.618Z',
    productCount: 2,
    productsPrice: '5',
    serviceFee: '0.4',
    totalPrice: '5.4',
    orderV2Id: '3bd4949d-3b92-41c7-9b03-3d3bc8e427d5',
  },
  user: {
    id: '6e6fcbef-886c-486e-8e15-f4ac5e234b5c',
    created_at: null,
    updated_at: null,
    name: 'Filipe Sá',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocLmDH7RUnhFFlwB5GPsV9WdSaJXdfP50-kuVk1bvH4bJwfuPjY=s96-c',
    email: 'pihh.rocks@gmail.com',
    firebaseUserId: 'o7KsXv5p00dVSbSQZJY5MWmLLky1',
    latitude: '38.5061227',
    longitude: '-9.1559587',
    isDeleted: false,
  },
  userV2: {
    id: '6e6fcbef-886c-486e-8e15-f4ac5e234b5c',
    created_at: null,
    updated_at: null,
    name: 'Filipe Sá',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocLmDH7RUnhFFlwB5GPsV9WdSaJXdfP50-kuVk1bvH4bJwfuPjY=s96-c',
    email: 'pihh.rocks@gmail.com',
    firebaseUserId: 'o7KsXv5p00dVSbSQZJY5MWmLLky1',
    latitude: '38.5061227',
    longitude: '-9.1559587',
    isDeleted: false,
  },
  price: {
    id: 'd346c909-7fdc-4fa7-b88d-953a6b35e503',
    created_at: '2025-02-14T02:14:36.513Z',
    updated_at: '2025-02-14T02:14:36.513Z',
    price: '5.40',
    currencyId: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
    currency: {
      deleted: false,
      deletedOn: null,
      deletedBy: null,
      id: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
      created_at: '2024-08-23T00:00:00.000Z',
      updated_at: '2024-08-23T00:00:00.000Z',
      currency: 'EUR',
      symbol: '€',
      name: 'euro',
    },
  },
  items: [
    {
      id: '46a3f94c-47c2-4a77-9e3a-c5c51a06afbd',
      created_at: '2025-02-14T02:14:36.724Z',
      updated_at: '2025-02-14T02:14:36.724Z',
      basePrice: '2.5',
      calculatedPrice: '2.5',
      orderV2Id: '3bd4949d-3b92-41c7-9b03-3d3bc8e427d5',
      menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
      optionIds: [],
      options: [],
      menuProduct: {
        deleted: false,
        deletedOn: null,
        deletedBy: null,
        id: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
        created_at: '2024-10-15T10:41:08.870Z',
        updated_at: '2024-10-15T10:41:08.870Z',
        menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
        thumbnailId: '64829554-6ad4-4f27-b192-1680eea924fb',
        priceId: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
        productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
        product: {
          deleted: false,
          deletedOn: null,
          deletedBy: null,
          id: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
          created_at: '2024-10-15T10:39:07.481Z',
          updated_at: '2024-10-15T10:39:07.481Z',
          name: '7up',
          description: 'copo, 33cl',
          customizable: null,
          tagIds: ['328470a0-8502-4e0b-90d0-7dcc40ef6237'],
          thumbnailId: 'e6269185-c5d2-4775-af7e-f0e584575820',
          tags: [
            {
              deleted: false,
              deletedOn: null,
              deletedBy: null,
              id: '328470a0-8502-4e0b-90d0-7dcc40ef6237',
              created_at: '2024-10-15T10:40:00.351Z',
              updated_at: '2024-10-15T10:40:00.351Z',
              name: 'beverages',
              type: 'product-category',
              translationId: 'c6f63082-f890-4f8c-8249-98a936e14f16',
            },
          ],
          thumbnail: {
            deleted: false,
            deletedOn: null,
            deletedBy: null,
            id: 'e6269185-c5d2-4775-af7e-f0e584575820',
            created_at: '2024-10-15T10:40:29.866Z',
            updated_at: '2024-10-15T10:40:29.868Z',
            url: 'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
            type: 'cover',
            refId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
            description: null,
            orderId: null,
          },
          ingredients: [
            {
              deleted: false,
              deletedOn: null,
              deletedBy: null,
              id: '5ba8fcaf-d9fc-4055-b957-00bf3cf68a13',
              created_at: '2024-11-26T15:26:27.302Z',
              updated_at: '2024-11-26T15:26:27.302Z',
              isOptional: true,
              optionType: 'string',
              optionDefaultValue: 'string',
              cost: '0',
              productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
              ingredientId: '086d056f-2c83-4d49-ab41-2a87abf9e852',
              ingredient: {
                deleted: false,
                deletedOn: null,
                deletedBy: null,
                id: '086d056f-2c83-4d49-ab41-2a87abf9e852',
                created_at: '2024-09-06T08:49:58.833Z',
                updated_at: '2024-09-06T08:49:58.833Z',
                name: '7up',
                description: 'lata, 33cl',
                thumbnailId: 'd4cca4c5-ed4b-470b-88d7-375f4d48f2ee',
                tagIds: ['a0f7aebb-0503-4d3f-bb27-0ba4429527f0'],
                thumbnail: {
                  deleted: false,
                  deletedOn: null,
                  deletedBy: null,
                  id: 'd4cca4c5-ed4b-470b-88d7-375f4d48f2ee',
                  created_at: '2024-10-11T11:49:10.148Z',
                  updated_at: '2024-10-11T11:49:10.150Z',
                  url: 'https://minio-server-xqnl.onrender.com/copo-cheio/8fa24274-a3db-4f86-9b1c-635ab323cd27-image.jpeg',
                  type: 'thumbnail',
                  refId: '086d056f-2c83-4d49-ab41-2a87abf9e852',
                  description: null,
                  orderId: null,
                },
              },
            },
          ],
        },
      },
    },
    {
      id: '4a2045a1-ce3c-4c3a-b016-2d085cb801cc',
      created_at: '2025-02-14T02:14:36.671Z',
      updated_at: '2025-02-14T02:14:36.671Z',
      basePrice: '2.5',
      calculatedPrice: '2.5',
      orderV2Id: '3bd4949d-3b92-41c7-9b03-3d3bc8e427d5',
      menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
      optionIds: [],
      options: [],
      menuProduct: {
        deleted: false,
        deletedOn: null,
        deletedBy: null,
        id: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
        created_at: '2024-10-15T10:41:08.870Z',
        updated_at: '2024-10-15T10:41:08.870Z',
        menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
        thumbnailId: '64829554-6ad4-4f27-b192-1680eea924fb',
        priceId: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
        productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
        product: {
          deleted: false,
          deletedOn: null,
          deletedBy: null,
          id: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
          created_at: '2024-10-15T10:39:07.481Z',
          updated_at: '2024-10-15T10:39:07.481Z',
          name: '7up',
          description: 'copo, 33cl',
          customizable: null,
          tagIds: ['328470a0-8502-4e0b-90d0-7dcc40ef6237'],
          thumbnailId: 'e6269185-c5d2-4775-af7e-f0e584575820',
          tags: [
            {
              deleted: false,
              deletedOn: null,
              deletedBy: null,
              id: '328470a0-8502-4e0b-90d0-7dcc40ef6237',
              created_at: '2024-10-15T10:40:00.351Z',
              updated_at: '2024-10-15T10:40:00.351Z',
              name: 'beverages',
              type: 'product-category',
              translationId: 'c6f63082-f890-4f8c-8249-98a936e14f16',
            },
          ],
          thumbnail: {
            deleted: false,
            deletedOn: null,
            deletedBy: null,
            id: 'e6269185-c5d2-4775-af7e-f0e584575820',
            created_at: '2024-10-15T10:40:29.866Z',
            updated_at: '2024-10-15T10:40:29.868Z',
            url: 'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
            type: 'cover',
            refId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
            description: null,
            orderId: null,
          },
          ingredients: [
            {
              deleted: false,
              deletedOn: null,
              deletedBy: null,
              id: '5ba8fcaf-d9fc-4055-b957-00bf3cf68a13',
              created_at: '2024-11-26T15:26:27.302Z',
              updated_at: '2024-11-26T15:26:27.302Z',
              isOptional: true,
              optionType: 'string',
              optionDefaultValue: 'string',
              cost: '0',
              productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
              ingredientId: '086d056f-2c83-4d49-ab41-2a87abf9e852',
              ingredient: {
                deleted: false,
                deletedOn: null,
                deletedBy: null,
                id: '086d056f-2c83-4d49-ab41-2a87abf9e852',
                created_at: '2024-09-06T08:49:58.833Z',
                updated_at: '2024-09-06T08:49:58.833Z',
                name: '7up',
                description: 'lata, 33cl',
                thumbnailId: 'd4cca4c5-ed4b-470b-88d7-375f4d48f2ee',
                tagIds: ['a0f7aebb-0503-4d3f-bb27-0ba4429527f0'],
                thumbnail: {
                  deleted: false,
                  deletedOn: null,
                  deletedBy: null,
                  id: 'd4cca4c5-ed4b-470b-88d7-375f4d48f2ee',
                  created_at: '2024-10-11T11:49:10.148Z',
                  updated_at: '2024-10-11T11:49:10.150Z',
                  url: 'https://minio-server-xqnl.onrender.com/copo-cheio/8fa24274-a3db-4f86-9b1c-635ab323cd27-image.jpeg',
                  type: 'thumbnail',
                  refId: '086d056f-2c83-4d49-ab41-2a87abf9e852',
                  description: null,
                  orderId: null,
                },
              },
            },
          ],
        },
      },
    },
  ],
  orderTimelines: [
    {
      id: '41a2769e-91d7-4f23-818c-b82c79cf8bc5',
      created_at: '2025-02-14T02:14:36.851Z',
      updated_at: '2025-02-14T02:14:36.851Z',
      orderId: null,
      action: 'WAITING_PAYMENT',
      title: 'WAITING_PAYMENT',
      staffId: '6e6fcbef-886c-486e-8e15-f4ac5e234b5c',
      orderV2Id: '3bd4949d-3b92-41c7-9b03-3d3bc8e427d5',
      timelineKey: 'WAITING_PAYMENT',
    },
    {
      id: '5b6a012e-1c37-4831-8f3b-2cc141ad0f53',
      created_at: '2025-02-14T02:14:43.849Z',
      updated_at: '2025-02-14T02:14:43.849Z',
      orderId: null,
      action: 'ONHOLD',
      title: 'ONHOLD',
      staffId: '6e6fcbef-886c-486e-8e15-f4ac5e234b5c',
      orderV2Id: '3bd4949d-3b92-41c7-9b03-3d3bc8e427d5',
      timelineKey: 'ONHOLD',
    },
  ],
  id: '3bd4949d-3b92-41c7-9b03-3d3bc8e427d5',
  created_at: '2025-02-14T02:14:36.566Z',
  updated_at: '2025-02-14T02:14:36.566Z',
  status: 'ONHOLD',
  code: null,
  balconyId: '09f763fa-eea6-48b1-bb6b-fd8cfd69b069',
  userId: '6e6fcbef-886c-486e-8e15-f4ac5e234b5c',
  userUid: 'o7KsXv5p00dVSbSQZJY5MWmLLky1',
  placeId: 'adc41def-3c60-4995-8365-f2a8a1990f96',
  eventId: null,
  priceId: 'd346c909-7fdc-4fa7-b88d-953a6b35e503',
};
const _output = {
  active: true,
  placeId: 'adc41def-3c60-4995-8365-f2a8a1990f96',
  balconyId: '09f763fa-eea6-48b1-bb6b-fd8cfd69b069',
  userId: 'o7KsXv5p00dVSbSQZJY5MWmLLky1',
  status: 'ONHOLD',
  items: [
    {
      menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
      items: [
        {
          menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
          menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
          thumbnailId: '64829554-6ad4-4f27-b192-1680eea924fb',
          priceId: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
          productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
          currencyId: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
          available: true,
          price: {
            id: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
            price: '2.50',
            currency: '€',
          },
          product: {
            name: '7up',
            description: 'copo, 33cl',
            cover:
              'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
          },
          options: [],
          ingredients: [
            {
              id: '5ba8fcaf-d9fc-4055-b957-00bf3cf68a13',
              available: true,
            },
          ],
          tags: [
            {
              id: '328470a0-8502-4e0b-90d0-7dcc40ef6237',
              name: 'beverages',
              title: 'beverages',
              type: 'product-category',
              translation: {
                id: 'c6f63082-f890-4f8c-8249-98a936e14f16',
                created_at: '2024-10-15T10:39:58.511Z',
                updated_at: '2024-10-15T10:39:58.511Z',
                code: 'beverages',
                pt: 'refrigerantes',
                en: 'beverages',
                live: true,
              },
            },
          ],
          tagIds: ['328470a0-8502-4e0b-90d0-7dcc40ef6237'],
          group: 'beverages',
          calculatedPrice: 2.5,
          selectedOptions: [],
        },
        {
          menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
          menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
          thumbnailId: '64829554-6ad4-4f27-b192-1680eea924fb',
          priceId: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
          productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
          currencyId: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
          available: true,
          price: {
            id: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
            price: '2.50',
            currency: '€',
          },
          product: {
            name: '7up',
            description: 'copo, 33cl',
            cover:
              'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
          },
          options: [],
          ingredients: [
            {
              id: '5ba8fcaf-d9fc-4055-b957-00bf3cf68a13',
              available: true,
            },
          ],
          tags: [
            {
              id: '328470a0-8502-4e0b-90d0-7dcc40ef6237',
              name: 'beverages',
              title: 'beverages',
              type: 'product-category',
              translation: {
                id: 'c6f63082-f890-4f8c-8249-98a936e14f16',
                created_at: '2024-10-15T10:39:58.511Z',
                updated_at: '2024-10-15T10:39:58.511Z',
                code: 'beverages',
                pt: 'refrigerantes',
                en: 'beverages',
                live: true,
              },
            },
          ],
          tagIds: ['328470a0-8502-4e0b-90d0-7dcc40ef6237'],
          group: 'beverages',
          calculatedPrice: 2.5,
          selectedOptions: [],
        },
      ],
      itemCount: 2,
      name: '7up',
      cover:
        'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
      description: 'copo, 33cl',
      totalPrice: 5,
    },
  ],
  itemMap: {
    'a9ffa832-37b0-4b99-900b-398a0bf8088e': {
      menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
      items: [
        {
          menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
          menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
          thumbnailId: '64829554-6ad4-4f27-b192-1680eea924fb',
          priceId: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
          productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
          currencyId: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
          available: true,
          price: {
            id: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
            price: '2.50',
            currency: '€',
          },
          product: {
            name: '7up',
            description: 'copo, 33cl',
            cover:
              'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
          },
          options: [],
          ingredients: [
            {
              id: '5ba8fcaf-d9fc-4055-b957-00bf3cf68a13',
              available: true,
            },
          ],
          tags: [
            {
              id: '328470a0-8502-4e0b-90d0-7dcc40ef6237',
              name: 'beverages',
              title: 'beverages',
              type: 'product-category',
              translation: {
                id: 'c6f63082-f890-4f8c-8249-98a936e14f16',
                created_at: '2024-10-15T10:39:58.511Z',
                updated_at: '2024-10-15T10:39:58.511Z',
                code: 'beverages',
                pt: 'refrigerantes',
                en: 'beverages',
                live: true,
              },
            },
          ],
          tagIds: ['328470a0-8502-4e0b-90d0-7dcc40ef6237'],
          group: 'beverages',
          calculatedPrice: 2.5,
          selectedOptions: [],
        },
        {
          menuProductId: 'a9ffa832-37b0-4b99-900b-398a0bf8088e',
          menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
          thumbnailId: '64829554-6ad4-4f27-b192-1680eea924fb',
          priceId: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
          productId: 'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
          currencyId: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
          available: true,
          price: {
            id: 'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
            price: '2.50',
            currency: '€',
          },
          product: {
            name: '7up',
            description: 'copo, 33cl',
            cover:
              'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
          },
          options: [],
          ingredients: [
            {
              id: '5ba8fcaf-d9fc-4055-b957-00bf3cf68a13',
              available: true,
            },
          ],
          tags: [
            {
              id: '328470a0-8502-4e0b-90d0-7dcc40ef6237',
              name: 'beverages',
              title: 'beverages',
              type: 'product-category',
              translation: {
                id: 'c6f63082-f890-4f8c-8249-98a936e14f16',
                created_at: '2024-10-15T10:39:58.511Z',
                updated_at: '2024-10-15T10:39:58.511Z',
                code: 'beverages',
                pt: 'refrigerantes',
                en: 'beverages',
                live: true,
              },
            },
          ],
          tagIds: ['328470a0-8502-4e0b-90d0-7dcc40ef6237'],
          group: 'beverages',
          calculatedPrice: 2.5,
          selectedOptions: [],
        },
      ],
      itemCount: 2,
      name: '7up',
      cover:
        'https://minio-server-xqnl.onrender.com/copo-cheio/8365f1c1-5b2f-4ade-9855-5ac769bafd75-image.jpeg',
      description: 'copo, 33cl',
      totalPrice: 5,
    },
  },
  timeline: [
    {
      id: '12ab87d2-73ff-4a79-872c-89390b4cde84',
      created_at: '2024-11-12T19:25:34.975Z',
      updated_at: '2024-11-12T19:25:34.975Z',
      orderId: 'e2e127e8-ff5c-4d88-81fa-20cbffb2c997',
      action: 'ONHOLD',
      title: 'ONHOLD',
      staffId: 'e5ed35ae-f951-4a70-a129-e298a92c07cc',
      timelineKey: 'ONHOLD',
      staff: {
        deleted: false,
        deletedOn: null,
        deletedBy: null,
        id: 'e5ed35ae-f951-4a70-a129-e298a92c07cc',
        created_at: '2024-09-30T04:30:23.982Z',
        updated_at: '2024-09-30T04:30:23.982Z',
        name: 'Filipe',
        avatar:
          'https://lh3.googleusercontent.com/a/ACg8ocI-GCGkmacL9DIKSmik1s-asg3Tib0F62HU4s0VfbmmgFwA9g=s96-c',
        email: 'pihh.backup@gmail.com',
        firebaseUserId: 'IrU8vmqxK8R9qcp1EP2Yl4Ddvx92',
        latitude: '38.5061208',
        longitude: '-9.1559578',
        isDeleted: false,
      },
      balcony: '',
      message: 'Your order is on the line.',
      href: '/balcony/09f763fa-eea6-48b1-bb6b-fd8cfd69b069',
    },
  ],
  order: {
    id: 'e2e127e8-ff5c-4d88-81fa-20cbffb2c997',
    productCount: 2,
    productsPrice: 5,
    serviceFee: 0.4,
    totalPrice: 5.4,
    order: {
      timeline: [],
    },
  },
  id: 'e2e127e8-ff5c-4d88-81fa-20cbffb2c997',
  orderId: 'e2e127e8-ff5c-4d88-81fa-20cbffb2c997',
  created_at: '2025-02-14T02:14:36.730Z',
};

export const Orderv2Transformers: any = {
  full: (data: any = {}) => {
    const transformer = (item: any = {}) => {
      const timeline = item?.orderTimelines || [];
      const itemMap: any = {};

      for (const i of item.items) {
        if (!itemMap[i.menuProductId]) {
          itemMap[i.menuProductId] = {
            menuProductId: i.menuProductId,
            itemCount: 0,
            name: i.menuProduct.product.name,
            cover: i.menuProduct.product.thumbnail.url,
            description: i.menuProduct.product.description,
            totalPrice: 0,
            items: [],
          };
        }
        itemMap[i.menuProductId].itemCount++;
        const price = parseFloat(i.menuProduct.price.price).toFixed(2);
        let calculatedPrice: any = price;
        const options = i.options || [];
        const selectedOptions = [];
        for (const option of options) {
          if (option?.price?.price) {
            calculatedPrice =
              parseFloat(calculatedPrice) + parseFloat(option.price.price);
            calculatedPrice = calculatedPrice.toFixed(2);
          }
          option.ingredient = {
            ...option.ingredient,
            title: option.ingredient.name,
          };
          selectedOptions.push(option);
        }
        itemMap[i.menuProductId].totalPrice =
          parseFloat(itemMap[i.menuProductId].totalPrice) +
          parseFloat(calculatedPrice);
        itemMap[i.menuProductId].totalPrice =
          itemMap[i.menuProductId].totalPrice.toFixed(2);
        itemMap[i.menuProductId].items.push({
          menuProductId: i.menuProductId,
          menuId: '2803cf91-2311-4ca9-8991-c0f145086442',
          thumbnailId: i.menuProduct.product?.thumbnailId, //'64829554-6ad4-4f27-b192-1680eea924fb',
          priceId: i.menuProduct.priceId, //'e5f5499a-424d-4402-bfe5-d3b6a5efcbc0',
          productId: i.menuProduct.productId, //'a66c6897-bd27-41c7-8c09-3a159a5dc1b8',
          currencyId: i.menuProduct.price?.currencyId, //'bc6635ea-7273-4518-b18a-c066fb300b1f',
          available: true,
          price: {
            id: i.menuProduct.price.id,
            price: parseFloat(i.menuProduct.price.price).toFixed(2),
            currency: '€',
          },
          product: {
            name: i.menuProduct.product.name,
            description: i.menuProduct.product.description,
            cover: i.menuProduct.product.thumbnail.url,
          },
          options: selectedOptions,
          selectedOptions: selectedOptions,
          ingredients: i.menuProduct.product.ingredients.map(
            (ingredient: any) => {
              return {
                ...ingredient,
                ...ingredient.ingredient,
                title: ingredient.ingredient.title,
              };
            },
          ),
          tags: i.menuProduct.product.tags,
          tagIds: i.menuProduct.product.tagIds,
          group: i.menuProduct.product.tags[0].name,
          calculatedPrice: calculatedPrice,
        });
      }

      return {
        original: item,
        active: true,
        placeId: item.placeId,
        balconyId: item.balconyId,
        userId: item.userId,
        status: item.status,
        id: item.id,
        orderId: item.id,
        created_at: item.created_at,
        items: Object.values(itemMap),
        itemMap,
        timeline: timeline.map((t: any) => {
          return {
            id: t.id,
            created_at: t.created_at,
            updated_at: t.updated_at,
            orderId: null,
            action: t.action,
            title: t.title,
            staffId: '6e6fcbef-886c-486e-8e15-f4ac5e234b5c',
            orderV2Id: t.orderV2id,
            timelineKey: t.timelineKey,
            staff: {
              id: t.staff.id,
              name: t.staff.name,
              avatar: t.staff.avatar,
            },
          };
        }),

        order: {
          id: item.details.id,
          orderId: item.details.orderV2Id,
          orderV2Id: item.details.orderV2Id,
          productCount: parseInt(item.details.productCount),
          productsPrice: parseFloat(item.details.productsPrice).toFixed(2),
          serviceFee: parseFloat(item.details.serviceFee).toFixed(2),
          totalPrice: parseFloat(item.details.totalPrice).toFixed(2),
          order: {
            timeline: [],
          },
        },
      };
    };

    return Array.isArray(data) ? data.map(transformer) : transformer(data);
  },
};
