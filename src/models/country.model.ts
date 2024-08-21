import {hasMany,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Region} from './region.model';

/*
  {
    "id": "11e0d86d-fd1c-4984-b329-0206ebd36d59",
    "name": "Portugal",
    "code": "PT"
  }
*/
@model()
export class Country extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  code: string;

  @hasMany(() => Region)
  regions: Region[];

  constructor(data?: Partial<Country>) {
    super(data);
  }
}

export interface CountryRelations {
  // describe navigational properties here
}

export type CountryWithRelations = Country & CountryRelations;
