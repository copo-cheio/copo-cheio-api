export const IncludeAddressRelation: any = {
  relation: "address",
  scope: {
    include: [{ relation: "region" }, { relation: "country" }],
  },
};
