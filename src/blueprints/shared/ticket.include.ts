export const IncludeTicketsRelation:any = {
  relation: "tickets",
  scope: {
    include:[{
      relation: "price",
      scope:{
        include: "currency"
      }
    }]
  }
}
