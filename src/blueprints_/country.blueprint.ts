export const CountryQueryFull: any = {
  fields: {
    id: true,
    name: true,
    code: true,
  },
  include: [
    {
      relation: "regions",
      scope: {
        fields: {
          id: true,
          name: true,
        },
      },
    },
  ],
};
