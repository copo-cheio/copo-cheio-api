import {IncludeCountryRelation} from './shared/country.include';
import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';
import {IncludeRegionRelation} from './shared/region.include';

export const DefaultAddress = {
  place: "00000000-0000-0000-0000-000000000003",
  event: "00000000-0000-0000-0000-000000000003",
  region:"00000000-0000-0000-0000-000000000004",
  country:"00000000-0000-0000-0000-000000000005",
}



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



export const AddressBelongsToTransformer = (record:any, type:"place"|"event")=>{
  let key = "addressId"
  let value = record?.[key]
  let valid = typeof value == "string" && value.indexOf('-') >-1;
  if(!valid){
    record[key] = DefaultAddress[type]
  }
  return record;
}
