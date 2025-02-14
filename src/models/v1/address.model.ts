import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Country} from './country.model';
import {Region} from './region.model';

/*
{
  "latitude": 38.6447794,
  "longitude": -9.2319014,
  "type": "BAR",
  "address": "R. António Correia nº 1 B",
  "city": "Almada",
  "postal": "2825-291",
  "countryId": "11e0d86d-fd1c-4984-b329-0206ebd36d59",
  "regionId": "c5fe7d21-f49b-49ee-8382-1664bb8afe3d",
  "name": "Warm up club",
  "long_label": " Costa da Caparica",
  "short_label": "string",

}
*/

@model()
export class Address extends Base {
  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  latitude: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  longitude: number;

  @property({
    type: 'string',
    default: 'POI',
  })
  type?: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'string',
    required: true,
  })
  postal: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  long_label?: string;

  @property({
    type: 'string',
  })
  short_label?: string;

  @belongsTo(() => Region)
  regionId: string;

  @belongsTo(() => Country)
  countryId: string;

  constructor(data?: Partial<Address>) {
    super(data);
  }
}

export interface AddressRelations {
  // describe navigational properties here
}

export type AddressWithRelations = Address & AddressRelations;
