import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {TagQueryFull} from '../../blueprints/tag.blueprint';
import {Artist, Event, Place, Playlist, Tag} from '../../models';
import {
  ArtistRepository,
  EventRepository,
  PlaceRepository,
  PlaylistRepository,
  TagRepository,
  TranslationRepository,
} from '../../repositories';
import {replaceAll} from '../../utils/validations';

export class TagController {
  constructor(
    @repository(TagRepository)
    public tagRepository: TagRepository,
    @repository(TranslationRepository)
    public translationRepository: TranslationRepository,
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(PlaylistRepository)
    public playlistRepository: PlaylistRepository,
  ) {}

  parseSinglePayload(payload: any) {
    const translation = payload.translation || {};
    const tag = payload.tag || {};
    console.log({payload, tag, translation});
    const status: any = {
      tag: {
        keys: ['name', 'type'],
        create: true,
        update: true,
        payload: {},
        id: null,
      },
      translation: {
        keys: ['en', 'pt'],
        create: true,
        update: true,
        payload: {},
        id: null,
      },
    };
    for (const model of [
      [tag, 'tag'],
      [translation, 'translation'],
    ]) {
      const record = model[0];
      const arg = model[1];
      for (const key of status[arg].keys) {
        if (record[key]) {
          status[arg].payload[key] = record[key].trim().toLowerCase();
        } else {
          status[arg].create = false;
        }
      }
      if (Object.keys(status[arg].payload).length == 0) {
        status[arg].create = false;
        status[arg].update = false;
      }
      if (!record?.id) {
        status[arg].update = false;
      } else {
        status[arg].id = record.id;
      }
    }
    console.log({status});
    return status;
  }

  @post('/create/tag')
  @response(200, {
    description: 'Tag model instance',
    content: {'application/json': {schema: getModelSchemaRef(Tag)}},
  })
  async newTag(
    @requestBody({
      content: {},
    })
    payload: any,
  ): Promise<Tag> {
    const status = this.parseSinglePayload(payload);
    const {tag, translation} = status;

    if (!tag.create || !translation.create) {
      throw status;
    }
    tag.payload.name = replaceAll(translation.payload.en, ' ', '-');
    const translationRecord = await this.translationRepository.create(
      translation.payload,
    );
    const tagRecord = await this.tagRepository.create({
      ...tag.payload,
      translationId: translationRecord.id,
    });

    return tagRecord;
  }

  @patch('/update/tag')
  @response(200, {
    description: 'Tag model instance',
    content: {'application/json': {schema: getModelSchemaRef(Tag)}},
  })
  async updateTag(
    @requestBody({
      content: {},
    })
    payload: any,
  ): Promise<any> {
    const status = this.parseSinglePayload(payload);
    const {tag, translation} = status;
    if (tag.update) await this.tagRepository.updateById(tag.id, tag.payload);
    if (translation.update)
      await this.translationRepository.updateById(
        translation.id,
        translation.payload,
      );

    return {tag, translation};
  }

  @post('/tags')
  @response(200, {
    description: 'Tag model instance',
    content: {'application/json': {schema: getModelSchemaRef(Tag)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Tag, {
            title: 'NewTag',
            exclude: ['id', 'updated_at', 'created_at'],
          }),
        },
      },
    })
    tag: Omit<Tag, 'id'>,
  ): Promise<Tag> {
    return this.tagRepository.create(tag);
  }

  @get('/tags/count')
  @response(200, {
    description: 'Tag model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Tag) where?: Where<Tag>): Promise<Count> {
    return this.tagRepository.count(where);
  }

  @get('/tags')
  @response(200, {
    description: 'Array of Tag model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Tag, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Tag) filter?: Filter<Tag>): Promise<Tag[]> {
    const query = {...TagQueryFull};
    if (filter?.where) {
      query.where = filter.where;
    }
    return this.tagRepository.find(query);
  }
  @get('/tags/all')
  @response(200, {
    description: 'Array of all Tag model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Tag, {includeRelations: true}),
        },
      },
    },
  })
  async findAll(@param.filter(Tag) filter?: Filter<Tag>): Promise<Tag[]> {
    return this.tagRepository.find(TagQueryFull);
  }

  @patch('/tags')
  @response(200, {
    description: 'Tag PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Tag, {partial: true}),
        },
      },
    })
    tag: Tag,
    @param.where(Tag) where?: Where<Tag>,
  ): Promise<Count> {
    return this.tagRepository.updateAll(tag, where);
  }

  @get('/tags/{id}')
  @response(200, {
    description: 'Tag model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Tag, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Tag, {exclude: 'where'}) filter?: FilterExcludingWhere<Tag>,
  ): Promise<Tag> {
    return this.tagRepository.findById(id, filter);
  }

  @patch('/tags/{id}')
  @response(204, {
    description: 'Tag PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Tag, {partial: true}),
        },
      },
    })
    tag: Tag,
  ): Promise<void> {
    await this.tagRepository.updateById(id, tag);
  }

  @put('/tags/{id}')
  @response(204, {
    description: 'Tag PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() tag: Tag,
  ): Promise<void> {
    await this.tagRepository.replaceById(id, tag);
  }

  @del('/tags/{id}')
  @response(204, {
    description: 'Tag DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.tagRepository.deleteById(id);
  }

  /* ********************************** */
  /*              HELPER                */
  /* ********************************** */
  async addTagToRecord(repository: any, id: string, tagId: string) {
    const record = await repository.findById(id);
    record.tagIds = record.tagIds || [];
    if (!record.tagIds.includes(tagId)) {
      record.tagIds.push(tagId);
      await repository.updateById(id, record);
    }
  }
  async removeTagFromRecord(repository: any, id: string, tagId: string) {
    const record = await repository.findById(id);
    record.tagIds = record.tagIds || [];
    if (record.tagIds.includes(tagId)) {
      record.tagIds = record.tagIds.filter((_tagId: any) => _tagId !== tagId);
      await repository.updateById(id, record);
    }
  }

  @patch('/artist/{id}/tag/{tagId}')
  @response(204, {
    description: 'Artist PATCH success',
  })
  async addTagToArtist(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artist, {partial: true}),
        },
      },
    })
    artist: Artist,
  ): Promise<void> {
    return this.addTagToRecord(this.artistRepository, id, tagId);
  }
  @del('/artist/{id}/tag/{tagId}')
  @response(204, {
    description: 'Artist PATCH success',
  })
  async removeTagFromArtist(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artist, {partial: true}),
        },
      },
    })
    artist: Artist,
  ): Promise<void> {
    return this.removeTagFromRecord(this.artistRepository, id, tagId);
  }

  /* ********************************** */
  /*                PLACE               */
  /* ********************************** */
  @patch('/place/{id}/tag/{tagId}')
  @response(204, {
    description: 'Place PATCH success',
  })
  async addTagToPlace(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Place, {partial: true}),
        },
      },
    })
    place: Place,
  ): Promise<void> {
    return this.addTagToRecord(this.placeRepository, id, tagId);
  }
  @del('/place/{id}/tag/{tagId}')
  @response(204, {
    description: 'Place PATCH success',
  })
  async removeTagFromPlace(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Place, {partial: true}),
        },
      },
    })
    place: Place,
  ): Promise<void> {
    return this.removeTagFromRecord(this.placeRepository, id, tagId);
  }

  /* ********************************** */
  /*                EVENT               */
  /* ********************************** */
  @patch('/event/{id}/tag/{tagId}')
  @response(204, {
    description: 'Event PATCH success',
  })
  async addTagToEvent(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Event,
  ): Promise<void> {
    return this.addTagToRecord(this.eventRepository, id, tagId);
  }
  @del('/event/{id}/tag/{tagId}')
  @response(204, {
    description: 'Event PATCH success',
  })
  async removeTagFromEvent(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Event,
  ): Promise<void> {
    return this.removeTagFromRecord(this.eventRepository, id, tagId);
  }

  /* ********************************** */
  /*                PLAYLIST               */
  /* ********************************** */
  @patch('/playlist/{id}/tag/{tagId}')
  @response(204, {
    description: 'Playlist PATCH success',
  })
  async addTagToPlaylist(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Playlist, {partial: true}),
        },
      },
    })
    playlist: Playlist,
  ): Promise<void> {
    return this.addTagToRecord(this.playlistRepository, id, tagId);
  }
  @del('/playlist/{id}/tag/{tagId}')
  @response(204, {
    description: 'Playlist PATCH success',
  })
  async removeTagFromPlaylist(
    @param.path.string('id') id: string,
    @param.path.string('tagId') tagId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Playlist, {partial: true}),
        },
      },
    })
    playlist: Playlist,
  ): Promise<void> {
    return this.removeTagFromRecord(this.playlistRepository, id, tagId);
  }
}
