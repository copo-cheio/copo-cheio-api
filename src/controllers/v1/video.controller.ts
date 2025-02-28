import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';

import {Video} from '../../models/v1/video.model';
import {VideoRepository} from '../../repositories';

export class VideoController {
  constructor(
    @repository(VideoRepository)
    public videoRepository: VideoRepository,
  ) {}

  @post('/videos')
  @response(200, {
    description: 'Video model instance',
    content: {'application/json': {schema: getModelSchemaRef(Video)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Video, {
            title: 'NewVideo',
            exclude: ['id'],
          }),
        },
      },
    })
    video: Omit<Video, 'id'>,
  ): Promise<Video> {
    return this.videoRepository.create(video);
  }

  @get('/videos/manager-tutorials')
  @response(200, {
    description: 'Array of Manager tutorials Video model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Video, {includeRelations: true}),
        },
      },
    },
  })
  async findManagerTutorials(): Promise<any> {
    const tagId = 'ced0d004-9649-4711-b563-55702ab8fb0d';
    const query = `
      SELECT * FROM video WHERE tagIds LIKE '%ced0d004-9649-4711-b563-55702ab8fb0d%'
    `;
    const videos: any = await this.videoRepository.execute(query);
    return this.videoRepository.findAll({
      where: {
        and: [
          {id: {inq: videos.map((video: Video) => video.id)}},
          {deleted: false},
        ],
      },
      include: [
        {
          relation: 'cover',
        },
      ],
    });
    /*    return this.videoRepository.find(filter); */
  }

  @get('/videos')
  @response(200, {
    description: 'Array of Video model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Video, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Video) filter?: Filter<Video>): Promise<Video[]> {
    return this.videoRepository.find(filter);
  }

  @get('/videos/{id}')
  @response(200, {
    description: 'Video model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Video, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Video, {exclude: 'where'})
    filter?: FilterExcludingWhere<Video>,
  ): Promise<Video> {
    return this.videoRepository.findById(id, filter);
  }

  @patch('/videos/{id}')
  @response(204, {
    description: 'Video PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Video, {partial: true}),
        },
      },
    })
    video: Video,
  ): Promise<void> {
    await this.videoRepository.updateById(id, video);
  }
  /*
  @get('/videos/count')
  @response(200, {
    description: 'Video model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Video) where?: Where<Video>): Promise<Count> {
    return this.videoRepository.count(where);
  }
  @patch('/videos')
  @response(200, {
    description: 'Video PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Video, {partial: true}),
        },
      },
    })
    video: Video,
    @param.where(Video) where?: Where<Video>,
  ): Promise<Count> {
    return this.videoRepository.updateAll(video, where);
  }
  @put('/videos/{id}')
  @response(204, {
    description: 'Video PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() video: Video,
  ): Promise<void> {
    await this.videoRepository.replaceById(id, video);
  }

  @del('/videos/{id}')
  @response(204, {
    description: 'Video DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.videoRepository.deleteById(id);
  } */
}
