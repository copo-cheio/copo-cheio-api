import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AddressRepository, RegionRepository} from '../repositories/v1';

@injectable({scope: BindingScope.TRANSIENT})
export class AddressService {
  constructor(
    @repository(AddressRepository)
    public addressRepository: AddressRepository,
    @repository(RegionRepository)
    public regionRepository: RegionRepository,
  ) {}

  async findById(id: string) {
    return this.addressRepository.findById(id);
  }
  async findOrCreate(
    addressString: string,
    coordinates: any = {lat: 0, lon: 0},
  ) {
    const ptId = '11e0d86d-fd1c-4984-b329-0206ebd36d59';
    let address = await this.addressRepository.findOne({
      where: {long_label: addressString},
    });
    if (!address) {
      const eventAddress = addressString.split(',');
      const addressName = eventAddress[0].trim();
      const addressAddress = eventAddress[1].trim();
      const addressPostal = eventAddress[3].trim();
      let region = await this.regionRepository.findOne({
        where: {name: eventAddress[2].trim()},
      });
      if (!region) {
        region = await this.regionRepository.create({
          name: eventAddress[2].trim(),
          countryId: ptId,
        });
      }
      address = await this.addressRepository.create({
        name: addressName,
        address: addressAddress,
        long_label: Array.isArray(addressString)
          ? addressString.join(',')
          : addressString,
        latitude: Number(coordinates.lat),
        longitude: Number(coordinates.lon),
        countryId: ptId,
        regionId: region.id,
        postal: addressPostal,
      });
    }
    return address;
  }
  /*
   * Add service methods here
   */
}
