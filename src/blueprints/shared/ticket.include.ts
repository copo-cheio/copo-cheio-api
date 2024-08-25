import {IncludePriceRelation} from './price.include';

export const IncludeTicketsRelation:any = {
  relation: "tickets",
  scope: {
    include:[IncludePriceRelation]
  }
}
