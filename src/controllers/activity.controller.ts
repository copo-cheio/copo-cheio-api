import {authenticate,AuthenticationBindings} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from "@loopback/rest";
import {UserProfile} from '@loopback/security';
import {Activity} from "../models";
import {ActivityRepository} from "../repositories";
import {ActivityService} from "../services";

export class ActivityController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
    @inject("services.ActivityService")
    protected activityService: ActivityService,
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    private currentUser: UserProfile // Inject the current user profile
  ) {}


@post("/check-in")
@authenticate("firebase")
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
    activity: any //Omit<Activity, "id">
  ): Promise<any> {

    return this.activityService.checkIn(this.currentUser.id, activity.placeId);
  }

  @get("/check-in/{placeId}")
  @authenticate("firebase")
  @response(200, {
    description: "Activity model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Activity, { includeRelations: true }),
      },
    },
  })
  async checkInPlace(
    @param.path.string("placeId") placeId: string
    // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  ): Promise<any> {

    // const res = await this.activityService.checkIn(userId,placeId);
    return this.activityService.checkIn( this.currentUser.id, placeId);
    // return res
  }

  @get("/check-out")
  @authenticate("firebase")
  @response(200, {
    description: "Activity model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Activity, { includeRelations: true }),
      },
    },
  })
  async checkOut(): // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  Promise<any> {
    const userId = "6e6fcbef-886c-486e-8e15-f4ac5e234b5c";
    // const res = await this.activityService.checkIn(userId,placeId);
    return this.activityService.checkOut(this.currentUser.id);
    // return res
  }

  @get("/whoami")
  @authenticate("firebase") // Make sure this route is protected by authentication
  async whoAmI(): Promise<any> {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }
    // Return the user id or any other information
    return this.currentUser;
  }

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
