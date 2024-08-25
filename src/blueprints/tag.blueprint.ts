
export const TagQueryFull: any = {
  // ...QueryFilterBaseBlueprint,
  fields: {
    id: true,
    name: true,
    type: true,
    translationId: true,
  },
  include: [
    {
      relation: "translation",
      scope: {
        fields: {
          id: true,
          pt: true,
          en: true,
        },
      },
    },
  ],
};
