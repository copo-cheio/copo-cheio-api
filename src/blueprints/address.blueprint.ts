import {IncludeCountryRelation} from './shared/country.include';
import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';
import {IncludeRegionRelation} from './shared/region.include';

export const AddressFullQuery:any = {
  ...QueryFilterBaseBlueprint,

  "fields": {
    "id": true,
    "latitude": true,
    "longitude": true,
    "type": true,
    "address": true,
    "postal": true,
    "name": true,
    "long_label": true,
    "short_label": true,
    countryId:true,
    regionId:true
  },
  "include": [
    IncludeRegionRelation,
    IncludeCountryRelation
  ]
}
