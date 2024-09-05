import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import {get,getModelSchemaRef,param,post,requestBody,response} from "@loopback/rest";
import {Activity} from "../models";
import {ActivityRepository} from "../repositories";
import {ActivityService} from "../services";

export class ActivityController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
    @inject("services.ActivityService")
    protected activityService: ActivityService
  ) {}

  /*
  {

  "userId": "6e6fcbef-886c-486e-8e15-f4ac5e234b5c",
  "placeId": "a813bc90-d422-4d60-aa48-1e7d6c69ae8e",
  "eventId": "c4e47c95-7e36-4d37-8f6f-415148cecdca",
"action":"check-in"
}
*/
  @post("/check-in")
  @response(200, {
    description: "Activity model instance",
    content: {
      "application/json": { schema: getModelSchemaRef(Activity) },
    },
  })
  async checkIn(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Activity, {
            title: "NewActivity",
            exclude: ["id"],
          }),
        },
      },
    })
    activity: any//Omit<Activity, "id">
  ): Promise<any> {

    /**
     * @TODO
     */
     const userId ="6e6fcbef-886c-486e-8e15-f4ac5e234b5c"
    return this.activityService.checkIn(userId,activity.placeId);
  }


  @get('/check-in/{placeId}')
  @response(200, {
    description: 'Activity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Activity, {includeRelations: true}),
      },
    },
  })
  async checkInPlace(
    @param.path.string('placeId') placeId: string,
    // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  ): Promise<any> {
    const userId ="6e6fcbef-886c-486e-8e15-f4ac5e234b5c"
    // const res = await this.activityService.checkIn(userId,placeId);
    return this.activityService.checkIn(userId,placeId);
    // return res
  }
  // @post('/check-out')
  // @response(200, {
  //   description: 'Activity model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(Activity)}},
  // })
  // async checkOut(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Activity, {
  //           title: 'NewActivity',
  //           exclude: ['id'],
  //         }),
  //       },
  //     },
  //   })
  //   activity: Omit<Activity, 'id'>,
  // ): Promise<Activity> {
  //   return this.activityService.checkOut();
  // }

  /*
  @get('/activity-check-ins/count')
  @response(200, {
    description: 'Activity model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Activity) where?: Where<Activity>,
  ): Promise<Count> {
    return this.activityRepository.count(where);
  }

  @get('/activity-check-ins')
  @response(200, {
    description: 'Array of Activity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Activity, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Activity) filter?: Filter<Activity>,
  ): Promise<Activity[]> {
    return this.activityRepository.find(filter);
  }

  @patch('/activity-check-ins')
  @response(200, {
    description: 'Activity PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Activity, {partial: true}),
        },
      },
    })
    activity: Activity,
    @param.where(Activity) where?: Where<Activity>,
  ): Promise<Count> {
    return this.activityRepository.updateAll(activity, where);
  }

  @get('/activity-check-ins/{id}')
  @response(200, {
    description: 'Activity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Activity, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  ): Promise<Activity> {
    return this.activityRepository.findById(id, filter);
  }

  @patch('/activity-check-ins/{id}')
  @response(204, {
    description: 'Activity PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Activity, {partial: true}),
        },
      },
    })
    activity: Activity,
  ): Promise<void> {
    await this.activityRepository.updateById(id, activity);
  }

  @put('/activity-check-ins/{id}')
  @response(204, {
    description: 'Activity PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() activity: Activity,
  ): Promise<void> {
    await this.activityRepository.replaceById(id, activity);
  }

  @del('/activity-check-ins/{id}')
  @response(204, {
    description: 'Activity DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.activityRepository.deleteById(id);
  }
    */
}
