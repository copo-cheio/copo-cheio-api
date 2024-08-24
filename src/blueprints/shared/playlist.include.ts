import {IncludeTagsRelation} from "./tag.include";

export const IncludePlaylistRelation: any = {
  relation: "playlist",
  scope: {
    include: [
      {
        relation: "songs",
        scope: {
          include: [
            { relation: "artist" },
            { relation: "thumbnail" },

          ],
        },
      },
      IncludeTagsRelation
    ],
  },
};
