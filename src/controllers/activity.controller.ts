import {authenticate,AuthenticationBindings} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import {
  get,
  getModelSchemaRef,
  post,
  requestBody,
  response,
} from "@loopback/rest";
import {UserProfile} from "@loopback/security";
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



  /**
   * Check in a user on a place/event.
   * Search for previous check ins and close them as he can only do one thing at the time.
   * Define it's role on this activity and if staff, he's job ( bar, door ,and so on)
   *
   * @param {*} activity
   * @return {*}  {Promise<any>}
   * @memberof ActivityController
   */
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
        // "application/json": {
        //   schema: getModelSchemaRef(Activity, {
        //     title: "NewActivity",
        //     exclude: ["id"],
        //   }),
        // },
      },
    })
    activity: any //Omit<Activity, "id">
  ): Promise<any> {
    console.log({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Activity, {
            title: "NewActivity",
            exclude: ["id"],
          }),
        },
      },
    });

    return this.activityService.checkIn(
      this.currentUser.id,
      activity.placeId,
      activity.role,
      activity
    );
  }

    /**
   * Checks a user out
   * Will check a user out of current activity
   * @param {*} activity
   * @return {*}  {Promise<any>}
   * @memberof ActivityController
   */
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
    return this.activityService.checkOut(this.currentUser.id);
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

