import {IncludeBalconyRelation} from "./balcony.include";
import {IncludePlaceRelation} from "./place.include";
import {IncludePriceRelation} from "./price.include";
import {QueryFilterBaseBlueprint} from "./query-filter.interface";


export const OrderSingleFull: any = {
  ...QueryFilterBaseBlueprint,
  fields: {
    id: true,
    name: true,
    code: true,
    totalPrice: true,
    itemCount: true,
    fees: true,
    status: true,
    userId: true,
    placeId: true,
    balconyId: true,
    priceId: true,
    eventId: true,
    created_at:true
  },
  include: [
    {"relation":"qr"},
    IncludePlaceRelation,
    IncludePriceRelation,
    IncludeBalconyRelation,
    {
      relation: "orderItems",
      scope: {
        include: [
          {
            relation: "productOptions",
            scope: {
              include: [{ relation: "price" }, { relation: "ingredient" }],
            },
          },
          {
            relation: "menuProduct",
            scope: {
              include: [
                {
                  relation: "price",
                  scope: {
                    include: [
                      {
                        relation: "currency",
                      },
                    ],
                  },
                },
                {
                  relation: "product",
                  scope: {
                    include: [
                      {
                        relation: "thumbnail",
                      },
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
};

export const IncludeOrders: any = {
  include: [
    {
      relation: "orders",
      scope: {
        relation: "orderItems",
        scope: {
          include: [
            {
              relation: "productOptions",
              scope: {
                include: [{ relation: "price" }, { relation: "ingredient" }],
              },
            },
            {
              relation: "menuProduct",
              scope: {
                include: [
                  {
                    relation: "price",
                    scope: {
                      include: [
                        {
                          relation: "currency",
                        },
                      ],
                    },
                  },
                  {
                    relation: "product",
                    scope: {
                      include: [
                        {
                          relation: "thumbnail",
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  ],
};
