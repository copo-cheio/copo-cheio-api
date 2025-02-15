import {model, property} from '@loopback/repository';
import {Base} from '.';

/*
[
  {
    "id": "c7082619-a902-4682-8b48-68ad59c33e3c",
    "url": "http://placehold.it.com",
    "type": "cover",
    "refId": "a813bc90-d422-4d60-aa48-1e7d6c69ae8e",
    "description":"Default cover"
  },
  {
    "id": "64829554-6ad4-4f27-b192-1680eea924fb",
    "url": "https://placehold.it",
    "type": "cover",
    "refId": "bd3d4c7c-858d-4990-8d98-cda21bc3424a",
    "description":"Default thumbnail"
  }
]
*/
@model()
export class Image extends Base {
  @property({
    type: 'string',
    required: true,
    default: 'a813bc90-d422-4d60-aa48-1e7d6c69ae8e',
  })
  url: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
  })
  refId: string;

  @property({
    type: 'string',
    required: false,
  })
  description: string;

  @property({
    type: 'string',
  })
  orderId?: string;

  @property({
    type: 'string',
  })
  orderV2Id?: string;

  constructor(data?: Partial<Image>) {
    super(data);
  }
}

export interface ImageRelations {
  // describe navigational properties here
}

export type ImageWithRelations = Image & ImageRelations;
