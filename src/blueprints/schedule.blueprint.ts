import {belongsToTransformer} from '../shared/database';

export const DefaultSchedule = {
  once: "00000000-0000-0000-0000-000000000011",
  repeat: "00000000-0000-0000-0000-000000000012",
  lineup:"00000000-0000-0000-0000-00000000013",

}


/*
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
export const AddressBelongsToTransformer = (record:any, type:"place"|"event")=>{
  let key = "addresssId"
  let value = record?.[key]
  let valid = typeof value == "string" && value.indexOf('-') >-1;
  if(!valid){
    record[key] = DefaultAddress[type]
  }
  return record;
}

*/

export const ScheduleBelongsToTransformer = (record:any, type:"once"|"repeat" |"lineup" ="once")=>{
  record = belongsToTransformer(record, type,"scheduleId",DefaultSchedule);
  delete record.schedule;
  return record;
}
