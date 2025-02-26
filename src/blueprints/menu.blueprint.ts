import {IncludePriceRelation} from './shared/price.include';
import {IncludeProductRelation} from './shared/product.include';
import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';

export const MenuFullQuery: any = {
  ...QueryFilterBaseBlueprint,
  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
  },
  include: [
    {
      relation: 'products',
      scope: {
        where: {
          deleted: false,
        },
        include: [IncludePriceRelation, IncludeProductRelation],
      },
    },
  ],
};
