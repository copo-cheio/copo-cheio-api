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
  Image,
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

import {ImageRepository} from '.';
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

  public readonly qrCode: HasOneRepositoryFactory<
    Image,
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
    @repository.getter('ImageRepository')
    protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(OrderV2, dataSource);
    this.qrCode = this.createHasOneRepositoryFactoryFor(
      'qrCode',
      imageRepositoryGetter,
    );
    this.registerInclusionResolver('qrCode', this.qrCode.inclusionResolver);
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
    order: ['created_at ASC'],
    include: [
      IncludeBalconyRelation,
      IncludePriceRelation,
      {relation: 'user'},
      {relation: 'qrCode'},
      {
        relation: 'orderTimelines',
        scope: {
          include: [{relation: 'staff'}],
          order: ['created_at ASC'],
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
                        {
                          relation: 'tags',
                          scope: {
                            include: [{relation: 'translation'}],
                          },
                        },
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

export const OrderV2Transformers: any = {
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
        //original: item,
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
        qr: item?.qrCode?.url,
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
