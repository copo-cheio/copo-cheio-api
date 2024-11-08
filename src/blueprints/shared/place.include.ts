import {IncludeAddressRelation} from './address.include';
import {IncludeCover} from './image.include';
import {IncludeTagsRelation} from './tag.include';

export const IncludePlaceRelation: any = {
  relation: "place",
  scope: {
    include: [IncludeCover,IncludeTagsRelation,IncludeAddressRelation],
  },
};
export const IncludePlacesRelation: any = {
  relation: "places",
  scope: {
    include: [IncludeCover,IncludeTagsRelation,IncludeAddressRelation],
  },
};
