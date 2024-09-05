export const IncludeTagsRelation:any = {
  relation: "tags",
  scope:{
    include: [{"relation": "translation"}]
  }
}

export const FilterByTags = (query:any)=>{
  let tags = query?.where?.tags || []
  if(tags.length > 0){
    delete query.where.tags;


    query.where.or = query.where.or || [];
    for(let tag of tags){
      query.where.or.push({tagIds:{like: "%"+tag+"%"}})
    }
  }

  return query
}
