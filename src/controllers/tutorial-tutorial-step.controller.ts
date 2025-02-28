import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Tutorial,
  TutorialStep,
} from '../models';
import {TutorialRepository} from '../repositories';

export class TutorialTutorialStepController {
  constructor(
    @repository(TutorialRepository) protected tutorialRepository: TutorialRepository,
  ) { }

  @get('/tutorials/{id}/tutorial-steps', {
    responses: {
      '200': {
        description: 'Array of Tutorial has many TutorialStep',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TutorialStep)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<TutorialStep>,
  ): Promise<TutorialStep[]> {
    return this.tutorialRepository.steps(id).find(filter);
  }

  @post('/tutorials/{id}/tutorial-steps', {
    responses: {
      '200': {
        description: 'Tutorial model instance',
        content: {'application/json': {schema: getModelSchemaRef(TutorialStep)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Tutorial.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TutorialStep, {
            title: 'NewTutorialStepInTutorial',
            exclude: ['id'],
            optional: ['tutorialId']
          }),
        },
      },
    }) tutorialStep: Omit<TutorialStep, 'id'>,
  ): Promise<TutorialStep> {
    return this.tutorialRepository.steps(id).create(tutorialStep);
  }

  @patch('/tutorials/{id}/tutorial-steps', {
    responses: {
      '200': {
        description: 'Tutorial.TutorialStep PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TutorialStep, {partial: true}),
        },
      },
    })
    tutorialStep: Partial<TutorialStep>,
    @param.query.object('where', getWhereSchemaFor(TutorialStep)) where?: Where<TutorialStep>,
  ): Promise<Count> {
    return this.tutorialRepository.steps(id).patch(tutorialStep, where);
  }

  @del('/tutorials/{id}/tutorial-steps', {
    responses: {
      '200': {
        description: 'Tutorial.TutorialStep DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(TutorialStep)) where?: Where<TutorialStep>,
  ): Promise<Count> {
    return this.tutorialRepository.steps(id).delete(where);
  }
}
