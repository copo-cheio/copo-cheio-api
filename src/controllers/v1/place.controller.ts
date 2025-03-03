import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {PlaceQueryFull, PlacesQuery} from '../../blueprints/place.blueprint';
import {ExtendQueryFilterWhere} from '../../blueprints/shared/query-filter.interface';
import {FilterByTags} from '../../blueprints/shared/tag.include';
import {Place} from '../../models';
import {
  ContactsRepository,
  OpeningHoursRepository,
  PlaceRepository,
  PlaylistRepository,
} from '../../repositories';
import {ManagerService} from '../../services/manager-service.service';
import {PlaceService} from '../../services/place.service';
export class PlaceController {
  constructor(
    @inject('services.PlaceService')
    protected placeService: PlaceService,
    @inject('services.ManagerService')
    protected managerService: ManagerService,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(OpeningHoursRepository)
    public openingHourRepository: OpeningHoursRepository,
    @repository(ContactsRepository)
    public contactsRepository: ContactsRepository,
    @repository(PlaylistRepository)
    public playlistRepository: PlaylistRepository,
  ) {}

  @get('/places/nearby')
  async findNearbyPlaces(
    @param.query.number('lat') lat: number,
    @param.query.number('lon') lon: number,
  ) {
    const results = await this.placeRepository.findByDistance(
      lat || 0,
      lon || 0,
    );

    const _filter = {
      ...PlacesQuery,
      where: {
        or: results.map((r: any) => {
          return {id: r.id};
        }),
      },
      // sort:["distance DESC"]
    };

    return this.placeRepository.find(_filter);
  }

  @get('/places/current-event/{id}')
  @response(200, {
    description: 'Place model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Place, {includeRelations: true}),
      },
    },
  })
  async findCurrentEvent(
    @param.path.string('id') id: string,
    @param.filter(Place, {exclude: 'where'})
    filter?: FilterExcludingWhere<Place>,
  ): Promise<any> {
    return this.placeService.findCurrentEvent(id);
  }

  @post('/places')
  @response(200, {
    description: 'Place model instance',
    content: {'application/json': {schema: getModelSchemaRef(Place)}},
  })
  async create(
    @requestBody({
      content: {
        // "application/json": {
        //   schema: getModelSchemaRef(Place, {
        //     title: "NewPlace",
        //     exclude: ["id", "updated_at", "created_at"],
        //   }),
        // },
      },
    })
    place: any,
  ): Promise<any> {
    const transaction = await this.placeRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE,
    );
    try {
      const openingHours = place?.openingHours || [];
      const contacts = place.contacts || {};
      if (!place.addressId) throw 'Address required';
      place.coverId = place.coverId || '00000000-0000-0000-0000-000000000001';
      // const coverId = place.coverId || "";
      // const playlist = place.playlist || {};
      // const address = place.address || {};
      delete place.contacts;
      delete place.openingHours;
      delete place.playlist;
      delete place.cover;
      delete place.address;
      if (!place.playlistId) {
        const playlistRecord = await this.playlistRepository.create({
          name: place.name + ' playlist',
          tagIds: [],
        });
        place.playlistId = playlistRecord.id;
      }

      const record: any = await this.placeRepository.create(place);
      const openHourInstances = [];
      for (const openingHour of openingHours || []) {
        openHourInstances.push({
          dayofweek: openingHour.dayofweek,
          openhour: openingHour.openhour,
          closehour: openingHour.closehour,
          placeId: record.id,
          active: openingHour.open || openingHour.active || false,
        });
        await this.openingHourRepository.create({
          dayofweek: openingHour.dayofweek,
          openhour: openingHour.openhour,
          closehour: openingHour.closehour,
          placeId: record.id,
          active: openingHour.open || openingHour.active || false,
        });
      }
      const placeContactsPayload: any = {
        email: contacts?.email || '',
        phone: contacts?.phone || '',
        website: contacts?.website || '',
        social_facebook: contacts?.social_facebook || '',
        social_instagram: contacts?.social_instagram || '',
        social_threads: contacts?.social_threads,
        refId: record.id,
      };
      await this.contactsRepository.create(placeContactsPayload);
      await this.placeService.updatePlaceOpeningHours(
        record.id,
        openHourInstances,
      );
      await this.placeService.findOrCreateCheckInQrCode(record.id);
      const result = await this.placeRepository.findById(
        record.id,
        PlaceQueryFull,
      );
      await transaction.commit();
      return result;
    } catch (ex) {
      await transaction.rollback();
      throw ex;
    }
  }

  @get('/places/count')
  @response(200, {
    description: 'Place model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Place) where?: Where<Place>): Promise<Count> {
    return this.placeRepository.count(where);
  }

  @get('/places')
  @response(200, {
    description: 'Array of Place model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Place, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Place) filter?: Filter<Place>) {
    return this.placeRepository.find(
      FilterByTags({
        ...filter,
        ...ExtendQueryFilterWhere(PlacesQuery, [
          {live: true},
          {deleted: false},
        ]),
      }),
    );
  }

  // @patch("/places")
  // @response(200, {
  //   description: "Place PATCH success count",
  //   content: { "application/json": { schema: CountSchema } },
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       "application/json": {
  //         schema: getModelSchemaRef(Place, { partial: true }),
  //         exclude: ["id", "updated_at", "created_at"],
  //       },
  //     },
  //   })
  //   place: Place,
  //   @param.where(Place) where?: Where<Place>
  // ): Promise<Count> {
  //   return this.placeRepository.updateAll(place, where);
  // }

  @get('/places/{id}')
  @response(200, {
    description: 'Place model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Place, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Place, {exclude: 'where'})
    filter?: FilterExcludingWhere<Place>,
  ): Promise<Place> {
    return this.placeRepository.findById(id, filter);
  }
  @get('/places/list/{id}')
  @response(200, {
    description: 'List of places where id in []',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Place, {includeRelations: true}),
      },
    },
  })
  async findByIds(
    @param.path.string('id') id: string,
    @param.filter(Place, {exclude: 'where'})
    filter?: FilterExcludingWhere<Place>,
  ): Promise<any> {
    return this.placeRepository.findAll({
      ...PlacesQuery,
      where: {id: {inq: JSON.parse(id)}},
    });
  }

  // xx
  @get('/places/{id}/full')
  @response(200, {
    description: 'Place model instance with all dependencies',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Place, {includeRelations: true}),
      },
    },
  })
  async findByIdFull(
    @param.path.string('id') id: string,
    @param.filter(Place, {exclude: 'where'})
    filter?: FilterExcludingWhere<Place>,
  ): Promise<Place> {
    return this.placeRepository.findById(id, PlaceQueryFull);
  }

  @patch('/places/{id}')
  @response(204, {
    description: 'Place PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        // "application/json": {
        //   schema: getModelSchemaRef(Place, { partial: true }),
        // },
      },
    })
    place: any,
  ): Promise<any> {
    return this.managerService.updatePlace(id, place);
  }

  /*
  @put('/places/{id}')
  @response(204, {
    description: 'Place PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() place: Place,
  ): Promise<void> {
    await this.placeRepository.replaceById(id, place);
  }

  @del('/places/{id}')
  @response(204, {
    description: 'Place DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.placeRepository.deleteById(id);
  }
    */
}
