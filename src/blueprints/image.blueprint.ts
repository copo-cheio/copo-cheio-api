export const DefaultImage = {
  cover: "00000000-0000-0000-0000-000000000001",
  thumbnail: "00000000-0000-0000-0000-000000000002",
}


export const ImageBelongsToTransformer = (record:any, type: 'cover' | "thumbnail" ="cover")=>{
  let key = type+"Id"
  let value = record?.[key]
  let valid = typeof value == "string" && value.indexOf('-') >-1;
  console.log({value,valid,record})
  if(!valid){
    record[key] = DefaultImage[type]
  }

  delete record.cover;

  return record;
}
